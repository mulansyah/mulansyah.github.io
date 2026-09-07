import { useState } from 'react';

export default function App() {
  const [page, setPage] = useState('home');

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>GITHUB PAGES</div>
          <h1 style={styles.title}>Mulansyah</h1>
        </div>
      </header>

      <main style={styles.main}>
        {page === 'home' ? (
          <section style={styles.card}>
            <h2 style={styles.heading}>React is live.</h2>
            <p style={styles.text}>This site is deployed from a single React App.jsx file with Vite and GitHub Pages.</p>
          </section>
        ) : (
          <section style={styles.card}>
            <h2 style={styles.heading}>About</h2>
            <p style={styles.text}>A lightweight single-page React application ready for further development.</p>
          </section>
        )}
      </main>

      <nav style={styles.nav} aria-label="Main navigation">
        <button style={page === 'home' ? styles.activeButton : styles.button} onClick={() => setPage('home')}>Home</button>
        <button style={page === 'about' ? styles.activeButton : styles.button} onClick={() => setPage('about')}>About</button>
      </nav>
    </div>
  );
}

const styles = {
  app: { minHeight: '100vh', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f6f7f9', color: '#111827' },
  header: { padding: '56px 24px 24px', maxWidth: 760, margin: '0 auto' },
  eyebrow: { fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: '#6b7280' },
  title: { margin: '8px 0 0', fontSize: 36, lineHeight: 1.1 },
  main: { padding: '0 24px 100px', maxWidth: 760, margin: '0 auto' },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: 28, boxShadow: '0 10px 30px rgba(0,0,0,.05)' },
  heading: { margin: 0, fontSize: 24 },
  text: { margin: '12px 0 0', color: '#6b7280', lineHeight: 1.6 },
  nav: { position: 'fixed', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', gap: 8, padding: '12px 16px calc(12px + env(safe-area-inset-bottom))', background: 'rgba(255,255,255,.94)', borderTop: '1px solid #e5e7eb', backdropFilter: 'blur(12px)' },
  button: { border: 0, background: 'transparent', padding: '12px 24px', borderRadius: 12, fontSize: 15, cursor: 'pointer' },
  activeButton: { border: 0, background: '#111827', color: '#fff', padding: '12px 24px', borderRadius: 12, fontSize: 15, cursor: 'pointer' }
};
