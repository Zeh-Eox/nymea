import React from 'react';
import { Text, View } from 'react-native';
import { useThemedColors } from '@/hooks/use-theme';

type Point = { startDate: string; length: number };

type Props = {
  data: Point[];
  height?: number;
};

export function CycleLengthChart({ data, height = 140 }: Props): React.JSX.Element {
  const c = useThemedColors();
  if (data.length === 0) {
    return (
      <View
        className="items-center justify-center rounded-xl bg-surface-muted"
        style={{ height }}
      >
        <Text className="text-text-muted text-sm">Pas assez de données</Text>
      </View>
    );
  }

  const min = Math.min(...data.map((d) => d.length));
  const max = Math.max(...data.map((d) => d.length));
  const range = Math.max(1, max - min);
  const avg = data.reduce((acc, d) => acc + d.length, 0) / data.length;

  return (
    <View>
      <View
        className="flex-row items-end gap-1.5"
        style={{ height }}
      >
        {data.map((point, idx) => {
          const normalized = (point.length - min) / range;
          const barHeight = 24 + normalized * (height - 32);
          const isExtreme = point.length === min || point.length === max;
          return (
            <View key={`${point.startDate}-${idx}`} className="flex-1 items-center">
              <Text className="text-[10px] text-text-muted mb-1">
                {point.length}
              </Text>
              <View
                style={{
                  width: '100%',
                  height: barHeight,
                  backgroundColor: isExtreme
                    ? c.primary[400]
                    : c.primary[300],
                  borderTopLeftRadius: 6,
                  borderTopRightRadius: 6,
                }}
              />
            </View>
          );
        })}
      </View>
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-xs text-text-muted">
          Min {min} j · Max {max} j
        </Text>
        <Text className="text-xs text-text-muted">
          Moyenne {Math.round(avg * 10) / 10} j
        </Text>
      </View>
    </View>
  );
}
