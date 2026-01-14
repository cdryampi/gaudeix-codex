import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { 
  PlaceholderScreen 
} from '@/screens/main';
import { HomeScreen } from '@/features/home/screens/HomeScreen';
import { EventsScreen } from '@/features/events/screens/EventsScreen';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { RankingScreen } from '@/features/ranking/screens/RankingScreen';
import { MainTabParamList, DrawerParamList } from '@/navigation/types';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';
import { CustomDrawerContent } from '@/components/navigation/CustomDrawerContent';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: () => '🏠',
        }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventsScreen} 
        options={{
          tabBarLabel: 'Eventos',
          tabBarIcon: () => '📅',
        }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{
          tabBarLabel: 'Avisos',
          tabBarIcon: () => '🔔',
        }}
      />
      <Tab.Screen 
        name="Points" 
        component={RankingScreen} 
        options={{
          tabBarLabel: 'Puntos',
          tabBarIcon: () => '🏆',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: () => '👤',
        }}
      />
    </Tab.Navigator>
  );
};

export const MainNavigator = () => {
  return (
    <Drawer.Navigator 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ 
        headerShown: false,
        drawerType: 'front',
        drawerStyle: { width: '80%' }
      }}
    >
      <Drawer.Screen name="Tabs" component={BottomTabs} />
      <Drawer.Screen name="Settings" component={() => <PlaceholderScreen title="Configuración" icon="⚙️" />} />
      <Drawer.Screen name="Support" component={() => <PlaceholderScreen title="Soporte" icon="❓" />} />
      <Drawer.Screen name="About" component={() => <PlaceholderScreen title="Sobre Gaudeix" icon="ℹ️" />} />
    </Drawer.Navigator>
  );
};
