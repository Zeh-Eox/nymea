import React from 'react';
import { Pressable, Text, View } from 'react-native';

type StepperProps = {
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
};

export function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: StepperProps): React.JSX.Element {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));
  const canDec = value > min;
  const canInc = value < max;

  return (
    <View className="flex-row items-center justify-center gap-6">
      <Pressable
        onPress={decrement}
        disabled={!canDec}
        className={`h-14 w-14 items-center justify-center rounded-full ${
          canDec ? 'bg-primary-100 active:bg-primary-200' : 'bg-neutral-100'
        }`}
      >
        <Text className={`text-3xl ${canDec ? 'text-primary-700' : 'text-neutral-400'}`}>−</Text>
      </Pressable>

      <View className="min-w-[120px] items-center">
        <Text className="text-5xl font-bold text-text-primary">{value}</Text>
        {suffix && <Text className="mt-1 text-sm text-text-secondary">{suffix}</Text>}
      </View>

      <Pressable
        onPress={increment}
        disabled={!canInc}
        className={`h-14 w-14 items-center justify-center rounded-full ${
          canInc ? 'bg-primary-100 active:bg-primary-200' : 'bg-neutral-100'
        }`}
      >
        <Text className={`text-3xl ${canInc ? 'text-primary-700' : 'text-neutral-400'}`}>+</Text>
      </Pressable>
    </View>
  );
}
