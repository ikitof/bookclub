import type { CSSProperties } from 'react';
import type { BookView } from '../view';
import { CoverBox } from './CoverBox';

interface Props {
  view: BookView;
  mono: boolean;
  showOfferedBy?: boolean;
}

export function BookCard({ view, mono, showOfferedBy = false }: Props) {
  return (
    <div className="lp-plate" style={{ '--tilt': `${view.tilt}deg` } as CSSProperties}>
      <div
        style={{
          background: 'var(--plate)',
          padding: '9px 9px 11px',
          border: '1px solid var(--plate-line)',
          boxShadow: '0 9px 22px -12px rgba(20,15,5,0.55)',
        }}
      >
        <CoverBox view={view} mono={mono} tape fallback="lg" />
        <div style={{ padding: '9px 3px 2px' }}>
          <div style={{ fontFamily: "'Tangerine'", fontWeight: 700, fontSize: 20, lineHeight: 1.1, color: 'var(--ink)' }}>
            {view.title}
          </div>
          <div style={{ font: "italic 400 14px 'IM Fell English'", color: 'var(--ink-2)' }}>{view.meta}</div>
          {showOfferedBy && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6 }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  background: view.by.color,
                  border: '1.5px solid rgba(0,0,0,0.2)',
                  color: '#f2f2f0',
                  font: "600 11px/17px 'Tangerine'",
                  textAlign: 'center',
                  flex: 'none',
                }}
              >
                {view.by.initials}
              </span>
              <span style={{ font: "italic 400 13.5px 'IM Fell English'", color: 'var(--ink-3)' }}>
                proposé par {view.by.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
