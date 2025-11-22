import { TextStyle } from 'react-native';
import { theme } from '../theme/theme';

/**
 * Typography Helper for Outfit Font
 * 
 * Provides consistent text styles across the app using Outfit font family.
 * Outfit is a bold, contemporary geometric font perfect for modern UIs.
 */

type FontWeight = keyof typeof theme.fontFamily;
type FontSize = keyof typeof theme.fontSize;

/**
 * Get font family based on weight
 */
export const getFontFamily = (weight: FontWeight = 'regular'): string => {
  return theme.fontFamily[weight];
};

/**
 * Create a text style with font family and size
 */
export const createTextStyle = (
  weight: FontWeight = 'regular',
  size?: FontSize
): TextStyle => {
  return {
    fontFamily: getFontFamily(weight),
    ...(size && { fontSize: theme.fontSize[size] }),
  };
};

/**
 * Pre-defined text styles for common use cases
 * Outfit's bold, geometric nature makes it perfect for headings and emphasis
 */
export const typography = {
  // Display styles (large, bold text)
  displayLarge: {
    fontFamily: theme.fontFamily.black,
    fontSize: theme.fontSize['6xl'],
    lineHeight: 68,
  } as TextStyle,
  
  displayMedium: {
    fontFamily: theme.fontFamily.extrabold,
    fontSize: theme.fontSize['5xl'],
    lineHeight: 56,
  } as TextStyle,
  
  displaySmall: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize['4xl'],
    lineHeight: 42,
  } as TextStyle,

  // Heading styles - Outfit shines here
  h1: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize['3xl'],
    lineHeight: 34,
  } as TextStyle,
  
  h2: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize['2xl'],
    lineHeight: 30,
  } as TextStyle,
  
  h3: {
    fontFamily: theme.fontFamily.semibold,
    fontSize: theme.fontSize.xl,
    lineHeight: 26,
  } as TextStyle,
  
  h4: {
    fontFamily: theme.fontFamily.semibold,
    fontSize: theme.fontSize.lg,
    lineHeight: 24,
  } as TextStyle,

  // Body text - use lighter weights for readability
  bodyLarge: {
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSize.lg,
    lineHeight: 26,
  } as TextStyle,
  
  body: {
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSize.base,
    lineHeight: 23,
  } as TextStyle,
  
  bodySmall: {
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  } as TextStyle,

  // Body text - medium weight variants for emphasis
  bodyLargeMedium: {
    fontFamily: theme.fontFamily.medium,
    fontSize: theme.fontSize.lg,
    lineHeight: 26,
  } as TextStyle,
  
  bodyMedium: {
    fontFamily: theme.fontFamily.medium,
    fontSize: theme.fontSize.base,
    lineHeight: 23,
  } as TextStyle,
  
  bodySmallMedium: {
    fontFamily: theme.fontFamily.medium,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  } as TextStyle,

  // Labels and UI text - Outfit's geometric nature works great here
  label: {
    fontFamily: theme.fontFamily.medium,
    fontSize: theme.fontSize.sm,
    lineHeight: 18,
    letterSpacing: 0.3,
  } as TextStyle,
  
  labelLarge: {
    fontFamily: theme.fontFamily.medium,
    fontSize: theme.fontSize.base,
    lineHeight: 20,
    letterSpacing: 0.3,
  } as TextStyle,
  
  labelSmall: {
    fontFamily: theme.fontFamily.medium,
    fontSize: theme.fontSize.xs,
    lineHeight: 16,
    letterSpacing: 0.3,
  } as TextStyle,

  // Button text - Bold weights make buttons pop
  button: {
    fontFamily: theme.fontFamily.semibold,
    fontSize: theme.fontSize.base,
    lineHeight: 20,
    letterSpacing: 0.4,
  } as TextStyle,
  
  buttonLarge: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize.lg,
    lineHeight: 24,
    letterSpacing: 0.4,
  } as TextStyle,
  
  buttonSmall: {
    fontFamily: theme.fontFamily.semibold,
    fontSize: theme.fontSize.sm,
    lineHeight: 18,
    letterSpacing: 0.4,
  } as TextStyle,

  // Caption and overline
  caption: {
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSize.xs,
    lineHeight: 16,
  } as TextStyle,
  
  captionMedium: {
    fontFamily: theme.fontFamily.medium,
    fontSize: theme.fontSize.xs,
    lineHeight: 16,
  } as TextStyle,
  
  overline: {
    fontFamily: theme.fontFamily.semibold,
    fontSize: theme.fontSize.xs,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  } as TextStyle,

  // Timer display - Use bold/black for maximum impact
  timerDisplay: {
    fontFamily: theme.fontFamily.black,
    fontSize: theme.fontSize['6xl'],
    lineHeight: 68,
    letterSpacing: -1,
  } as TextStyle,

  // Stats numbers - Bold weights work great for numbers
  statsNumber: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize['4xl'],
    lineHeight: 42,
    letterSpacing: -0.5,
  } as TextStyle,
} as const;

/**
 * Quick access to font weights
 * Outfit has 9 weights for maximum flexibility
 */
export const fonts = {
  thin: theme.fontFamily.thin,
  extralight: theme.fontFamily.extralight,
  light: theme.fontFamily.light,
  regular: theme.fontFamily.regular,
  medium: theme.fontFamily.medium,
  semibold: theme.fontFamily.semibold,
  bold: theme.fontFamily.bold,
  extrabold: theme.fontFamily.extrabold,
  black: theme.fontFamily.black,
} as const;