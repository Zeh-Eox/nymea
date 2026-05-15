import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
};

const VARIANT_BG: Record<Variant, string> = {
  primary: 'bg-primary-500 active:bg-primary-600',
  secondary: 'bg-primary-100 active:bg-primary-200',
  ghost: 'bg-transparent active:bg-primary-50',
  danger: 'bg-red-500 active:bg-red-600',
};

const VARIANT_LABEL: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-primary-700',
  ghost: 'text-primary-600',
  danger: 'text-white',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-4 py-2.5 rounded-full',
  md: 'px-6 py-3.5 rounded-full',
  lg: 'px-8 py-4 rounded-full',
};

const SIZE_LABEL: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
}: ButtonProps): React.JSX.Element {
  const isInteractive = !disabled && !loading;
  const indicatorColor = variant === 'primary' || variant === 'danger' ? '#ffffff' : '#db2777';

  return (
    <Pressable
      onPress={onPress}
      disabled={!isInteractive}
      className={[
        VARIANT_BG[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-50' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {leadingIcon}
          <Text className={`text-center font-semibold ${VARIANT_LABEL[variant]} ${SIZE_LABEL[size]}`}>
            {label}
          </Text>
          {trailingIcon}
        </View>
      )}
    </Pressable>
  );
}
