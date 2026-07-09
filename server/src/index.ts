import express, {
  type CookieOptions,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import { db } from './db';
import { monthLabel } from './months';
import { buildSnapshot } from './state';
import { addClient, broadcast, snapshotFrame } from './events';

interface MemberRow {
  id: string;
  name: string;
  initials: string;
  color: string;
  gray: string;
}

const SESSION_COOKIE = 'sid';
const cookieOpts: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 1000 * 60 * 60 * 24 * 365,
  secure: config.production,
};

function memberFromReq(req: Request): MemberRow | null {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  const row = db
    .prepare(
      'SELECT m.id, m.name, m.initials, m.color, m.gray FROM sessions s JOIN members m ON m.id = s.member_id WHERE s.token = ?',
    )
    .get(token) as MemberRow | undefined;
  return row ?? null;
}

function requireMember(req: Request, res: Response, next: NextFunction): void {
  const member = memberFromReq(req);
  if (!member) {
    res.status(401).json({ error: 'Open the cover first — sign in as a member.' });
    return;
  }
  res.locals.member = member;
  next();
}

const app = express();
app.use(express.json());
app.use(cookieParser());

const api = express.Router();

api.get('/health', (_req, res) => res.json({ ok: true }));

// --- session (sign in / out) ---
api.get('/session', (req, res) => res.json({ member: memberFromReq(req) }));

api.post('/session', (req, res) => {
  const member = db
    .prepare('SELECT id, name, initials, color, gray FROM members WHERE id = ?')
    .get(req.body?.memberId) as MemberRow | undefined;
  if (!member) {
    res.status(400).json({ error: 'Unknown member.' });
    return;
  }
  const token = randomUUID();
  db.prepare('INSERT INTO sessions (token, member_id, created_at) VALUES (?, ?, ?)').run(
    token,
    member.id,
    new Date().toISOString(),
  );
  res.cookie(SESSION_COOKIE, token, cookieOpts);
  res.json({ member });
});

api.delete('/session', (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.status(204).end();
});

// --- shared state ---
api.get('/state', (_req, res) => res.json(buildSnapshot()));

api.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();
  res.write(snapshotFrame());
  addClient(res);
});

// --- the monthly cycle ---

// Offer: replace my two volumes on the table.
api.post('/suggestions', requireMember, (req, res) => {
  const me = res.locals.member as MemberRow;
  const raw: unknown[] = Array.isArray(req.body?.books) ? req.body.books : [];
  const books = raw
    .map((b) => {
      const v = b as Record<string, unknown>;
      const num = (x: unknown) =>
        x != null && x !== '' && Number.isFinite(Number(x)) ? Number(x) : null;
      return {
        title: String(v?.title ?? '').trim(),
        author: String(v?.author ?? '').trim(),
        genre: String(v?.genre || 'Literary'),
        pages: num(v?.pages),
        year: num(v?.year),
        coverUrl: v?.coverUrl ? String(v.coverUrl) : null,
      };
    })
    .filter((b) => b.title && b.author)
    .slice(0, 2);

  if (books.length !== 2) {
    res.status(400).json({ error: 'Give a title and author for both volumes.' });
    return;
  }

  const now = new Date().toISOString();
  db.transaction(() => {
    db.prepare('DELETE FROM books WHERE submitted_by = ?').run(me.id);
    const ins = db.prepare(
      'INSERT INTO books (id, title, author, genre, pages, year, cover_url, submitted_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    );
    books.forEach((b, i) =>
      ins.run(`${me.id}-${Date.now()}-${i}`, b.title, b.author, b.genre, b.pages, b.year, b.coverUrl, me.id, now),
    );
  })();

  broadcast();
  res.json(buildSnapshot());
});

// Draw: pick two volumes by lot and open the ballot.
api.post('/draw', requireMember, (_req, res) => {
  const phase = (db.prepare('SELECT phase FROM club WHERE id = 1').get() as { phase: string }).phase;
  if (phase !== 'suggesting') {
    res.status(409).json({ error: 'The lots can only be drawn while offerings are open.' });
    return;
  }
  const ids = (db.prepare('SELECT id FROM books').all() as { id: string }[]).map((r) => r.id);
  if (ids.length < 2) {
    res.status(400).json({ error: 'At least two volumes are needed to draw.' });
    return;
  }
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  db.transaction(() => {
    db.prepare('DELETE FROM votes').run();
    db.prepare('UPDATE club SET phase = ?, drawn_a = ?, drawn_b = ? WHERE id = 1').run(
      'voting',
      ids[0],
      ids[1],
    );
  })();
  broadcast();
  res.json(buildSnapshot());
});

// Ballot: cast (or change) my vote.
api.post('/vote', requireMember, (req, res) => {
  const me = res.locals.member as MemberRow;
  const club = db.prepare('SELECT phase, drawn_a, drawn_b FROM club WHERE id = 1').get() as {
    phase: string;
    drawn_a: string | null;
    drawn_b: string | null;
  };
  if (club.phase !== 'voting') {
    res.status(409).json({ error: 'The ballot is not open.' });
    return;
  }
  const bookId = String(req.body?.bookId ?? '');
  if (bookId !== club.drawn_a && bookId !== club.drawn_b) {
    res.status(400).json({ error: 'That volume is not on the ballot.' });
    return;
  }
  db.prepare(
    'INSERT INTO votes (member_id, book_id) VALUES (?, ?) ON CONFLICT(member_id) DO UPDATE SET book_id = excluded.book_id',
  ).run(me.id, bookId);
  broadcast();
  res.json(buildSnapshot());
});

// Seal the ballot: fix the count.
api.post('/seal', requireMember, (_req, res) => {
  const phase = (db.prepare('SELECT phase FROM club WHERE id = 1').get() as { phase: string }).phase;
  if (phase !== 'voting') {
    res.status(409).json({ error: 'The ballot is not open.' });
    return;
  }
  db.prepare("UPDATE club SET phase = 'result' WHERE id = 1").run();
  broadcast();
  res.json(buildSnapshot());
});

// Open a new month: record the winner and clear the table.
api.post('/next-month', requireMember, (_req, res) => {
  const club = db
    .prepare('SELECT month_idx AS monthIdx, phase, drawn_a AS a, drawn_b AS b FROM club WHERE id = 1')
    .get() as { monthIdx: number; phase: string; a: string | null; b: string | null };
  if (club.phase !== 'result') {
    res.status(409).json({ error: 'Seal the ballot before opening a new month.' });
    return;
  }

  type BookRow = { title: string; author: string; genre: string; pages: number | null; year: number | null; cover_url: string | null };
  const bookOf = (id: string | null) =>
    id ? (db.prepare('SELECT * FROM books WHERE id = ?').get(id) as BookRow | undefined) : undefined;
  const countOf = (id: string | null) =>
    id ? (db.prepare('SELECT COUNT(*) AS c FROM votes WHERE book_id = ?').get(id) as { c: number }).c : 0;

  const bookA = bookOf(club.a);
  const bookB = bookOf(club.b);
  const countA = countOf(club.a);
  const countB = countOf(club.b);
  const winner = countA >= countB ? bookA : bookB;
  const loser = winner === bookA ? bookB : bookA;
  const hi = Math.max(countA, countB);
  const lo = Math.min(countA, countB);
  const now = new Date().toISOString();

  db.transaction(() => {
    if (winner) {
      db.prepare(
        'INSERT INTO history (month, title, author, genre, pages, year, cover_url, tally, runner_up, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ).run(
        monthLabel(club.monthIdx),
        winner.title,
        winner.author,
        winner.genre,
        winner.pages,
        winner.year,
        winner.cover_url,
        `${hi}–${lo}`,
        loser ? loser.title : null,
        now,
      );
    }
    db.prepare('DELETE FROM votes').run();
    db.prepare('DELETE FROM books').run();
    db.prepare(
      "UPDATE club SET phase = 'suggesting', drawn_a = NULL, drawn_b = NULL, month_idx = month_idx + 1 WHERE id = 1",
    ).run();
  })();

  broadcast();
  res.json(buildSnapshot());
});

app.use('/api', api);

// In production the built client is served from the same origin.
if (fs.existsSync(config.clientDist)) {
  app.use(express.static(config.clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(config.clientDist, 'index.html'));
  });
}

app.listen(config.port, () => {
  console.log(`Lamplight server listening on http://localhost:${config.port}`);
});
