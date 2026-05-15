import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Button,
  Card,
  Caption,
  Divider,
  Heading,
  ScreenContainer,
  ScreenHeader,
  Spinner,
  Stack,
  Stepper,
  Typography,
} from '@/components/index';
import { useCycles } from '@/hooks/use-cycles';
import { formatLongDate } from '@/utils/cycle';
import { toast } from '@/store/toast.store';

export default function CycleDetailScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { cycles, update, remove } = useCycles(false);
  const cycle = cycles.find((c) => c.id === id);

  const [periodLength, setPeriodLength] = useState<number>(cycle?.periodLength ?? 5);
  const [cycleLength, setCycleLength] = useState<number>(cycle?.cycleLength ?? 28);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!cycle) {
    return <Spinner fullScreen />;
  }

  const onSave = async () => {
    setSaving(true);
    try {
      await update(cycle.id, { periodLength, cycleLength });
      toast.success('Cycle mis à jour');
      router.back();
    } catch {
      toast.error("Impossible d'enregistrer le cycle");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    Alert.alert(
      'Supprimer ce cycle ?',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await remove(cycle.id);
              toast.success('Cycle supprimé');
              router.back();
            } catch {
              toast.error('Impossible de supprimer');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Détails du cycle" showBack />
      <Stack gap="lg">
        <Card>
          <Stack gap="sm">
            <Typography variant="label" tone="secondary">
              Date de début
            </Typography>
            <Heading level={3}>{formatLongDate(cycle.startDate)}</Heading>
            {cycle.endDate && (
              <>
                <Divider spacing="sm" />
                <Caption>Fin : {formatLongDate(cycle.endDate)}</Caption>
              </>
            )}
          </Stack>
        </Card>

        <View>
          <Typography variant="label" className="mb-3">
            Durée des règles
          </Typography>
          <Stepper
            value={periodLength}
            onChange={setPeriodLength}
            min={1}
            max={15}
            suffix={periodLength === 1 ? 'jour' : 'jours'}
          />
        </View>

        <View>
          <Typography variant="label" className="mb-3">
            Longueur du cycle
          </Typography>
          <Stepper
            value={cycleLength}
            onChange={setCycleLength}
            min={15}
            max={60}
            suffix="jours"
          />
          <Caption className="mt-2" align="center">
            Mis à jour automatiquement au prochain cycle.
          </Caption>
        </View>

        <Stack gap="sm" className="mt-4">
          <Button label="Enregistrer" onPress={onSave} loading={saving} />
          <Button
            label="Supprimer ce cycle"
            variant="ghost"
            onPress={onDelete}
            loading={deleting}
          />
        </Stack>
      </Stack>
    </ScreenContainer>
  );
}
