const MONTH_NAMES = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

const MONTH_NAMES_EN = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

// The society's first gathering — month index 0.
const START_YEAR = 2026;
const START_MONTH = 6; // July (0-based)

/** Human label for a month index, e.g. 0 -> "juillet 2026". */
export function monthLabel(idx: number): string {
  const total = START_MONTH + idx;
  const year = START_YEAR + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  return `${MONTH_NAMES[month]} ${year}`;
}

/** An absolute, comparable key for a month: year * 12 + monthIndex (0-based). */
export function monthKeyFromIndex(idx: number): number {
  return START_YEAR * 12 + START_MONTH + idx;
}

/**
 * Parse a free-form month label into the same absolute key, so imported reads
 * sort correctly against live entries. Accepts French or English month names
 * ("juillet 2026", "July 2026") and numeric forms ("2024-07", "07/2024").
 * Returns null if it can't be understood.
 */
export function parseMonthKey(label: string): number | null {
  const s = (label || '').trim().toLowerCase();
  if (!s) return null;

  let m: number; // 1-12
  let y: number;
  let match: RegExpMatchArray | null;
  if ((match = s.match(/^(\d{4})[-/.](\d{1,2})$/))) {
    y = Number(match[1]);
    m = Number(match[2]);
  } else if ((match = s.match(/^(\d{1,2})[-/.](\d{4})$/))) {
    m = Number(match[1]);
    y = Number(match[2]);
  } else {
    const year = s.match(/\d{4}/);
    if (!year) return null;
    y = Number(year[0]);
    const idx = MONTH_NAMES.findIndex((fr, i) => s.includes(fr) || s.includes(MONTH_NAMES_EN[i]));
    if (idx < 0) return null;
    m = idx + 1;
  }
  if (!y || !m || m < 1 || m > 12) return null;
  return y * 12 + (m - 1);
}
