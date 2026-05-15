import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Body, Button, Heading, ScreenContainer, Stack, TextField } from '@/components/index';
import { OnboardingProgress } from '@/components/onboarding-progress';
import { useOnboardingStore } from '@/store/onboarding.store';

export default function NameStep(): React.JSX.Element {
  const router = useRouter();
  const { name, setName } = useOnboardingStore();

  return (
    <ScreenContainer>
      <OnboardingProgress step={1} total={4} />

      <Stack gap="md" className="mb-8">
        <Heading level={1}>Comment t'appelles-tu ?</Heading>
        <Body tone="secondary">On utilisera ce prénom pour personnaliser l'app.</Body>
      </Stack>

      <TextField
        value={name}
        onChangeText={setName}
        label="Prénom"
        placeholder="Ton prénom"
        autoCapitalize="words"
      />

      <View className="mt-auto">
        <Button
          label="Continuer"
          onPress={() => router.push('/(onboarding)/last-period')}
          disabled={name.trim().length === 0}
        />
      </View>
    </ScreenContainer>
  );
}
