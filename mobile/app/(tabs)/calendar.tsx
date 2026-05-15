import React, { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Body,
  Button,
  CalendarGrid,
  Card,
  Caption,
  Chip,
  Divider,
  Heading,
  PhaseChip,
  Row,
  ScreenContainer,
  Stack,
  Typography,
} from '@/components/index';
import { useAuth } from '@/hooks/use-auth';
import { useCycles } from '@/hooks/use-cycles';
import { useEntries } from '@/hooks/use-entries';
import { usePrediction } from '@/hooks/use-prediction';
import { SYMPTOM_TYPES, MOODS } from '@/constants/journal';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '@/constants/config';
import { formatHumanDate, relativeLabel } from '@/utils/date';
import {
  PHASE_LABEL,
  resolveDayState,
  resolvePhase,
} from '@/utils/cycle-phase';
import { useScheme, useThemedColors } from '@/hooks/use-theme';

const MONTHS_LONG = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

export default function CalendarScreen(): React.JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { cycles } = useCycles();
  const { getByDate } = useEntries({}, true);
  const { prediction } = usePrediction();
  const c = useThemedColors();

  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth());
  const [selected, setSelected] = useState<string | null>(null);

  const defaults = {
    cycleLength: user?.defaultCycleLength ?? DEFAULT_CYCLE_LENGTH,
    periodLength: user?.defaultPeriodLength ?? DEFAULT_PERIOD_LENGTH,
  };

  const getDayState = useCallback(
    (dateKey: string) => resolveDayState(cycles, prediction, dateKey, defaults),
    [cycles, prediction, defaults.cycleLength, defaults.periodLength],
  );

  const goPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const goNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };
  const goToday = () => {
    setYear(now.getUTCFullYear());
    setMonth(now.getUTCMonth());
  };

  const selectedInfo = useMemo(() => {
    if (!selected) return null;
    const phase = resolvePhase(cycles, selected, defaults);
    const entry = getByDate(selected);
    return { phase, entry };
  }, [selected, cycles, getByDate, defaults.cycleLength, defaults.periodLength]);

  return (
    <ScreenContainer>
      <Row justify="between" align="center" className="mb-4 mt-2">
        <Heading level={1}>Calendrier</Heading>
        <Pressable
          onPress={goToday}
          className="rounded-full bg-blush px-3 py-1.5 active:opacity-80"
        >
          <Caption tone="primary">Aujourd'hui</Caption>
        </Pressable>
      </Row>

      <Card elevation="sm" padding="lg">
        <Row justify="between" align="center" className="mb-4">
          <Pressable
            onPress={goPrev}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
            style={{ backgroundColor: c.blush }}
          >
            <Text className="text-2xl" style={{ color: c.primary[600] }}>‹</Text>
          </Pressable>
          <Typography variant="label">
            {MONTHS_LONG[month]} {year}
          </Typography>
          <Pressable
            onPress={goNext}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
            style={{ backgroundColor: c.blush }}
          >
            <Text className="text-2xl" style={{ color: c.primary[600] }}>›</Text>
          </Pressable>
        </Row>

        <CalendarGrid
          year={year}
          month={month}
          selectedDateKey={selected}
          getDayState={getDayState}
          onDayPress={setSelected}
        />
      </Card>

      <View className="mt-4">
        <Caption tone="secondary" className="mb-2">Légende</Caption>
        <Row gap="md" className="flex-wrap">
          {(['menstrual', 'follicular', 'ovulation', 'luteal'] as const).map((p) => (
            <Row key={p} gap="xs" align="center">
              <View
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: c.cycle[p] }}
              />
              <Caption>{PHASE_LABEL[p]}</Caption>
            </Row>
          ))}
          <Row gap="xs" align="center">
            <View
              className="h-2.5 w-2.5 rounded-full"
              style={{
                borderWidth: 1.5,
                borderColor: c.cycle.menstrual,
                backgroundColor: 'transparent',
              }}
            />
            <Caption>Prévu</Caption>
          </Row>
        </Row>
      </View>

      <DayDetailModal
        dateKey={selected}
        info={selectedInfo}
        onClose={() => setSelected(null)}
        onEdit={() => {
          if (selected) router.push(`/journal?date=${selected}`);
          setSelected(null);
        }}
      />
    </ScreenContainer>
  );
}

type DayDetailModalProps = {
  dateKey: string | null;
  info: {
    phase: ReturnType<typeof resolvePhase>;
    entry: ReturnType<ReturnType<typeof useEntries>['getByDate']>;
  } | null;
  onClose: () => void;
  onEdit: () => void;
};

function DayDetailModal({
  dateKey,
  info,
  onClose,
  onEdit,
}: DayDetailModalProps): React.JSX.Element {
  const visible = dateKey !== null;
  const relative = dateKey ? relativeLabel(dateKey) : null;
  const c = useThemedColors();
  const scheme = useScheme();
  const moodLabel = info?.entry?.mood
    ? MOODS.find((m) => m.value === info.entry?.mood)?.label ?? info.entry.mood
    : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/40 justify-end"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-surface px-5 pt-3 pb-8"
          style={{
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            shadowColor: c.primary[600],
            shadowOpacity: scheme === 'dark' ? 0.5 : 0.18,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: -8 },
            elevation: 12,
          }}
        >
          <View
            className="self-center h-1.5 w-12 rounded-full mb-4"
            style={{ backgroundColor: c.blush }}
          />
          <ScrollView showsVerticalScrollIndicator={false}>
            {dateKey && (
              <>
                <Stack gap="xs" className="mb-4">
                  {relative && <Caption tone="primary">{relative}</Caption>}
                  <Heading level={3}>{formatHumanDate(dateKey)}</Heading>
                </Stack>

                {info?.phase ? (
                  <Card padding="sm" elevation="none" className="bg-surface-muted mb-4">
                    <Row justify="between" align="center">
                      <PhaseChip phase={info.phase.phase} />
                      <Caption tone="secondary">
                        Jour {info.phase.dayOfCycle} / {info.phase.cycleLength}
                      </Caption>
                    </Row>
                  </Card>
                ) : (
                  <Card padding="sm" elevation="none" className="bg-surface-muted mb-4">
                    <Caption tone="secondary">Pas de cycle enregistré pour cette date.</Caption>
                  </Card>
                )}

                {info?.entry ? (
                  <Stack gap="sm" className="mb-4">
                    {moodLabel && (
                      <Row gap="sm">
                        <Caption tone="secondary">Humeur</Caption>
                        <Body>{moodLabel}</Body>
                      </Row>
                    )}
                    {info.entry.symptoms.length > 0 && (
                      <View>
                        <Caption tone="secondary" className="mb-2">Symptômes</Caption>
                        <View className="flex-row flex-wrap gap-2">
                          {info.entry.symptoms.map((s) => {
                            const label =
                              SYMPTOM_TYPES.find((t) => t.value === s.type)?.label ?? s.type;
                            return (
                              <Chip
                                key={s.id}
                                label={`${label} · ${s.intensity}/5`}
                                variant="accent"
                              />
                            );
                          })}
                        </View>
                      </View>
                    )}
                    {(info.entry.sleep !== null ||
                      info.entry.hydration !== null ||
                      info.entry.libido !== null ||
                      info.entry.weight !== null) && (
                      <>
                        <Divider spacing="sm" />
                        <Row gap="lg" className="flex-wrap">
                          {info.entry.sleep !== null && (
                            <Stat label="Sommeil" value={`${info.entry.sleep} h`} />
                          )}
                          {info.entry.hydration !== null && (
                            <Stat label="Hydratation" value={`${info.entry.hydration} L`} />
                          )}
                          {info.entry.libido !== null && (
                            <Stat label="Libido" value={`${info.entry.libido}/5`} />
                          )}
                          {info.entry.weight !== null && (
                            <Stat label="Poids" value={`${info.entry.weight} kg`} />
                          )}
                        </Row>
                      </>
                    )}
                  </Stack>
                ) : (
                  <Body tone="secondary" className="mb-4">
                    Aucune saisie pour ce jour.
                  </Body>
                )}

                <Button label="Modifier l'entrée" onPress={onEdit} />
              </>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View>
      <Caption tone="secondary">{label}</Caption>
      <Body>{value}</Body>
    </View>
  );
}
