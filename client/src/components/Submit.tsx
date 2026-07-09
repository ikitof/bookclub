import { useState, type CSSProperties } from 'react';
import type { Club } from '../useClub';
import type { Draft } from '../types';
import type { BookView } from '../view';
import { GENRE_LIST, genreTint, mapGenre } from '../genres';
import { api, coverUrlFor, searchOpenLibrary, type OpenLibraryResult } from '../api';
import { CoverBox } from './CoverBox';

interface SearchState {
  open: boolean;
  loading: boolean;
  error: string | null;
  results: OpenLibraryResult[];
}

const emptyDraft = (): Draft => ({ title: '', author: '', genre: 'Literary', pages: '', year: '', coverUrl: null });
const emptySearch = (): SearchState => ({ open: false, loading: false, error: null, results: [] });

const label: CSSProperties = {
  font: "600 11px 'IM Fell English'",
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--ink-4)',
};
const field: CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1.5px solid var(--accent-line)',
  padding: '5px 2px',
  color: 'var(--ink)',
  outline: 'none',
};

function previewView(d: Draft, mono: boolean): BookView {
  return {
    id: 'preview',
    title: d.title || 'Untitled',
    author: d.author || 'Author unknown',
    genre: d.genre,
    tint: genreTint(d.genre, mono),
    meta: '',
    tilt: 0,
    coverUrl: d.coverUrl,
    noCover: !d.coverUrl,
    by: { name: '', initials: '?', color: '' },
  };
}

function VolumeForm({
  eyebrow,
  draft,
  search,
  mono,
  onField,
  onSearch,
  onChoose,
}: {
  eyebrow: string;
  draft: Draft;
  search: SearchState;
  mono: boolean;
  onField: (field: keyof Draft, value: string) => void;
  onSearch: () => void;
  onChoose: (r: OpenLibraryResult) => void;
}) {
  return (
    <div
      style={{
        border: '1px solid var(--plate-line)',
        background: 'var(--card)',
        borderRadius: 3,
        padding: 18,
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ font: "600 11px 'IM Fell English'", letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          {eyebrow}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={label}>Title</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <input
              className="lp-field"
              value={draft.title}
              onChange={(e) => onField('title', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSearch();
                }
              }}
              placeholder="name a book…"
              style={{ ...field, flex: 1, minWidth: 0, font: "500 19px 'IM Fell English'" }}
            />
            <button
              onClick={onSearch}
              style={{
                flex: 'none',
                padding: '5px 14px',
                border: '1px solid var(--accent)',
                borderRadius: 2,
                background: 'transparent',
                color: 'var(--accent)',
                fontFamily: "'Tangerine'",
                fontWeight: 700,
                fontSize: 18,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Look it up
            </button>
          </div>
        </div>

        {search.open && (
          <div
            style={{
              border: '1px solid var(--plate-line)',
              background: 'var(--plate)',
              borderRadius: 2,
              padding: 5,
              maxHeight: 230,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {search.loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 7px', font: "italic 400 15px 'IM Fell English'", color: 'var(--ink-2)' }}>
                <span
                  style={{
                    width: 13,
                    height: 13,
                    border: '2px solid var(--accent-line)',
                    borderTopColor: 'var(--accent)',
                    borderRadius: 999,
                    display: 'inline-block',
                    animation: 'spinnerRot 0.7s linear infinite',
                  }}
                />
                Consulting the register…
              </div>
            )}
            {search.error && (
              <div style={{ padding: '9px 7px', font: "italic 400 15px 'IM Fell English'", color: 'var(--ink-4)' }}>{search.error}</div>
            )}
            {search.results.map((r, i) => (
              <button
                key={`${r.title}-${i}`}
                className="lp-result"
                onClick={() => onChoose(r)}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  textAlign: 'left',
                  width: '100%',
                  padding: 6,
                  border: 'none',
                  background: 'transparent',
                  borderRadius: 2,
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 45,
                    flex: 'none',
                    overflow: 'hidden',
                    background: 'var(--fallback)',
                    position: 'relative',
                    display: 'block',
                    border: '1px solid var(--plate-line)',
                  }}
                >
                  {r.coverId && (
                    <img
                      src={coverUrlFor(r.coverId, 'M')}
                      alt=""
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...(mono ? { filter: 'grayscale(1)' } : {}) }}
                    />
                  )}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontFamily: "'Tangerine'",
                      fontWeight: 600,
                      fontSize: 18,
                      lineHeight: 1.1,
                      color: 'var(--ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.title}
                  </span>
                  <span style={{ display: 'block', font: "italic 400 13px 'IM Fell English'", color: 'var(--ink-3)' }}>
                    {[r.author, r.year].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={label}>Author</label>
          <input
            className="lp-field"
            value={draft.author}
            onChange={(e) => onField('author', e.target.value)}
            placeholder="by whom…"
            style={{ ...field, width: '100%', font: "italic 500 18px 'IM Fell English'" }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 120 }}>
            <label style={label}>Genre</label>
            <select
              className="lp-field"
              value={draft.genre}
              onChange={(e) => onField('genre', e.target.value)}
              style={{ ...field, width: '100%', font: "500 17px 'IM Fell English'" }}
            >
              {GENRE_LIST.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 74 }}>
            <label style={label}>Pages</label>
            <input
              className="lp-field"
              type="number"
              value={draft.pages}
              onChange={(e) => onField('pages', e.target.value)}
              placeholder="—"
              style={{ ...field, width: '100%', font: "500 17px 'IM Fell English'" }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 80 }}>
            <label style={label}>Year</label>
            <input
              className="lp-field"
              type="number"
              value={draft.year}
              onChange={(e) => onField('year', e.target.value)}
              placeholder="—"
              style={{ ...field, width: '100%', font: "500 17px 'IM Fell English'" }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          width: 104,
          flex: 'none',
          background: 'var(--plate)',
          padding: '7px 7px 9px',
          border: '1px solid var(--plate-line)',
          boxShadow: '0 6px 16px -10px rgba(20,15,5,0.55)',
          alignSelf: 'flex-start',
        }}
      >
        <CoverBox view={previewView(draft, mono)} mono={mono} fallback="sm" />
      </div>
    </div>
  );
}

export function Submit({ club }: { club: Club }) {
  const { mono } = club;
  const [drafts, setDrafts] = useState<[Draft, Draft]>([emptyDraft(), emptyDraft()]);
  const [searches, setSearches] = useState<[SearchState, SearchState]>([emptySearch(), emptySearch()]);

  const setDraft = (slot: 0 | 1, field: keyof Draft, value: string) =>
    setDrafts((d) => {
      const next: [Draft, Draft] = [{ ...d[0] }, { ...d[1] }];
      next[slot] = { ...next[slot], [field]: value, ...(field === 'title' ? { coverUrl: null } : {}) };
      return next;
    });

  const patchSearch = (slot: 0 | 1, patch: Partial<SearchState>) =>
    setSearches((s) => {
      const next: [SearchState, SearchState] = [{ ...s[0] }, { ...s[1] }];
      next[slot] = { ...next[slot], ...patch };
      return next;
    });

  const runSearch = async (slot: 0 | 1) => {
    const title = drafts[slot].title.trim();
    if (!title) {
      club.showToast('Name a title first, then look it up.');
      return;
    }
    patchSearch(slot, { open: true, loading: true, results: [], error: null });
    try {
      const results = await searchOpenLibrary(title);
      patchSearch(slot, {
        loading: false,
        results,
        error: results.length ? null : 'No entry found — you may write it in by hand.',
      });
    } catch {
      patchSearch(slot, { loading: false, results: [], error: 'The register could not be reached — write it in by hand.' });
    }
  };

  const choose = (slot: 0 | 1, r: OpenLibraryResult) => {
    setDrafts((d) => {
      const next: [Draft, Draft] = [{ ...d[0] }, { ...d[1] }];
      next[slot] = {
        title: r.title,
        author: r.author,
        genre: mapGenre(r.subject),
        pages: r.pages ? String(r.pages) : '',
        year: r.year ? String(r.year) : '',
        coverUrl: r.coverId ? coverUrlFor(r.coverId, 'L') : null,
      };
      return next;
    });
    patchSearch(slot, { open: false });
  };

  const submit = async () => {
    const [a, b] = drafts;
    if (!a.title.trim() || !a.author.trim() || !b.title.trim() || !b.author.trim()) {
      club.showToast('Give a title and author for both volumes.');
      return;
    }
    const toSubmit = (d: Draft) => ({
      title: d.title.trim(),
      author: d.author.trim(),
      genre: d.genre,
      coverUrl: d.coverUrl,
      pages: d.pages === '' ? null : Number(d.pages) || null,
      year: d.year === '' ? null : Number(d.year) || null,
    });
    try {
      const snap = await api.suggestions([toSubmit(a), toSubmit(b)]);
      club.applySnapshot(snap);
      club.turnTo('pool');
      club.showToast('Your two volumes are entered in the ledger.');
    } catch (err) {
      club.showToast(err instanceof Error ? err.message : 'The ledger refused the entry.');
    }
  };

  return (
    <div style={{ animation: 'fadeUp 0.5s ease both', maxWidth: 900, margin: '0 auto' }}>
      <p
        style={{
          textAlign: 'center',
          maxWidth: 580,
          margin: '0 auto 24px',
          fontFamily: "'Tangerine'",
          fontWeight: 700,
          fontSize: 27,
          lineHeight: 1.25,
          color: 'var(--ink-2)',
        }}
      >
        Name a volume and press <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Look it up</span> — the register
        fetches its plate, author and length. Or write it in by hand.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 26 }}>
        <VolumeForm
          eyebrow="the first volume"
          draft={drafts[0]}
          search={searches[0]}
          mono={mono}
          onField={(f, v) => setDraft(0, f, v)}
          onSearch={() => void runSearch(0)}
          onChoose={(r) => choose(0, r)}
        />
        <VolumeForm
          eyebrow="the second volume"
          draft={drafts[1]}
          search={searches[1]}
          mono={mono}
          onField={(f, v) => setDraft(1, f, v)}
          onSearch={() => void runSearch(1)}
          onChoose={(r) => choose(1, r)}
        />
      </div>
      <div style={{ marginTop: 22, textAlign: 'center' }}>
        <button
          onClick={() => void submit()}
          style={{
            padding: '10px 34px',
            background: 'var(--accent)',
            color: 'var(--on-accent)',
            border: 'none',
            borderRadius: 2,
            fontFamily: "'Tangerine'",
            fontWeight: 700,
            fontSize: 24,
            cursor: 'pointer',
            boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.22)',
          }}
        >
          Enter both in the ledger
        </button>
        <div style={{ marginTop: 9, font: "italic 400 14px 'IM Fell English'", color: 'var(--ink-4)' }}>
          Entering again replaces your current two.
        </div>
      </div>
    </div>
  );
}
