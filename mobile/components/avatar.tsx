import React from 'react';
import { Image, Text, View } from 'react-native';

type Size = 'sm' | 'md' | 'lg' | 'xl';
type AvatarProps = {
  uri?: string | null;
  name?: string | null;
  size?: Size;
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const TEXT_CLASSES: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
};

function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts[1]?.[0] ?? '';
  return (first + second).toUpperCase() || '?';
}

export function Avatar({ uri, name, size = 'md' }: AvatarProps): React.JSX.Element {
  const ringClasses = `rounded-full bg-blush items-center justify-center p-0.5 ${SIZE_CLASSES[size]}`;
  const innerClasses =
    'w-full h-full rounded-full bg-primary-200 items-center justify-center overflow-hidden';

  if (uri) {
    return (
      <View className={ringClasses}>
        <View className={innerClasses}>
          <Image source={{ uri }} className="w-full h-full" />
        </View>
      </View>
    );
  }

  return (
    <View className={ringClasses}>
      <View className={innerClasses}>
        <Text className={`font-semibold text-primary-700 ${TEXT_CLASSES[size]}`}>
          {getInitials(name)}
        </Text>
      </View>
    </View>
  );
}
