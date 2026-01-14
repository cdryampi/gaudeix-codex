/**
 * Text Atom Component
 * 
 * Typography component with predefined variants for consistent text styling.
 * Uses NativeWind (Tailwind CSS) for styling with Plus Jakarta Sans font.
 * 
 * @example
 * ```tsx
 * <Text variant="heading" weight="bold" color="primary">
 *   Gaudeix Mobile
 * </Text>
 * ```
 */
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { type ReactNode } from 'react';

export interface TextProps extends Omit<RNTextProps, 'children'> {
  /**
   * Typography variant
   * - `heading`: Large heading text (30px)
   * - `title`: Section title text (24px)
   * - `body`: Regular body text (14px) - default
   * - `caption`: Small caption text (12px)
   * - `label`: Tiny label text (10px)
   */
  variant?: 'heading' | 'title' | 'body' | 'caption' | 'label';
  
  /**
   * Font weight
   * - `normal`: 400
   * - `medium`: 500
   * - `semibold`: 600
   * - `bold`: 700
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  
  /**
   * Text color semantic token
   * - `primary`: Main text color (dark gray #1F2937)
   * - `secondary`: Secondary text color (medium gray #6B7280)
   * - `tertiary`: Tertiary/disabled text (light gray #9CA3AF)
   * - `inverse`: White text for dark backgrounds
   * - `error`: Red text for errors
   * - `success`: Green text for success
   * - `warning`: Orange text for warnings
   * - `info`: Blue text for info
   */
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error' | 'success' | 'warning' | 'info';
  
  /** Text content */
  children: ReactNode;
  
  /** Additional custom className */
  className?: string;
}

const variantStyles = {
  heading: 'text-3xl',      // 30px
  title: 'text-2xl',        // 24px
  body: 'text-base',        // 14px
  caption: 'text-sm',       // 12px
  label: 'text-xs',         // 10px
};

const weightStyles = {
  normal: 'font-normal',     // 400
  medium: 'font-medium',     // 500
  semibold: 'font-semibold', // 600
  bold: 'font-bold',         // 700
};

const colorStyles = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  inverse: 'text-text-inverse',
  error: 'text-error',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
};

export function Text({
  variant = 'body',
  weight = 'normal',
  color = 'primary',
  children,
  className = '',
  ...textProps
}: TextProps) {
  const textClassName = [
    'font-display', // Plus Jakarta Sans
    variantStyles[variant],
    weightStyles[weight],
    colorStyles[color],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <RNText className={textClassName} {...textProps}>
      {children}
    </RNText>
  );
}
