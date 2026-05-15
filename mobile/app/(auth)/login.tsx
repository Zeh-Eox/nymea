import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Button } from '@/components/button';
import { ScreenContainer } from '@/components/screen-container';
import { TextField } from '@/components/text-field';
import { useAuth } from '@/hooks/use-auth';
import { loginSchema, type LoginFormValues } from '@/validators/auth.schema';

export default function LoginScreen(): React.JSX.Element {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
    } catch (err) {
      const axiosErr = err as {
        response?: { status?: number; data?: unknown };
        message?: string;
        code?: string;
      };
      console.error('[login] error', {
        status: axiosErr.response?.status,
        data: axiosErr.response?.data,
        message: axiosErr.message,
        code: axiosErr.code,
      });
      if (!axiosErr.response) {
        setServerError(`Réseau injoignable: ${axiosErr.message ?? 'unknown'}`);
      } else if (axiosErr.response.status === 401) {
        setServerError('Email ou mot de passe incorrect');
      } else {
        setServerError(`Erreur ${axiosErr.response.status} — ${JSON.stringify(axiosErr.response.data)}`);
      }
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1 justify-center">
        <Text className="text-4xl font-bold text-text-primary">Connexion</Text>
        <Text className="mb-8 mt-2 text-text-secondary">Heureux de te revoir</Text>

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
          placeholder="••••••••"
          secureTextEntry
        />

        {serverError && <Text className="mb-3 text-sm text-red-500">{serverError}</Text>}

        <Button label="Se connecter" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />

        <View className="mt-6 flex-row justify-center">
          <Text className="text-text-secondary">Pas encore de compte ? </Text>
          <Link href="/(auth)/register" className="font-semibold text-primary-600">
            Créer un compte
          </Link>
        </View>
      </View>
    </ScreenContainer>
  );
}
