export const colors = {
  primary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  accent: {
    100: '#ede9fe',
    300: '#c4b5fd',
    500: '#a78bfa',
    600: '#8b5cf6',
    700: '#7c3aed',
  },
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    700: '#44403c',
    900: '#1c1917',
  },
  background: '#fff7f3',
  surface: '#ffffff',
  surfaceMuted: '#fff1eb',
  blush: '#fde6ee',
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    muted: '#9ca3af',
    inverse: '#ffffff',
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  // Cycle phase colors used across the app for badges, calendar dots, gradients
  cycle: {
    menstrual: '#ef4444',
    follicular: '#f9a8d4',
    ovulation: '#8b5cf6',
    luteal: '#fbbf24',
  },
} as const;

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radii = {
  none: 0,
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  xxl: 36,
  full: 9999,
} as const;

export const typography = {
  h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  h2: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  bodyLarge: { fontSize: 18, lineHeight: 28, fontWeight: '400' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
} as const;

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  sm: {
    shadowColor: '#f472b6',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#ec4899',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lg: {
    shadowColor: '#db2777',
    shadowOpacity: 0.14,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;

export type ColorKey = keyof typeof colors;
export type CyclePhase = keyof typeof colors.cycle;
export type SpacingKey = keyof typeof spacing;
export type TypographyKey = keyof typeof typography;
