import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Body,
  Button,
  Caption,
  Card,
  Heading,
  ScreenContainer,
  ScreenHeader,
  Stack,
  TextField,
} from '@/components/index';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/toast.store';
import { useScheme, useThemedColors } from '@/hooks/use-theme';

const CONFIRM_PHRASE = 'SUPPRIMER';

export default function DeleteAccountScreen(): React.JSX.Element {
  const { clearTokens } = useAuthStore();
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const c = useThemedColors();
  const isDark = useScheme() === 'dark';

  const canDelete = confirmation.trim() === CONFIRM_PHRASE;

  const onDelete = async () => {
    setDeleting(true);
    try {
      await authService.deleteMe();
      toast.success('Compte supprimé');
      await clearTokens();
    } catch {
      toast.error('Impossible de supprimer le compte');
      setDeleting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Suppression du compte" showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card className="mb-4">
          <Stack gap="md">
            <View
              className="h-14 w-14 rounded-full items-center justify-center self-start"
              style={{ backgroundColor: isDark ? '#3a1a22' : '#fff1f2' }}
            >
              <Ionicons name="alert" size={26} color={isDark ? '#fb7185' : '#e11d48'} />
            </View>
            <Heading level={3}>C'est définitif</Heading>
            <Body tone="secondary">
              Toutes tes données seront supprimées : profil, cycles, journal, symptômes,
              prédictions et préférences. Cette action est irréversible.
            </Body>
            <Caption tone="secondary">
              Pour confirmer, écris{' '}
              <Body weight="bold" style={{ color: c.text.primary }}>
                {CONFIRM_PHRASE}
              </Body>{' '}
              ci-dessous.
            </Caption>
            <TextField
              value={confirmation}
              onChangeText={setConfirmation}
              placeholder={CONFIRM_PHRASE}
              autoCapitalize="characters"
            />
          </Stack>
        </Card>

        <View>
          <Button
            label="Supprimer définitivement"
            variant="danger"
            onPress={onDelete}
            loading={deleting}
            disabled={!canDelete}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
