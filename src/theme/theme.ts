export const theme = {
  colors: {
    // Background layers
    background: {
      primary: '#0A1F2C',    // Deep teal - main screen
      secondary: '#132B38',  // Dark teal - cards
      tertiary: '#1E3A47',   // Medium teal - elevated elements
      gradient: ['#0A1F2C', '#132B38'], // Subtle gradient
    },
    
    // Brand colors
    primary: '#4FD1C5',      // Bright cyan - CTAs, active elements
    primaryDark: '#3ABAB4',  // Darker cyan - pressed states
    primaryLight: '#6FE1D5', // Light cyan - hover states
    
    // Accent colors
    accent: '#5DEAC3',       // Mint green - success, highlights
    secondary: '#3ABAB4',    // Soft cyan - secondary buttons
    
    // Semantic colors
    success: '#5DEAC3',      // Mint green - achievements
    warning: '#FFB84D',      // Warm orange - warnings
    danger: '#FF6B6B',       // Coral red - errors, delete
    info: '#4FD1C5',         // Cyan - information
    
    // Text hierarchy
    text: {
      primary: '#FFFFFF',    // Pure white - main headings
      secondary: '#B4E8E5',  // Light cyan - body text, descriptions
      tertiary: '#6B8B95',   // Muted gray - labels, placeholders
      inverse: '#0A1F2C',    // For light backgrounds
      disabled: '#4A5F6C',   // Disabled text
    },
    
    // Surface colors
    card: '#132B38',         // Card background
    cardElevated: '#1E3A47', // Elevated cards (hover, pressed)
    border: '#1E3A47',       // Borders, outlines
    borderLight: '#2A4A5A',  // Lighter borders
    divider: '#1E3A47',      // Dividers, separators
    overlay: 'rgba(10, 31, 44, 0.95)',
    
    // Interactive states
    active: '#4FD1C5',
    inactive: '#6B8B95',
    disabled: '#2A3F4C',
    hover: '#1E3A47',
    pressed: '#0F2531',
    
    // Glow effects
    glow: {
      primary: 'rgba(79, 209, 197, 0.3)',    // Cyan glow
      accent: 'rgba(93, 234, 195, 0.3)',     // Mint glow
      success: 'rgba(93, 234, 195, 0.2)',
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 28,
    xxxl: 42,
  },
  
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    glow: {
      shadowColor: '#4FD1C5',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 6,
    },
    glowAccent: {
      shadowColor: '#5DEAC3',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
  },
  
  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  
  // Gradient presets
  gradients: {
    background: ['#0A1F2C', '#132B38'],
    card: ['#132B38', '#1E3A47'],
    primary: ['#4FD1C5', '#3ABAB4'],
    accent: ['#5DEAC3', '#4FD1C5'],
    cardSubtle: ['#0F2531', '#132B38'],
  },
} as const;

export type Theme = typeof theme;