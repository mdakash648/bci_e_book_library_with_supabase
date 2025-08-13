import { useState, useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

// Global theme state
let globalTheme: Theme = 'light';
let themeListeners: ((theme: Theme) => void)[] = [];

const notifyListeners = (theme: Theme) => {
  themeListeners.forEach(listener => listener(theme));
};

export const setGlobalTheme = (theme: Theme) => {
  globalTheme = theme;
  notifyListeners(theme);
};

export const useTheme = () => {
  const systemColorScheme = useRNColorScheme();
  const [theme, setTheme] = useState<Theme>(globalTheme);

  useEffect(() => {
    // Initialize with system theme
    if (globalTheme === 'light') {
      setGlobalTheme((systemColorScheme as Theme) || 'light');
    }
  }, [systemColorScheme]);

  useEffect(() => {
    // Subscribe to theme changes
    const listener = (newTheme: Theme) => {
      setTheme(newTheme);
    };
    themeListeners.push(listener);
    
    return () => {
      themeListeners = themeListeners.filter(l => l !== listener);
    };
  }, []);

  const setThemeAndNotify = (newTheme: Theme) => {
    setGlobalTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setGlobalTheme(newTheme);
  };

  return {
    theme,
    setTheme: setThemeAndNotify,
    toggleTheme,
  };
};
