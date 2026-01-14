import React from 'react';
import { View } from 'react-native';
import { Text, Avatar } from '@/components/atoms';
import { RankedUser } from '@/features/ranking/api';

interface PodiumProps {
  topThree: RankedUser[];
}

export const Podium = ({ topThree }: PodiumProps) => {
  const [first, second, third] = topThree;

  const PodiumStep = ({ user, place }: { user: RankedUser; place: 1 | 2 | 3 }) => {
    if (!user) return null;

    const isFirst = place === 1;
    const height = isFirst ? 'h-32' : place === 2 ? 'h-24' : 'h-20';
    const bgColor = isFirst ? 'bg-yellow-100 border-yellow-200' : place === 2 ? 'bg-gray-100 border-gray-200' : 'bg-orange-50 border-orange-100';
    const avatarSize = isFirst ? 'xl' : 'lg';
    const icon = isFirst ? '👑' : place === 2 ? '🥈' : '🥉';

    return (
      <View className="items-center justify-end flex-1">
        <View className="items-center mb-2 relative">
          {isFirst && (
            <Text className="text-2xl absolute -top-8 z-10">{icon}</Text>
          )}
          <Avatar 
            initials={user.avatar} 
            size={avatarSize} 
            className={`border-4 ${isFirst ? 'border-yellow-400' : 'border-white'}`}
          />
          <View className="bg-primary px-2 py-0.5 rounded-full absolute -bottom-2 border-2 border-white">
            <Text color="inverse" weight="bold" className="text-[10px]">
              {user.points}
            </Text>
          </View>
        </View>
        
        <Text variant="body" weight="bold" className="mb-1 text-center" numberOfLines={1}>
          {user.name.split(' ')[0]}
        </Text>
        
        <View className={`w-full ${height} ${bgColor} rounded-t-lg border-x border-t items-center justify-center`}>
          <Text variant="heading" weight="bold" className={`text-4xl opacity-20`}>
            {place}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-row items-end justify-center px-4 mb-6 space-x-2">
      <PodiumStep user={second} place={2} />
      <PodiumStep user={first} place={1} />
      <PodiumStep user={third} place={3} />
    </View>
  );
};
