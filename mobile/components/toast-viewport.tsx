import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useToastStore,
  type Toast,
  type ToastVariant,
} from '@/store/toast.store';
import { useThemedColors } from '@/hooks/use-theme';
import { useScheme } from '@/hooks/use-theme';

type Palette = {
  bg: string;
  border: string;
  tint: string;
};

function variantPalette(variant: ToastVariant, isDark: boolean): Palette {
  if (isDark) {
    if (variant === 'success') {
      return { bg: '#173028', border: '#1c4a3a', tint: '#34d399' };
    }
    if (variant === 'error') {
      return { bg: '#3a1a22', border: '#5a2433', tint: '#fb7185' };
    }
    return { bg: '#3a1f30', border: '#5a2c45', tint: '#f9a8d4' };
  }
  if (variant === 'success') {
    return { bg: '#ecfdf5', border: '#a7f3d0', tint: '#059669' };
  }
  if (variant === 'error') {
    return { bg: '#fff1f2', border: '#fecdd3', tint: '#e11d48' };
  }
  return { bg: '#fdf2f8', border: '#fbcfe8', tint: '#db2777' };
}

const VARIANT_ICON: Record<ToastVariant, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  info: 'information-circle',
};

export function ToastViewport(): React.JSX.Element {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 16,
        right: 16,
        zIndex: 9999,
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </View>
  );
}

function ToastItem({ toast }: { toast: Toast }): React.JSX.Element {
  const dismiss = useToastStore((s) => s.dismiss);
  const c = useThemedColors();
  const scheme = useScheme();
  const palette = variantPalette(toast.variant, scheme === 'dark');

  const translateY = useRef(new Animated.Value(-24)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 14,
        stiffness: 180,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -24,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => dismiss(toast.id));
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss, translateY, opacity]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
        marginBottom: 8,
        backgroundColor: palette.bg,
        borderColor: palette.border,
        borderWidth: 1,
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: c.primary[600],
        shadowOpacity: scheme === 'dark' ? 0.4 : 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
      }}
    >
      <Ionicons
        name={VARIANT_ICON[toast.variant]}
        size={22}
        color={palette.tint}
        style={{ marginRight: 10 }}
      />
      <Text
        style={{
          flex: 1,
          color: c.text.primary,
          fontSize: 14,
          lineHeight: 20,
        }}
      >
        {toast.message}
      </Text>
      <Pressable
        onPress={() => dismiss(toast.id)}
        hitSlop={10}
        style={{ paddingLeft: 8 }}
      >
        <Ionicons name="close" size={18} color={c.text.muted} />
      </Pressable>
    </Animated.View>
  );
}
