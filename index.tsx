
import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Changed to a named import as App.tsx does not have a default export.
import App from './components/App';
import ErrorBoundary from './components/ErrorBoundary';
import { ErrorProvider } from './contexts/ErrorContext';
import { MusicProvider } from './contexts/MusicContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemePlayground from './components/ThemePlayground';
import './styles/theme-prototype.css';
// macOS Big Sur / Monterey look
import './styles/macos-theme.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Suppress React DevTools suggestion banner in dev console (harmless informational message).
// We only silence this exact message during local development so real warnings/errors still appear.
if (import.meta.env.DEV) {
  const BLOCKED_SUBSTRING = 'Download the React DevTools for a better development experience';
  const wrap = (orig: typeof console.log | typeof console.info) => {
    return (...args: unknown[]) => {
      try {
        if (args.some(a => typeof a === 'string' && a.includes(BLOCKED_SUBSTRING))) return;
      } catch {
        /* ignore */
      }
      orig(...args);
    };
  };
  console.info = wrap(console.info.bind(console));
  console.log = wrap(console.log.bind(console));
}

console.log('🚀 Starting React application...');
console.log('📱 Root element found:', rootElement);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ErrorProvider>
        <ThemeProvider>
          <DataProvider>
            <MusicProvider>
              {new URLSearchParams(window.location.search).get('themeDemo') === '1' ? (
                <ThemePlayground />
              ) : (
                <App />
              )}
            </MusicProvider>
          </DataProvider>
        </ThemeProvider>
      </ErrorProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
