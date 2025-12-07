import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'forest' | 'ocean' | 'summer' | 'midnight';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  border: string;
  borderLight: string;
  error: string;
  card: string;
  shadow: string;
}

const lightTheme: ThemeColors = {
  background: '#FFF5F8',
  surface: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  primary: '#FF6B9D',
  primaryLight: '#FFE5ED',
  border: '#FFE5ED',
  borderLight: '#FFB3D1',
  error: '#FF6B9D',
  card: '#FFFFFF',
  shadow: '#FF6B9D',
};

const darkTheme: ThemeColors = {
  background: '#1A1A1A',
  surface: '#2D2D2D',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  primary: '#FF6B9D',
  primaryLight: '#4A2A3A',
  border: '#3D3D3D',
  borderLight: '#4D4D4D',
  error: '#FF6B9D',
  card: '#2D2D2D',
  shadow: '#000000',
};

const forestTheme: ThemeColors = {
  background: '#F0F7ED',
  surface: '#FFFFFF',
  text: '#2D3E2D',
  textSecondary: '#5A6B5A',
  primary: '#4A7C59',
  primaryLight: '#E8F5E9',
  border: '#C8E6C9',
  borderLight: '#A5D6A7',
  error: '#E57373',
  card: '#FFFFFF',
  shadow: '#4A7C59',
};

const oceanTheme: ThemeColors = {
  background: '#E8F4F8',
  surface: '#FFFFFF',
  text: '#1A3A4A',
  textSecondary: '#4A6B7A',
  primary: '#2196F3',
  primaryLight: '#E3F2FD',
  border: '#BBDEFB',
  borderLight: '#90CAF9',
  error: '#EF5350',
  card: '#FFFFFF',
  shadow: '#2196F3',
};

const summerTheme: ThemeColors = {
  background: '#FFF8E1',
  surface: '#FFFFFF',
  text: '#5D4037',
  textSecondary: '#8D6E63',
  primary: '#FF9800',
  primaryLight: '#FFF3E0',
  border: '#FFE0B2',
  borderLight: '#FFCC80',
  error: '#F44336',
  card: '#FFFFFF',
  shadow: '#FF9800',
};

const midnightTheme: ThemeColors = {
  background: '#0D1B2A',
  surface: '#1B263B',
  text: '#E0E1DD',
  textSecondary: '#B0B8C4',
  primary: '#7B68EE',
  primaryLight: '#2D2A4A',
  border: '#415A77',
  borderLight: '#778DA9',
  error: '#E91E63',
  card: '#1B263B',
  shadow: '#000000',
};

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme && ['light', 'dark', 'forest', 'ocean', 'summer', 'midnight'].includes(savedTheme)) {
          setThemeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const getThemeColors = (themeMode: ThemeMode): ThemeColors => {
    switch (themeMode) {
      case 'dark':
        return darkTheme;
      case 'forest':
        return forestTheme;
      case 'ocean':
        return oceanTheme;
      case 'summer':
        return summerTheme;
      case 'midnight':
        return midnightTheme;
      case 'light':
      default:
        return lightTheme;
    }
  };

  const colors = getThemeColors(theme);

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

