import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/use-theme';

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({
  focused,
  color,
  outline,
  filled,
  blush,
}: {
  focused: boolean;
  color: string;
  outline: IconName;
  filled: IconName;
  blush: string;
}): React.JSX.Element {
  return (
    <View
      style={{
        width: 44,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        backgroundColor: focused ? blush : 'transparent',
      }}
    >
      <Ionicons name={focused ? filled : outline} size={22} color={color} />
    </View>
  );
}

export default function TabLayout(): React.JSX.Element {
  const c = useThemedColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary[600],
        tabBarInactiveTintColor: c.text.muted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopWidth: 0,
          height: 72,
          paddingTop: 8,
          paddingBottom: 12,
          shadowColor: c.primary[600],
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          elevation: 8,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              outline="heart-outline"
              filled="heart"
              blush={c.blush}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendrier',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              outline="calendar-outline"
              filled="calendar"
              blush={c.blush}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              outline="book-outline"
              filled="book"
              blush={c.blush}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              outline="person-outline"
              filled="person"
              blush={c.blush}
            />
          ),
        }}
      />
    </Tabs>
  );
}
