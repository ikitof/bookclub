import { config } from './config';
import { parseMonthKey } from './months';
import { db } from './sqlite';

export { db };

db.exec(`
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS members (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  initials   TEXT NOT NULL,
  color      TEXT NOT NULL,
  gray       TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS club (
  id         INTEGER PRIMARY KEY CHECK (id = 1),
  name       TEXT NOT NULL,
  month_idx  INTEGER NOT NULL DEFAULT 0,
  phase      TEXT NOT NULL DEFAULT 'suggesting',
  live_tally INTEGER NOT NULL DEFAULT 1,
  drawn_a    TEXT,
  drawn_b    TEXT
);

CREATE TABLE IF NOT EXISTS books (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  author       TEXT NOT NULL,
  genre        TEXT NOT NULL,
  pages        INTEGER,
  year         INTEGER,
  cover_url    TEXT,
  submitted_by TEXT NOT NULL REFERENCES members(id),
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS votes (
  member_id TEXT PRIMARY KEY REFERENCES members(id),
  book_id   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS history (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  month      TEXT NOT NULL,
  title      TEXT NOT NULL,
  author     TEXT NOT NULL,
  genre      TEXT,
  pages      INTEGER,
  year       INTEGER,
  cover_url  TEXT,
  tally      TEXT NOT NULL,
  runner_up  TEXT,
  created_at TEXT NOT NULL,
  sort_key   INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  member_id  TEXT NOT NULL REFERENCES members(id),
  created_at TEXT NOT NULL
);
`);

// Migration: add history.sort_key to older databases and backfill it from the
// month label, so records order chronologically regardless of insertion order.
{
  const cols = db.prepare('PRAGMA table_info(history)').all() as { name: string }[];
  if (!cols.some((c) => c.name === 'sort_key')) {
    db.exec('ALTER TABLE history ADD COLUMN sort_key INTEGER');
  }
  const rows = db.prepare('SELECT id, month FROM history WHERE sort_key IS NULL').all() as {
    id: number;
    month: string;
  }[];
  const upd = db.prepare('UPDATE history SET sort_key = ? WHERE id = ?');
  rows.forEach((r) => {
    const key = parseMonthKey(r.month);
    if (key != null) upd.run(key, r.id);
  });
}

// The four friends — see the dedication in the design.
const MEMBERS = [
  { id: 'arthur', name: 'Arthur', initials: 'AR', color: '#5B7FB0', gray: '#4A4A4A' },
  { id: 'emma', name: 'Emma', initials: 'EM', color: '#C27A8E', gray: '#616161' },
  { id: 'sarah', name: 'Sarah', initials: 'SA', color: '#7FA96B', gray: '#6E6E6E' },
  { id: 'elza', name: 'Elza', initials: 'EL', color: '#B07BB0', gray: '#565656' },
];

// A starter table — two volumes offered by each member. Covers are left null
// and resolved from Open Library on the client.
const SEED_BOOKS = [
  { title: 'The Overstory', author: 'Richard Powers', genre: 'Literary', pages: 625, year: 2018, by: 'arthur' },
  { title: 'The Secret History', author: 'Donna Tartt', genre: 'Mystery', pages: 559, year: 1992, by: 'arthur' },
  { title: 'Project Hail Mary', author: 'Andy Weir', genre: 'Sci-Fi', pages: 496, year: 2021, by: 'emma' },
  { title: 'Klara and the Sun', author: 'Kazuo Ishiguro', genre: 'Sci-Fi', pages: 303, year: 2021, by: 'emma' },
  { title: 'Pachinko', author: 'Min Jin Lee', genre: 'Literary', pages: 490, year: 2017, by: 'sarah' },
  { title: 'Educated', author: 'Tara Westover', genre: 'Nonfiction', pages: 334, year: 2018, by: 'sarah' },
  { title: 'Piranesi', author: 'Susanna Clarke', genre: 'Fantasy', pages: 245, year: 2020, by: 'elza' },
  { title: 'Circe', author: 'Madeline Miller', genre: 'Fantasy', pages: 393, year: 2018, by: 'elza' },
];

const SEED_HISTORY = [
  { month: 'juin 2026', title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', genre: 'Literary', pages: 401, year: 2022, tally: '5–3', runnerUp: 'The Bee Sting' },
  { month: 'mai 2026', title: 'Babel', author: 'R.F. Kuang', genre: 'Fantasy', pages: 545, year: 2022, tally: '6–2', runnerUp: 'Yellowface' },
  { month: 'avril 2026', title: 'Sea of Tranquility', author: 'Emily St. John Mandel', genre: 'Sci-Fi', pages: 259, year: 2022, tally: '5–2', runnerUp: 'Cloud Cuckoo Land' },
  { month: 'mars 2026', title: 'The Wager', author: 'David Grann', genre: 'Nonfiction', pages: 329, year: 2023, tally: '4–3', runnerUp: 'Chip War' },
];

function seed() {
  // The club row must always exist.
  if (!db.prepare('SELECT 1 FROM club WHERE id = 1').get()) {
    db.prepare('INSERT INTO club (id, name, month_idx, phase, live_tally) VALUES (1, ?, 0, ?, 1)').run(
      config.clubName,
      'suggesting',
    );
  }

  if (db.prepare("SELECT 1 FROM meta WHERE key = 'seeded'").get()) return;

  const now = new Date().toISOString();
  db.transaction(() => {
    const insMember = db.prepare(
      'INSERT OR IGNORE INTO members (id, name, initials, color, gray, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
    );
    MEMBERS.forEach((m, i) => insMember.run(m.id, m.name, m.initials, m.color, m.gray, i));

    const insBook = db.prepare(
      'INSERT INTO books (id, title, author, genre, pages, year, cover_url, submitted_by, created_at) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)',
    );
    SEED_BOOKS.forEach((b, i) =>
      insBook.run(`seed-${i}`, b.title, b.author, b.genre, b.pages, b.year, b.by, now),
    );

    const insHistory = db.prepare(
      'INSERT INTO history (month, title, author, genre, pages, year, cover_url, tally, runner_up, created_at, sort_key) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)',
    );
    SEED_HISTORY.forEach((h) =>
      insHistory.run(h.month, h.title, h.author, h.genre, h.pages, h.year, h.tally, h.runnerUp, now, parseMonthKey(h.month)),
    );

    db.prepare("INSERT INTO meta (key, value) VALUES ('seeded', '1')").run();
  })();
}

seed();
