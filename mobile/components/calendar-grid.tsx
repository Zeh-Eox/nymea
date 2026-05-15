import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { CyclePhase } from '@/theme/tokens';
import { useThemedColors } from '@/hooks/use-theme';
import { todayKey, toDateKey } from '@/utils/date';

export type DayCellInfo = {
  dateKey: string;
  inMonth: boolean;
};

export type DayState = {
  phase: CyclePhase | null;
  predicted?: boolean;
};

type CalendarGridProps = {
  year: number;
  month: number;
  selectedDateKey?: string | null;
  onDayPress: (dateKey: string) => void;
  getDayState: (dateKey: string) => DayState;
};

const WEEKDAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function buildMonthDays(year: number, month: number): DayCellInfo[] {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const offsetSunday = firstOfMonth.getUTCDay();
  const offsetMonday = (offsetSunday + 6) % 7;
  const gridStart = new Date(firstOfMonth);
  gridStart.setUTCDate(gridStart.getUTCDate() - offsetMonday);

  const days: DayCellInfo[] = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(gridStart);
    d.setUTCDate(gridStart.getUTCDate() + i);
    days.push({
      dateKey: toDateKey(d),
      inMonth: d.getUTCMonth() === month,
    });
  }
  return days;
}

export function CalendarGrid({
  year,
  month,
  selectedDateKey,
  onDayPress,
  getDayState,
}: CalendarGridProps): React.JSX.Element {
  const today = todayKey();
  const days = useMemo(() => buildMonthDays(year, month), [year, month]);
  const c = useThemedColors();

  return (
    <View>
      <View className="flex-row mb-2">
        {WEEKDAYS_SHORT.map((w, idx) => (
          <View key={`${w}-${idx}`} className="flex-1 items-center py-1">
            <Text className="text-xs font-semibold text-text-muted">{w}</Text>
          </View>
        ))}
      </View>
      <View className="flex-row flex-wrap">
        {days.map((day) => {
          const { phase, predicted } = getDayState(day.dateKey);
          const isToday = day.dateKey === today;
          const isSelected = day.dateKey === selectedDateKey;
          const dayNumber = parseInt(day.dateKey.slice(8), 10);
          const dotColor = phase ? c.cycle[phase] : 'transparent';

          return (
            <Pressable
              key={day.dateKey}
              onPress={() => onDayPress(day.dateKey)}
              style={{ width: `${100 / 7}%` }}
              className="items-center py-1.5"
            >
              <View
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  isSelected
                    ? 'bg-primary-500'
                    : isToday
                      ? 'border-2 border-primary-400'
                      : ''
                }`}
              >
                <Text
                  className={`text-base ${
                    isSelected
                      ? 'text-white font-bold'
                      : day.inMonth
                        ? 'text-text-primary'
                        : 'text-text-muted'
                  }`}
                >
                  {dayNumber}
                </Text>
              </View>
              <View
                className="h-1.5 w-1.5 mt-1 rounded-full"
                style={{
                  backgroundColor: predicted ? 'transparent' : dotColor,
                  borderWidth: predicted ? 1.5 : 0,
                  borderColor: dotColor,
                  opacity: day.inMonth ? 1 : 0.4,
                }}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
