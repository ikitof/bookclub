import type { CSSProperties } from 'react';
import type { Club } from '../useClub';
import { deriveBallot } from '../ballot';
import { BookCard } from './BookCard';

const btnAccent: CSSProperties = {
  background: 'var(--accent)',
  color: 'var(--on-accent)',
  border: 'none',
  borderRadius: 2,
  fontFamily: "'Tangerine'",
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.22)',
  whiteSpace: 'nowrap',
};

function SectionHead({ title, count }: { title: string; count: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '30px 0 16px' }}>
      <span style={{ fontFamily: "'Tangerine'", fontWeight: 700, fontSize: 28, color: 'var(--ink)' }}>{title}</span>
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,var(--rule),transparent)' }} />
      <span style={{ font: "italic 400 16px 'IM Fell English'", color: 'var(--ink-4)' }}>{count}</span>
    </div>
  );
}

export function Pool({ club }: { club: Club }) {
  const { snapshot, me, theme } = club;
  if (!snapshot) return null;
  const { phase, monthLabel } = snapshot.club;
  const pool = snapshot.pool;
  const mySubs = me ? pool.filter((b) => b.by === me.id) : [];
  const phaseIdx = { suggesting: 0, voting: 1, result: 2 }[phase];
  const steps = [
    { num: 'I', label: 'offer' },
    { num: 'II', label: 'ballot' },
    { num: 'III', label: 'record' },
  ];

  const ballot = phase === 'suggesting' ? null : deriveBallot(snapshot, club);
  const totalVotes = ballot?.totalVotes ?? 0;
  let phaseSub: string;
  if (phase === 'suggesting') phaseSub = `${pool.length} volumes rest on the table · you have offered ${mySubs.length} of 2`;
  else if (phase === 'voting') phaseSub = `${totalVotes} of ${snapshot.members.length} marks have been cast`;
  else phaseSub = ballot?.winner ? `${ballot.winner.title} carries the month` : 'The month is settled';

  const gridCols = 'repeat(auto-fill,minmax(150px,1fr))';

  return (
    <div style={{ animation: 'fadeUp 0.5s ease both' }}>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        {steps.map((s, i) => (
          <span
            key={s.num}
            style={{
              color: i === phaseIdx ? 'var(--accent)' : 'var(--ink-4)',
              margin: '0 9px',
              fontVariant: 'small-caps',
              letterSpacing: '0.12em',
              fontSize: 14,
              fontFamily: "'IM Fell English'",
            }}
          >
            {s.num} · {s.label}
          </span>
        ))}
      </div>
      <p
        style={{
          textAlign: 'center',
          maxWidth: 620,
          margin: '2px auto 22px',
          fontFamily: "'Tangerine'",
          fontWeight: 700,
          fontSize: 27,
          lineHeight: 1.25,
          color: 'var(--ink-2)',
        }}
      >
        {phaseSub}
      </p>

      <SectionHead title="Your two volumes" count={`${mySubs.length} of 2`} />
      {mySubs.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 26 }}>
          {mySubs.map((b, i) => (
            <BookCard key={b.id} view={club.view(b, i)} mono={theme.mono} />
          ))}
        </div>
      ) : (
        <div
          style={{
            border: '1.5px dashed var(--accent-line)',
            borderRadius: 3,
            padding: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            flexWrap: 'wrap',
            background: 'var(--card)',
          }}
        >
          <div>
            <div style={{ fontFamily: "'Tangerine'", fontWeight: 700, fontSize: 26, color: 'var(--ink)' }}>
              Your leaf in the ledger is blank
            </div>
            <div style={{ font: "italic 400 17px 'IM Fell English'", color: 'var(--ink-2)', marginTop: 3 }}>
              Inscribe two volumes before the drawing is held.
            </div>
          </div>
          <button onClick={() => club.turnTo('submit')} style={{ ...btnAccent, padding: '9px 24px', fontSize: 21 }}>
            Inscribe your volumes
          </button>
        </div>
      )}

      {phase === 'suggesting' && (
        <div
          style={{
            margin: '26px 0',
            border: '1px solid var(--accent-line)',
            borderRadius: 3,
            padding: '20px 22px',
            background: 'var(--accent-wash)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ font: "600 11px 'IM Fell English'", letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
              the keeper's office
            </div>
            <div style={{ fontFamily: "'Tangerine'", fontWeight: 700, fontSize: 25, color: 'var(--ink)', marginTop: 4 }}>
              Hold this month's drawing
            </div>
            <div style={{ font: "italic 400 16px 'IM Fell English'", color: 'var(--ink-2)' }}>
              Draw two volumes from the table, by lot, for the society to weigh.
            </div>
          </div>
          <button onClick={() => void club.draw()} style={{ ...btnAccent, padding: '10px 26px', fontSize: 22 }}>
            Draw the lots
          </button>
        </div>
      )}
      {phase === 'voting' && (
        <div
          style={{
            margin: '26px 0',
            border: '1px solid var(--accent-line)',
            borderRadius: 3,
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            background: 'var(--card)',
          }}
        >
          <div style={{ fontFamily: "'Tangerine'", fontWeight: 600, fontSize: 22, color: 'var(--ink)' }}>
            The lots are drawn — the ballot is open.
          </div>
          <button
            onClick={() => club.turnTo('vote')}
            style={{
              padding: '8px 22px',
              background: 'transparent',
              color: 'var(--accent)',
              border: '1px solid var(--accent)',
              borderRadius: 2,
              fontFamily: "'Tangerine'",
              fontWeight: 700,
              fontSize: 20,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            To the ballot
          </button>
        </div>
      )}
      {phase === 'result' && (
        <div
          style={{
            margin: '26px 0',
            border: '1px solid var(--accent-line)',
            borderRadius: 3,
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            background: 'var(--card)',
          }}
        >
          <div style={{ fontFamily: "'Tangerine'", fontWeight: 600, fontSize: 22, color: 'var(--ink)' }}>
            The vote is settled for {monthLabel}.
          </div>
          <button onClick={() => club.turnTo('vote')} style={{ ...btnAccent, padding: '8px 22px', fontSize: 20 }}>
            See the chosen volume
          </button>
        </div>
      )}

      <SectionHead title="On the table this month" count={`${pool.length} volumes`} />
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 26 }}>
        {pool.map((b, i) => (
          <BookCard key={b.id} view={club.view(b, i)} mono={theme.mono} showOfferedBy />
        ))}
      </div>
    </div>
  );
}
