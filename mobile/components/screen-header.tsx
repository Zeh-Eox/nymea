import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useScheme, useThemedColors } from '@/hooks/use-theme';

type ScreenHeaderProps = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  variant?: 'flat' | 'soft';
};

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
  variant = 'flat',
}: ScreenHeaderProps): React.JSX.Element {
  const router = useRouter();
  const c = useThemedColors();
  const scheme = useScheme();

  const handleBack = () => {
    if (onBackPress) onBackPress();
    else if (router.canGoBack()) router.back();
  };

  const softShadow =
    variant === 'soft'
      ? {
          shadowColor: c.primary[500],
          shadowOpacity: scheme === 'dark' ? 0.3 : 0.1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        }
      : undefined;

  return (
    <View
      className={`mb-4 ${variant === 'soft' ? 'rounded-3xl bg-surface px-4 py-3' : 'px-1 py-2'}`}
      style={softShadow}
    >
      <View className="flex-row items-center" style={{ minHeight: 40 }}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
            style={{ backgroundColor: c.blush }}
          >
            <Ionicons name="chevron-back" size={22} color={c.primary[600]} />
          </Pressable>
        ) : (
          <View style={{ width: 40, height: 40 }} />
        )}

        <View className="flex-1 items-center px-2">
          {title ? (
            <Text
              numberOfLines={1}
              style={{ color: c.text.primary }}
              className="text-base font-semibold"
            >
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text style={{ color: c.text.muted }} className="text-xs mt-0.5">
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View
          style={{ width: 40, height: 40 }}
          className="items-center justify-center"
        >
          {rightAction}
        </View>
      </View>
    </View>
  );
}
