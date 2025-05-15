// https://www.mattstobbs.com/remix-dark-mode/

import { ColorTheme } from '@prisma/client';
import { createContext, useContext, useEffect, useState } from 'react';

import type { Dispatch, ReactNode, SetStateAction } from 'react';

const prefersDarkMQ = '(prefers-color-scheme: dark)';
export const getPreferredTheme = () => (window.matchMedia(prefersDarkMQ).matches ? 'DARK' : 'LIGHT');

type ThemeContextType = [ColorTheme | null, Dispatch<SetStateAction<ColorTheme | null>>];

const clientThemeCode = `
;(() => {
  const theme = window.matchMedia(${JSON.stringify(prefersDarkMQ)}).matches
    ? 'dark'
    : 'light';
  const cl = document.documentElement.classList;
  const themeAlreadyApplied = cl.contains('light') || cl.contains('dark');
  if (themeAlreadyApplied) {
    // this script shouldn't exist if the theme is already applied!
    console.warn(
      "Hi there, could you let Matt know you're seeing this message? Thanks!",
    );
  } else {
    cl.add(theme);
  }
})();
`;

function NonFlashOfWrongThemeEls({ ssrTheme }: { ssrTheme: boolean }) {
  return <>{ssrTheme ? null : <script dangerouslySetInnerHTML={{ __html: clientThemeCode }} />}</>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ColorTheme | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('theme') as ColorTheme | null;
      return stored;
    }

    // there's no way for us to know what the theme should be in this context
    // the client will have to figure it out before hydration.
    if (typeof document === 'undefined') {
      return null;
    }

    return getPreferredTheme();
  });

  useEffect(() => {
    if (theme) {
      window.localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // listener for when the user updates their system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia(prefersDarkMQ);
    const handleChange = () => {
      setTheme(mediaQuery.matches ? ColorTheme.DARK : ColorTheme.LIGHT);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return <ThemeContext.Provider value={[theme, setTheme]}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { NonFlashOfWrongThemeEls, ThemeProvider, useTheme };
