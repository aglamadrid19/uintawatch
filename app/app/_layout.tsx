import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#FAF8F5" },
          headerTintColor: "#1C1814",
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 17,
          },
          headerBackTitle: "",
          headerShadowVisible: false,
          contentStyle: { backgroundColor: "#FAF8F5" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
