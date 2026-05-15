import React from 'react';
import { View } from 'react-native';

type DividerProps = {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
};

const H_SPACING: Record<NonNullable<DividerProps['spacing']>, string> = {
  none: 'my-0',
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-6',
};

const V_SPACING: Record<NonNullable<DividerProps['spacing']>, string> = {
  none: 'mx-0',
  sm: 'mx-2',
  md: 'mx-4',
  lg: 'mx-6',
};

export function Divider({
  orientation = 'horizontal',
  spacing = 'md',
}: DividerProps): React.JSX.Element {
  if (orientation === 'vertical') {
    return <View className={`w-px self-stretch bg-neutral-200 ${V_SPACING[spacing]}`} />;
  }
  return <View className={`h-px w-full bg-neutral-200 ${H_SPACING[spacing]}`} />;
}
