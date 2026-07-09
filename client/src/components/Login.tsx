import type { Club } from '../useClub';
import { sealColor } from '../view';
import { Orb } from './Orb';

interface Props {
  club: Club;
}

export function Login({ club }: Props) {
  const { snapshot, theme } = club;
  const clubName = snapshot?.club.name ?? 'Lamplight';
  const members = snapshot?.members ?? [];

  return (
    <div style={{ position: 'relative', width: 'min(720px, 96vw)', animation: 'fadeUp 0.6s ease both' }}>
      <div
        style={{
          position: 'absolute',
          top: -2,
          right: '16%',
          width: 26,
          height: 132,
          background: 'var(--cover-ribbon)',
          clipPath: 'polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)',
          boxShadow: '2px 2px 6px rgba(0,0,0,0.4)',
          zIndex: 3,
        }}
      />
      <div
        style={{
          position: 'relative',
          background: 'var(--cover-binding)',
          borderRadius: '5px 9px 9px 5px',
          padding: 'clamp(30px,5vw,56px)',
          boxShadow:
            'inset 0 0 0 2px var(--cover-line), inset 0 0 90px rgba(0,0,0,0.4), 20px 26px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 16,
            background: 'linear-gradient(90deg,rgba(0,0,0,0.45),rgba(0,0,0,0))',
          }}
        />
        <div
          style={{
            border: '1.5px solid var(--cover-line)',
            borderRadius: 3,
            padding: 'clamp(30px,4.5vw,48px) clamp(22px,4vw,42px)',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <Orb size={48} />
          </div>
          <h1
            style={{
              margin: '0 auto',
              maxWidth: '9em',
              fontFamily: "'Tangerine'",
              fontWeight: 700,
              fontSize: 'clamp(46px,9vw,84px)',
              lineHeight: 0.98,
              color: 'var(--cover-foil)',
              textShadow: '0 1px 0 rgba(0,0,0,0.4)',
            }}
          >
            {clubName}
          </h1>
          <div
            style={{
              marginTop: 10,
              fontFamily: "'Tangerine'",
              fontWeight: 500,
              fontSize: 'clamp(19px,3.4vw,26px)',
              color: 'var(--cover-foil-2)',
            }}
          >
            a reading society
          </div>
          <div style={{ margin: '18px auto 8px', color: 'var(--cover-foil-2)', fontSize: 22 }}>❦</div>
          <div
            style={{
              font: "500 13px/1 'IM Fell English'",
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--cover-foil-2)',
              marginBottom: 18,
            }}
          >
            This volume belongs to
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(118px,1fr))',
              gap: 12,
              maxWidth: 520,
              margin: '0 auto',
            }}
          >
            {members.map((m) => (
              <button
                key={m.id}
                className="lp-member"
                onClick={() => void club.signIn(m.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 8px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--cover-line)',
                  borderRadius: 3,
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    background: sealColor(m, theme.mono),
                    border: '2px solid rgba(0,0,0,0.28)',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.35)',
                    color: '#f4efe6',
                    font: "600 20px/40px 'Tangerine'",
                    textAlign: 'center',
                  }}
                >
                  {m.initials}
                </span>
                <span style={{ fontFamily: "'Tangerine'", fontWeight: 600, fontSize: 20, color: 'var(--cover-foil)' }}>
                  {m.name}
                </span>
              </button>
            ))}
          </div>
          <div
            style={{
              marginTop: 20,
              fontFamily: "'Tangerine'",
              fontWeight: 500,
              fontSize: 18,
              color: 'var(--cover-foil-2)',
            }}
          >
            Open the cover to begin · Est. 2026
          </div>
        </div>
      </div>
    </div>
  );
}
