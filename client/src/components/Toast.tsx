export function Toast({ message }: { message: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 30,
        transform: 'translateX(-50%)',
        zIndex: 90,
        padding: '9px 24px',
        borderRadius: 2,
        background: 'var(--toast-bg)',
        border: '1px solid var(--binding-line)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
        fontFamily: "'Tangerine'",
        fontWeight: 600,
        fontSize: 20,
        color: 'var(--toast-ink)',
        animation: 'fadeUp 0.3s ease both',
      }}
    >
      {message}
    </div>
  );
}
