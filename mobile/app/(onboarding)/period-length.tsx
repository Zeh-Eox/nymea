import React, { useState } from 'react';
import { Text, View } from 'react-native';
import {
  Body,
  Button,
  Heading,
  ScreenContainer,
  Stack,
  Stepper,
} from '@/components/index';
import { OnboardingProgress } from '@/components/onboarding-progress';
import { useOnboardingStore } from '@/store/onboarding.store';
import { useAuthStore } from '@/store/auth.store';
import { onboardingService } from '@/services/onboarding.service';

function toIsoFromDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString();
}

export default function PeriodLengthStep(): React.JSX.Element {
  const {
    name,
    lastPeriodDaysAgo,
    cycleLength,
    periodLength,
    setPeriodLength,
    reset,
  } = useOnboardingStore();
  const setUser = useAuthStore((s) => s.setUser);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const user = await onboardingService.complete({
        name: name || undefined,
        lastPeriodStart:
          lastPeriodDaysAgo !== null ? toIsoFromDaysAgo(lastPeriodDaysAgo) : undefined,
        cycleLength,
        periodLength,
      });
      setUser(user);
      reset();
      // The root layout will redirect to (tabs) automatically via useProtectedRoute
    } catch (err) {
      const axiosErr = err as { response?: { data?: unknown }; message?: string };
      console.error('[onboarding] error', axiosErr);
      setError('Impossible de finaliser. Réessaie dans un instant.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <OnboardingProgress step={4} total={4} />

      <Stack gap="md" className="mb-10">
        <Heading level={1}>Durée de tes règles</Heading>
        <Body tone="secondary">Combien de jours en moyenne ? La plupart se situent autour de 5.</Body>
      </Stack>

      <View className="my-10">
        <Stepper
          value={periodLength}
          onChange={setPeriodLength}
          min={1}
          max={15}
          suffix={periodLength === 1 ? 'jour' : 'jours'}
        />
      </View>

      {error && <Text className="mb-2 text-sm text-red-500">{error}</Text>}

      <View className="mt-auto">
        <Button label="Terminer" onPress={onFinish} loading={submitting} />
      </View>
    </ScreenContainer>
  );
}
