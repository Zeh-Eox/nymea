import React from 'react';
import { Pressable, View, type ViewProps } from 'react-native';
import { shadows } from '@/theme/tokens';

type CardProps = ViewProps & {
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  children: React.ReactNode;
};

const PADDING_CLASSES = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
} as const;

export function Card({
  elevation = 'sm',
  padding = 'md',
  onPress,
  className,
  style,
  children,
  ...rest
}: CardProps): React.JSX.Element {
  const baseClasses = `rounded-2xl bg-surface ${PADDING_CLASSES[padding]} ${className ?? ''}`;
  const shadowStyle = shadows[elevation];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${baseClasses} active:opacity-80`}
        style={[shadowStyle, style]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View {...rest} className={baseClasses} style={[shadowStyle, style]}>
      {children}
    </View>
  );
}
