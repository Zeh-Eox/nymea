import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Body, Button, Heading, ScreenContainer, Stack } from '@/components/index';

export default function WelcomeStep(): React.JSX.Element {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View className="flex-1 justify-center">
        <Stack gap="md" align="center">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-primary-100">
            <Body className="text-5xl">🌸</Body>
          </View>
          <Heading level={1} align="center">
            Bienvenue sur Nymea
          </Heading>
          <Body tone="secondary" align="center">
            En quelques étapes, on configure ton profil pour des prédictions personnalisées.
          </Body>
        </Stack>
      </View>

      <Stack gap="sm">
        <Button label="C'est parti" onPress={() => router.push('/(onboarding)/name')} />
      </Stack>
    </ScreenContainer>
  );
}
