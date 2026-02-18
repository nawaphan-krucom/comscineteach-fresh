
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
/* eslint-disable react-refresh/only-export-components */

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  macosEnabled: boolean;
  toggleMacOS: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  // macOS-theme flag (persisted)
  const [macosEnabled, setMacosEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('macos-theme-enabled');
    // default to true so the app uses macOS look across the system by default
    return saved === null ? true : saved === '1';
  });

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

    // Keep prototype flag in sync with query param (dev playground)
    try {
      const qs = new URLSearchParams(window.location.search);
      if (qs.get('themeDemo') === '1') {
        localStorage.setItem('theme-prototype-enabled', '1');
      }

      if (localStorage.getItem('theme-prototype-enabled') === '1') {
        root.classList.add('theme-prototype');
      } else {
        root.classList.remove('theme-prototype');
      }
    } catch {
      /* ignore */
    }

    // macOS theme class (applies macOS design tokens/styles)
    if (macosEnabled) {
      root.classList.add('macos');
      localStorage.setItem('macos-theme-enabled', '1');
    } else {
      root.classList.remove('macos');
      localStorage.setItem('macos-theme-enabled', '0');
    }
  }, [theme, macosEnabled]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleMacOS = () => setMacosEnabled(v => !v);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, macosEnabled, toggleMacOS }}>
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
