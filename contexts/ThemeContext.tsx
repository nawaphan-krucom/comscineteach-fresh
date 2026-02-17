
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
/* eslint-disable react-refresh/only-export-components */

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  // Respect the prototype flag from localStorage or a query param.
  // We DO NOT remove the flag on module load because this breaks the dev-only
  // prototype playground and Playwright tests that set the flag before page load.

  useEffect(() => {
    const root = window.document.documentElement;

    // Apply dark mode class
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Persist the chosen theme
    localStorage.setItem('theme', theme);

    // If ?themeDemo=1 is present, enable the prototype flag so the playground works
    try {
      const qs = new URLSearchParams(window.location.search);
      if (qs.get('themeDemo') === '1') {
        localStorage.setItem('theme-prototype-enabled', '1');
      }

      // keep prototype class in sync with the flag
      if (localStorage.getItem('theme-prototype-enabled') === '1') {
        root.classList.add('theme-prototype');
      } else {
        root.classList.remove('theme-prototype');
      }
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
