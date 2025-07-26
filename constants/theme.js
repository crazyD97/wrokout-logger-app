import { DefaultTheme, DarkTheme } from '@react-navigation/native';

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
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.cardBorder,
    notification: colors.primary,
  },
  roundness: 12,
  elevation: {
    level0: 0,
    level1: 2,
    level2: 4,
    level3: 6,
    level4: 8,
    level5: 12,
  },
};

export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    ...darkColors,
    primary: darkColors.primary,
    background: darkColors.background,
    card: darkColors.surface,
    text: darkColors.text,
    border: darkColors.cardBorder,
    notification: darkColors.primary,
  },
  roundness: 12,
  elevation: {
    level0: 0,
    level1: 2,
    level2: 4,
    level3: 6,
    level4: 8,
    level5: 12,
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
    fontFamily: 'Poppins-Bold',
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    fontFamily: 'Poppins-Bold',
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    fontFamily: 'Poppins-SemiBold',
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    fontFamily: 'Poppins-SemiBold',
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
    fontFamily: 'Poppins-Regular',
  },
};
