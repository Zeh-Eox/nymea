import React from 'react';
import { View } from 'react-native';

type OnboardingProgressProps = {
  step: number;
  total: number;
};

export function OnboardingProgress({
  step,
  total,
}: OnboardingProgressProps): React.JSX.Element {
  return (
    <View className="mb-8 flex-row gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`h-1.5 flex-1 rounded-full ${
            i < step ? 'bg-primary-500' : 'bg-primary-100'
          }`}
        />
      ))}
    </View>
  );
}
