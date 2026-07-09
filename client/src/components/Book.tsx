import type { ReactNode } from 'react';
import type { Club } from '../useClub';
import type { Screen } from '../types';
import { sealColor } from '../view';
import { PageFlip } from './PageFlip';

const CHAPTERS: Record<Exclude<Screen, 'login'>, { eyebrowFixed?: string; title: string }> = {
  pool: { title: 'La table du mois' },
  submit: { eyebrowFixed: 'vos contributions', title: 'Inscrivez deux volumes' },
  vote: { title: 'Le scrutin' },
  history: { eyebrowFixed: 'depuis la première réunion', title: 'Le registre' },
};

const NAV: { key: Screen; label: string }[] = [
  { key: 'pool', label: 'La table' },
  { key: 'submit', label: 'Inscrire' },
  { key: 'vote', label: 'Le scrutin' },
  { key: 'history', label: 'Le registre' },
];

export function Book({ club, children }: { club: Club; children: ReactNode }) {
  const { snapshot, me, screen, mono } = club;
  const monthLabel = snapshot?.club.monthLabel ?? '';
  const clubName = snapshot?.club.name ?? 'The Smallest Book Club Who Ever Lived';
  const chapter = screen === 'login' ? CHAPTERS.pool : CHAPTERS[screen];
  const eyebrow = chapter.eyebrowFixed ?? monthLabel;

  return (
    <div style={{ position: 'relative', width: 'min(1060px, 96vw)', height: 'min(90vh, 900px)', perspective: 2400, perspectiveOrigin: '12% 50%' }}>
      <div
        style={{
          position: 'absolute',
          top: -3,
          right: 16,
          width: 20,
          height: 132,
          background: 'var(--ribbon)',
          clipPath: 'polygon(0 0,100% 0,100% 100%,50% 84%,0 100%)',
          boxShadow: '2px 2px 6px rgba(0,0,0,0.45)',
          zIndex: 6,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          height: '100%',
          background: 'var(--binding)',
          borderRadius: '4px 8px 8px 4px',
          padding: '13px 13px 15px 17px',
          boxShadow: '20px 26px 62px rgba(0,0,0,0.62), inset 0 0 0 2px var(--binding-line)',
        }}
      >
        <div style={{ position: 'relative', height: '100%' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '2px 4px 4px 2px', boxShadow: '4px 5px 0 var(--edge), 8px 10px 0 var(--edge), 12px 15px 0 var(--edge)' }} />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '2px 4px 4px 2px',
              overflow: 'hidden',
              background: 'var(--paper)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 34, background: 'var(--spine)', pointerEvents: 'none' }} />

            {/* running head */}
            <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px clamp(20px,4vw,46px) 0' }}>
              <span style={{ font: "500 12.5px/1 'IM Fell English'", letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                {clubName}
              </span>
              {me && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      background: sealColor(me, mono),
                      border: '2px solid rgba(0,0,0,0.22)',
                      boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.3)',
                      color: '#f2f2f0',
                      font: "600 16px/30px 'Tangerine'",
                      textAlign: 'center',
                    }}
                  >
                    {me.initials}
                  </span>
                  <div style={{ lineHeight: 1.1 }}>
                    <div style={{ fontFamily: "'Tangerine'", fontWeight: 600, fontSize: 19, color: 'var(--ink)' }}>{me.name}</div>
                    <button
                      onClick={() => void club.signOut()}
                      className="lp-link"
                      style={{ background: 'none', border: 'none', padding: 0, font: "italic 400 13px 'IM Fell English'", color: 'var(--ink-4)', cursor: 'pointer' }}
                    >
                      refermer le livre
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* chapter title */}
            <div style={{ flex: 'none', textAlign: 'center', padding: '12px clamp(20px,4vw,46px) 6px' }}>
              <div style={{ font: "500 12.5px/1 'IM Fell English'", letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{eyebrow}</div>
              <h2 style={{ margin: '4px 0 8px', fontFamily: "'Tangerine'", fontWeight: 700, fontSize: 'clamp(50px,8vw,82px)', lineHeight: 0.98, color: 'var(--ink)' }}>
                {chapter.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--rule)' }}>
                <span style={{ height: 1, width: 52, background: 'linear-gradient(90deg,transparent,var(--rule))' }} />
                <span style={{ fontSize: 17 }}>❦</span>
                <span style={{ height: 1, width: 52, background: 'linear-gradient(270deg,transparent,var(--rule))' }} />
              </div>
            </div>

            {/* content */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px clamp(20px,4vw,46px) 20px' }}>{children}</div>

            {/* footer */}
            <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px clamp(20px,4vw,46px) 14px', borderTop: '1px solid var(--hairline)' }}>
              <div style={{ display: 'flex', gap: 'clamp(12px,2.4vw,24px)', alignItems: 'center', flexWrap: 'wrap' }}>
                {NAV.map((n) => {
                  const active = screen === n.key;
                  return (
                    <button
                      key={n.key}
                      onClick={() => club.turnTo(n.key)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '2px 1px 3px',
                        fontFamily: "'Tangerine'",
                        fontWeight: 600,
                        fontSize: 22,
                        color: active ? 'var(--accent)' : 'var(--nav-off)',
                        borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                        cursor: 'pointer',
                      }}
                    >
                      {n.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ font: "italic 400 16px 'IM Fell English'", color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>{monthLabel}</div>
            </div>
          </div>

          <PageFlip club={club} />
        </div>
      </div>
    </div>
  );
}
