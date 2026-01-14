/**
 * Button Atom Component
 * 
 * Flexible button component with multiple variants, sizes, and states.
 * Uses NativeWind (Tailwind CSS) for styling.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onPress={handlePress}>
 *   Iniciar Sesión
 * </Button>
 * ```
 */
import { Pressable, Text as RNText, type PressableProps } from 'react-native';
import { type ReactNode } from 'react';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  /**
   * Visual style variant
   * - `primary`: Solid primary color background (verde #3E9124)
   * - `secondary`: Solid secondary color background (naranja #E97B1C)
   * - `outline`: Transparent background with border
   * - `ghost`: No background or border, text only
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  
  /**
   * Size of the button
   * - `sm`: Small padding and text
   * - `md`: Medium padding and text (default)
   * - `lg`: Large padding and text
   */
  size?: 'sm' | 'md' | 'lg';
  
  /** Callback when button is pressed */
  onPress: () => void;
  
  /** Button content (text or components) */
  children: ReactNode;
  
  /** Whether the button is disabled */
  disabled?: boolean;
  
  /** Additional custom className */
  className?: string;
}

const variantStyles = {
  primary: {
    container: 'bg-primary',
    text: 'text-text-inverse',
  },
  secondary: {
    container: 'bg-secondary',
    text: 'text-text-inverse',
  },
  outline: {
    container: 'bg-transparent border-2 border-primary',
    text: 'text-primary',
  },
  ghost: {
    container: 'bg-transparent',
    text: 'text-primary',
  },
};

const sizeStyles = {
  sm: {
    container: 'py-2 px-4',
    text: 'text-sm',
  },
  md: {
    container: 'py-3 px-6',
    text: 'text-base',
  },
  lg: {
    container: 'py-4 px-8',
    text: 'text-lg',
  },
};

export function Button({
  variant = 'primary',
  size = 'md',
  onPress,
  children,
  disabled = false,
  className = '',
  ...pressableProps
}: ButtonProps) {
  const variantClasses = variantStyles[variant];
  const sizeClasses = sizeStyles[size];
  
  const containerClassName = [
    'rounded-lg items-center justify-center',
    sizeClasses.container,
    variantClasses.container,
    disabled && 'opacity-50',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  
  const textClassName = [
    'font-semibold text-center',
    sizeClasses.text,
    variantClasses.text,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={containerClassName}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
      android_ripple={{
        color: 'rgba(0, 0, 0, 0.1)',
        borderless: false,
      }}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      {...pressableProps}
    >
      {typeof children === 'string' ? (
        <RNText className={textClassName}>{children}</RNText>
      ) : (
        children
      )}
    </Pressable>
  );
}
