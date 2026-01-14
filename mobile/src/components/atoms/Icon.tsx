/**
 * Icon Atom Component
 * 
 * Simple wrapper for emoji/unicode icons.
 * Provides consistent sizing across the app.
 * 
 * @example
 * ```tsx
 * <Icon icon="🏠" size="md" />
 * ```
 */
import { Text } from './Text';

export interface IconProps {
  /** Icon emoji or unicode character */
  icon: string;
  
  /** Icon size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Additional className */
  className?: string;
}

const sizeVariants = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
};

export function Icon({
  icon,
  size = 'md',
  className = '',
}: IconProps) {
  return (
    <Text className={`${sizeVariants[size]} ${className}`}>
      {icon}
    </Text>
  );
}
