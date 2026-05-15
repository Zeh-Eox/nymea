import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
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

export default function LastPeriodStep(): React.JSX.Element {
  const router = useRouter();
  const { lastPeriodDaysAgo, setLastPeriodDaysAgo } = useOnboardingStore();
  const value = lastPeriodDaysAgo ?? 0;

  return (
    <ScreenContainer>
      <OnboardingProgress step={2} total={4} />

      <Stack gap="md" className="mb-10">
        <Heading level={1}>Tes dernières règles</Heading>
        <Body tone="secondary">
          Il y a combien de jours ont-elles commencé ? Ça nous aide à prédire les prochaines.
        </Body>
      </Stack>

      <View className="my-10">
        <Stepper
          value={value}
          onChange={setLastPeriodDaysAgo}
          min={0}
          max={60}
          suffix={value === 0 ? 'aujourd’hui' : value === 1 ? 'jour' : 'jours'}
        />
      </View>

      <View className="mt-auto">
        <Stack gap="sm">
          <Button
            label="Continuer"
            onPress={() => router.push('/(onboarding)/cycle-length')}
          />
          <Button
            label="Je préfère renseigner plus tard"
            variant="ghost"
            onPress={() => {
              setLastPeriodDaysAgo(null);
              router.push('/(onboarding)/cycle-length');
            }}
          />
        </Stack>
      </View>
    </ScreenContainer>
  );
}
