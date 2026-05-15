import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import {
  Body,
  Card,
  Caption,
  CycleLengthChart,
  Heading,
  Row,
  ScreenContainer,
  ScreenHeader,
  Spinner,
  Stack,
  Typography,
} from '@/components/index';
import { useStats } from '@/hooks/use-stats';
import { MOODS, SYMPTOM_TYPES } from '@/constants/journal';

export default function StatsScreen(): React.JSX.Element {
  const { stats, isLoading, refresh } = useStats();

  if (!stats && isLoading) {
    return <Spinner fullScreen />;
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Statistiques" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} />
        }
      >
        {!stats || stats.totalCycles === 0 ? (
          <Card>
            <Body tone="secondary">
              Quand tu auras enregistré quelques cycles, tu pourras voir ici tes
              moyennes, ta régularité, tes symptômes récurrents et ton humeur.
            </Body>
          </Card>
        ) : (
          <>
            <Row gap="sm" className="mb-4">
              <View className="flex-1">
                <KpiCard
                  label="Cycle moyen"
                  value={stats.avgCycleLength}
                  unit="j"
                />
              </View>
              <View className="flex-1">
                <KpiCard
                  label="Règles moy."
                  value={stats.avgPeriodLength}
                  unit="j"
                />
              </View>
            </Row>

            {stats.regularityScore !== null && (
              <Card elevation="sm" className="mb-4">
                <Row justify="between" align="center" className="mb-2">
                  <Typography variant="label" tone="secondary">Régularité</Typography>
                  <Heading level={3}>{stats.regularityScore} / 100</Heading>
                </Row>
                <View className="h-2 bg-surface-muted rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${stats.regularityScore}%` }}
                  />
                </View>
                <Caption tone="secondary" className="mt-2">
                  Basé sur {stats.totalCycles} cycle
                  {stats.totalCycles > 1 ? 's' : ''}.{' '}
                  {stats.cycleLengthVariance !== null &&
                    `Variance ${stats.cycleLengthVariance} j².`}
                </Caption>
              </Card>
            )}

            <Card elevation="sm" className="mb-4">
              <Typography variant="label" tone="secondary" className="mb-3">
                Historique de longueur des cycles
              </Typography>
              <CycleLengthChart data={stats.cycleHistory} />
            </Card>

            <Card elevation="sm" className="mb-4">
              <Typography variant="label" tone="secondary" className="mb-3">
                Symptômes les plus fréquents (60 derniers jours)
              </Typography>
              {stats.topSymptoms.length === 0 ? (
                <Caption tone="secondary">Aucun symptôme enregistré.</Caption>
              ) : (
                <Stack gap="sm">
                  {stats.topSymptoms.map((s, idx) => {
                    const label =
                      SYMPTOM_TYPES.find((t) => t.value === s.type)?.label ?? s.type;
                    const maxCount = stats.topSymptoms[0]?.count ?? 1;
                    const ratio = (s.count / maxCount) * 100;
                    return (
                      <View key={s.type}>
                        <Row justify="between" align="center" className="mb-1">
                          <Body>{idx + 1}. {label}</Body>
                          <Caption tone="secondary">{s.count}×</Caption>
                        </Row>
                        <View className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                          <View
                            className="h-full bg-accent-500 rounded-full"
                            style={{ width: `${ratio}%` }}
                          />
                        </View>
                      </View>
                    );
                  })}
                </Stack>
              )}
            </Card>

            <Card elevation="sm">
              <Typography variant="label" tone="secondary" className="mb-3">
                Humeurs des 30 derniers jours
              </Typography>
              {stats.moodTrend.length === 0 ? (
                <Caption tone="secondary">Pas d'humeur enregistrée.</Caption>
              ) : (
                <MoodDistribution moods={stats.moodTrend.map((m) => m.mood)} />
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function KpiCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}): React.JSX.Element {
  return (
    <Card elevation="sm" padding="md">
      <Caption tone="secondary">{label}</Caption>
      <Row align="end" gap="xs" className="mt-1">
        <Heading level={2}>{value ?? '—'}</Heading>
        {value !== null && <Body tone="secondary">{unit}</Body>}
      </Row>
    </Card>
  );
}

function MoodDistribution({ moods }: { moods: string[] }): React.JSX.Element {
  const counts = new Map<string, number>();
  moods.forEach((m) => counts.set(m, (counts.get(m) ?? 0) + 1));
  const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, n]) => n));

  return (
    <Stack gap="sm">
      {entries.map(([mood, count]) => {
        const label = MOODS.find((m) => m.value === mood)?.label ?? mood;
        const ratio = (count / max) * 100;
        return (
          <View key={mood}>
            <Row justify="between" align="center" className="mb-1">
              <Body>{label}</Body>
              <Caption tone="secondary">{count} jour{count > 1 ? 's' : ''}</Caption>
            </Row>
            <View className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
              <View
                className="h-full bg-primary-400 rounded-full"
                style={{ width: `${ratio}%` }}
              />
            </View>
          </View>
        );
      })}
    </Stack>
  );
}
