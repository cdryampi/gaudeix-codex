/**
 * Molecules - Component Library
 *
 * Mid-level components composed of atoms.
 */

/**
 * Card Component - Base card container
 */
import { View, type ViewProps } from 'react-native';
import { Input, Text } from '../atoms';

/**
 * SearchBar Component - Search input with icon
 */
export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  children: React.ReactNode;
  className?: string;
}

export function Card({ variant = 'elevated', children, className = '', ...props }: CardProps) {
  const variantClasses = {
    elevated: 'bg-surface-light shadow-md',
    outlined: 'bg-surface-light border border-border-light',
    filled: 'bg-background-light',
  }[variant];

  return (
    <View className={`rounded-xl p-4 ${variantClasses} ${className}`} {...props}>
      {children}
    </View>
  );
}

/**
 * EventCard Component - Displays event information
 */
export interface EventCardProps {
  title: string;
  time: string;
  points?: number;
  location?: string;
  onPress?: () => void;
}

export function EventCard({ title, time, points, location }: EventCardProps) {
  return (
    <Card variant="outlined" className="mb-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text variant="body" weight="semibold">
            {title}
          </Text>
          <Text variant="caption" color="secondary" className="mt-1">
            {time}
          </Text>
          {location && (
            <Text variant="caption" color="tertiary" className="mt-1">
              {location}
            </Text>
          )}
        </View>
        {points && (
          <View className="bg-accent px-2 py-1 rounded-full">
            <Text variant="label" weight="bold" color="inverse">
              +{points}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

/**
 * ListItem Component - Generic list item
 */
export interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
}

export function ListItem({ title, subtitle, leftIcon, rightIcon }: ListItemProps) {
  return (
    <View className="flex-row items-center py-3 px-4">
      {leftIcon && <View className="mr-3">{leftIcon}</View>}
      <View className="flex-1">
        <Text variant="body" weight="medium">
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="secondary">
            {subtitle}
          </Text>
        )}
      </View>
      {rightIcon && <View>{rightIcon}</View>}
    </View>
  );
}

export interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
}

export function SearchBar({ placeholder = 'Buscar...', value, onChangeText }: SearchBarProps) {
  return (
    <Input variant="search" placeholder={placeholder} value={value} onChangeText={onChangeText} />
  );
}
