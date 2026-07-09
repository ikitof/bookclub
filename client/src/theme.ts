import type { CSSProperties } from 'react';

export type Palette = 'monochrome' | 'antiquarian';

export interface Theme {
  binding: string;
  bindingLine: string;
  ribbon: string;
  foil: string;
  foil2: string;
  paper: string;
  spine: string;
  edge: string;
  plate: string;
  plateLine: string;
  card: string;
  fallback: string;
  tape: string;
  ink: string;
  ink2: string;
  ink3: string;
  ink4: string;
  rule: string;
  hairline: string;
  navOff: string;
  onAccent: string;
  toastBg: string;
  toastInk: string;
  scrim: string;
  openDesk: string;
  coverBinding: string;
  coverLine: string;
  coverRibbon: string;
  coverFoil: string;
  coverFoil2: string;
  coverDesk: string;
  accent: string;
  accentLine: string;
  accentWash: string;
  mono: boolean;
}

function hexToRgba(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const WARM_DESK =
  'radial-gradient(1100px 640px at 50% -12%, rgba(245,196,120,0.20), rgba(27,18,12,0) 60%), radial-gradient(900px 520px at 50% 118%, rgba(150,86,38,0.12), rgba(27,18,12,0) 58%), #1B120C';

export function buildTheme(palette: Palette, accentProp: string): Theme {
  const mono = palette === 'monochrome';
  const accent = mono ? '#1F1F1F' : accentProp;

  const base = mono
    ? {
        binding: 'linear-gradient(120deg,#2b2b2d,#171719 58%,#101012)',
        bindingLine: 'rgba(220,220,224,0.42)',
        ribbon: 'linear-gradient(180deg,#4c4c4e,#232325)',
        foil: '#E8E8EA',
        foil2: '#C4C4C7',
        paper:
          'radial-gradient(120% 90% at 82% 12%, rgba(255,255,255,0.7), rgba(0,0,0,0) 46%), linear-gradient(100deg,#EDEDEA 0%,#F5F5F2 12%,#FAFAF8 46%,#F0F0ED 100%)',
        spine: 'linear-gradient(90deg,rgba(0,0,0,0.13),rgba(0,0,0,0))',
        edge: '#E4E4E1',
        plate: '#FBFBF9',
        plateLine: '#CFCFCF',
        card: 'rgba(255,255,255,0.5)',
        fallback: 'linear-gradient(165deg,#ECECEC,#D9D9D9)',
        tape: 'rgba(120,120,120,0.22)',
        ink: '#1A1A1A',
        ink2: '#4C4C4C',
        ink3: '#6E6E6E',
        ink4: '#8A8A8A',
        rule: '#9C9C9C',
        hairline: '#DADADA',
        navOff: '#5A5A5A',
        onAccent: '#FFFFFF',
        toastBg: '#1B1B1C',
        toastInk: '#EAEAEA',
        scrim: 'rgba(12,12,14,0.93)',
        openDesk:
          'radial-gradient(1100px 640px at 50% -12%, rgba(255,255,255,0.05), rgba(12,12,14,0) 60%), #0D0D0F',
        coverBinding: 'linear-gradient(120deg,#2E4E44,#213A31 55%,#18302A)',
        coverLine: 'rgba(201,162,75,0.55)',
        coverRibbon: 'linear-gradient(180deg,#A63E36,#6E221E)',
        coverFoil: '#EBD08A',
        coverFoil2: '#ECD9A6',
        coverDesk:
          'radial-gradient(1150px 660px at 50% -14%, rgba(233,190,120,0.22), rgba(16,20,23,0) 58%), radial-gradient(950px 560px at 50% 122%, rgba(44,92,80,0.20), rgba(16,20,23,0) 60%), #101417',
      }
    : {
        binding: 'linear-gradient(120deg,#662623,#54201E 58%,#4a1a18)',
        bindingLine: 'rgba(201,162,75,0.5)',
        ribbon: 'linear-gradient(180deg,#8C2F2C,#661F1D)',
        foil: '#E7C878',
        foil2: '#E4CB95',
        paper:
          'radial-gradient(120% 90% at 82% 12%, rgba(255,250,235,0.6), rgba(0,0,0,0) 46%), linear-gradient(100deg,#E7D8B8 0%,#EFE3C8 12%,#F3E9D2 46%,#EFE3C6 100%)',
        spine: 'linear-gradient(90deg,rgba(90,50,20,0.22),rgba(90,50,20,0))',
        edge: '#E0D0AE',
        plate: '#F5ECD6',
        plateLine: '#CDA766',
        card: 'rgba(255,250,235,0.5)',
        fallback: 'linear-gradient(165deg,#ECDFC4,#E1D0AE)',
        tape: 'rgba(201,162,75,0.34)',
        ink: '#2E2013',
        ink2: '#6B5B44',
        ink3: '#8A7455',
        ink4: '#9C7B4B',
        rule: '#C9A24B',
        hairline: '#D6C39A',
        navOff: '#6B4E2E',
        onAccent: '#F5ECD6',
        toastBg: '#3A2016',
        toastInk: '#F0DDA9',
        scrim: 'rgba(20,13,8,0.92)',
        openDesk: WARM_DESK,
        coverBinding: 'linear-gradient(120deg,#662623,#54201E 58%,#4a1a18)',
        coverLine: 'rgba(201,162,75,0.5)',
        coverRibbon: 'linear-gradient(180deg,#8C2F2C,#661F1D)',
        coverFoil: '#E7C878',
        coverFoil2: '#E4CB95',
        coverDesk: WARM_DESK,
      };

  return {
    ...base,
    accent,
    accentLine: hexToRgba(accent, 0.4),
    accentWash: hexToRgba(accent, 0.08),
    mono,
  };
}

/** The theme as a set of CSS custom properties for the root container. */
export function themeVars(t: Theme): CSSProperties {
  const v: Record<string, string> = {
    '--binding': t.binding,
    '--binding-line': t.bindingLine,
    '--ribbon': t.ribbon,
    '--foil': t.foil,
    '--foil-2': t.foil2,
    '--paper': t.paper,
    '--spine': t.spine,
    '--edge': t.edge,
    '--plate': t.plate,
    '--plate-line': t.plateLine,
    '--card': t.card,
    '--fallback': t.fallback,
    '--tape': t.tape,
    '--ink': t.ink,
    '--ink-2': t.ink2,
    '--ink-3': t.ink3,
    '--ink-4': t.ink4,
    '--rule': t.rule,
    '--hairline': t.hairline,
    '--nav-off': t.navOff,
    '--on-accent': t.onAccent,
    '--toast-bg': t.toastBg,
    '--toast-ink': t.toastInk,
    '--scrim': t.scrim,
    '--accent': t.accent,
    '--accent-line': t.accentLine,
    '--accent-wash': t.accentWash,
    '--cover-binding': t.coverBinding,
    '--cover-line': t.coverLine,
    '--cover-ribbon': t.coverRibbon,
    '--cover-foil': t.coverFoil,
    '--cover-foil-2': t.coverFoil2,
  };
  return v as CSSProperties;
}
