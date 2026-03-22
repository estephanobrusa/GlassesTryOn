// App.tsx

import React from 'react';
import { GlassesTryOn } from 'glasses-tryon-react';
import './global.css';

const GITHUB_URL = 'https://github.com/estephanobrusa/GlassesTryOn';
const NPM_REACT_URL = 'https://www.npmjs.com/package/glasses-tryon-react';
const NPM_CORE_URL = 'https://www.npmjs.com/package/glasses-tryon-core';

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
    <div>
      {/* ── Navbar ── */}
      <header className="navbar">
        <a href="#" className="navbar__brand">
          GlassesTryON
        </a>
        <nav className="navbar__links">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="navbar__link">
            <GitHubIcon />
            GitHub
          </a>
          <a
            href={NPM_REACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__link"
          >
            <NpmIcon />
            npm
          </a>
        </nav>
      </header>

      {/* ── Hero ── */}
      <main>
        <section className="hero">
          <div className="hero__badge">
            <span>⚠️</span>
            Learning project · Not production-ready
          </div>

          <h1 className="hero__title">
            Real-time AR <span className="hero__accent">Glasses Try-On</span>
          </h1>

          <p className="hero__description">
            Open-source virtual try-on using your webcam, MediaPipe FaceMesh, and Three.js. Drop the
            React component into your app — no server required.
          </p>

          <div className="cta-row">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <GitHubIcon />
              View on GitHub
            </a>
            <a
              href={NPM_REACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <NpmIcon />
              Install from npm
            </a>
          </div>
        </section>

        {/* ── AR Demo ── */}
        <section className="demo-section">
          <div className="demo-label">
            <span className="demo-dot" />
            <span className="demo-label-text">Live Demo — webcam required</span>
          </div>

          <div className="demo-wrapper">
            <div className="demo-inner">
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
        <div className="footer">
          <span className="footer__text">MIT License · Built for learning purposes</span>
          <div className="footer__links">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="footer__link">
              GitHub
            </a>
            <a
              href={NPM_REACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              npm (react)
            </a>
            <a
              href={NPM_CORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              npm (core)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
