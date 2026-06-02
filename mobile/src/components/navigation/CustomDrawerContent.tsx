import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, Button } from '@/components/atoms';
import { useAuthStore } from '@/stores/authStore';

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { user, logout } = useAuthStore();
  const { navigation } = props;

  const handleLogout = async () => {
    await logout();
    // Navigation to Login is handled by the auth state listener in RootNavigator/SplashScreen
    // but for good measure or if logic changes:
    // navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    // Actually RootNavigator should react to isAuthenticated change.
  };

  const MenuItem = ({
    icon,
    label,
    onPress,
  }: {
    icon: string;
    label: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-3 px-4 active:bg-gray-50 rounded-lg"
    >
      <Text className="text-xl mr-3">{icon}</Text>
      <Text variant="body" weight="medium" color="primary">
        {label}
      </Text>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text variant="label" weight="bold" color="tertiary" className="uppercase px-4 mt-6 mb-2">
      {title}
    </Text>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-2">
            <Text color="inverse" weight="bold">
              G
            </Text>
          </View>
          <Text variant="title" weight="bold">
            Gaudeix
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.closeDrawer()} className="p-2">
          <Text className="text-xl">✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* DESCUBRIR Section */}
        <SectionHeader title="Descubrir" />
        <MenuItem
          icon="💡"
          label="¿Cómo funciona Gaudeix?"
          onPress={() => navigation.navigate('About')}
        />
        <MenuItem icon="🏰" label="Sobre el Pueblo" onPress={() => navigation.navigate('About')} />
        <MenuItem
          icon="📢"
          label="Avisos Municipales"
          onPress={() => navigation.navigate('Tabs', { screen: 'Notifications' })}
        />

        {/* SOPORTE Y CUENTA Section */}
        <SectionHeader title="Soporte y Cuenta" />
        <MenuItem
          icon="❓"
          label="Asistencia y Soporte"
          onPress={() => navigation.navigate('Support')}
        />
        <MenuItem icon="⚙️" label="Configuración" onPress={() => navigation.navigate('Settings')} />
      </ScrollView>

      {/* Footer */}
      <View className="border-t border-gray-100 p-4 bg-gray-50">
        <View className="flex-row items-center mb-4">
          <Avatar
            initials={user?.username?.substring(0, 2).toUpperCase() || 'GU'}
            size="md"
            className="mr-3"
          />
          <View className="flex-1">
            <Text variant="body" weight="bold" numberOfLines={1}>
              {user?.name || user?.username || 'Invitado'}
            </Text>
            <Text variant="caption" color="secondary" numberOfLines={1}>
              {user?.email || 'Sin correo'}
            </Text>
          </View>
        </View>

        <Button
          variant="outline"
          size="sm"
          onPress={handleLogout}
          className="flex-row justify-center items-center"
        >
          <Text variant="body" weight="medium">
            Cerrar Sesión
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};
