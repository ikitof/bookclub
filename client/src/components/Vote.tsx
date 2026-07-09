import type { Club } from '../useClub';
import { deriveBallot, type VoteSide } from '../ballot';
import { api } from '../api';
import { CoverBox } from './CoverBox';

function VoteCard({ side, mono, showTally, onVote }: { side: VoteSide; mono: boolean; showTally: boolean; onVote: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 260,
        maxWidth: 420,
        border: `2px solid ${side.ring}`,
        borderRadius: 3,
        padding: 20,
        background: 'var(--card)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'border-color 0.3s',
      }}
    >
      {side.win && (
        <div style={{ alignSelf: 'center', font: "600 12px 'IM Fell English'", letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          — la société choisit —
        </div>
      )}
      <div style={{ display: 'flex', gap: 16 }}>
        <div
          style={{
            width: 110,
            flex: 'none',
            background: 'var(--plate)',
            padding: '7px 7px 9px',
            border: '1px solid var(--plate-line)',
            boxShadow: '0 8px 18px -11px rgba(20,15,5,0.55)',
          }}
        >
          <CoverBox view={side} mono={mono} fallback="md" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ font: "600 10.5px 'IM Fell English'", letterSpacing: '0.16em', textTransform: 'uppercase', color: side.tint }}>
            {side.genre}
          </div>
          <div style={{ marginTop: 5, fontFamily: "'Tangerine'", fontWeight: 700, fontSize: 29, lineHeight: 1.0, color: 'var(--ink)' }}>
            {side.title}
          </div>
          <div style={{ marginTop: 4, font: "italic 400 16px 'IM Fell English'", color: 'var(--ink-2)' }}>{side.author}</div>
          <div style={{ marginTop: 3, font: "400 14px 'IM Fell English'", color: 'var(--ink-3)' }}>{side.meta}</div>
        </div>
      </div>

      {showTally ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 28, marginBottom: 6 }}>
            {side.strokes.map((s, i) => (
              <span key={i} style={{ width: 2, height: 24, background: 'var(--accent)', marginLeft: s.ml, display: 'block' }} />
            ))}
            {side.noVotes && <span style={{ font: "italic 400 15px 'IM Fell English'", color: 'var(--ink-4)' }}>aucune voix</span>}
          </div>
          <div style={{ fontFamily: "'Tangerine'", fontSize: 22, color: 'var(--ink)' }}>
            <span style={{ fontWeight: 700 }}>{side.count}</span> <span style={{ color: 'var(--ink-3)' }}>voix · {side.pctStr}</span>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {side.voters.map((v, i) => (
              <span
                key={i}
                title={v.name}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: v.color,
                  border: '1.5px solid rgba(0,0,0,0.2)',
                  color: '#f2f2f0',
                  font: "600 12px/21px 'Tangerine'",
                  textAlign: 'center',
                }}
              >
                {v.initials}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ font: "italic 400 15px 'IM Fell English'", color: 'var(--ink-4)' }}>
          Le décompte est scellé jusqu’à votre vote.
        </div>
      )}

      <button
        onClick={onVote}
        style={{
          marginTop: 'auto',
          padding: '9px 18px',
          border: '1px solid var(--accent)',
          borderRadius: 2,
          background: side.mine ? 'var(--accent)' : 'transparent',
          color: side.mine ? 'var(--on-accent)' : 'var(--accent)',
          fontFamily: "'Tangerine'",
          fontWeight: 700,
          fontSize: 20,
          cursor: 'pointer',
        }}
      >
        {side.mine ? 'Votre voix est donnée' : 'Voter'}
      </button>
    </div>
  );
}

export function Vote({ club }: { club: Club }) {
  const { snapshot } = club;
  if (!snapshot) return null;
  const ballot = deriveBallot(snapshot, club);
  const phase = snapshot.club.phase;
  const showTally = snapshot.club.liveTally || !!club.myVote;

  const cast = async (bookId: string) => {
    try {
      club.applySnapshot(await api.vote(bookId));
      club.showToast('Votre voix est enregistrée.');
    } catch (err) {
      club.showToast(err instanceof Error ? err.message : 'Votre voix n’a pas pu être enregistrée.');
    }
  };
  const seal = async () => {
    try {
      club.applySnapshot(await api.seal());
      club.showToast('Le scrutin est scellé.');
    } catch (err) {
      club.showToast(err instanceof Error ? err.message : 'Le scrutin n’a pas pu être scellé.');
    }
  };
  const nextMonth = async () => {
    try {
      club.applySnapshot(await api.nextMonth());
      club.turnTo('pool');
      club.showToast('Un nouveau mois s’ouvre — les propositions sont les bienvenues.');
    } catch (err) {
      club.showToast(err instanceof Error ? err.message : 'Un nouveau mois n’a pas pu être ouvert.');
    }
  };

  if (!ballot) {
    return (
      <div style={{ animation: 'fadeUp 0.5s ease both' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: 520, margin: '0 auto' }}>
          <div style={{ color: 'var(--rule)', fontSize: 26 }}>❦</div>
          <div style={{ fontFamily: "'Tangerine'", fontWeight: 700, fontSize: 30, color: 'var(--ink)', margin: '8px 0' }}>
            Les sorts ne sont pas encore tirés
          </div>
          <div style={{ fontFamily: "'Tangerine'", fontWeight: 500, fontSize: 20, lineHeight: 1.35, color: 'var(--ink-2)', marginBottom: 22 }}>
            Deux volumes sont tirés au sort une fois les propositions du mois réunies. Le gardien procède au tirage depuis la table.
          </div>
          <button
            onClick={() => club.turnTo('pool')}
            style={{
              padding: '9px 24px',
              background: 'transparent',
              color: 'var(--accent)',
              border: '1px solid var(--accent)',
              borderRadius: 2,
              fontFamily: "'Tangerine'",
              fontWeight: 700,
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            Retour à la table
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeUp 0.5s ease both' }}>
      <div style={{ display: 'flex', gap: 22, alignItems: 'stretch', justifyContent: 'center', flexWrap: 'wrap' }}>
        <VoteCard side={ballot.voteA} mono={club.mono} showTally={showTally} onVote={() => void cast(ballot.voteA.id)} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Tangerine'", fontWeight: 500, fontSize: 32, color: 'var(--ink-4)' }}>
          ou
        </div>
        <VoteCard side={ballot.voteB} mono={club.mono} showTally={showTally} onVote={() => void cast(ballot.voteB.id)} />
      </div>

      <div style={{ marginTop: 24, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
        {phase === 'voting' && (
          <div
            style={{
              border: '1px solid var(--accent-line)',
              borderRadius: 3,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              flexWrap: 'wrap',
              background: 'var(--card)',
            }}
          >
            <div style={{ fontFamily: "'Tangerine'", fontWeight: 600, fontSize: 20, color: 'var(--ink)' }}>
              Gardien — scellez le scrutin pour arrêter le décompte et désigner la lecture du mois.
            </div>
            <button
              onClick={() => void seal()}
              style={{
                padding: '8px 20px',
                background: 'var(--accent)',
                color: 'var(--on-accent)',
                border: 'none',
                borderRadius: 2,
                fontFamily: "'Tangerine'",
                fontWeight: 700,
                fontSize: 19,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Sceller le scrutin
            </button>
          </div>
        )}
        {phase === 'result' && (
          <div style={{ border: '1.5px solid var(--rule)', borderRadius: 3, padding: '20px 22px', textAlign: 'center', background: 'var(--card)' }}>
            <div style={{ font: "600 12px 'IM Fell English'", letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
              ce mois-ci, nous lisons
            </div>
            <div style={{ margin: '6px 0 4px', fontFamily: "'Tangerine'", fontWeight: 700, fontSize: 33, lineHeight: 1.0, color: 'var(--ink)' }}>
              {ballot.winner?.title}
            </div>
            <div style={{ font: "italic 400 17px 'IM Fell English'", color: 'var(--ink-2)' }}>
              {ballot.winner?.author} · l’emporte {ballot.tallyStr}
            </div>
            <button
              onClick={() => void nextMonth()}
              style={{
                marginTop: 16,
                padding: '9px 26px',
                background: 'var(--accent)',
                color: 'var(--on-accent)',
                border: 'none',
                borderRadius: 2,
                fontFamily: "'Tangerine'",
                fontWeight: 700,
                fontSize: 20,
                cursor: 'pointer',
                boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.22)',
              }}
            >
              Commencer un nouveau mois
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
