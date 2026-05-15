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

export default function CycleLengthStep(): React.JSX.Element {
  const router = useRouter();
  const { cycleLength, setCycleLength } = useOnboardingStore();

  return (
    <ScreenContainer>
      <OnboardingProgress step={3} total={4} />

      <Stack gap="md" className="mb-10">
        <Heading level={1}>Durée moyenne du cycle</Heading>
        <Body tone="secondary">
          Du premier jour des règles au premier jour des règles suivantes. La moyenne est de
          28 jours.
        </Body>
      </Stack>

      <View className="my-10">
        <Stepper
          value={cycleLength}
          onChange={setCycleLength}
          min={21}
          max={40}
          suffix="jours"
        />
      </View>

      <View className="mt-auto">
        <Button
          label="Continuer"
          onPress={() => router.push('/(onboarding)/period-length')}
        />
      </View>
    </ScreenContainer>
  );
}
