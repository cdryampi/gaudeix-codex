/**
 * Chip Atom Component
 * 
 * Compact element for filters, tags, and selections.
 * 
 * @example
 * ```tsx
 * <Chip
 *   label="Deportes"
 *   selected={true}
 *   onPress={() => handleFilter('sports')}
 * />
 * ```
 */
import { Pressable, type PressableProps } from 'react-native';
import { Text } from './Text';

export interface ChipProps extends Omit<PressableProps, 'children'> {
  /** Chip label */
  label: string;
  
  /** Selected state */
  selected?: boolean;
  
  /** Removable chip (shows X icon) */
  removable?: boolean;
  
  /** Callback when remove is pressed */
  onRemove?: () => void;
  
  /** Callback when chip is pressed */
  onPress?: () => void;
  
  /** Additional className */
  className?: string;
}

export function Chip({
  label,
  selected = false,
  removable = false,
  onRemove,
  onPress,
  className = '',
  ...pressableProps
}: ChipProps) {
  const containerClassName = [
    'flex-row items-center px-3 py-2 rounded-full border',
    selected
      ? 'bg-primary border-primary'
      : 'bg-transparent border-border-medium',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Pressable
      className={containerClassName}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      {...pressableProps}
    >
      <Text
        variant="caption"
        weight="medium"
        color={selected ? 'inverse' : 'secondary'}
      >
        {label}
      </Text>
      
      {removable && (
        <Pressable
          onPress={onRemove}
          className="ml-1"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${label}`}
        >
          <Text variant="caption" color={selected ? 'inverse' : 'secondary'}>
            ×
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}
