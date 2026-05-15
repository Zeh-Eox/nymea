import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Avatar,
  Body,
  Button,
  Card,
  Caption,
  Heading,
  Row,
  ScreenContainer,
  Stack,
  Typography,
} from '@/components/index';
import { useAuth } from '@/hooks/use-auth';
import { useCycles } from '@/hooks/use-cycles';
import { useScheme, useThemedColors } from '@/hooks/use-theme';

export default function ProfileScreen(): React.JSX.Element {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cycles } = useCycles();
  const c = useThemedColors();
  const scheme = useScheme();

  const heroShadow = {
    shadowColor: c.primary[500],
    shadowOpacity: scheme === 'dark' ? 0.3 : 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <Row justify="between" align="center" className="mb-6 mt-2">
          <Heading level={1}>Profil</Heading>
        </Row>

        <View className="mb-4 rounded-3xl bg-surface px-5 py-6" style={heroShadow}>
          <Row gap="md" align="center">
            <Avatar name={user?.name} size="lg" />
            <Stack gap="xs" className="flex-1">
              <Body weight="semibold">{user?.name ?? 'Sans nom'}</Body>
              <Caption tone="secondary">{user?.email}</Caption>
            </Stack>
          </Row>
        </View>

        {user && (
          <Row gap="sm" className="mb-4">
            <View className="flex-1">
              <MiniStat
                label="Cycle moyen"
                value={`${user.defaultCycleLength}`}
                unit="j"
              />
            </View>
            <View className="flex-1">
              <MiniStat label="Règles" value={`${user.defaultPeriodLength}`} unit="j" />
            </View>
            <View className="flex-1">
              <MiniStat label="Suivi" value={`${cycles.length}`} unit="cycles" />
            </View>
          </Row>
        )}

        <ProfileLink
          icon="settings-outline"
          label="Paramètres"
          help="Profil, notifications, sécurité"
          onPress={() => router.push('/profile/settings')}
        />

        <ProfileLink
          icon="stats-chart-outline"
          label="Mes statistiques"
          help="Régularité, symptômes, humeurs"
          onPress={() => router.push('/profile/stats')}
        />

        <ProfileLink
          icon="time-outline"
          label="Historique des cycles"
          help={`${cycles.length} cycle${cycles.length > 1 ? 's' : ''} enregistré${cycles.length > 1 ? 's' : ''}`}
          onPress={() => router.push('/profile/cycles')}
        />

        <View className="mt-4">
          <Button label="Se déconnecter" variant="secondary" onPress={() => void logout()} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function MiniStat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}): React.JSX.Element {
  return (
    <Card elevation="sm" padding="sm">
      <Caption tone="secondary">{label}</Caption>
      <Row align="end" gap="xs" className="mt-1">
        <Heading level={3}>{value}</Heading>
        <Body tone="secondary" className="text-xs">
          {unit}
        </Body>
      </Row>
    </Card>
  );
}

function ProfileLink({
  icon,
  label,
  help,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  help: string;
  onPress: () => void;
}): React.JSX.Element {
  const c = useThemedColors();
  const scheme = useScheme();
  const rowShadow = {
    shadowColor: c.primary[500],
    shadowOpacity: scheme === 'dark' ? 0.25 : 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  };
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-3xl bg-surface px-4 py-4 active:opacity-90"
      style={rowShadow}
    >
      <View
        className="h-11 w-11 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: c.blush }}
      >
        <Ionicons name={icon} size={20} color={c.primary[600]} />
      </View>
      <View className="flex-1">
        <Typography variant="label">{label}</Typography>
        <Caption tone="secondary">{help}</Caption>
      </View>
      <Ionicons name="chevron-forward" size={20} color={c.text.muted} />
    </Pressable>
  );
}
