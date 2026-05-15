import React from 'react';
import { View, type ViewProps } from 'react-native';

type Gap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Align = 'start' | 'center' | 'end' | 'stretch';
type Justify = 'start' | 'center' | 'end' | 'between' | 'around';

const GAP_CLASSES: Record<Gap, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const ALIGN_CLASSES: Record<Align, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const JUSTIFY_CLASSES: Record<Justify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

type StackProps = ViewProps & {
  gap?: Gap;
  align?: Align;
  justify?: Justify;
  children: React.ReactNode;
};

export function Stack({
  gap = 'md',
  align,
  justify,
  className,
  children,
  ...rest
}: StackProps): React.JSX.Element {
  return (
    <View
      {...rest}
      className={[
        'flex-col',
        GAP_CLASSES[gap],
        align ? ALIGN_CLASSES[align] : '',
        justify ? JUSTIFY_CLASSES[justify] : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </View>
  );
}

export function Row({
  gap = 'md',
  align = 'center',
  justify,
  className,
  children,
  ...rest
}: StackProps): React.JSX.Element {
  return (
    <View
      {...rest}
      className={[
        'flex-row',
        GAP_CLASSES[gap],
        ALIGN_CLASSES[align],
        justify ? JUSTIFY_CLASSES[justify] : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </View>
  );
}

export function Spacer({ size = 'md' }: { size?: Gap }): React.JSX.Element {
  const PX: Record<Gap, number> = { none: 0, xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
  return <View style={{ height: PX[size], width: PX[size] }} />;
}
