import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, findCover } from './api';
import { buildTheme, themeVars, type Palette, type Theme } from './theme';
import { bookView, coverKey, type BookView } from './view';
import type { Book, Member, Screen, Snapshot } from './types';
import type { CSSProperties } from 'react';

const PALETTE_KEY = 'lamplight.palette';
const ACCENT_KEY = 'lamplight.accent';
const FLIP_MS = 980;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function readPalette(): Palette {
  return localStorage.getItem(PALETTE_KEY) === 'antiquarian' ? 'antiquarian' : 'monochrome';
}
function randomPair<T>(items: T[]): [T, T] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return [a[0], a[1]];
}

export interface Flip {
  active: boolean;
  kind: 'page' | 'open';
}

export interface Club {
  ready: boolean;
  loadError: string | null;
  snapshot: Snapshot | null;
  me: Member | null;
  screen: Screen;
  flip: Flip;
  toast: string | null;
  drawSpin: [string, string] | null;

  palette: Palette;
  accent: string;
  theme: Theme;
  mono: boolean;
  vars: CSSProperties;

  members: Member[];
  memberById: (id: string) => Member | undefined;
  view: (book: Book, index: number | null) => BookView;
  coverFor: (title: string, author: string, coverUrl: string | null) => string | null;
  myVote: string | null;

  setPalette: (p: Palette) => void;
  showToast: (msg: string) => void;
  turnTo: (screen: Screen, kind?: Flip['kind']) => void;
  signIn: (memberId: string) => Promise<void>;
  signOut: () => Promise<void>;
  draw: () => Promise<void>;
  applySnapshot: (s: Snapshot) => void;
}

export function useClub(): Club {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [me, setMe] = useState<Member | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>('login');
  const [flip, setFlip] = useState<Flip>({ active: false, kind: 'page' });
  const [toast, setToast] = useState<string | null>(null);
  const [drawSpin, setDrawSpin] = useState<[string, string] | null>(null);
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [palette, setPaletteState] = useState<Palette>(readPalette);
  const [accent] = useState<string>(() => localStorage.getItem(ACCENT_KEY) || '#7C2D2D');

  const flipTimer = useRef<ReturnType<typeof setTimeout>>();
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const coverTried = useRef<Set<string>>(new Set());

  // --- initial load + live stream ---
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [{ member }, state] = await Promise.all([api.session(), api.state()]);
        if (!alive) return;
        setMe(member);
        setSnapshot(state);
        setScreen(member ? 'pool' : 'login');
      } catch (err) {
        if (alive) setLoadError(err instanceof Error ? err.message : 'Could not reach the register.');
      } finally {
        if (alive) setReady(true);
      }
    })();

    const es = new EventSource('/api/events');
    es.onmessage = (ev) => {
      try {
        setSnapshot(JSON.parse(ev.data) as Snapshot);
      } catch {
        /* ignore malformed frame */
      }
    };
    return () => {
      alive = false;
      es.close();
    };
  }, []);

  // --- resolve missing covers from Open Library ---
  useEffect(() => {
    if (!snapshot) return;
    const wanted: { title: string; author: string }[] = [];
    const consider = (title: string, author: string, coverUrl: string | null) => {
      if (coverUrl) return;
      const key = coverKey(title, author);
      if (covers[key] || coverTried.current.has(key)) return;
      coverTried.current.add(key);
      wanted.push({ title, author });
    };
    snapshot.pool.forEach((b) => consider(b.title, b.author, b.coverUrl));
    snapshot.history.forEach((h) => consider(h.title, h.author, h.coverUrl));
    wanted.forEach(async ({ title, author }) => {
      const url = await findCover(title, author);
      if (url) setCovers((prev) => ({ ...prev, [coverKey(title, author)]: url }));
    });
  }, [snapshot, covers]);

  const theme = useMemo(() => buildTheme(palette, accent), [palette, accent]);
  const vars = useMemo(() => themeVars(theme), [theme]);

  const members = snapshot?.members ?? [];
  const memberById = useCallback(
    (id: string) => members.find((m) => m.id === id),
    [members],
  );
  const coverFor = useCallback(
    (title: string, author: string, coverUrl: string | null) =>
      coverUrl || covers[coverKey(title, author)] || null,
    [covers],
  );
  const view = useCallback(
    (book: Book, index: number | null) =>
      bookView(book, index, theme.mono, memberById, coverFor(book.title, book.author, book.coverUrl)),
    [theme.mono, memberById, coverFor],
  );

  const myVote = useMemo(() => {
    if (!me || !snapshot?.drawn) return null;
    return snapshot.drawn.find((id) => snapshot.votes[id]?.includes(me.id)) ?? null;
  }, [me, snapshot]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const turnTo = useCallback((next: Screen, kind: Flip['kind'] = 'page') => {
    setScreen(next);
    setFlip((f) => (f.active ? f : { active: true, kind }));
    clearTimeout(flipTimer.current);
    flipTimer.current = setTimeout(() => setFlip((f) => ({ ...f, active: false })), FLIP_MS);
  }, []);

  const setPalette = useCallback((p: Palette) => {
    setPaletteState(p);
    localStorage.setItem(PALETTE_KEY, p);
  }, []);

  const applySnapshot = useCallback((s: Snapshot) => setSnapshot(s), []);

  const signIn = useCallback(
    async (memberId: string) => {
      const { member } = await api.signIn(memberId);
      setMe(member);
      turnTo('pool', 'open');
    },
    [turnTo],
  );

  const signOut = useCallback(async () => {
    try {
      await api.signOut();
    } finally {
      clearTimeout(flipTimer.current);
      setFlip({ active: false, kind: 'page' });
      setMe(null);
      setScreen('login');
    }
  }, []);

  const draw = useCallback(async () => {
    if (!snapshot) return;
    const ids = snapshot.pool.map((b) => b.id);
    if (ids.length < 2) {
      showToast('At least two volumes are needed to draw.');
      return;
    }
    setDrawSpin(randomPair(ids));
    const spin = setInterval(() => setDrawSpin(randomPair(ids)), 140);
    const started = Date.now();
    try {
      const snap = await api.draw();
      await delay(Math.max(0, 1500 - (Date.now() - started)));
      setSnapshot(snap);
      showToast('Two volumes drawn — the ballot is open.');
      turnTo('vote', 'page');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'The draw could not be held.');
    } finally {
      clearInterval(spin);
      setDrawSpin(null);
    }
  }, [snapshot, showToast, turnTo]);

  useEffect(
    () => () => {
      clearTimeout(flipTimer.current);
      clearTimeout(toastTimer.current);
    },
    [],
  );

  return {
    ready,
    loadError,
    snapshot,
    me,
    screen,
    flip,
    toast,
    drawSpin,
    palette,
    accent,
    theme,
    mono: theme.mono,
    vars,
    members,
    memberById,
    view,
    coverFor,
    myVote,
    setPalette,
    showToast,
    turnTo,
    signIn,
    signOut,
    draw,
    applySnapshot,
  };
}
