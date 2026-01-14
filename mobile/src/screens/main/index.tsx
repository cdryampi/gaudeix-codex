import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/atoms';
import { SafeAreaView } from 'react-native-safe-area-context';

// Reusable placeholder component for tabs
export const PlaceholderScreen = ({ title, icon }: { title: string; icon: string }) => (
  <SafeAreaView className="flex-1 bg-white items-center justify-center p-4">
    <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
      <Text className="text-6xl">{icon}</Text>
    </View>
    <Text variant="heading" className="mb-2 text-center">{title}</Text>
    <Text variant="body" color="secondary" className="text-center">
      Esta funcionalidad estará disponible pronto.
    </Text>
  </SafeAreaView>
);

export const HomeScreen = () => <PlaceholderScreen title="Inicio" icon="🏠" />;
export const EventsScreen = () => <PlaceholderScreen title="Eventos" icon="📅" />;
export const NotificationsScreen = () => <PlaceholderScreen title="Avisos" icon="🔔" />;
export const PointsScreen = () => <PlaceholderScreen title="Puntos" icon="🏆" />;
export const ProfileScreen = () => <PlaceholderScreen title="Perfil" icon="👤" />;
