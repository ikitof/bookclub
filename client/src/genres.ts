// Keys are canonical (stored in the database); labels are shown in French.
export const GENRES: Record<string, { tint: string; label: string }> = {
  Literary: { tint: '#6D4E86', label: 'Littérature' },
  'Sci-Fi': { tint: '#2F6E68', label: 'Science-fiction' },
  Mystery: { tint: '#8A4C63', label: 'Policier' },
  Fantasy: { tint: '#9A6B1E', label: 'Fantasy' },
  Nonfiction: { tint: '#4E5A66', label: 'Essais' },
};

export const GENRE_LIST = Object.keys(GENRES);

export function genreLabel(genre: string | null): string {
  return (genre && GENRES[genre]?.label) || genre || 'Littérature';
}

export function genreTint(genre: string | null, mono: boolean): string {
  if (mono) return '#6E6E6E';
  return (genre && GENRES[genre]?.tint) || '#8A7455';
}

/** Best-effort genre from Open Library subject tags. */
export function mapGenre(subjects: string[]): string {
  const s = (subjects || []).join(' ').toLowerCase();
  if (/science fiction|sci-fi|dystopia|space opera/.test(s)) return 'Sci-Fi';
  if (/fantasy|magic|mythology|dragons/.test(s)) return 'Fantasy';
  if (/mystery|detective|crime|thriller|suspense/.test(s)) return 'Mystery';
  if (/biography|autobiography|history|nonfiction|non-fiction|essays|memoir|politics|economics/.test(s))
    return 'Nonfiction';
  return 'Literary';
}
