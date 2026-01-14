/**
 * Avatar Atom Component
 * 
 * User avatar with optional status indicator.
 * Displays initials when no image is provided.
 * 
 * @example
 * ```tsx
 * <Avatar
 *   size="md"
 *   initials="JD"
 *   status="online"
 * />
 * ```
 */
import { View, Image, type ViewProps, type ImageSourcePropType } from 'react-native';
import { Text } from './Text';

export interface AvatarProps extends ViewProps {
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** User initials (shown when no image) */
  initials?: string;
  
  /** Image source */
  source?: ImageSourcePropType;
  
  /** Status indicator */
  status?: 'online' | 'offline' | 'busy' | 'away';
  
  /** Additional className */
  className?: string;
}

const sizeStyles = {
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-12 h-12', text: 'text-sm' },
  lg: { container: 'w-16 h-16', text: 'text-base' },
  xl: { container: 'w-24 h-24', text: 'text-2xl' },
};

const statusColors = {
  online: 'bg-success',
  offline: 'bg-text-tertiary',
  busy: 'bg-error',
  away: 'bg-warning',
};

export function Avatar({
  size = 'md',
  initials = '??',
  source,
  status,
  className = '',
  ...viewProps
}: AvatarProps) {
  const { container, text } = sizeStyles[size];
  
  const containerClassName = [
    container,
    'rounded-full bg-primary/20 items-center justify-center overflow-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <View className="relative">
      <View className={containerClassName} {...viewProps}>
        {source ? (
          <Image
            source={source}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Text
            variant="body"
            weight="semibold"
            color="primary"
            className={text}
          >
            {initials.toUpperCase()}
          </Text>
        )}
      </View>
      
      {status && (
        <View
          className={[
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
            statusColors[status],
          ].join(' ')}
        />
      )}
    </View>
  );
}
