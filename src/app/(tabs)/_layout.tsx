import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingAddButton } from '@/components/ui/FloatingAddButton';
import { tabs } from '@/constants/navigation';
import { colors, fonts, layout } from '@/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.flex}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.gold[300],
          tabBarInactiveTintColor: colors.text.muted,
          tabBarLabelStyle: {
            fontFamily: fonts.sans.medium,
            fontSize: 10,
          },
          tabBarStyle: {
            height: layout.tabBarBaseHeight + insets.bottom,
            paddingTop: 6,
            paddingBottom: insets.bottom + 5,
            borderTopColor: colors.line.soft,
            backgroundColor: colors.background.deep,
          },
        }}>
        {tabs.map(({ name, title, icon: Icon }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title,
              tabBarIcon: ({ color, size }) => <Icon color={color} size={size} />,
            }}
          />
        ))}
      </Tabs>

      {/* Global "Add a Book" action, shared by every tab screen. */}
      <FloatingAddButton />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
