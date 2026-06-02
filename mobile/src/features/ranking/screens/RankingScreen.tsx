import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar } from '@/components/atoms';
import { Podium } from '@/features/ranking/components/Podium';
import { useRanking } from '@/features/ranking/api';

export const RankingScreen = () => {
  const [filter, setFilter] = useState<'global' | 'monthly'>('global');
  const [refreshing, setRefreshing] = useState(false);
  const { data, refetch, isLoading } = useRanking(filter);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const topThree = data?.results.slice(0, 3) || [];
  const restOfList = data?.results.slice(3) || [];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100">
        <Text variant="title" weight="bold">
          Ranking
        </Text>

        {/* Toggle */}
        <View className="flex-row bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            onPress={() => setFilter('global')}
            className={`px-3 py-1 rounded-md ${filter === 'global' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text
              weight="bold"
              color={filter === 'global' ? 'primary' : 'tertiary'}
              className="text-xs"
            >
              Global
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('monthly')}
            className={`px-3 py-1 rounded-md ${filter === 'monthly' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text
              weight="bold"
              color={filter === 'monthly' ? 'primary' : 'tertiary'}
              className="text-xs"
            >
              Mensual
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerClassName="pb-32"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E9124" />
        }
      >
        <View className="px-6 py-6">
          <Text
            variant="label"
            color="secondary"
            weight="bold"
            className="uppercase tracking-widest text-center mb-8"
          >
            LÍDERES DE LA COMUNIDAD
          </Text>

          {/* Podium */}
          {!isLoading && <Podium topThree={topThree} />}

          {/* List */}
          <View className="mt-4 space-y-3">
            {isLoading ? (
              <Text className="text-center py-8">Cargando ranking...</Text>
            ) : (
              restOfList.map(user => (
                <View
                  key={user.id}
                  className="flex-row items-center bg-gray-50 p-4 rounded-xl border border-gray-100"
                >
                  <Text weight="bold" color="secondary" className="w-8 text-lg">
                    {user.rank}
                  </Text>
                  <Avatar initials={user.avatar} size="sm" className="mr-3 bg-white" />
                  <View className="flex-1">
                    <Text weight="bold">{user.name}</Text>
                    <Text variant="caption" color="secondary">
                      {user.events_completed} eventos
                    </Text>
                  </View>
                  <Text weight="bold" color="primary">
                    {user.points} pts
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky User Rank */}
      {data?.user_rank && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8 shadow-lg">
          <View className="flex-row items-center bg-primary/10 p-4 rounded-xl border border-primary/20">
            <Text weight="bold" color="primary" className="w-8 text-lg">
              #{data.user_rank.rank}
            </Text>
            <Avatar initials="YO" size="sm" className="mr-3 bg-primary" />
            <View className="flex-1">
              <Text weight="bold" color="primary">
                Tú
              </Text>
              <Text variant="caption" color="secondary">
                ¡A 50 pts del siguiente nivel!
              </Text>
            </View>
            <Text weight="bold" color="primary" className="text-lg">
              {data.user_rank.points} pts
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};
