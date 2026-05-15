import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Body,
  Button,
  Caption,
  Card,
  ScreenContainer,
  ScreenHeader,
  Stack,
  Stepper,
  TextField,
  Typography,
} from '@/components/index';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/toast.store';

export default function EditProfileScreen(): React.JSX.Element {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [name, setName] = useState(user?.name ?? '');
  const [cycleLength, setCycleLength] = useState(user?.defaultCycleLength ?? 28);
  const [periodLength, setPeriodLength] = useState(user?.defaultPeriodLength ?? 5);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      const updated = await authService.updateMe({
        name: name.trim() || null,
        defaultCycleLength: cycleLength,
        defaultPeriodLength: periodLength,
      });
      setUser(updated);
      toast.success('Profil mis à jour');
      router.back();
    } catch {
      toast.error('Impossible de mettre à jour le profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Profil" showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card className="mb-4">
          <TextField
            label="Prénom"
            placeholder="Ton prénom"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <Caption tone="secondary">
            L'email ({user?.email}) ne peut pas être modifié pour le moment.
          </Caption>
        </Card>

        <Card className="mb-4">
          <Typography variant="label" tone="secondary" className="mb-3">
            Longueur moyenne du cycle
          </Typography>
          <Stepper
            value={cycleLength}
            onChange={setCycleLength}
            min={15}
            max={60}
            suffix="jours"
          />
          <Caption tone="secondary" className="mt-2" align="center">
            Utilisée comme valeur de référence pour les prédictions.
          </Caption>
        </Card>

        <Card className="mb-6">
          <Typography variant="label" tone="secondary" className="mb-3">
            Durée des règles par défaut
          </Typography>
          <Stepper
            value={periodLength}
            onChange={setPeriodLength}
            min={1}
            max={15}
            suffix={periodLength === 1 ? 'jour' : 'jours'}
          />
        </Card>

        <View>
          <Button label="Enregistrer" onPress={onSave} loading={saving} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
