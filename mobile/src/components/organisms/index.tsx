/**
 * Organisms - Complex Components
 * 
 * High-level components composed of molecules and atoms.
 */

import { View, Pressable } from 'react-native';
import { Text } from '../atoms';

/**
 * Header Component - Top navigation header
 */
export interface HeaderProps {
  title: string;
  showBack?: boolean;
  showNotifications?: boolean;
  onBack?: () => void;
  onNotifications?: () => void;
}

export function Header({ title, showNotifications = true }: HeaderProps) {
  return (
    <View className="bg-background-light px-6 py-4 flex-row items-center justify-between border-b border-border-light">
      <View className="flex-row items-center">
        <View className="bg-primary/15 p-2 rounded-xl mr-3">
          <Text variant="title">📅</Text>
        </View>
        <Text variant="title" weight="bold">{title}</Text>
      </View>
      {showNotifications && (
        <Pressable className="w-10 h-10 items-center justify-center rounded-full bg-surface-light border border-border-light">
          <Text variant="body">🔔</Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * BottomNav Component - Bottom tab navigation
 */
export interface BottomNavProps {
  activeTab: 'home' | 'events' | 'notifications' | 'profile';
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Inicio' },
    { id: 'events', icon: '📅', label: 'Eventos' },
    { id: 'notifications', icon: '🔔', label: 'Avisos' },
    { id: 'profile', icon: '👤', label: 'Perfil' },
  ];

  return (
    <View className="flex-row bg-surface-light border-t border-border-light px-2 py-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <Pressable
            key={tab.id}
            className="flex-1 items-center py-2"
            onPress={() => onTabChange(tab.id)}
          >
            <Text variant="title">{tab.icon}</Text>
            <Text
              variant="label"
              weight="medium"
              color={isActive ? 'primary' : 'tertiary'}
              className="mt-1"
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
