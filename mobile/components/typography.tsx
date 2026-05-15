import React from 'react';
import { Text, type TextProps } from 'react-native';

type Variant = 'h1' | 'h2' | 'h3' | 'bodyLarge' | 'body' | 'bodySmall' | 'caption' | 'label';
type Tone = 'primary' | 'secondary' | 'muted' | 'inverse' | 'accent' | 'error';

type TypographyProps = TextProps & {
  variant?: Variant;
  tone?: Tone;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
};

const VARIANT_CLASSES: Record<Variant, string> = {
  h1: 'text-[32px] leading-10 font-bold',
  h2: 'text-2xl leading-8 font-bold',
  h3: 'text-xl leading-7 font-semibold',
  bodyLarge: 'text-lg leading-7',
  body: 'text-base leading-6',
  bodySmall: 'text-sm leading-5',
  caption: 'text-xs leading-4',
  label: 'text-sm leading-5 font-semibold',
};

const TONE_CLASSES: Record<Tone, string> = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  muted: 'text-text-muted',
  inverse: 'text-text-inverse',
  accent: 'text-primary-600',
  error: 'text-red-500',
};

const WEIGHT_CLASSES: Record<NonNullable<TypographyProps['weight']>, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const ALIGN_CLASSES: Record<NonNullable<TypographyProps['align']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function Typography({
  variant = 'body',
  tone = 'primary',
  weight,
  align,
  className,
  children,
  ...rest
}: TypographyProps): React.JSX.Element {
  return (
    <Text
      {...rest}
      className={[
        VARIANT_CLASSES[variant],
        TONE_CLASSES[tone],
        weight ? WEIGHT_CLASSES[weight] : '',
        align ? ALIGN_CLASSES[align] : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Text>
  );
}

export const Heading = (props: Omit<TypographyProps, 'variant'> & { level?: 1 | 2 | 3 }) => (
  <Typography variant={(`h${props.level ?? 1}` as Variant)} {...props} />
);

export const Body = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body" {...props} />
);

export const Caption = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="caption" tone="muted" {...props} />
);
