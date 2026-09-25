import { Tabs } from "expo-router";
import { Platform, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { colors, shadows } from "../../src/theme";
import { fonts } from "../../src/theme/typography";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const iconMap: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
    index: "map",
    alerts: "flame",
    report: "document-text",
    lab: "flask-outline",
    settings: "options-outline",
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

export default function TabLayout() {  return (
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
          fontFamily: fonts.bodySemiBold,
          fontSize: 10,
          letterSpacing: 0.3,
          marginTop: 2,
        },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.ink,
        headerTitleStyle: {
          fontFamily: fonts.bodySemiBold,
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
          headerShown: false,
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
          // Hidden from the tab bar (the center slot is the Agent chat);
          // still routable via the Report Smoke CTA and deep links.
          href: null,
          title: "Report",
          headerTitle: "Report Sighting",
        }}
      />
      <Tabs.Screen
        name="agent"
        options={{
          title: "Agent",
          headerShown: false,
          tabBarIcon: () => (
            <View style={styles.centerBtnSlot}>
              <View style={styles.centerBtn}>
                <Image
                  source={require("../../assets/brand-logo.png")}
                  style={styles.centerBtnLogo}
                  contentFit="contain"
                  accessible={false}
                />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="lab"
        options={{
          title: "Lab",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="lab" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Center agent button: raised above the bar (mockup-style float). The brand
  // bee logo fills the fire circle directly (its own rust disc + black/white
  // linework gives the contrast), keeping the highlighted-tab look.
  centerBtnSlot: {
    width: 54,
    height: 28,
    alignItems: "center",
  },
  centerBtn: {
    position: "absolute",
    top: -24,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.fire,
    borderWidth: 4,
    borderColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.glow,
  },
  centerBtnLogo: {
    width: 40,
    height: 40,
  },
});
