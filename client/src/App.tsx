import type { CSSProperties } from 'react';
import { useClub } from './useClub';
import { Login } from './components/Login';
import { Book } from './components/Book';
import { Pool } from './components/Pool';
import { Submit } from './components/Submit';
import { Vote } from './components/Vote';
import { History } from './components/History';
import { DrawOverlay } from './components/DrawOverlay';
import { Toast } from './components/Toast';
import { ThemeToggle } from './components/ThemeToggle';

export function App() {
  const club = useClub();
  const { ready, loadError, screen, theme, vars } = club;
  const deskBg = screen === 'login' ? theme.coverDesk : theme.openDesk;

  const shell: CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(12px,3vw,44px)',
    color: 'var(--ink)',
    background: deskBg,
    ...vars,
  };

  let body;
  if (loadError) {
    body = (
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ color: 'var(--foil-2)', fontSize: 26 }}>❦</div>
        <div style={{ fontFamily: "'Tangerine'", fontWeight: 700, fontSize: 30, color: 'var(--foil)', margin: '8px 0' }}>
          The register could not be reached
        </div>
        <div style={{ font: "italic 400 16px 'IM Fell English'", color: 'var(--foil-2)' }}>{loadError}</div>
      </div>
    );
  } else if (!ready) {
    body = (
      <div
        style={{
          width: 44,
          height: 44,
          border: '2px solid var(--cover-line)',
          borderTopColor: 'var(--cover-foil)',
          borderRadius: 999,
          animation: 'spinnerRot 0.8s linear infinite',
        }}
      />
    );
  } else if (screen === 'login') {
    body = <Login club={club} />;
  } else {
    body = (
      <Book club={club}>
        {screen === 'pool' && <Pool club={club} />}
        {screen === 'submit' && <Submit club={club} />}
        {screen === 'vote' && <Vote club={club} />}
        {screen === 'history' && <History club={club} />}
      </Book>
    );
  }

  return (
    <div style={shell}>
      {body}
      <DrawOverlay club={club} />
      {club.toast && <Toast message={club.toast} />}
      <ThemeToggle club={club} />
    </div>
  );
}
