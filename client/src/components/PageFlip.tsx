import type { Club } from '../useClub';

export function PageFlip({ club }: { club: Club }) {
  const { flip, snapshot } = club;
  if (!flip.active) return null;
  const clubName = snapshot?.club.name ?? 'Lamplight';
  const clubInitial = (clubName || 'L').trim().charAt(0).toUpperCase();
  const isOpen = flip.kind === 'open';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transformOrigin: 'left center',
        transformStyle: 'preserve-3d',
        zIndex: 20,
        pointerEvents: 'none',
        borderRadius: '2px 4px 4px 2px',
        animation: 'leafTurn 0.98s cubic-bezier(0.42,0,0.14,1) forwards, leafLift 0.98s ease-in-out forwards',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          overflow: 'hidden',
          borderRadius: '2px 4px 4px 2px',
        }}
      >
        {isOpen ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--cover-binding)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: 'inset 0 0 0 2px var(--cover-line), inset 0 0 90px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ border: '1.5px solid var(--cover-line)', padding: '24px 40px', textAlign: 'center', maxWidth: '80%' }}>
              <h1
                style={{
                  margin: 0,
                  maxWidth: '8em',
                  fontFamily: "'Tangerine'",
                  fontWeight: 700,
                  fontSize: 'clamp(26px,4.5vw,40px)',
                  lineHeight: 1.04,
                  color: 'var(--cover-foil)',
                }}
              >
                {clubName}
              </h1>
              <div style={{ marginTop: 6, fontFamily: "'Tangerine'", fontWeight: 500, fontSize: 20, color: 'var(--cover-foil-2)' }}>
                a reading society
              </div>
              <div style={{ marginTop: 12, color: 'var(--cover-foil-2)', fontSize: 22 }}>❦</div>
            </div>
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--paper)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: 999,
                border: '1.5px solid var(--rule)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Tangerine'",
                fontSize: 44,
                color: 'var(--ink-3)',
              }}
            >
              {clubInitial}
            </div>
            <div style={{ marginTop: 16, color: 'var(--rule)', fontSize: 22 }}>❦</div>
          </div>
        )}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 44, background: 'linear-gradient(90deg,rgba(0,0,0,0.28),rgba(0,0,0,0))' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg,rgba(0,0,0,0.4),rgba(0,0,0,0) 46%)', animation: 'leafShade 0.98s ease-in-out forwards' }} />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: 'rotateY(180deg)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          overflow: 'hidden',
          borderRadius: '2px 4px 4px 2px',
          background: 'var(--paper)',
        }}
      >
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 44, background: 'linear-gradient(270deg,rgba(0,0,0,0.2),rgba(0,0,0,0))' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.45, color: 'var(--rule)', fontSize: 26 }}>
          ❦
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(260deg,rgba(0,0,0,0.22),rgba(0,0,0,0) 42%)', animation: 'leafShadeBack 0.98s ease-in-out forwards' }} />
      </div>
    </div>
  );
}
