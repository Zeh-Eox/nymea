import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Button } from '@/components/button';
import { ScreenContainer } from '@/components/screen-container';
import { TextField } from '@/components/text-field';
import { useAuth } from '@/hooks/use-auth';
import { registerSchema, type RegisterFormValues } from '@/validators/auth.schema';

export default function RegisterScreen(): React.JSX.Element {
  const { register } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await register(values.email, values.password, values.name || undefined);
    } catch (err) {
      const axiosErr = err as {
        response?: { status?: number; data?: unknown };
        message?: string;
        code?: string;
      };
      console.error('[register] error', {
        status: axiosErr.response?.status,
        data: axiosErr.response?.data,
        message: axiosErr.message,
        code: axiosErr.code,
      });
      const status = axiosErr.response?.status;
      if (status === 409) {
        setServerError('Cet email est déjà utilisé');
      } else if (!axiosErr.response) {
        setServerError(`Réseau injoignable: ${axiosErr.message ?? 'unknown'}`);
      } else {
        setServerError(`Erreur ${status ?? '?'} — ${JSON.stringify(axiosErr.response.data)}`);
      }
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1 justify-center">
        <Text className="text-4xl font-bold text-text-primary">Créer un compte</Text>
        <Text className="mb-8 mt-2 text-text-secondary">Commençons ensemble</Text>

        <TextField
          control={control}
          name="name"
          label="Prénom (optionnel)"
          placeholder="Comment t'appelles-tu ?"
          autoCapitalize="words"
        />
        <TextField
          control={control}
          name="email"
          label="Email"
          placeholder="ton@email.com"
          keyboardType="email-address"
        />
        <TextField
          control={control}
          name="password"
          label="Mot de passe"
          placeholder="Minimum 8 caractères"
          secureTextEntry
        />

        {serverError && <Text className="mb-3 text-sm text-red-500">{serverError}</Text>}

        <Button label="S'inscrire" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />

        <View className="mt-6 flex-row justify-center">
          <Text className="text-text-secondary">Déjà un compte ? </Text>
          <Link href="/(auth)/login" className="font-semibold text-primary-600">
            Se connecter
          </Link>
        </View>
      </View>
    </ScreenContainer>
  );
}
