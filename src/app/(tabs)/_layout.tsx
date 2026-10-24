import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import type { IconName } from '../../components/ui/Button';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeProvider';

const tabs: { name: string; title: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', title: 'Heute', icon: 'moon-outline', iconActive: 'moon' },
  { name: 'journal', title: 'Tagebuch', icon: 'book-outline', iconActive: 'book' },
  { name: 'program', title: 'Programm', icon: 'compass-outline', iconActive: 'compass' },
  { name: 'stats', title: 'Statistik', icon: 'bar-chart-outline', iconActive: 'bar-chart' },
  { name: 'settings', title: 'Einstellungen', icon: 'settings-outline', iconActive: 'settings' },
];

export default function TabsLayout() {
  const p = useTheme();
  const onboardingDone = useAppStore((s) => s.settings.onboardingDone);
  if (!onboardingDone) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: p.primary,
        tabBarInactiveTintColor: p.textMuted,
        tabBarStyle: { backgroundColor: p.surface, borderTopColor: p.border, minHeight: 64 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        sceneStyle: { backgroundColor: p.background },
      }}
    >
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarAccessibilityLabel: t.title,
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons name={focused ? t.iconActive : t.icon} color={typeof color === 'string' ? color : p.primary} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
