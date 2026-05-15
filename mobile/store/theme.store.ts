import { create } from 'zustand';
import { Appearance, type ColorSchemeName } from 'react-native';
import { colorScheme as nwColorScheme } from 'nativewind';
import { storage } from '@/utils/storage';
import { THEME_MODE_KEY } from '@/constants/config';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Scheme = 'light' | 'dark';

function applyScheme(mode: ThemeMode): void {
  if (mode === 'system') {
    nwColorScheme.set('system');
  } else {
    nwColorScheme.set(mode);
  }
}

function resolveScheme(mode: ThemeMode, system: ColorSchemeName): Scheme {
  if (mode === 'system') {
    return system === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

type ThemeState = {
  mode: ThemeMode;
  systemScheme: ColorSchemeName;
  scheme: Scheme;
  setMode: (mode: ThemeMode) => Promise<void>;
  hydrate: () => Promise<void>;
  _setSystemScheme: (s: ColorSchemeName) => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  systemScheme: Appearance.getColorScheme(),
  scheme: resolveScheme('system', Appearance.getColorScheme()),
  setMode: async (mode) => {
    await storage.set(THEME_MODE_KEY, mode);
    applyScheme(mode);
    const { systemScheme } = get();
    set({ mode, scheme: resolveScheme(mode, systemScheme) });
  },
  hydrate: async () => {
    const stored = (await storage.get(THEME_MODE_KEY)) as ThemeMode | null;
    const mode: ThemeMode =
      stored === 'light' || stored === 'dark' || stored === 'system'
        ? stored
        : 'system';
    applyScheme(mode);
    const systemScheme = Appearance.getColorScheme();
    set({ mode, systemScheme, scheme: resolveScheme(mode, systemScheme) });
  },
  _setSystemScheme: (systemScheme) =>
    set((state) => ({
      systemScheme,
      scheme: resolveScheme(state.mode, systemScheme),
    })),
}));

Appearance.addChangeListener(({ colorScheme }) => {
  useThemeStore.getState()._setSystemScheme(colorScheme);
});
