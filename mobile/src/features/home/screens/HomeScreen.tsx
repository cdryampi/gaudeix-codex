import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Text, Avatar, Icon } from '@/components/atoms';
import { EventCard } from '@/components/molecules';
import { useAuthStore } from '@/stores/authStore';
import { useFeaturedEvents, useUpcomingEvents } from '@/features/events/api';
import { GamificationBanner } from '@/features/home/components/GamificationBanner';
import { DrawerParamList, RootStackParamList } from '@/navigation/types';

type HomeScreenNavigationProp = DrawerNavigationProp<DrawerParamList> &
  NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // Queries
  const {
    data: featuredEvents,
    refetch: refetchFeatured,
    isLoading: loadingFeatured,
  } = useFeaturedEvents();
  const {
    data: upcomingEvents,
    refetch: refetchUpcoming,
    isLoading: loadingUpcoming,
  } = useUpcomingEvents();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchFeatured(), refetchUpcoming()]);
    setRefreshing(false);
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const CATEGORIES = [
    { id: 1, name: 'Cultura', icon: '🎭', color: 'bg-purple-100 text-purple-600' },
    { id: 2, name: 'Deporte', icon: '⚽', color: 'bg-green-100 text-green-600' },
    { id: 3, name: 'Gastronomía', icon: '🍷', color: 'bg-orange-100 text-orange-600' },
    { id: 4, name: 'Naturaleza', icon: '🌲', color: 'bg-emerald-100 text-emerald-600' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between bg-white/80 backdrop-blur-md z-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Avatar
              initials={user?.username?.substring(0, 2).toUpperCase() || 'GU'}
              size="sm"
              className="mr-3 bg-gray-200"
            />
          </TouchableOpacity>
          <View>
            <Text
              variant="caption"
              color="secondary"
              className="uppercase tracking-widest text-[10px]"
            >
              Bienvenido a
            </Text>
            <Text variant="title" color="primary" weight="bold" className="leading-6">
              Gaudeix
            </Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-3">
          <View className="flex-row items-center bg-blue-50 px-2 py-1 rounded-full">
            <Text className="text-sm mr-1">☀️</Text>
            <Text variant="caption" color="primary" weight="bold">
              24°
            </Text>
          </View>
          <TouchableOpacity className="relative">
            <Icon icon="🔔" size="md" />
            <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E9124" />
        }
        contentContainerClassName="pb-24"
      >
        <View className="mt-6" />

        {/* Gamification Banner */}
        <GamificationBanner />

        {/* Categories Grid */}
        <View className="px-6 mb-8">
          <Text variant="title" weight="bold" className="mb-4">
            Explorar
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                className="w-[48%] bg-white p-4 rounded-xl mb-4 shadow-sm items-center justify-center border border-gray-100"
              >
                <View
                  className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${cat.color.split(' ')[0]}`}
                >
                  <Text className="text-2xl">{cat.icon}</Text>
                </View>
                <Text variant="body" weight="medium">
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Events */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between px-6 mb-4">
            <Text variant="title" weight="bold">
              Destacados
            </Text>
            <TouchableOpacity>
              <Text variant="body" color="secondary" weight="medium">
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-6 gap-4"
          >
            {loadingFeatured ? (
              // Skeleton loading would go here
              <Text>Cargando...</Text>
            ) : (
              featuredEvents?.map(event => (
                <TouchableOpacity
                  key={event.id}
                  className="w-72"
                  onPress={() => handleEventPress(event.id)}
                >
                  <EventCard
                    title={event.title}
                    time={new Date(event.start_at).toLocaleDateString()}
                    location={event.location_text}
                    points={50}
                  />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Upcoming Events */}
        <View className="px-6">
          <Text variant="title" weight="bold" className="mb-4">
            Próximamente
          </Text>
          {loadingUpcoming ? (
            <Text>Cargando...</Text>
          ) : (
            upcomingEvents?.map(event => (
              <TouchableOpacity
                key={event.id}
                className="flex-row bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100"
                onPress={() => handleEventPress(event.id)}
              >
                <View className="w-16 h-16 bg-gray-100 rounded-lg items-center justify-center mr-4">
                  <Text className="text-2xl">{event.category.icon}</Text>
                </View>
                <View className="flex-1 justify-center">
                  <Text variant="body" weight="bold" numberOfLines={1} className="mb-1">
                    {event.title}
                  </Text>
                  <Text variant="caption" color="secondary" className="mb-1">
                    📅 {new Date(event.start_at).toLocaleDateString()}
                  </Text>
                  <Text variant="caption" color="secondary" numberOfLines={1}>
                    📍 {event.location_text}
                  </Text>
                </View>
                <View className="justify-center">
                  <Icon icon="›" size="sm" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
