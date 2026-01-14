import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';

export const onboardingStorage = {
  async setCompleted(value: boolean = true): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  },

  async isCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return value !== null ? JSON.parse(value) : false;
    } catch (error) {
      console.error('Error reading onboarding state:', error);
      return false;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    } catch (error) {
      console.error('Error clearing onboarding state:', error);
    }
  }
};
