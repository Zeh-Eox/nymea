import React from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Body,
  Card,
  Caption,
  Heading,
  Row,
  ScreenContainer,
  ScreenHeader,
  Spinner,
  Stack,
  Typography,
} from '@/components/index';
import { useCycles } from '@/hooks/use-cycles';
import { formatLongDate } from '@/utils/cycle';

export default function CyclesListScreen(): React.JSX.Element {
  const router = useRouter();
  const { cycles, isLoading, refresh } = useCycles();

  if (isLoading && cycles.length === 0) {
    return <Spinner fullScreen />;
  }

  if (cycles.length === 0) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Mes cycles" showBack />
        <View className="flex-1 items-center justify-center">
          <Heading level={3}>Aucun cycle</Heading>
          <Body tone="secondary" align="center" className="mt-2">
            Quand tu enregistreras tes règles depuis la Home, l'historique apparaîtra ici.
          </Body>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Mes cycles" showBack />
      <FlatList
        data={cycles}
        keyExtractor={(c) => c.id}
        ItemSeparatorComponent={() => <View className="h-3" />}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} />
        }
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/cycles/${item.id}`)}>
            <Row justify="between" align="center">
              <Stack gap="xs">
                <Typography variant="label">{formatLongDate(item.startDate)}</Typography>
                {item.endDate && (
                  <Caption>Fin : {formatLongDate(item.endDate)}</Caption>
                )}
              </Stack>
              <Stack gap="xs" align="end">
                <Caption tone="primary">
                  {item.cycleLength ? `${item.cycleLength} j` : '—'}
                </Caption>
                {item.periodLength && (
                  <Caption>Règles {item.periodLength} j</Caption>
                )}
              </Stack>
            </Row>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}
