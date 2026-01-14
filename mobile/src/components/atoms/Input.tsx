/**
 * Input Atom Component
 * 
 * Text input component with variants for different use cases.
 * Supports password fields with visibility toggle and search inputs.
 * 
 * @example
 * ```tsx
 * <Input
 *   variant="text"
 *   placeholder="Nombre de usuario"
 *   value={username}
 *   onChangeText={setUsername}
 * />
 * ```
 */
import { useState } from 'react';
import {
  TextInput,
  View,
  Pressable,
  type TextInputProps,
} from 'react-native';
import { Text } from './Text';

export interface InputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  /** Input variant */
  variant?: 'text' | 'password' | 'search';
  
  /** Error state */
  error?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Additional container className */
  containerClassName?: string;
}

export function Input({
  variant = 'text',
  error = false,
  disabled = false,
  containerClassName = '',
  className = '',
  ...inputProps
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const containerClasses = [
    'flex-row items-center rounded-lg border-2 px-4 py-3',
    error ? 'border-error' : 'border-border-light',
    disabled && 'opacity-50 bg-surface-hover',
    containerClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const inputClasses = [
    'flex-1 text-base text-text-primary font-display',
    variant === 'search' && 'ml-2',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const isPassword = variant === 'password';
  const isSearch = variant === 'search';

  return (
    <View className={containerClasses}>
      {isSearch && (
        <Text variant="body" color="tertiary">🔍</Text>
      )}
      
      <TextInput
        className={inputClasses}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={isPassword && !showPassword}
        editable={!disabled}
        {...inputProps}
      />
      
      {isPassword && (
        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          className="ml-2"
          accessibilityRole="button"
          accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <Text variant="body" color="tertiary">
            {showPassword ? '🙈' : '👁️'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
