
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
