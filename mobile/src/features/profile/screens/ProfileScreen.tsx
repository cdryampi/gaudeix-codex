import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Text, Avatar, Button, Icon } from '@/components/atoms';
import { EventCard } from '@/components/molecules';
import { StatCard } from '@/features/profile/components/StatCard';
import { useUserProfile } from '@/features/profile/api';
import { useAuthStore } from '@/stores/authStore';
import { RootStackParamList } from '@/navigation/types';

export const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated } = useAuthStore();
  const { data: profile, isLoading } = useUserProfile();

  // Guest View
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
          <Text className="text-4xl">👤</Text>
        </View>
        <Text variant="heading" className="text-center mb-2">
          Únete a la comunidad
        </Text>
        <Text variant="body" color="secondary" className="text-center mb-8">
          Inicia sesión para guardar tus favoritos, acumular puntos y participar en el ranking.
        </Text>

        <Button
          variant="primary"
          className="w-full mb-4"
          onPress={() => navigation.navigate('Login')}
        >
          <Text color="inverse" weight="bold">
            Iniciar Sesión
          </Text>
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onPress={() => navigation.navigate('Register')}
        >
          <Text weight="bold">Crear Cuenta</Text>
        </Button>
      </SafeAreaView>
    );
  }

  if (isLoading || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between">
        <TouchableOpacity>
          <Icon icon="⚙️" size="md" />
        </TouchableOpacity>
        <Text variant="title" weight="bold">
          Mi Perfil
        </Text>
        <TouchableOpacity>
          <Icon icon="🔔" size="md" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerClassName="pb-24 px-6">
        {/* Identity */}
        <View className="items-center mb-8">
          <View className="relative mb-4">
            <Avatar
              initials={profile.user.name.substring(0, 2).toUpperCase()}
              size="xl"
              className="bg-primary/10"
            />
            <View className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
              <Icon icon="✅" size="sm" />
            </View>
          </View>

          <Text variant="heading" weight="bold" className="mb-1 text-2xl">
            {profile.user.name}
          </Text>

          <View className="flex-row items-center bg-green-50 px-3 py-1 rounded-full mb-2">
            <Text className="text-xs mr-1">🌱</Text>
            <Text variant="caption" className="text-green-700 font-bold uppercase tracking-wide">
              {profile.stats.level} Nivel {profile.stats.level_number}
            </Text>
          </View>

          <Text variant="caption" color="secondary">
            Miembro desde{' '}
            {format(new Date(profile.stats.member_since), 'MMMM yyyy', { locale: es })}
          </Text>
        </View>

        {/* Actions */}
        <View className="flex-row gap-3 mb-8">
          <Button variant="outline" className="flex-1" onPress={() => {}}>
            <Text weight="bold">Editar Perfil</Text>
          </Button>
          <Button variant="primary" className="flex-1" onPress={() => {}}>
            <Text color="inverse" weight="bold">
              Compartir
            </Text>
          </Button>
        </View>

        {/* Stats */}
        <View className="flex-row gap-4 mb-8">
          <StatCard
            label="Total Puntos"
            value={profile.stats.total_points.toLocaleString()}
            subValue={`+${profile.stats.points_this_month} este mes`}
            icon="⭐"
            theme="warning"
          />
          <StatCard
            label="Ranking"
            value={`#${profile.stats.ranking_position}`}
            subValue={`Top ${profile.stats.ranking_percentile}%`}
            icon="📊"
            theme="info"
          />
        </View>

        {/* Favorites */}
        <View>
          <View className="flex-row items-center justify-between mb-4">
            <Text variant="title" weight="bold">
              Favoritos
            </Text>
            <TouchableOpacity>
              <Text variant="body" color="secondary">
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
            {profile.favorites.map(event => (
              <View key={event.id} className="w-64 mr-4">
                <EventCard
                  title={event.title}
                  time={format(new Date(event.start_at), 'd MMM')}
                  location={event.location_text}
                  points={50}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
