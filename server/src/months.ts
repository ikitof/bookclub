const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// The society's first gathering — month index 0.
const START_YEAR = 2026;
const START_MONTH = 6; // July (0-based)

/** Human label for a month index, e.g. 0 -> "July 2026". */
export function monthLabel(idx: number): string {
  const total = START_MONTH + idx;
  const year = START_YEAR + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  return `${MONTH_NAMES[month]} ${year}`;
}
