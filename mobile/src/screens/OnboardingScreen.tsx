import React, { useRef, useState } from 'react';
import { View, FlatList, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '@/components/atoms';
import { onboardingStorage } from '@/lib/storage/onboardingStorage';
import { RootStackParamList } from '@/navigation/types';

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Descubre Gaudí y su entorno',
    description: 'Explora la riqueza cultural y arquitectónica de nuestro municipio. Encuentra lugares únicos y su historia.',
    // image: require('@/assets/images/onboarding1.png'), // Placeholder
    icon: '🏛️',
  },
  {
    id: '2',
    title: 'Agenda y eventos',
    description: 'Mantente al día con todas las actividades, fiestas y eventos culturales. ¡No te pierdas nada!',
    // image: require('@/assets/images/onboarding2.png'), // Placeholder
    icon: '📅',
  },
  {
    id: '3',
    title: 'Crea tu perfil',
    description: 'Personaliza tu experiencia, guarda tus favoritos y recibe notificaciones de lo que más te interesa.',
    // image: require('@/assets/images/onboarding3.png'), // Placeholder
    icon: '👤',
  },
];

export const OnboardingScreen = ({ navigation }: OnboardingScreenProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const finishOnboarding = async () => {
    await onboardingStorage.setCompleted(true);
    navigation.replace('Login');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      finishOnboarding();
    }
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
    return (
      <View style={{ width }} className="items-center justify-center px-8">
        <View className="w-64 h-64 bg-primary/10 rounded-full items-center justify-center mb-10">
          <Text className="text-8xl">{item.icon}</Text>
        </View>
        <Text variant="heading" className="text-center mb-4 text-primary">
          {item.title}
        </Text>
        <Text variant="body" className="text-center text-gray-500 leading-6">
          {item.description}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          keyExtractor={(item) => item.id}
          bounces={false}
        />

        {/* Pagination Dots */}
        <View className="flex-row justify-center space-x-2 mb-8">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'w-8 bg-primary' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </View>

        {/* Footer Buttons */}
        <View className="px-6 pb-6 space-y-4">
          <Button variant="primary" onPress={handleNext} className="w-full">
            <Text color="inverse" weight="bold">{currentIndex === SLIDES.length - 1 ? 'Comenzar' : 'Siguiente'}</Text>
          </Button>
          
          {currentIndex < SLIDES.length - 1 && (
            <Button variant="ghost" onPress={handleSkip} className="w-full">
              <Text className="text-gray-500">Saltar</Text>
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};
