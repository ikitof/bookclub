import { config } from './config';
import { db } from './db';
import { monthLabel } from './months';
import type { Book, HistoryEntry, Member, Phase, Snapshot } from './types';

interface ClubRow {
  name: string;
  monthIdx: number;
  phase: Phase;
  liveTally: number;
  drawnA: string | null;
  drawnB: string | null;
}

/** Read the whole shared state out of the database. */
export function buildSnapshot(): Snapshot {
  const club = db
    .prepare(
      'SELECT name, month_idx AS monthIdx, phase, live_tally AS liveTally, drawn_a AS drawnA, drawn_b AS drawnB FROM club WHERE id = 1',
    )
    .get() as ClubRow;

  const members = db
    .prepare('SELECT id, name, initials, color, gray FROM members ORDER BY sort_order')
    .all() as Member[];

  const pool = db
    .prepare(
      'SELECT id, title, author, genre, pages, year, cover_url AS coverUrl, submitted_by AS by FROM books ORDER BY created_at, id',
    )
    .all() as Book[];

  const history = db
    .prepare(
      'SELECT id, month, title, author, genre, pages, year, cover_url AS coverUrl, tally, runner_up AS runnerUp FROM history ORDER BY sort_key IS NULL, sort_key DESC, id DESC',
    )
    .all() as HistoryEntry[];

  const drawn: [string, string] | null =
    club.drawnA && club.drawnB ? [club.drawnA, club.drawnB] : null;

  const votes: Record<string, string[]> = {};
  if (drawn) {
    drawn.forEach((id) => (votes[id] = []));
    const rows = db
      .prepare('SELECT member_id AS memberId, book_id AS bookId FROM votes')
      .all() as { memberId: string; bookId: string }[];
    rows.forEach((r) => votes[r.bookId]?.push(r.memberId));
  }

  return {
    club: {
      // The display name is configuration, not per-database state.
      name: config.clubName,
      monthLabel: monthLabel(club.monthIdx),
      monthIdx: club.monthIdx,
      phase: club.phase,
      liveTally: !!club.liveTally,
    },
    members,
    pool,
    drawn,
    votes,
    history,
  };
}
