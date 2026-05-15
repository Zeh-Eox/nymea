import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  get: async (key: string): Promise<string | null> => AsyncStorage.getItem(key),
  set: async (key: string, value: string): Promise<void> => AsyncStorage.setItem(key, value),
  remove: async (key: string): Promise<void> => AsyncStorage.removeItem(key),
  clear: async (): Promise<void> => AsyncStorage.clear(),
};
