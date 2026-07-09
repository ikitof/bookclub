import type { Club } from '../useClub';
import type { Palette } from '../theme';

export function ThemeToggle({ club }: { club: Club }) {
  const swatch = (palette: Palette, background: string, title: string) => (
    <button
      title={title}
      aria-label={title}
      onClick={() => club.setPalette(palette)}
      style={{
        width: 15,
        height: 15,
        borderRadius: 999,
        background,
        border: club.palette === palette ? '2px solid rgba(255,255,255,0.85)' : '1px solid rgba(255,255,255,0.3)',
        cursor: 'pointer',
        padding: 0,
      }}
    />
  );

  return (
    <div style={{ position: 'fixed', bottom: 14, left: 16, zIndex: 80, display: 'flex', gap: 8, alignItems: 'center', opacity: 0.75 }}>
      {swatch('monochrome', 'linear-gradient(135deg,#efefef,#777)', 'Monochrome')}
      {swatch('antiquarian', 'linear-gradient(135deg,#E7C878,#8C2F2C)', 'Antiquarian')}
    </div>
  );
}
