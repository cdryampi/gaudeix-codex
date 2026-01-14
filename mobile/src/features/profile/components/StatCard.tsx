import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/atoms';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: string;
  theme: 'primary' | 'secondary' | 'info' | 'warning';
}

const getThemeColors = (theme: StatCardProps['theme']) => {
  switch (theme) {
    case 'primary': return 'bg-green-50 border-green-100 text-green-600';
    case 'secondary': return 'bg-orange-50 border-orange-100 text-orange-600';
    case 'info': return 'bg-blue-50 border-blue-100 text-blue-600';
    case 'warning': return 'bg-yellow-50 border-yellow-100 text-yellow-600';
    default: return 'bg-gray-50 border-gray-100 text-gray-600';
  }
};

export const StatCard = ({ label, value, subValue, icon, theme }: StatCardProps) => {
  const colors = getThemeColors(theme);
  
  return (
    <View className={`flex-1 p-4 rounded-2xl border ${colors.split(' ')[0]} ${colors.split(' ')[1]}`}>
      <View className="flex-row justify-between items-start mb-2">
        <Text variant="label" weight="bold" className="uppercase opacity-60">
          {label}
        </Text>
        <Text className="text-xl">{icon}</Text>
      </View>
      <Text variant="heading" weight="bold" className="mb-1">
        {value}
      </Text>
      {subValue && (
        <Text variant="caption" weight="medium" className="opacity-80">
          {subValue}
        </Text>
      )}
    </View>
  );
};
