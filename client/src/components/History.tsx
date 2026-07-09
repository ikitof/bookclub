import type { Club } from '../useClub';
import type { BookView } from '../view';
import { metaLine } from '../view';
import { genreTint } from '../genres';
import { CoverBox } from './CoverBox';

export function History({ club }: { club: Club }) {
  const { snapshot, mono, coverFor } = club;
  if (!snapshot) return null;

  return (
    <div style={{ animation: 'fadeUp 0.5s ease both', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {snapshot.history.map((h) => {
          const cover = coverFor(h.title, h.author, h.coverUrl);
          const view: BookView = {
            id: String(h.id),
            title: h.title,
            author: h.author,
            genre: h.genre ?? 'Literary',
            tint: genreTint(h.genre, mono),
            meta: metaLine(h.pages, h.year),
            tilt: 0,
            coverUrl: cover,
            noCover: !cover,
            by: { name: '', initials: '?', color: '' },
          };
          return (
            <div
              key={h.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                flexWrap: 'wrap',
                paddingBottom: 16,
                borderBottom: '1px solid var(--hairline)',
              }}
            >
              <div
                style={{
                  width: 58,
                  flex: 'none',
                  background: 'var(--plate)',
                  padding: '5px 5px 6px',
                  border: '1px solid var(--plate-line)',
                  boxShadow: '0 6px 14px -9px rgba(20,15,5,0.55)',
                  transform: 'rotate(-1.5deg)',
                }}
              >
                <CoverBox view={view} mono={mono} fallback="none" />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ font: "600 11px 'IM Fell English'", letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>
                  {h.month}
                </div>
                <div style={{ marginTop: 3, fontFamily: "'Tangerine'", fontWeight: 700, fontSize: 25, lineHeight: 1.05, color: 'var(--ink)' }}>
                  {h.title}
                </div>
                <div style={{ marginTop: 2, font: "italic 400 15px 'IM Fell English'", color: 'var(--ink-2)' }}>
                  {h.author}
                  {view.meta ? ` · ${view.meta}` : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Tangerine'", fontWeight: 700, fontSize: 20, color: 'var(--ink)' }}>l’emporte {h.tally}</div>
                {h.runnerUp && (
                  <div style={{ font: "italic 400 14px 'IM Fell English'", color: 'var(--ink-3)' }}>devant {h.runnerUp}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
