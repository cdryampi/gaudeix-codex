import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Text } from '@/components/atoms';
import { Notification, NotificationType } from '@/features/notifications/api';

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
}

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case 'urgent': return '⚠️';
    case 'info': return '📢';
    case 'success': return '🏆';
    case 'event': return '📅';
    default: return '🔔';
  }
};

const getColorsForType = (type: NotificationType) => {
  switch (type) {
    case 'urgent': return 'bg-orange-100 border-l-4 border-l-orange-500';
    case 'info': return 'bg-blue-50 border-l-4 border-l-blue-500';
    case 'success': return 'bg-green-50 border-l-4 border-l-green-500';
    case 'event': return 'bg-purple-50 border-l-4 border-l-purple-500';
    default: return 'bg-gray-50 border-l-4 border-l-gray-300';
  }
};

export const NotificationCard = ({ notification, onPress }: NotificationCardProps) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`flex-row p-4 mb-3 rounded-lg ${getColorsForType(notification.type)} ${!notification.is_read ? 'opacity-100' : 'opacity-80'}`}
    >
      <View className="mr-3 pt-1">
        <Text className="text-xl">{getIconForType(notification.type)}</Text>
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <Text variant="body" weight="bold" color="primary" className="flex-1 mr-2">
            {notification.title}
          </Text>
          {!notification.is_read && (
            <View className="w-2 h-2 bg-red-500 rounded-full mt-1" />
          )}
        </View>
        <Text variant="body" color="secondary" className="mb-2 leading-5">
          {notification.message}
        </Text>
        <Text variant="caption" color="tertiary">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
