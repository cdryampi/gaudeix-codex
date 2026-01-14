import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Chip } from '@/components/atoms';
import { NotificationCard } from '@/features/notifications/components/NotificationCard';
import { useNotifications, NotificationType } from '@/features/notifications/api';

const FILTERS: { id: NotificationType | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'urgent', label: 'Urgentes' },
  { id: 'info', label: 'Informativos' },
  { id: 'success', label: 'Logros' },
  { id: 'event', label: 'Eventos' },
];

export const NotificationsScreen = () => {
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { data: notifications, refetch, isLoading } = useNotifications();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredNotifications = notifications?.filter(
    n => activeFilter === 'all' || n.type === activeFilter
  );

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4">
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <Text variant="title" weight="bold">Avisos Gaudeix</Text>
        </View>
        <TouchableOpacity>
          <Text className="text-xl">⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerClassName="pb-24"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E9124" />
        }
      >
        {/* Hero Section */}
        <View className="px-6 py-6">
          <Text variant="label" color="secondary" weight="bold" className="uppercase tracking-widest mb-1">
            CENTRO DE NOTIFICACIONES
          </Text>
          <Text variant="heading" weight="bold" className="mb-6">
            Tu actividad al día
          </Text>

          {/* Push Toggle Card */}
          <View className="bg-gray-50 p-4 rounded-xl flex-row items-center justify-between mb-6 border border-gray-100">
            <View className="flex-row items-center flex-1 mr-4">
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm mr-3">
                <Text className="text-lg">🔔</Text>
              </View>
              <Text variant="body" weight="medium" className="flex-1">
                Recibe notificaciones en tiempo real
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#767577', true: '#3E9124' }}
              thumbColor={'#f4f3f4'}
            />
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {FILTERS.map((filter) => (
              <View key={filter.id} className="mr-2">
                <Chip
                  label={filter.label}
                  selected={activeFilter === filter.id}
                  onPress={() => setActiveFilter(filter.id)}
                />
              </View>
            ))}
          </ScrollView>

          {/* List */}
          <View>
            {isLoading ? (
              <Text className="text-center py-8">Cargando avisos...</Text>
            ) : filteredNotifications?.length === 0 ? (
              <View className="items-center py-12">
                <Text className="text-4xl mb-4">📭</Text>
                <Text variant="body" color="secondary">No hay notificaciones</Text>
              </View>
            ) : (
              filteredNotifications?.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onPress={() => {}} // TODO: Navigate to detail or mark read
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
