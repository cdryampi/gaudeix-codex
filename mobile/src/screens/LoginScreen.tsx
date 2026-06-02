import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Text, Button, Input } from '@/components/atoms';
import { useAuthStore } from '@/stores/authStore';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';
import { RootStackParamList } from '@/navigation/types';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const { login, isLoading, error: authError } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      // Navigation is handled by auth state listener in RootNavigator or SplashScreen
      // But for explicit action, we can also navigate or let the store update trigger it.
      // In this app structure, we rely on the RootNavigator to switch stacks or screens based on auth state.
      // However, since we are using a stack, we might need to replace manually if not using a switch navigator pattern.
      // The current RootNavigator just puts screens in a stack.
      // Let's assume on success, we navigate to Main.
      navigation.replace('Main');
    } catch {
      // Error is handled by store and displayed below
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Próximamente', `El inicio de sesión con ${provider} estará disponible pronto.`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mb-8 w-10 h-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Text>←</Text>
          </TouchableOpacity>

          {/* Headlines */}
          <View className="mb-8">
            <Text variant="heading" weight="bold" className="mb-2">
              Bienvenido de nuevo
            </Text>
            <Text variant="body" color="secondary">
              Inicia sesión para continuar disfrutando de Gaudeix.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4 mb-6">
            <View>
              <Text variant="label" weight="bold" className="uppercase ml-1 mb-2">
                Usuario o Email
              </Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Ej. gaudeix"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.username}
                  />
                )}
              />
              {errors.username && (
                <Text color="error" variant="caption" className="mt-1 ml-1">
                  {errors.username.message}
                </Text>
              )}
            </View>

            <View>
              <Text variant="label" weight="bold" className="uppercase ml-1 mb-2">
                Contraseña
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    variant="password"
                    placeholder="Ingresa tu contraseña"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.password}
                  />
                )}
              />
              {errors.password && (
                <Text color="error" variant="caption" className="mt-1 ml-1">
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={() => Alert.alert('Info', 'Funcionalidad de recuperación próximamente')}
            >
              <Text color="primary" variant="body" weight="semibold" className="text-right">
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* Auth Error */}
            {authError && (
              <View className="bg-red-50 p-3 rounded-lg border border-red-100">
                <Text color="error" variant="body" className="text-center">
                  {authError}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="mb-6"
          >
            {isLoading ? (
              <Text color="inverse" weight="bold">
                Iniciando sesión...
              </Text>
            ) : (
              <Text color="inverse" weight="bold">
                Iniciar Sesión
              </Text>
            )}
          </Button>

          <View className="flex-row justify-center mb-8">
            <Text color="secondary">¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text color="primary" weight="bold">
                Regístrate
              </Text>
            </TouchableOpacity>
          </View>

          {/* Social Auth Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text
              variant="label"
              weight="bold"
              className="mx-4 text-gray-400 uppercase tracking-widest"
            >
              O inicia con
            </Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Social Buttons */}
          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={() => handleSocialLogin('Google')}
              className="flex-1 flex-row items-center justify-center h-14 border-2 border-gray-100 rounded-xl bg-white"
            >
              <Text variant="body" weight="bold">
                G
              </Text>
              <Text variant="body" weight="bold" className="ml-2">
                Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSocialLogin('Apple')}
              className="flex-1 flex-row items-center justify-center h-14 border-2 border-gray-100 rounded-xl bg-white"
            >
              <Text variant="body" weight="bold">
                
              </Text>
              <Text variant="body" weight="bold" className="ml-2">
                Apple
              </Text>
            </TouchableOpacity>
          </View>

          {/* Legal */}
          <View className="mt-8">
            <Text variant="caption" color="tertiary" className="text-center">
              Al iniciar sesión, aceptas nuestra Política de Privacidad y Términos de Uso.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
