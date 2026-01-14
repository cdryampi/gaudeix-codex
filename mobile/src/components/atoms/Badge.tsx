/**
 * Badge Atom Component
 * 
 * Small badge component for status indicators, points, and notification counts.
 * 
 * @example
 * ```tsx
 * <Badge variant="points" value="250" />
 * <Badge variant="notification" value="5" />
 * ```
 */
import { View, type ViewProps } from 'react-native';
import { Text } from './Text';

export interface BadgeProps extends ViewProps {
  /** Badge variant */
  variant?: 'status' | 'points' | 'notification';
  
  /** Badge content */
  value: string | number;
  
  /** Status color (only for status variant) */
  status?: 'success' | 'warning' | 'error' | 'info';
  
  /** Additional className */
  className?: string;
}

const variantStyles = {
  status: {
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    info: 'bg-info',
  },
  points: 'bg-accent',
  notification: 'bg-secondary',
};

export function Badge({
  variant = 'status',
  value,
  status = 'success',
  className = '',
  ...viewProps
}: BadgeProps) {
  const bgColor =
    variant === 'status'
      ? variantStyles.status[status]
      : variantStyles[variant];

  const badgeClassName = [
    'px-2 py-1 rounded-full items-center justify-center min-w-[24px]',
    bgColor,
    variant === 'notification' && 'absolute -top-1 -right-1 z-10',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <View className={badgeClassName} {...viewProps}>
      <Text
        variant="label"
        weight="bold"
        color="inverse"
        className="text-center"
      >
        {value}
      </Text>
    </View>
  );
}
