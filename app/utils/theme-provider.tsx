// inspriated by implementation of: https://www.mattstobbs.com/remix-dark-mode/

import { ColorTheme } from '@prisma/client';
import { createContext, useContext, useEffect, useState } from 'react';

import type { Dispatch, ReactNode, SetStateAction } from 'react';

const prefersDarkMQ = '(prefers-color-scheme: dark)';
export const getPreferredTheme = () => (window.matchMedia(prefersDarkMQ).matches ? 'DARK' : 'LIGHT');

type ThemeContextType = [ColorTheme | null, Dispatch<SetStateAction<ColorTheme | null>>];

const clientThemeCode = `
;(() => {
  try {
    var theme = localStorage.getItem('theme');
    if (!theme) {
      theme = window.matchMedia('${prefersDarkMQ}').matches ? 'dark' : 'light';
    }
    var cl = document.documentElement.classList;
    cl.remove('light', 'dark');
    cl.add(theme.toLowerCase());
  } catch(e) {}
})();
`;

function NonFlashOfWrongThemeEls() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: clientThemeCode,
      }}
    />
  );
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ColorTheme | null>(() => {
    if (typeof window === 'undefined') {
      // there's no way for us to know what the theme should be in this context
      // the client will have to figure it out before hydration.
      return null;
    }

    const stored = window.localStorage.getItem('theme') as ColorTheme | null;
    if (!stored) {
      return getPreferredTheme();
    }

    return stored;
  });

  useEffect(() => {
    if (theme) {
      window.localStorage.setItem('theme', theme);
    }
  }, [theme]);

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
