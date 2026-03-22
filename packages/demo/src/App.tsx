// App.tsx

import React from 'react';
import { GlassesTryOn } from 'glasses-tryon-react';

const GITHUB_URL = 'https://github.com/estephanobrusa/GlassesTryOn';
const NPM_REACT_URL = 'https://www.npmjs.com/package/glasses-tryon-react';
const NPM_CORE_URL = 'https://www.npmjs.com/package/glasses-tryon-core';

const styles = {
  root: {
    margin: 0,
    padding: 0,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    backgroundColor: '#0f0f0f',
    color: '#e5e5e5',
    minHeight: '100vh',
  } as React.CSSProperties,

  // ── Navbar ──────────────────────────────────────────────────────────────
  navbar: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '56px',
    backgroundColor: 'rgba(15, 15, 15, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  } as React.CSSProperties,

  navBrand: {
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    color: '#fff',
    textDecoration: 'none',
  } as React.CSSProperties,

  navLinks: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  } as React.CSSProperties,

  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#a3a3a3',
    textDecoration: 'none',
    border: '1px solid transparent',
    transition: 'color 0.15s, border-color 0.15s, background 0.15s',
  } as React.CSSProperties,

  // ── Hero ────────────────────────────────────────────────────────────────
  hero: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    padding: '72px 24px 56px',
    maxWidth: '720px',
    margin: '0 auto',
  } as React.CSSProperties,

  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    marginBottom: '28px',
    letterSpacing: '0.01em',
  } as React.CSSProperties,

  heroTitle: {
    fontSize: 'clamp(32px, 6vw, 56px)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    color: '#fff',
    margin: '0 0 20px',
  } as React.CSSProperties,

  heroAccent: {
    color: '#22d3ee',
  } as React.CSSProperties,

  heroDescription: {
    fontSize: 'clamp(15px, 2vw, 18px)',
    lineHeight: 1.7,
    color: '#a3a3a3',
    margin: '0 0 36px',
    maxWidth: '560px',
  } as React.CSSProperties,

  ctaRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
    justifyContent: 'center',
  } as React.CSSProperties,

  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#0f0f0f',
    backgroundColor: '#22d3ee',
    border: '1px solid #22d3ee',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  } as React.CSSProperties,

  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#e5e5e5',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
  } as React.CSSProperties,

  // ── Demo section ─────────────────────────────────────────────────────────
  demoSection: {
    padding: '0 24px 80px',
    maxWidth: '1280px',
    margin: '0 auto',
  } as React.CSSProperties,

  demoLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    paddingLeft: '4px',
  } as React.CSSProperties,

  demoDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    boxShadow: '0 0 8px #22c55e',
    flexShrink: 0,
  } as React.CSSProperties,

  demoLabelText: {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#71717a',
  } as React.CSSProperties,

  demoWrapper: {
    position: 'relative' as const,
    width: '100%',
    paddingTop: '56.25%', // 16:9 aspect ratio
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 0 0 1px rgba(34,211,238,0.08), 0 24px 80px rgba(0,0,0,0.6)',
    backgroundColor: '#000',
  } as React.CSSProperties,

  demoInner: {
    position: 'absolute' as const,
    inset: 0,
  } as React.CSSProperties,

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: '28px 24px',
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    maxWidth: '1280px',
    margin: '0 auto',
  } as React.CSSProperties,

  footerText: {
    fontSize: '13px',
    color: '#52525b',
  } as React.CSSProperties,

  footerLinks: {
    display: 'flex',
    gap: '20px',
  } as React.CSSProperties,

  footerLink: {
    fontSize: '13px',
    color: '#52525b',
    textDecoration: 'none',
  } as React.CSSProperties,
};

// ── SVG icons (inline, no external deps) ───────────────────────────────────

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function NpmIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 7" fill="currentColor" aria-hidden="true">
      <path d="M0 0h18v6H9V7H5V6H0V0zm1 5h2V2h1v3h1V1H1v4zm5-4v5h2V5h2V1H6zm2 1h1v2H8V2zm3-1v4h2V2h1v3h1V2h1v3h1V1h-6z" />
    </svg>
  );
}

export default function App() {
  return (
    <div style={styles.root}>
      {/* ── Navbar ── */}
      <header style={styles.navbar}>
        <a href="#" style={styles.navBrand}>
          GlassesTryON
        </a>
        <nav style={styles.navLinks}>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.navLink}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#e5e5e5';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#a3a3a3';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'transparent';
            }}
          >
            <GitHubIcon />
            GitHub
          </a>
          <a
            href={NPM_REACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.navLink}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#e5e5e5';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#a3a3a3';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'transparent';
            }}
          >
            <NpmIcon />
            npm
          </a>
        </nav>
      </header>

      {/* ── Hero ── */}
      <main>
        <section style={styles.hero}>
          <div style={styles.badge}>
            <span>⚠️</span>
            Learning project · Not production-ready
          </div>

          <h1 style={styles.heroTitle}>
            Real-time AR <span style={styles.heroAccent}>Glasses Try-On</span>
          </h1>

          <p style={styles.heroDescription}>
            Open-source virtual try-on using your webcam, MediaPipe FaceMesh, and Three.js. Drop the
            React component into your app — no server required.
          </p>

          <div style={styles.ctaRow}>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.btnPrimary}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
              }}
            >
              <GitHubIcon />
              View on GitHub
            </a>
            <a
              href={NPM_REACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.btnSecondary}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.3)';
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                  'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.15)';
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
              }}
            >
              <NpmIcon />
              Install from npm
            </a>
          </div>
        </section>

        {/* ── AR Demo ── */}
        <section style={styles.demoSection}>
          <div style={styles.demoLabel}>
            <span style={styles.demoDot} />
            <span style={styles.demoLabelText}>Live Demo — webcam required</span>
          </div>

          <div style={styles.demoWrapper}>
            <div style={styles.demoInner}>
              <GlassesTryOn
                model={`${import.meta.env.BASE_URL}models/test.glb`}
                maxFPS={30}
                onFaceDetected={() => console.log('face detected')}
                modelConfig={{ scale: 30 }}
              />
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer>
        <div style={styles.footer}>
          <span style={styles.footerText}>MIT License · Built for learning purposes</span>
          <div style={styles.footerLinks}>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.footerLink}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = '#a3a3a3';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = '#52525b';
              }}
            >
              GitHub
            </a>
            <a
              href={NPM_REACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.footerLink}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = '#a3a3a3';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = '#52525b';
              }}
            >
              npm (react)
            </a>
            <a
              href={NPM_CORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.footerLink}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = '#a3a3a3';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = '#52525b';
              }}
            >
              npm (core)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
