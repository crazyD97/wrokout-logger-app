import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const colors = {
  primary: '#667EFF',
  primaryDark: '#4A5FE7',
  secondary: '#9C27B0',
  accent: '#03DAC6',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  error: '#B00020',
  success: '#4CAF50',
  warning: '#FF9800',
  cardBorder: '#E0E0E0',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const darkColors = {
  primary: '#667EFF',
  primaryDark: '#4A5FE7',
  secondary: '#BB86FC',
  accent: '#03DAC6',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  error: '#CF6679',
  success: '#4CAF50',
  warning: '#FF9800',
  cardBorder: '#2A2A2A',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: '#E8F0FF',
    onPrimaryContainer: '#1A1B3F',
    secondary: colors.secondary,
    onSecondary: '#FFFFFF',
    secondaryContainer: '#F0E7FF',
    onSecondaryContainer: '#2A1B3F',
    surface: colors.surface,
    onSurface: colors.text,
    surfaceVariant: '#F0F0F0',
    onSurfaceVariant: colors.textSecondary,
    background: colors.background,
    onBackground: colors.text,
    error: colors.error,
    onError: '#FFFFFF',
    errorContainer: '#FFEBEE',
    onErrorContainer: '#B00020',
    outline: '#E0E0E0',
    outlineVariant: '#F0F0F0',
    inverseSurface: '#2A2A2A',
    inverseOnSurface: '#F5F5F5',
    inversePrimary: '#667EFF',
    shadow: colors.shadow,
    scrim: 'rgba(0, 0, 0, 0.32)',
    surfaceTint: colors.primary,
    surfaceDisabled: '#F5F5F5',
    onSurfaceDisabled: '#BDBDBD',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  // Navigation theme properties
  navigation: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.cardBorder,
      notification: colors.primary,
    },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: '#1A1B3F',
    onPrimaryContainer: '#E8F0FF',
    secondary: darkColors.secondary,
    onSecondary: '#FFFFFF',
    secondaryContainer: '#2A1B3F',
    onSecondaryContainer: '#F0E7FF',
    surface: darkColors.surface,
    onSurface: darkColors.text,
    surfaceVariant: '#2A2A2A',
    onSurfaceVariant: darkColors.textSecondary,
    background: darkColors.background,
    onBackground: darkColors.text,
    error: darkColors.error,
    onError: '#FFFFFF',
    errorContainer: '#B00020',
    onErrorContainer: '#FFEBEE',
    outline: '#404040',
    outlineVariant: '#2A2A2A',
    inverseSurface: '#F5F5F5',
    inverseOnSurface: '#2A2A2A',
    inversePrimary: '#667EFF',
    shadow: darkColors.shadow,
    scrim: 'rgba(0, 0, 0, 0.32)',
    surfaceTint: darkColors.primary,
    surfaceDisabled: '#2A2A2A',
    onSurfaceDisabled: '#666666',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  // Navigation theme properties
  navigation: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: darkColors.primary,
      background: darkColors.background,
      card: darkColors.surface,
      text: darkColors.text,
      border: darkColors.cardBorder,
      notification: darkColors.primary,
    },
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
  },
};
