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
    { num: 'I', label: 'offrande' },
    { num: 'II', label: 'scrutin' },
    { num: 'III', label: 'registre' },
  ];

  const ballot = phase === 'suggesting' ? null : deriveBallot(snapshot, club);
  const totalVotes = ballot?.totalVotes ?? 0;
  let phaseSub: string;
  if (phase === 'suggesting') phaseSub = `${pool.length} volumes reposent sur la table · vous en avez proposé ${mySubs.length} sur 2`;
  else if (phase === 'voting') phaseSub = `${totalVotes} voix sur ${snapshot.members.length} ont été exprimées`;
  else phaseSub = ballot?.winner ? `${ballot.winner.title} l’emporte ce mois-ci` : 'Le mois est décidé';

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

      <SectionHead title="Vos deux volumes" count={`${mySubs.length} sur 2`} />
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
              Votre feuillet dans le registre est vierge
            </div>
            <div style={{ font: "italic 400 17px 'IM Fell English'", color: 'var(--ink-2)', marginTop: 3 }}>
              Inscrivez deux volumes avant le tirage au sort.
            </div>
          </div>
          <button onClick={() => club.turnTo('submit')} style={{ ...btnAccent, padding: '9px 24px', fontSize: 21 }}>
            Inscrire vos volumes
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
              le bureau du gardien
            </div>
            <div style={{ fontFamily: "'Tangerine'", fontWeight: 700, fontSize: 25, color: 'var(--ink)', marginTop: 4 }}>
              Procéder au tirage du mois
            </div>
            <div style={{ font: "italic 400 16px 'IM Fell English'", color: 'var(--ink-2)' }}>
              Tirez deux volumes de la table, au sort, pour que la société les départage.
            </div>
          </div>
          <button onClick={() => void club.draw()} style={{ ...btnAccent, padding: '10px 26px', fontSize: 22 }}>
            Tirer au sort
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
            Les sorts sont tirés — le scrutin est ouvert.
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
            Au scrutin
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
            Le vote est clos pour {monthLabel}.
          </div>
          <button onClick={() => club.turnTo('vote')} style={{ ...btnAccent, padding: '8px 22px', fontSize: 20 }}>
            Voir le volume élu
          </button>
        </div>
      )}

      <SectionHead title="Sur la table ce mois-ci" count={`${pool.length} volumes`} />
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 26 }}>
        {pool.map((b, i) => (
          <BookCard key={b.id} view={club.view(b, i)} mono={theme.mono} showOfferedBy />
        ))}
      </div>
    </div>
  );
}
