import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Avatar,
  Body,
  Button,
  Card,
  Caption,
  Divider,
  Heading,
  Row,
  ScreenContainer,
  Spinner,
  Stack,
  Typography,
} from '@/components/index';
import { useAuth } from '@/hooks/use-auth';
import { useCycles } from '@/hooks/use-cycles';
import { usePrediction } from '@/hooks/use-prediction';
import {
  formatShortDate,
  getCurrentCycleState,
  todayIso,
} from '@/utils/cycle';
import { formatHumanDate } from '@/utils/date';
import type { PredictionConfidence } from '@/services/prediction.service';
import { toast } from '@/store/toast.store';
import { useScheme, useThemedColors } from '@/hooks/use-theme';

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { cycles, isLoading, create, update } = useCycles();
  const { prediction } = usePrediction();
  const c = useThemedColors();
  const scheme = useScheme();

  const heroShadow = {
    shadowColor: c.primary[500],
    shadowOpacity: scheme === 'dark' ? 0.35 : 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  };

  const state = getCurrentCycleState(cycles);
  const firstName = (user?.name ?? 'toi').split(' ')[0];

  const startPeriod = async () => {
    try {
      await create({ startDate: todayIso() });
      toast.success('Cycle enregistré');
    } catch {
      toast.error("Impossible d'enregistrer le cycle");
    }
  };

  const endPeriod = async (cycleId: string) => {
    try {
      await update(cycleId, { endDate: todayIso() });
      toast.success('Fin des règles enregistrée');
    } catch {
      toast.error('Impossible de mettre à jour le cycle');
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Row justify="between" align="center" className="mb-6 mt-2">
          <View>
            <Caption tone="secondary">{greeting()}</Caption>
            <Heading level={1}>{firstName}</Heading>
          </View>
          <Avatar name={user?.name} size="lg" />
        </Row>

        <View
          className="mb-4 rounded-3xl bg-surface px-6 py-7"
          style={heroShadow}
        >
          {isLoading && cycles.length === 0 ? (
            <View className="py-8 items-center">
              <Spinner />
            </View>
          ) : state.kind === 'none' ? (
            <Stack gap="md">
              <PhasePill label="Démarre ton suivi" tint={c.primary[400]} />
              <Heading level={2}>Aucun cycle enregistré</Heading>
              <Body tone="secondary">
                Quand tes règles commencent, appuie ci-dessous pour démarrer ton premier cycle.
              </Body>
              <Button label="Mes règles ont commencé" onPress={startPeriod} />
            </Stack>
          ) : state.kind === 'in-period' ? (
            <Stack gap="md">
              <PhasePill label="Règles en cours" tint={c.cycle.menstrual} />
              <Heading level={2}>Jour {state.dayOfPeriod}</Heading>
              <Body tone="secondary">
                Démarrées le {formatShortDate(state.cycle.startDate)}. Prends soin de toi.
              </Body>
              <Button
                label="Mes règles sont terminées"
                variant="secondary"
                onPress={() => void endPeriod(state.cycle.id)}
              />
            </Stack>
          ) : (
            <Stack gap="md">
              <PhasePill label="Entre deux cycles" tint={c.cycle.follicular} />
              <Heading level={2}>Jour {state.dayOfCycle}</Heading>
              <Body tone="secondary">
                Dernières règles le {formatShortDate(state.cycle.startDate)}.
              </Body>
              <Button label="Mes règles ont commencé" onPress={startPeriod} />
            </Stack>
          )}
        </View>

        {prediction && state.kind !== 'in-period' && (
          <Card elevation="sm" padding="lg" className="mb-4">
            <Row justify="between" align="center" className="mb-2">
              <Row gap="sm" align="center">
                <View
                  className="h-9 w-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: c.blush }}
                >
                  <Ionicons name="moon" size={18} color={c.primary[600]} />
                </View>
                <Typography variant="label" tone="secondary">
                  Prochaines règles
                </Typography>
              </Row>
              <ConfidenceBadge confidence={prediction.confidence} />
            </Row>
            <Heading level={2}>{formatCountdown(prediction.daysUntilNextPeriod)}</Heading>
            <Body tone="secondary" className="mt-1">
              Prévues le {formatHumanDate(prediction.nextPeriodStart.slice(0, 10))}
            </Body>
            <Divider spacing="sm" />
            <Row justify="between">
              <Stack gap="xs">
                <Caption tone="secondary">Ovulation</Caption>
                <Body>{formatShortDate(prediction.ovulation)}</Body>
              </Stack>
              <Stack gap="xs" align="end">
                <Caption tone="secondary">Fenêtre fertile</Caption>
                <Body>
                  {formatShortDate(prediction.fertileStart)} →{' '}
                  {formatShortDate(prediction.fertileEnd)}
                </Body>
              </Stack>
            </Row>
          </Card>
        )}

        <ActionRow
          icon="book"
          label="Journal du jour"
          help="Humeur, symptômes, sommeil…"
          onPress={() => router.push('/journal')}
        />

        {cycles.length > 0 && (
          <ActionRow
            icon="stats-chart"
            label="Statistiques"
            help="Moyennes, régularité, symptômes"
            onPress={() => router.push('/stats')}
          />
        )}

        {cycles.length > 0 && (
          <Card elevation="sm" onPress={() => router.push('/cycles')}>
            <Row justify="between" align="center" className="mb-3">
              <Row gap="sm" align="center">
                <View
                  className="h-9 w-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: c.blush }}
                >
                  <Ionicons name="time" size={18} color={c.primary[600]} />
                </View>
                <Typography variant="label" tone="secondary">
                  Cycles précédents
                </Typography>
              </Row>
              <Caption tone="primary">Voir tout</Caption>
            </Row>
            <Stack gap="none">
              {cycles.slice(0, 3).map((c, i) => (
                <React.Fragment key={c.id}>
                  {i > 0 && <Divider spacing="none" />}
                  <Row justify="between" className="py-2">
                    <Body>{formatShortDate(c.startDate)}</Body>
                    <Caption>
                      {c.cycleLength ? `${c.cycleLength} j` : 'en cours'}
                    </Caption>
                  </Row>
                </React.Fragment>
              ))}
            </Stack>
          </Card>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Bonne nuit';
  if (h < 12) return 'Bon matin';
  if (h < 18) return 'Bel après-midi';
  return 'Belle soirée';
}

function formatCountdown(days: number): string {
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Demain';
  if (days > 0) return `Dans ${days} jours`;
  return `Retard de ${Math.abs(days)} ${Math.abs(days) === 1 ? 'jour' : 'jours'}`;
}

function PhasePill({
  label,
  tint,
}: {
  label: string;
  tint: string;
}): React.JSX.Element {
  return (
    <View className="flex-row items-center self-start rounded-full px-3 py-1.5" style={{ backgroundColor: `${tint}1f` }}>
      <View
        className="h-2 w-2 rounded-full mr-2"
        style={{ backgroundColor: tint }}
      />
      <Text className="text-xs font-semibold" style={{ color: tint }}>
        {label}
      </Text>
    </View>
  );
}

function ActionRow({
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
  const subtleShadow = {
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
      style={subtleShadow}
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

function ConfidenceBadge({
  confidence,
}: {
  confidence: PredictionConfidence;
}): React.JSX.Element {
  const scheme = useScheme();
  const isDark = scheme === 'dark';
  const label =
    confidence === 'high'
      ? 'Fiable'
      : confidence === 'medium'
        ? 'Estimation'
        : 'Approximatif';
  const palette =
    confidence === 'high'
      ? { bg: isDark ? '#163d2e' : '#d1fae5', fg: isDark ? '#6ee7b7' : '#047857' }
      : confidence === 'medium'
        ? { bg: isDark ? '#3f2d10' : '#fef3c7', fg: isDark ? '#fcd34d' : '#b45309' }
        : { bg: isDark ? '#2c2c2c' : '#e5e5e5', fg: isDark ? '#d4d4d4' : '#404040' };
  return (
    <View
      className="rounded-full px-2.5 py-1"
      style={{ backgroundColor: palette.bg }}
    >
      <Typography variant="caption" style={{ color: palette.fg }}>
        {label}
      </Typography>
    </View>
  );
}
