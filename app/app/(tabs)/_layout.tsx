import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, shadows } from "../../src/theme";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const iconMap: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
    index: "map",
    alerts: "flame",
    report: "document-text",
  };

  return (
    <View style={{ position: "relative" }}>
      <Ionicons
        name={iconMap[name] || "ellipse"}
        size={focused ? 24 : 22}
        color={focused ? colors.fire : colors.inkMuted}
        style={{
          transform: [{ scale: focused ? 1 : 0.95 }],
        }}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.fire,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.bgAlt,
          height: Platform.select({ ios: 88, android: 64 }),
          paddingBottom: Platform.select({ ios: 32, android: 10 }),
          paddingTop: 10,
          ...shadows.sm,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.3,
          marginTop: 2,
        },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.ink,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 17,
          letterSpacing: -0.3,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Network",
          headerTitle: "Uinta Watch",
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          headerTitle: "Fire Alerts",
          tabBarIcon: ({ focused }) => <TabIcon name="alerts" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          headerTitle: "Report Sighting",
          tabBarIcon: ({ focused }) => <TabIcon name="report" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
