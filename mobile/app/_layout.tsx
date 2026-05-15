import '@/global.css';
import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { pushService } from '@/services/push.service';
import { setUnauthorizedHandler } from '@/services/api';
import { Spinner } from '@/components/spinner';
import { ToastViewport } from '@/components/toast-viewport';
import { useThemeStore } from '@/store/theme.store';
import { useScheme } from '@/hooks/use-theme';

function useProtectedRoute(
  isAuthenticated: boolean,
  isHydrating: boolean,
  needsOnboarding: boolean,
): void {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isHydrating) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && needsOnboarding && !inOnboardingGroup) {
      router.replace('/(onboarding)/welcome');
    } else if (isAuthenticated && !needsOnboarding && (inAuthGroup || inOnboardingGroup)) {
      router.replace('/');
    }
  }, [isAuthenticated, isHydrating, needsOnboarding, segments, router]);
}

export default function RootLayout(): React.JSX.Element {
  const { user, isAuthenticated, isHydrating, hydrate, clearTokens } = useAuthStore();
  const needsOnboarding = isAuthenticated && user?.onboardedAt == null;
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const scheme = useScheme();

  useEffect(() => {
    setUnauthorizedHandler(clearTokens);
    void hydrate(() => authService.me());
    void hydrateTheme();
  }, [hydrate, clearTokens, hydrateTheme]);

  useProtectedRoute(isAuthenticated, isHydrating, needsOnboarding);

  useEffect(() => {
    if (isAuthenticated && !needsOnboarding) {
      void pushService.registerForPush();
    }
  }, [isAuthenticated, needsOnboarding]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        {isHydrating ? <Spinner fullScreen /> : <Slot />}
        <ToastViewport />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
