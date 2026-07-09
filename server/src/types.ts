export type Phase = 'suggesting' | 'voting' | 'result';

export interface Member {
  id: string;
  name: string;
  initials: string;
  color: string; // seal colour in the antiquarian theme
  gray: string; // seal colour in the monochrome theme
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  pages: number | null;
  year: number | null;
  coverUrl: string | null;
  by: string; // member id who offered it
}

export interface HistoryEntry {
  id: number;
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

/** The shared state every client sees. Per-member fields (who I am, how I
 *  voted) are derived on the client from its own session + this snapshot. */
export interface Snapshot {
  club: {
    name: string;
    monthLabel: string;
    monthIdx: number;
    phase: Phase;
    liveTally: boolean;
  };
  members: Member[];
  pool: Book[];
  drawn: [string, string] | null;
  votes: Record<string, string[]>; // book id -> member ids
  history: HistoryEntry[];
}
