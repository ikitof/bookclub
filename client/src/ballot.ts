import { sealColor, type BookView } from './view';
import type { Book, Member, Snapshot } from './types';

export interface Voter {
  name: string;
  initials: string;
  color: string;
}

export interface VoteSide extends BookView {
  count: number;
  pct: number;
  pctStr: string;
  voters: Voter[];
  mine: boolean;
  strokes: { ml: string }[];
  noVotes: boolean;
  win: boolean;
  ring: string;
}

export interface Ballot {
  voteA: VoteSide;
  voteB: VoteSide;
  totalVotes: number;
  winner: VoteSide | null;
  loser: VoteSide | null;
  tallyStr: string;
}

interface Deps {
  view: (book: Book, index: number | null) => BookView;
  memberById: (id: string) => Member | undefined;
  mono: boolean;
  myVote: string | null;
}

export function deriveBallot(snapshot: Snapshot, deps: Deps): Ballot | null {
  if (!snapshot.drawn) return null;
  const { view, memberById, mono, myVote } = deps;
  const [idA, idB] = snapshot.drawn;
  const byId = (id: string) => snapshot.pool.find((b) => b.id === id);
  const totalVotes = (snapshot.votes[idA]?.length ?? 0) + (snapshot.votes[idB]?.length ?? 0);

  const side = (id: string): VoteSide => {
    const book = byId(id);
    const base: BookView = book
      ? view(book, null)
      : {
          id,
          title: 'A volume',
          author: '',
          genre: 'Literary',
          tint: 'var(--ink-3)',
          meta: '',
          tilt: 0,
          coverUrl: null,
          noCover: true,
          by: { name: '', initials: '?', color: sealColor(null, mono) },
        };
    const voters = (snapshot.votes[id] ?? [])
      .map(memberById)
      .filter((m): m is Member => !!m)
      .map((m) => ({ name: m.name, initials: m.initials, color: sealColor(m, mono) }));
    const count = voters.length;
    return {
      ...base,
      count,
      pct: totalVotes ? Math.round((count / totalVotes) * 100) : 0,
      pctStr: `${totalVotes ? Math.round((count / totalVotes) * 100) : 0}%`,
      voters,
      mine: myVote === id,
      strokes: Array.from({ length: count }, (_, i) => ({ ml: i > 0 && i % 5 === 0 ? '10px' : '4px' })),
      noVotes: count === 0,
      win: false,
      ring: 'var(--plate-line)',
    };
  };

  const voteA = side(idA);
  const voteB = side(idB);
  const tie = voteA.count === voteB.count;
  const winner = tie || voteA.count > voteB.count ? voteA : voteB;
  const loser = winner === voteA ? voteB : voteA;

  // The winner is only revealed once the ballot is sealed.
  if (snapshot.club.phase === 'result') {
    if (tie) voteA.win = voteB.win = true;
    else winner.win = true;
  }

  const tallyStr = `${winner.count}–${loser.count}`;
  voteA.ring = voteA.win || voteA.mine ? 'var(--accent)' : 'var(--plate-line)';
  voteB.ring = voteB.win || voteB.mine ? 'var(--accent)' : 'var(--plate-line)';

  return { voteA, voteB, totalVotes, winner, loser, tallyStr };
}
