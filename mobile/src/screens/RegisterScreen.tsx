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
import { registerSchema, RegisterFormData } from '@/lib/validations/auth';
import { RootStackParamList } from '@/navigation/types';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

export const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const { register, isLoading, error: authError } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      password_confirm: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data);
      navigation.replace('Main');
    } catch {
      // Error handled by store
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Próximamente', `El registro con ${provider} estará disponible pronto.`);
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
            className="mb-6 w-10 h-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Text>←</Text>
          </TouchableOpacity>

          {/* Headlines */}
          <View className="mb-8">
            <Text variant="heading" weight="bold" className="mb-2">
              Únete a Gaudeix
            </Text>
            <Text variant="body" color="secondary">
              Empieza a descubrir eventos locales y suma puntos exclusivos.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4 mb-6">
            <View>
              <Text variant="label" weight="bold" className="uppercase ml-1 mb-2">
                Nombre Completo
              </Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Ej. Marc Torrent"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.name}
                  />
                )}
              />
              {errors.name && (
                <Text color="error" variant="caption" className="mt-1 ml-1">
                  {errors.name.message}
                </Text>
              )}
            </View>

            <View>
              <Text variant="label" weight="bold" className="uppercase ml-1 mb-2">
                Usuario
              </Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Ej. marc.torrent"
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
                Correo Electrónico
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="nombre@ejemplo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.email}
                  />
                )}
              />
              {errors.email && (
                <Text color="error" variant="caption" className="mt-1 ml-1">
                  {errors.email.message}
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
                    placeholder="Mínimo 8 caracteres"
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

            <View>
              <Text variant="label" weight="bold" className="uppercase ml-1 mb-2">
                Confirmar Contraseña
              </Text>
              <Controller
                control={control}
                name="password_confirm"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    variant="password"
                    placeholder="Repite tu contraseña"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.password_confirm}
                  />
                )}
              />
              {errors.password_confirm && (
                <Text color="error" variant="caption" className="mt-1 ml-1">
                  {errors.password_confirm.message}
                </Text>
              )}
            </View>

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
            className="mb-6 flex-row items-center justify-center space-x-2"
          >
            {isLoading ? (
              <Text color="inverse" weight="bold">
                Creando cuenta...
              </Text>
            ) : (
              <>
                <Text color="inverse" weight="bold">
                  Crear cuenta y empezar a sumar
                </Text>
                <Text color="inverse">✨</Text>
              </>
            )}
          </Button>

          <View className="flex-row justify-center mb-8">
            <Text color="secondary">¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text color="primary" weight="bold">
                Inicia sesión
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
              O regístrate con
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
          <View className="mt-8 mb-4">
            <Text variant="caption" color="tertiary" className="text-center">
              Al registrarte, confirmas que has leído y aceptas nuestra Política de Privacidad y
              Términos de Uso.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
