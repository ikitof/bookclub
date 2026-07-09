export type Phase = 'suggesting' | 'voting' | 'result';

export interface Member {
  id: string;
  name: string;
  initials: string;
  color: string;
  gray: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  pages: number | null;
  year: number | null;
  coverUrl: string | null;
  by: string;
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
  votes: Record<string, string[]>;
  history: HistoryEntry[];
}

export type Screen = 'login' | 'pool' | 'submit' | 'vote' | 'history';

/** A draft volume in the Inscribe form. */
export interface Draft {
  title: string;
  author: string;
  genre: string;
  pages: string;
  year: string;
  coverUrl: string | null;
}
