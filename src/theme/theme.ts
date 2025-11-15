// Session Track - Complete Design System
// Based on glassmorphism + neon cyan/teal aesthetic

export const theme = {
  colors: {
    // Primary brand colors (Cyan/Teal from home screen)
    primary: {
      aqua: '#38BDF8',     // Primary actions, main brand
      cyan: '#67E8F9',     // Highlights, active states
      mint: '#34D399',     // Success, achievements
      light: '#A5F3FC',    // Lighter variant
      dark: '#0891B2',     // Darker variant
      sage: '#6EE7B7',     // Additional accent
      teal: '#14B8A6',     // Additional accent
    },

    // Background layers
    background: {
      primary: '#08171c',   // Deep teal - main background
      secondary: '#0d1f26', // Medium teal - cards
      tertiary: '#1e313b',  // Light teal - elevated cards
      gradient: ['#08171c', '#1e313b'], // Main gradient
      animated: ['#08171c', '#1B263B', '#1e313b'], // 3-stop for animations
    },

    // Surface colors (glassmorphism)
    glass: {
      background: 'rgba(30, 49, 59, 0.4)',
      border: 'rgba(107, 255, 235, 0.1)',
      light: 'rgba(255, 255, 255, 0.05)',
      medium: 'rgba(255, 255, 255, 0.1)',
      strong: 'rgba(255, 255, 255, 0.15)',
    },

    // Semantic colors
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    info: '#67E8F9',

    // Text hierarchy
    text: {
      primary: '#FFFFFF',       // Pure white
      secondary: 'rgba(255, 255, 255, 0.9)',  // 90% white
      tertiary: 'rgba(255, 255, 255, 0.6)',   // 60% white
      quaternary: 'rgba(255, 255, 255, 0.4)', // 40% white
      inverse: '#08171c',
    },

    // Interactive states
    active: '#67E8F9',
    inactive: 'rgba(255, 255, 255, 0.4)',
    hover: 'rgba(103, 232, 249, 0.1)',
    pressed: 'rgba(103, 232, 249, 0.2)',

    // Overlay & backdrop
    overlay: 'rgba(8, 23, 28, 0.8)',
    backdrop: 'rgba(8, 23, 28, 0.3)',
  },

  // Typography
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },

  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },

  // Spacing scale
  spacing: {
    0: 0,
    px: 1,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
  },

  // Border radius
  borderRadius: {
    none: 0,
    sm: 8,
    DEFAULT: 12,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },

  // Shadows & Glows
  shadows: {
    // Standard shadows
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },

    // Glow effects
    glowAqua: {
      shadowColor: '#38BDF8',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 10,
    },
    glowCyan: {
      shadowColor: '#67E8F9',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 12,
    },
    glowMint: {
      shadowColor: '#34D399',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 10,
    },
    glowEnergyRing: {
      shadowColor: '#67E8F9',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 60,
      elevation: 15,
    },
    glowBottomNav: {
      shadowColor: '#67E8F9',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 15,
      elevation: 12,
    },
  },

  // Animation durations
  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
    gradient: 15000, // 15s for gradient animation
    glow: 3000,      // 3s for glow pulse
  },

  // Gradient presets
  gradients: {
    background: ['#08171c', '#1e313b'],
    backgroundAnimated: ['#08171c', '#1B263B', '#1e313b'],
    glass: ['rgba(30, 49, 59, 0.4)', 'rgba(30, 49, 59, 0.2)'],
    primary: ['#38BDF8', '#67E8F9'],
    success: ['#34D399', '#67E8F9'],
    reflection: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0)'],
    energyRing: ['rgba(103, 232, 249, 0.1)', 'rgba(103, 232, 249, 0)'],
  },

  // Blur strength
  blur: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
} as const;

export type Theme = typeof theme;

export const COLORS = theme.colors;