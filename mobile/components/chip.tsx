import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { CyclePhase } from '@/theme/tokens';

type Variant = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'error';
type ChipProps = {
  label: string;
  variant?: Variant;
  selected?: boolean;
  onPress?: () => void;
};

const VARIANT_BG: Record<Variant, string> = {
  neutral: 'bg-neutral-100',
  primary: 'bg-primary-100',
  accent: 'bg-accent-100',
  success: 'bg-emerald-100',
  warning: 'bg-amber-100',
  error: 'bg-red-100',
};

const VARIANT_FG: Record<Variant, string> = {
  neutral: 'text-neutral-700',
  primary: 'text-primary-700',
  accent: 'text-accent-700',
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  error: 'text-red-700',
};

export function Chip({
  label,
  variant = 'neutral',
  selected = false,
  onPress,
}: ChipProps): React.JSX.Element {
  const classes = `px-3.5 py-2 rounded-full ${VARIANT_BG[variant]} ${
    selected ? 'border-2 border-primary-500' : 'border border-transparent'
  }`;
  const labelClasses = `text-sm font-medium ${VARIANT_FG[variant]}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={`${classes} active:opacity-80`}>
        <Text className={labelClasses}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <View className={classes}>
      <Text className={labelClasses}>{label}</Text>
    </View>
  );
}

const PHASE_VARIANT: Record<CyclePhase, Variant> = {
  menstrual: 'error',
  follicular: 'primary',
  ovulation: 'accent',
  luteal: 'warning',
};

const PHASE_LABEL: Record<CyclePhase, string> = {
  menstrual: 'Règles',
  follicular: 'Folliculaire',
  ovulation: 'Ovulation',
  luteal: 'Lutéale',
};

export function PhaseChip({ phase }: { phase: CyclePhase }): React.JSX.Element {
  return <Chip label={PHASE_LABEL[phase]} variant={PHASE_VARIANT[phase]} />;
}
