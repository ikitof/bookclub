import type { Club } from '../useClub';
import { CoverBox } from './CoverBox';

export function DrawOverlay({ club }: { club: Club }) {
  const { drawSpin, snapshot } = club;
  if (!drawSpin || !snapshot) return null;
  const bookById = (id: string) => snapshot.pool.find((b) => b.id === id);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'var(--scrim)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
        padding: 24,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ font: "600 12px 'IM Fell English'", letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--foil-2)' }}>
          tirage au sort
        </div>
        <div style={{ marginTop: 6, fontFamily: "'Tangerine'", fontWeight: 700, fontSize: 40, color: 'var(--foil)' }}>
          Deux volumes choisis par le hasard…
        </div>
      </div>
      <div style={{ display: 'flex', gap: 22 }}>
        {drawSpin.map((id, i) => {
          const book = bookById(id);
          if (!book) return null;
          return (
            <div
              key={i}
              style={{
                width: 140,
                animation: `flick 0.3s linear infinite${i === 1 ? ' reverse' : ''}`,
                background: 'var(--plate)',
                padding: '8px 8px 10px',
                border: '1px solid var(--plate-line)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
              }}
            >
              <CoverBox view={club.view(book, null)} mono={club.mono} fallback="title" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
