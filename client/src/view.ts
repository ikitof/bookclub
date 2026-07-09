import { genreTint } from './genres';
import type { Book, Member } from './types';

/** Stable key for caching a cover by title/author across cycles. */
export function coverKey(title: string, author: string): string {
  return `${title.toLowerCase().trim()}␟${(author || '').toLowerCase().trim()}`;
}

export function sealColor(member: Member | null | undefined, mono: boolean): string {
  if (!member) return mono ? '#5a5a5a' : '#9B8C7A';
  return mono ? member.gray || '#5a5a5a' : member.color;
}

/** The gentle, deterministic tilt the design gives each plate. */
export function tiltFor(index: number | null): number {
  if (index == null) return 0;
  return (index % 2 ? 1.3 : -1.3) + ((index % 3) - 1) * 0.35;
}

export function metaLine(pages: number | null, year: number | null): string {
  return [pages ? `${pages} pp` : null, year || null].filter(Boolean).join(' · ');
}

export interface BookView {
  id: string;
  title: string;
  author: string;
  genre: string;
  tint: string;
  meta: string;
  tilt: number;
  coverUrl: string | null;
  noCover: boolean;
  by: { name: string; initials: string; color: string };
}

export function bookView(
  book: Book,
  index: number | null,
  mono: boolean,
  memberById: (id: string) => Member | undefined,
  resolvedCover: string | null,
): BookView {
  const m = memberById(book.by);
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    genre: book.genre,
    tint: genreTint(book.genre, mono),
    meta: metaLine(book.pages, book.year),
    tilt: tiltFor(index),
    coverUrl: resolvedCover,
    noCover: !resolvedCover,
    by: m
      ? { name: m.name, initials: m.initials, color: sealColor(m, mono) }
      : { name: book.by, initials: '?', color: sealColor(null, mono) },
  };
}
