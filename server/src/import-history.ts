import fs from 'fs';
import path from 'path';
import { config } from './config';
import { db } from './db';
import { parseMonthKey } from './months';

/**
 * Import a club's past reads into the record ("Le registre").
 *
 *   npm run import:history -w server -- [--file <path>] [--replace]
 *
 * The file is a JSON array of entries. Only `month` and `title` are required;
 * everything else (author, cover, pages, year, genre) is filled in from Open
 * Library when missing. See server/history.import.example.json.
 */
interface RawEntry {
  month?: string;
  title?: string;
  author?: string;
  genre?: string;
  pages?: number | string;
  year?: number | string;
  coverUrl?: string;
  tally?: string;
  runnerUp?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function mapGenre(subjects: string[]): string {
  const s = (subjects || []).join(' ').toLowerCase();
  if (/science fiction|sci-fi|dystopia|space opera/.test(s)) return 'Sci-Fi';
  if (/fantasy|magic|mythology|dragons/.test(s)) return 'Fantasy';
  if (/mystery|detective|crime|thriller|suspense/.test(s)) return 'Mystery';
  if (/biography|autobiography|history|nonfiction|non-fiction|essays|memoir|politics|economics/.test(s)) return 'Nonfiction';
  return 'Literary';
}

// Skip a single phantom edition dated decades before the real cluster.
function cleanYear(first?: number, all?: number[]): number | null {
  const years = (all ?? []).filter((y) => typeof y === 'number' && y > 1000).sort((a, b) => a - b);
  if (!years.length) return first && first > 1000 ? first : null;
  if (years.length > 1 && years[1] - years[0] > 25) return years[1];
  return years[0];
}

interface Resolved {
  month: string;
  title: string;
  author: string;
  genre: string | null;
  pages: number | null;
  year: number | null;
  coverUrl: string | null;
  tally: string;
  runnerUp: string | null;
}

async function enrich(e: RawEntry): Promise<Resolved> {
  const num = (v: unknown) => (v != null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);
  let author = (e.author || '').trim();
  let genre = e.genre || null;
  let pages = num(e.pages);
  let year = num(e.year);
  let coverUrl = e.coverUrl || null;

  if (!author || !coverUrl || pages == null || year == null || !genre) {
    try {
      const q = new URLSearchParams({
        title: String(e.title),
        limit: '1',
        fields: 'author_name,first_publish_year,publish_year,cover_i,number_of_pages_median,subject',
      });
      if (author) q.set('author', author);
      const res = await fetch(`https://openlibrary.org/search.json?${q}`);
      const doc = ((await res.json()) as { docs?: Record<string, unknown>[] }).docs?.[0];
      if (doc) {
        author ||= (Array.isArray(doc.author_name) ? (doc.author_name[0] as string) : '') || '';
        year ??= cleanYear(doc.first_publish_year as number, doc.publish_year as number[]);
        pages ??= (doc.number_of_pages_median as number) || null;
        coverUrl ||= doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i as number}-L.jpg` : null;
        genre ||= mapGenre((doc.subject as string[]) || []);
      }
    } catch {
      /* offline / not found — keep whatever was provided */
    }
  }

  return {
    month: String(e.month).trim(),
    title: String(e.title).trim(),
    author: author || 'Auteur inconnu',
    genre,
    pages,
    year,
    coverUrl,
    tally: (e.tally || '').trim(),
    runnerUp: e.runnerUp?.trim() || null,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const replace = args.includes('--replace');
  const fi = args.indexOf('--file');
  const file =
    fi >= 0 && args[fi + 1] ? path.resolve(args[fi + 1]) : path.join(path.dirname(config.dbPath), 'history.import.json');

  if (!fs.existsSync(file)) {
    console.error(`No import file at ${file}`);
    console.error('Create one (see server/history.import.example.json) or pass --file <path>.');
    process.exit(1);
  }

  let entries: RawEntry[];
  try {
    entries = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(entries)) throw new Error('expected a JSON array');
  } catch (err) {
    console.error(`Could not read ${file}: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  if (replace) {
    db.prepare('DELETE FROM history').run();
    console.log('Cleared existing record.');
  }

  const now = new Date().toISOString();
  const exists = db.prepare('SELECT 1 FROM history WHERE month = ? AND lower(title) = lower(?)');
  const insert = db.prepare(
    'INSERT INTO history (month, title, author, genre, pages, year, cover_url, tally, runner_up, created_at, sort_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );

  let imported = 0;
  let skipped = 0;
  for (const raw of entries) {
    if (!raw?.month || !raw?.title) {
      console.warn('  skip (needs month + title):', JSON.stringify(raw));
      skipped++;
      continue;
    }
    if (!replace && exists.get(String(raw.month).trim(), String(raw.title).trim())) {
      console.log(`  skip (already present): ${raw.title}`);
      skipped++;
      continue;
    }
    const e = await enrich(raw);
    insert.run(
      e.month,
      e.title,
      e.author,
      e.genre,
      e.pages,
      e.year,
      e.coverUrl,
      e.tally,
      e.runnerUp,
      now,
      parseMonthKey(e.month),
    );
    imported++;
    console.log(`  + ${e.month} — ${e.title}${e.year ? ` (${e.year})` : ''} — ${e.author}`);
    await sleep(120); // be gentle with Open Library
  }

  console.log(`\nDone: ${imported} imported, ${skipped} skipped, into ${config.dbPath}`);
  console.log('If the server is running, restart it so it re-reads the database.');
  db.close();
}

main();
