import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

export const themes = {
  dark: {
    primary: '#7C3AED',
    background: '#000000',
    surface: '#18181B',
    border: '#27272A',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F97316',
    info: '#3B82F6',
    overlay: 'rgba(0,0,0,0.7)',
    cardBg: '#18181B',
    inputBg: '#27272A',
  },
  light: {
    primary: '#7C3AED',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F97316',
    info: '#3B82F6',
    overlay: 'rgba(0,0,0,0.5)',
    cardBg: '#FFFFFF',
    inputBg: '#F3F4F6',
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem('theme');
        if (stored) setIsDark(stored === 'dark');
      } catch {}
    };
    restore();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const theme = isDark ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
