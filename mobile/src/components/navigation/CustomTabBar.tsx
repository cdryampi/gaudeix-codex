import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Text } from '@/components/atoms';

export const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white/95 border-t border-gray-100 pb-safe">
      <SafeAreaView edges={['bottom']}>
        <View className={`flex-row justify-around items-center pt-2 ${Platform.OS === 'android' ? 'pb-3' : 'pb-0'}`}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            
            // Get label
            const label = options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

            // Get icon (passed as emoji string in tabBarIcon options for now)
            const icon = options.tabBarIcon ? options.tabBarIcon({ focused: isFocused, color: '', size: 0 }) : '❓';

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarButtonTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                className="items-center justify-center flex-1"
              >
                <View className={`items-center justify-center p-2 rounded-xl transition-all ${isFocused ? 'bg-secondary/10' : ''}`}>
                  <Text className={`text-2xl mb-1 ${isFocused ? 'scale-110' : 'opacity-60'}`}>
                    {icon}
                  </Text>
                  <Text 
                    variant="label" 
                    color={isFocused ? 'secondary' : 'secondary'}
                    className={`text-[10px] ${isFocused ? 'font-bold' : 'font-medium opacity-60'}`}
                  >
                    {label as string}
                  </Text>
                </View>
                
                {/* Active Indicator Dot */}
                {isFocused && (
                  <View className="absolute -bottom-1 w-1 h-1 bg-secondary rounded-full" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
};
