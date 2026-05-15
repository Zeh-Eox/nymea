import { useThemeStore, type Scheme } from '@/store/theme.store';
import { colors as lightColors } from '@/theme/tokens';

const DARK_OVERRIDES = {
  background: '#181218',
  surface: '#241c24',
  surfaceMuted: '#2f252f',
  blush: '#472c3a',
  border: '#382a34',
  text: {
    primary: '#f5f0ed',
    secondary: '#bcaeb4',
    muted: '#82747a',
    inverse: '#181218',
  },
  neutralSoft: '#2f252f',
  neutralStrong: '#473c42',
};

export type ThemedColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  blush: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  neutralSoft: string;
  neutralStrong: string;
  primary: typeof lightColors.primary;
  accent: typeof lightColors.accent;
  cycle: typeof lightColors.cycle;
  status: typeof lightColors.status;
};

function buildColors(scheme: Scheme): ThemedColors {
  const isDark = scheme === 'dark';
  return {
    background: isDark ? DARK_OVERRIDES.background : lightColors.background,
    surface: isDark ? DARK_OVERRIDES.surface : lightColors.surface,
    surfaceMuted: isDark ? DARK_OVERRIDES.surfaceMuted : lightColors.surfaceMuted,
    blush: isDark ? DARK_OVERRIDES.blush : lightColors.blush,
    border: isDark ? DARK_OVERRIDES.border : '#f4e9ee',
    text: isDark ? DARK_OVERRIDES.text : lightColors.text,
    neutralSoft: isDark ? DARK_OVERRIDES.neutralSoft : lightColors.neutral[100],
    neutralStrong: isDark ? DARK_OVERRIDES.neutralStrong : lightColors.neutral[200],
    primary: lightColors.primary,
    accent: lightColors.accent,
    cycle: lightColors.cycle,
    status: lightColors.status,
  };
}

export function useThemedColors(): ThemedColors {
  const scheme = useThemeStore((s) => s.scheme);
  return buildColors(scheme);
}

export function useScheme(): Scheme {
  return useThemeStore((s) => s.scheme);
}
