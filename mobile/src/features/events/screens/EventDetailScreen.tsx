import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Text, Button, Badge } from '@/components/atoms';
import { useEventDetail, useEventCheckIn } from '@/features/events/api/detail';
import { RootStackParamList } from '@/navigation/types';

type EventDetailRouteProp = RouteProp<RootStackParamList, 'EventDetail'>;

export const EventDetailScreen = () => {
  const route = useRoute<EventDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { eventId } = route.params;

  const { data: event, isLoading } = useEventDetail(eventId);
  const checkInMutation = useEventCheckIn();
  const [isCheckedIn, setIsCheckedIn] = useState(false); // Local state for mock demo

  const handleCheckIn = () => {
    // In real app, verify location here
    checkInMutation.mutate(eventId, {
      onSuccess: () => {
        setIsCheckedIn(true);
        Alert.alert('¡Check-in realizado!', 'Has ganado +50 puntos.');
      },
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Mira este evento en Gaudeix: ${event?.title}!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading || !event) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Cargando evento...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="pb-24">
        {/* Hero Image (Placeholder) */}
        <View className="h-64 bg-gray-200 w-full relative">
          <View className="absolute inset-0 bg-black/20" />

          {/* Header Actions */}
          <SafeAreaView
            edges={['top']}
            className="absolute top-0 w-full px-4 flex-row justify-between"
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full items-center justify-center"
            >
              <Text className="text-white text-xl">←</Text>
            </TouchableOpacity>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleShare}
                className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full items-center justify-center"
              >
                <Text className="text-white text-xl">📤</Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full items-center justify-center">
                <Text className="text-white text-xl">❤️</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View className="px-6 -mt-6 bg-white rounded-t-3xl pt-8">
          {/* Category Badge */}
          <View className="flex-row mb-4">
            <Badge
              variant="status"
              status="info"
              value={event.category.name}
              className="bg-blue-50 text-blue-700"
            />
          </View>

          {/* Title */}
          <Text variant="heading" weight="bold" className="mb-2 text-3xl leading-tight">
            {event.title}
          </Text>

          {/* Info Rows */}
          <View className="mt-4 space-y-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mr-3">
                <Text>📅</Text>
              </View>
              <View>
                <Text variant="body" weight="bold">
                  {format(new Date(event.start_at), "EEEE, d 'de' MMMM", { locale: es })}
                </Text>
                <Text variant="caption" color="secondary">
                  {format(new Date(event.start_at), 'HH:mm')} -{' '}
                  {format(new Date(event.end_at), 'HH:mm')}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-3">
                <Text>📍</Text>
              </View>
              <View>
                <Text variant="body" weight="bold">
                  {event.location_text}
                </Text>
                <Text variant="caption" color="secondary">
                  {event.venue_name || 'Ubicación'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center mr-3">
                <Text>🎟️</Text>
              </View>
              <View>
                <Text variant="body" weight="bold">
                  {event.price_text || 'Entrada libre'}
                </Text>
                <Text variant="caption" color="secondary">
                  Precio
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="mt-8">
            <Text variant="title" weight="bold" className="mb-3">
              Sobre el evento
            </Text>
            <Text variant="body" color="secondary" className="leading-6">
              {event.description}
            </Text>
          </View>

          {/* Tags */}
          <View className="mt-6 flex-row flex-wrap gap-2">
            {event.tags.map(tag => (
              <View key={tag} className="bg-gray-100 px-3 py-1 rounded-full">
                <Text variant="caption" color="secondary">
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer Action */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg pb-safe">
        <Button
          variant={isCheckedIn ? 'outline' : 'primary'}
          size="lg"
          onPress={handleCheckIn}
          disabled={isCheckedIn}
          className="flex-row justify-center items-center"
        >
          <Text className="mr-2 text-xl">{isCheckedIn ? '✅' : '📍'}</Text>
          <Text color={isCheckedIn ? 'primary' : 'inverse'} weight="bold">
            {isCheckedIn ? 'Check-in realizado' : 'Hacer Check-in (+50 pts)'}
          </Text>
        </Button>
      </View>
    </View>
  );
};
