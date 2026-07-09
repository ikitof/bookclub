import type { CSSProperties } from 'react';
import type { BookView } from '../view';

type Scale = 'lg' | 'md' | 'sm' | 'title' | 'none';

// Typographic fallback sizes, matched to each context in the design.
const SCALE: Record<Exclude<Scale, 'none'>, {
  pad: number;
  genre: number;
  ls: string;
  orn: number;
  title: number;
  author: number;
  gap: number;
}> = {
  lg: { pad: 12, genre: 10, ls: '0.2em', orn: 13, title: 22, author: 13, gap: 6 },
  md: { pad: 9, genre: 9, ls: '0.16em', orn: 12, title: 17, author: 0, gap: 4 },
  sm: { pad: 8, genre: 8, ls: '0.16em', orn: 11, title: 16, author: 11, gap: 4 },
  title: { pad: 10, genre: 0, ls: '0', orn: 0, title: 19, author: 0, gap: 0 },
};

interface Props {
  view: BookView;
  mono: boolean;
  tape?: boolean;
  fallback?: Scale;
}

export function CoverBox({ view, mono, tape = false, fallback = 'lg' }: Props) {
  const s = fallback === 'none' ? null : SCALE[fallback];
  return (
    <div style={{ position: 'relative', aspectRatio: '2 / 3', overflow: 'hidden', background: 'var(--fallback)' }}>
      {view.coverUrl && (
        <img
          src={view.coverUrl}
          alt=""
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            ...(mono ? { filter: 'grayscale(1) contrast(1.03)' } : {}),
          }}
        />
      )}
      {tape && (
        <div
          style={{
            position: 'absolute',
            top: -5,
            left: '50%',
            transform: 'translateX(-50%) rotate(-2deg)',
            width: 52,
            height: 15,
            background: 'var(--tape)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
          }}
        />
      )}
      {view.noCover && s && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: s.pad,
          }}
        >
          {s.genre > 0 && (
            <div
              style={{
                font: `600 ${s.genre}px 'IM Fell English'`,
                letterSpacing: s.ls,
                textTransform: 'uppercase',
                color: view.tint,
              } as CSSProperties}
            >
              {view.genre}
            </div>
          )}
          {s.orn > 0 && <div style={{ color: 'var(--rule)', margin: `${s.gap}px 0`, fontSize: s.orn }}>❧</div>}
          <div
            style={{
              fontFamily: "'Tangerine'",
              fontWeight: 700,
              fontSize: s.title,
              lineHeight: 1.05,
              color: 'var(--ink)',
            }}
          >
            {view.title}
          </div>
          {s.author > 0 && (
            <div style={{ marginTop: 4, font: `italic 400 ${s.author}px 'IM Fell English'`, color: 'var(--ink-2)' }}>
              {view.author}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
