import type { Draft, Member, Snapshot } from './types';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

type SubmitBook = Omit<Draft, 'pages' | 'year'> & { pages: number | null; year: number | null };

export const api = {
  session: () => req<{ member: Member | null }>('/session'),
  signIn: (memberId: string) =>
    req<{ member: Member }>('/session', { method: 'POST', body: JSON.stringify({ memberId }) }),
  signOut: () => req<null>('/session', { method: 'DELETE' }),
  state: () => req<Snapshot>('/state'),
  suggestions: (books: SubmitBook[]) =>
    req<Snapshot>('/suggestions', { method: 'POST', body: JSON.stringify({ books }) }),
  draw: () => req<Snapshot>('/draw', { method: 'POST' }),
  vote: (bookId: string) => req<Snapshot>('/vote', { method: 'POST', body: JSON.stringify({ bookId }) }),
  seal: () => req<Snapshot>('/seal', { method: 'POST' }),
  nextMonth: () => req<Snapshot>('/next-month', { method: 'POST' }),
};

// --- Open Library (covers & metadata) ---

const OL = 'https://openlibrary.org/search.json';
export const coverUrlFor = (id: number, size: 'M' | 'L' = 'L') =>
  `https://covers.openlibrary.org/b/id/${id}-${size}.jpg`;

export interface OpenLibraryResult {
  title: string;
  author: string;
  year: number | '';
  pages: number | '';
  coverId: number | null;
  subject: string[];
}

export async function searchOpenLibrary(title: string): Promise<OpenLibraryResult[]> {
  const q = new URLSearchParams({
    title,
    limit: '6',
    fields: 'title,author_name,first_publish_year,cover_i,number_of_pages_median,subject',
  });
  const res = await fetch(`${OL}?${q}`);
  const data = (await res.json()) as { docs?: Record<string, unknown>[] };
  return (data.docs || []).map((d) => ({
    title: String(d.title ?? ''),
    author: (Array.isArray(d.author_name) ? (d.author_name[0] as string) : '') || 'Unknown',
    year: (d.first_publish_year as number) || '',
    pages: (d.number_of_pages_median as number) || '',
    coverId: (d.cover_i as number) || null,
    subject: (d.subject as string[]) || [],
  }));
}

/** Look up a single cover image for a known title/author. */
export async function findCover(title: string, author: string): Promise<string | null> {
  try {
    const q = new URLSearchParams({ title, author: author || '', limit: '1', fields: 'cover_i' });
    const res = await fetch(`${OL}?${q}`);
    const data = (await res.json()) as { docs?: { cover_i?: number }[] };
    const id = data.docs?.[0]?.cover_i;
    return id ? coverUrlFor(id, 'L') : null;
  } catch {
    return null;
  }
}
