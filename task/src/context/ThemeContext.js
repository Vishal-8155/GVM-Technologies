import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const KEY = 'miniblog-theme';

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem(KEY) === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, dark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, setDark, toggle: () => setDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
