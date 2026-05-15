import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { api } from './api';

export type PushSettings = {
  remindPeriod: boolean;
  remindOvulation: boolean;
  remindJournal: boolean;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function platformLabel(): 'ios' | 'android' | 'web' {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
}

export const pushService = {
  async registerForPush(): Promise<string | null> {
    if (!Device.isDevice) return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notifications Nymea',
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: '#db2777',
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let granted = existing.granted;
    if (!granted && existing.canAskAgain) {
      const req = await Notifications.requestPermissionsAsync();
      granted = req.granted;
    }
    if (!granted) return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenResponse.data;

    try {
      await api.post('/push/register', { token, platform: platformLabel() });
    } catch {
      return null;
    }
    return token;
  },

  async getSettings(): Promise<PushSettings> {
    const { data } = await api.get<PushSettings>('/push/settings');
    return data;
  },

  async updateSettings(input: Partial<PushSettings>): Promise<PushSettings> {
    const { data } = await api.put<PushSettings>('/push/settings', input);
    return data;
  },

  async unregister(token: string): Promise<void> {
    await api.post('/push/unregister', { token });
  },
};
