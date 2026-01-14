import React, { useEffect } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@/components/atoms';
import { useAuthStore } from '@/stores/authStore';
import { onboardingStorage } from '@/lib/storage/onboardingStorage';
import { RootStackParamList } from '@/navigation/types';

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export const SplashScreen = ({ navigation }: SplashScreenProps) => {
  const { loadUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      // 1. Initialize Auth (check token validity)
      await loadUser();

      // 2. Check Onboarding status
      const onboardingCompleted = await onboardingStorage.isCompleted();

      // 3. Navigate based on state
      // We use replace to prevent going back to Splash
      setTimeout(() => {
        if (isAuthenticated) {
          navigation.replace('Main');
        } else if (onboardingCompleted) {
          navigation.replace('Login');
        } else {
          navigation.replace('Onboarding');
        }
      }, 2000); // 2 seconds delay for branding visibility
    };

    initializeApp();
  }, [loadUser, isAuthenticated, navigation]);

  return (
    <View className="flex-1 bg-primary items-center justify-center">
      {/* Logo placeholder - replace with actual image asset when available */}
      <View className="w-32 h-32 bg-white rounded-full items-center justify-center mb-6 shadow-lg">
        <Text variant="heading" className="text-primary text-4xl">G</Text>
      </View>
      
      <Text variant="heading" color="inverse" className="mb-2 text-center">
        Gaudeix
      </Text>
      <Text variant="title" color="inverse" className="mb-12 text-center opacity-80">
        Codex
      </Text>

      <ActivityIndicator size="large" color="white" />
    </View>
  );
};
