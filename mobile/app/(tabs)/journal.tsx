import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  Body,
  Button,
  Card,
  Caption,
  Chip,
  Heading,
  Row,
  ScreenContainer,
  Stack,
  Stepper,
  TextField,
  Typography,
} from '@/components/index';
import { useEntries } from '@/hooks/use-entries';
import { toast } from '@/store/toast.store';
import { MOODS, SYMPTOM_TYPES, type SymptomType } from '@/constants/journal';
import {
  formatHumanDate,
  relativeLabel,
  shiftDays,
  todayKey,
} from '@/utils/date';

type SelectedSymptoms = Partial<Record<SymptomType, number>>;

export default function JournalScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ date?: string }>();
  const [dateKey, setDateKey] = useState<string>(params.date ?? todayKey());

  const { getByDate, save, refresh } = useEntries({}, true);
  const existing = getByDate(dateKey);

  const [mood, setMood] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<SelectedSymptoms>({});
  const [sleep, setSleep] = useState<number>(7.5);
  const [hydration, setHydration] = useState<number>(1.5);
  const [libido, setLibido] = useState<number>(3);
  const [weight, setWeight] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMood(existing?.mood ?? null);
    setSleep(existing?.sleep ?? 7.5);
    setHydration(existing?.hydration ?? 1.5);
    setLibido(existing?.libido ?? 3);
    setWeight(existing?.weight ? String(existing.weight) : '');
    const next: SelectedSymptoms = {};
    existing?.symptoms.forEach((s) => {
      next[s.type as SymptomType] = s.intensity;
    });
    setSymptoms(next);
  }, [existing?.id, dateKey]);

  const toggleSymptom = (type: SymptomType) => {
    setSymptoms((prev) => {
      const next = { ...prev };
      if (next[type] !== undefined) delete next[type];
      else next[type] = 3;
      return next;
    });
  };

  const setSymptomIntensity = (type: SymptomType, value: number) => {
    setSymptoms((prev) => ({ ...prev, [type]: value }));
  };

  const selectedSymptoms = useMemo(
    () =>
      (Object.entries(symptoms) as [SymptomType, number][]).map(
        ([type, intensity]) => ({ type, intensity }),
      ),
    [symptoms],
  );

  const parsedWeight = (() => {
    const n = parseFloat(weight.replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? n : null;
  })();

  const onSave = async () => {
    setSaving(true);
    try {
      await save({
        date: dateKey,
        mood,
        sleep,
        hydration,
        libido,
        weight: parsedWeight,
        symptoms: selectedSymptoms,
      });
      await refresh();
      toast.success('Journal enregistré');
    } catch {
      toast.error("Impossible d'enregistrer");
    } finally {
      setSaving(false);
    }
  };

  const relative = relativeLabel(dateKey);

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Row justify="between" align="center" className="mb-4 mt-2">
          <Heading level={1}>Journal</Heading>
        </Row>

        <Card elevation="sm" className="mb-4">
          <Row justify="between" align="center">
            <Pressable
              onPress={() => setDateKey((d) => shiftDays(d, -1))}
              className="h-10 w-10 items-center justify-center rounded-full bg-blush active:opacity-80"
            >
              <Text className="text-2xl text-primary-600">‹</Text>
            </Pressable>
            <Pressable
              onPress={() => setDateKey(todayKey())}
              className="flex-1 items-center"
            >
              {relative && <Caption tone="primary">{relative}</Caption>}
              <Typography variant="label">{formatHumanDate(dateKey)}</Typography>
            </Pressable>
            <Pressable
              onPress={() => setDateKey((d) => shiftDays(d, 1))}
              disabled={dateKey >= todayKey()}
              className={`h-10 w-10 items-center justify-center rounded-full ${
                dateKey >= todayKey()
                  ? 'bg-surface-muted'
                  : 'bg-blush active:opacity-80'
              }`}
            >
              <Text
                className={`text-2xl ${
                  dateKey >= todayKey() ? 'text-text-muted' : 'text-primary-600'
                }`}
              >
                ›
              </Text>
            </Pressable>
          </Row>
        </Card>

        <Section title="Humeur">
          <View className="flex-row flex-wrap gap-2">
            {MOODS.map((m) => (
              <Chip
                key={m.value}
                label={m.label}
                variant="primary"
                selected={mood === m.value}
                onPress={() => setMood(mood === m.value ? null : m.value)}
              />
            ))}
          </View>
        </Section>

        <Section title="Symptômes">
          <View className="flex-row flex-wrap gap-2">
            {SYMPTOM_TYPES.map((s) => (
              <Chip
                key={s.value}
                label={s.label}
                variant="accent"
                selected={symptoms[s.value] !== undefined}
                onPress={() => toggleSymptom(s.value)}
              />
            ))}
          </View>
          {selectedSymptoms.length > 0 && (
            <Stack gap="sm" className="mt-4">
              <Caption tone="secondary">Intensité (1 = léger · 5 = fort)</Caption>
              {selectedSymptoms.map(({ type, intensity }) => {
                const label =
                  SYMPTOM_TYPES.find((s) => s.value === type)?.label ?? type;
                return (
                  <Row
                    key={type}
                    justify="between"
                    align="center"
                    className="rounded-2xl bg-surface-muted px-4 py-3"
                  >
                    <Body className="flex-1">{label}</Body>
                    <View className="flex-row gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Pressable
                          key={n}
                          onPress={() => setSymptomIntensity(type, n)}
                          className={`h-8 w-8 items-center justify-center rounded-full ${
                            intensity >= n ? 'bg-primary-500' : 'bg-border'
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              intensity >= n ? 'text-white' : 'text-text-muted'
                            }`}
                          >
                            {n}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </Row>
                );
              })}
            </Stack>
          )}
        </Section>

        <Section title="Sommeil">
          <Stepper
            value={sleep}
            onChange={setSleep}
            min={0}
            max={12}
            step={0.5}
            suffix="heures"
          />
        </Section>

        <Section title="Hydratation">
          <Stepper
            value={hydration}
            onChange={setHydration}
            min={0}
            max={3}
            step={0.25}
            suffix="litres"
          />
        </Section>

        <Section title="Libido">
          <Stepper
            value={libido}
            onChange={setLibido}
            min={1}
            max={5}
            suffix={libido === 1 ? 'très basse' : libido === 5 ? 'très haute' : '—'}
          />
        </Section>

        <Section title="Poids">
          <TextField
            value={weight}
            onChangeText={setWeight}
            placeholder="Ex. 62.5"
            keyboardType="decimal-pad"
            helper="En kilogrammes (optionnel)"
          />
        </Section>

        <View className="mt-2">
          <Button label="Enregistrer" onPress={onSave} loading={saving} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <View className="mb-6">
      <Typography variant="label" tone="secondary" className="mb-3">
        {title}
      </Typography>
      {children}
    </View>
  );
}
