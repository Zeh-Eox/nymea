import React, { useEffect, useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Body,
  Caption,
  Card,
  Row,
  ScreenContainer,
  ScreenHeader,
  Spinner,
  Stack,
  Typography,
} from '@/components/index';
import { pushService, type PushSettings } from '@/services/push.service';
import { toast } from '@/store/toast.store';
import { useThemedColors } from '@/hooks/use-theme';
import { useThemeStore, type ThemeMode } from '@/store/theme.store';

const NOTIF_ITEMS: { key: keyof PushSettings; label: string; help: string }[] = [
  { key: 'remindPeriod', label: 'Rappel règles', help: '2 jours avant et le jour J.' },
  { key: 'remindOvulation', label: 'Ovulation', help: 'Le jour de l’ovulation estimée.' },
  { key: 'remindJournal', label: 'Journal du soir', help: 'Rappel à 21h pour saisir ta journée.' },
];

const THEME_OPTIONS: {
  value: ThemeMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: 'light', label: 'Clair', icon: 'sunny-outline' },
  { value: 'dark', label: 'Sombre', icon: 'moon-outline' },
  { value: 'system', label: 'Système', icon: 'phone-portrait-outline' },
];

export default function SettingsScreen(): React.JSX.Element {
  const router = useRouter();
  const c = useThemedColors();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);

  const [settings, setSettings] = useState<PushSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState<keyof PushSettings | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await pushService.getSettings();
        if (active) setSettings(data);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const toggle = async (key: keyof PushSettings, value: boolean) => {
    if (!settings) return;
    const optimistic = { ...settings, [key]: value };
    setSettings(optimistic);
    setSaving(key);
    try {
      const updated = await pushService.updateSettings({ [key]: value });
      setSettings(updated);
      if (value && key !== 'remindJournal') {
        void pushService.registerForPush();
      }
    } catch {
      setSettings(settings);
      toast.error('Impossible de mettre à jour la préférence');
    } finally {
      setSaving(null);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Paramètres" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Typography variant="label" tone="secondary" className="mb-2 px-1">
          Compte
        </Typography>
        <Card padding="none" className="mb-4 overflow-hidden">
          <SettingsRow
            icon="person-outline"
            label="Modifier le profil"
            onPress={() => router.push('/profile/settings/edit')}
          />
          <SettingsRow
            icon="lock-closed-outline"
            label="Changer le mot de passe"
            onPress={() => router.push('/profile/settings/password')}
            isLast
          />
        </Card>

        <Typography variant="label" tone="secondary" className="mb-2 px-1">
          Apparence
        </Typography>
        <Card className="mb-4">
          <Row gap="sm">
            {THEME_OPTIONS.map((opt) => {
              const active = themeMode === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => void setThemeMode(opt.value)}
                  className="flex-1 items-center rounded-2xl py-3 active:opacity-80"
                  style={{
                    backgroundColor: active ? c.primary[500] : c.surfaceMuted,
                  }}
                >
                  <Ionicons
                    name={opt.icon}
                    size={20}
                    color={active ? '#ffffff' : c.text.secondary}
                  />
                  <Typography
                    variant="caption"
                    className="mt-1"
                    style={{
                      color: active ? '#ffffff' : c.text.secondary,
                      fontWeight: '600',
                    }}
                  >
                    {opt.label}
                  </Typography>
                </Pressable>
              );
            })}
          </Row>
          <Caption tone="secondary" className="mt-3">
            {themeMode === 'system'
              ? "Suit l'apparence de ton téléphone."
              : themeMode === 'dark'
                ? 'Une ambiance plus douce le soir.'
                : 'Le thème clair par défaut.'}
          </Caption>
        </Card>

        <Typography variant="label" tone="secondary" className="mb-2 px-1">
          Notifications
        </Typography>
        <Card className="mb-4">
          {isLoading ? (
            <View className="py-4 items-center">
              <Spinner />
            </View>
          ) : settings ? (
            <Stack gap="md">
              {NOTIF_ITEMS.map((item, idx) => (
                <Row
                  key={item.key}
                  justify="between"
                  align="center"
                  className={idx > 0 ? 'border-t border-border pt-3' : ''}
                >
                  <View className="flex-1 pr-3">
                    <Body>{item.label}</Body>
                    <Caption>{item.help}</Caption>
                  </View>
                  <Switch
                    value={settings[item.key]}
                    onValueChange={(v) => void toggle(item.key, v)}
                    disabled={saving === item.key}
                    trackColor={{ false: c.neutralStrong, true: c.primary[300] }}
                    thumbColor={settings[item.key] ? c.primary[600] : c.surface}
                  />
                </Row>
              ))}
            </Stack>
          ) : (
            <Caption tone="secondary">Préférences indisponibles.</Caption>
          )}
        </Card>

        <Typography variant="label" tone="secondary" className="mb-2 px-1">
          Zone sensible
        </Typography>
        <Card padding="none" className="overflow-hidden">
          <SettingsRow
            icon="trash-outline"
            label="Supprimer mon compte"
            danger
            onPress={() => router.push('/profile/settings/delete')}
            isLast
          />
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function SettingsRow({
  icon,
  label,
  onPress,
  danger = false,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
  isLast?: boolean;
}): React.JSX.Element {
  const c = useThemedColors();
  const tint = danger ? '#e11d48' : c.primary[600];
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 py-4 active:bg-blush ${isLast ? '' : 'border-b border-border'}`}
    >
      <View
        className="h-10 w-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: danger ? c.blush : c.blush }}
      >
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Body className="flex-1" style={{ color: tint }}>
        {label}
      </Body>
      <Ionicons name="chevron-forward" size={20} color={c.text.muted} />
    </Pressable>
  );
}
