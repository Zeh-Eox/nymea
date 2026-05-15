import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Body,
  Button,
  Card,
  Caption,
  ScreenContainer,
  ScreenHeader,
  TextField,
} from '@/components/index';
import { authService } from '@/services/auth.service';
import { toast } from '@/store/toast.store';

export default function ChangePasswordScreen(): React.JSX.Element {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit faire au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Mot de passe mis à jour');
      router.back();
    } catch (err) {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      if (e.response?.status === 400) {
        setError(e.response?.data?.message ?? 'Mot de passe actuel incorrect');
      } else {
        toast.error('Impossible de mettre à jour le mot de passe');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Mot de passe" showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card className="mb-4">
          <TextField
            label="Mot de passe actuel"
            placeholder="••••••••"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <TextField
            label="Nouveau mot de passe"
            placeholder="Minimum 8 caractères"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextField
            label="Confirmer le nouveau"
            placeholder="••••••••"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />
          {error && (
            <Body tone="error" className="text-sm mt-1">
              {error}
            </Body>
          )}
          <Caption tone="secondary" className="mt-2">
            Tous tes appareils seront déconnectés après le changement.
          </Caption>
        </Card>

        <View>
          <Button label="Mettre à jour" onPress={onSubmit} loading={saving} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
