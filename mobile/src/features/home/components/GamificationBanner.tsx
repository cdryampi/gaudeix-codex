import React from 'react';
import { View } from 'react-native';
import { Text, Button } from '@/components/atoms';
import { useAuthStore } from '@/stores/authStore';

export const GamificationBanner = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <View className="mx-6 mb-8 rounded-2xl bg-secondary overflow-hidden shadow-lg shadow-secondary/30">
        <View className="p-6">
          <Text variant="heading" color="inverse" className="text-2xl mb-2">
            ¡Gana premios!
          </Text>
          <Text variant="body" color="inverse" className="mb-4 opacity-90">
            Regístrate para acumular puntos visitando lugares y asistiendo a eventos.
          </Text>
          <Button
            variant="ghost"
            className="bg-white/20 self-start"
            onPress={() => {}} // TODO: Navigate to register
          >
            <Text color="inverse" weight="bold">
              Crear cuenta
            </Text>
          </Button>
        </View>

        {/* Decorative circle */}
        <View className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10" />
      </View>
    );
  }

  return (
    <View className="mx-6 mb-8 rounded-2xl bg-secondary overflow-hidden shadow-lg shadow-secondary/30">
      <View className="p-6 flex-row items-center justify-between">
        <View>
          <Text
            variant="label"
            color="inverse"
            className="opacity-80 uppercase tracking-widest mb-1"
          >
            Tus Puntos
          </Text>
          <Text className="text-4xl font-bold text-white mb-1">
            {/* Mock points - will connect to API later */}
            1.450
            <Text className="text-2xl text-white/80"> pts</Text>
          </Text>
          <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1 self-start">
            <Text className="text-sm mr-1">🏆</Text>
            <Text color="inverse" weight="bold" className="text-xs">
              Nivel Explorador
            </Text>
          </View>
        </View>

        <View className="items-end">
          <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-2 border-2 border-white/30">
            <Text className="text-2xl font-bold text-white">#12</Text>
          </View>
          <Text variant="label" color="inverse" className="text-xs opacity-80">
            Ranking
          </Text>
        </View>
      </View>

      {/* Decorative elements */}
      <View className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5" />
      <View className="absolute left-1/2 -bottom-10 w-24 h-24 rounded-full bg-white/5" />
    </View>
  );
};
