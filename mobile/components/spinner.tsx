import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/theme/tokens';

type SpinnerProps = {
  size?: 'small' | 'large';
  fullScreen?: boolean;
};

export function Spinner({ size = 'large', fullScreen = false }: SpinnerProps): React.JSX.Element {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size={size} color={colors.primary[600]} />
      </View>
    );
  }
  return <ActivityIndicator size={size} color={colors.primary[600]} />;
}
