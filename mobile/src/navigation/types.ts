// Export all navigation types
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  EventDetail: { eventId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Events: undefined;
  Notifications: undefined;
  Points: undefined;
  Profile: undefined;
};

export type DrawerParamList = {
  Tabs: undefined;
  Settings: undefined;
  Support: undefined;
  About: undefined;
};
