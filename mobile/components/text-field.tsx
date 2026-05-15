import React from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

type BaseProps = {
  label?: string;
  placeholder?: string;
  helper?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
};

const inputClasses = (hasError: boolean): string =>
  `rounded-2xl border px-4 py-3 text-base text-text-primary bg-surface ${
    hasError ? 'border-red-400' : 'border-primary-100'
  }`;

function FieldWrapper({
  label,
  helper,
  error,
  children,
}: BaseProps & { children: React.ReactNode }): React.JSX.Element {
  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-1 text-sm font-medium text-text-secondary">{label}</Text>
      )}
      {children}
      {error ? (
        <Text className="mt-1 text-xs text-red-500">{error}</Text>
      ) : helper ? (
        <Text className="mt-1 text-xs text-text-muted">{helper}</Text>
      ) : null}
    </View>
  );
}

type ControlledProps<T extends FieldValues> = BaseProps & {
  control: Control<T>;
  name: Path<T>;
};

type UncontrolledProps = BaseProps & {
  value: string;
  onChangeText: (next: string) => void;
};

export function TextField<T extends FieldValues>(
  props: ControlledProps<T> | UncontrolledProps,
): React.JSX.Element {
  if ('control' in props) {
    const {
      control,
      name,
      label,
      placeholder,
      helper,
      secureTextEntry,
      keyboardType,
      autoCapitalize = 'none',
    } = props;
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
          <FieldWrapper label={label} helper={helper} error={error?.message}>
            <TextInput
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              placeholderTextColor="#9ca3af"
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoCorrect={false}
              className={inputClasses(!!error)}
            />
          </FieldWrapper>
        )}
      />
    );
  }

  const {
    value,
    onChangeText,
    label,
    placeholder,
    helper,
    error,
    secureTextEntry,
    keyboardType,
    autoCapitalize = 'none',
  } = props;
  return (
    <FieldWrapper label={label} helper={helper} error={error}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        className={inputClasses(!!error)}
      />
    </FieldWrapper>
  );
}
