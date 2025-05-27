import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../lib/constants';

// Define theme types
export type ThemeType = 'light' | 'dark';
export type ViewMode = 'default' | 'compact';

interface ThemeContextType {
  theme: ThemeType;
  viewMode: ViewMode;
  setTheme: (theme: ThemeType) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleTheme: () => void;
  toggleViewMode: () => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  viewMode: 'default',
  setTheme: () => {},
  setViewMode: () => {},
  toggleTheme: () => {},
  toggleViewMode: () => {},
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize state from localStorage or default to light theme and default view
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem(`${STORAGE_KEYS.THEME}_mode`);
    return (savedTheme as ThemeType) || 'light';
  });
  
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const savedViewMode = localStorage.getItem(`${STORAGE_KEYS.THEME}_view`);
    return (savedViewMode as ViewMode) || 'default';
  });

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEYS.THEME}_mode`, theme);
    
    // Apply theme class to document body
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Update localStorage when view mode changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEYS.THEME}_view`, viewMode);
    
    // Apply view mode class to document body
    if (viewMode === 'compact') {
      document.documentElement.classList.add('compact');
    } else {
      document.documentElement.classList.remove('compact');
    }
  }, [viewMode]);

  // Set theme function
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  // Set view mode function
  const setViewMode = (newMode: ViewMode) => {
    setViewModeState(newMode);
  };

  // Toggle theme function
  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Toggle view mode function
  const toggleViewMode = () => {
    setViewModeState(prevMode => prevMode === 'default' ? 'compact' : 'default');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        viewMode,
        setTheme,
        setViewMode,
        toggleTheme,
        toggleViewMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = () => useContext(ThemeContext);
