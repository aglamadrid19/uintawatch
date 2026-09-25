import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNetInfo } from "@react-native-community/netinfo";
import { useFonts } from "expo-font";
import * as SecureStore from "expo-secure-store";
import { colors, spacing, fonts } from "../src/theme";
import { useSettingsStore } from "../src/store/settings";
import OnboardingScreen from "./onboarding";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const ONBOARDING_KEY = "onboarding.seen";

function OfflineBanner() {
  const netInfo = useNetInfo();
  const insets = useSafeAreaInsets();
  const offline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
  if (!offline) return null;
  return (
    <View style={[styles.offlineBanner, { paddingTop: insets.top + 6 }]}>
      <Text style={styles.offlineText}>Offline — showing cached data</Text>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "DM Serif Display": require("../assets/fonts/DMSerifDisplay-Regular.ttf"),
    "Archivo": require("../assets/fonts/Archivo-Regular.ttf"),
    "Archivo Medium": require("../assets/fonts/Archivo-Medium.ttf"),
    "Archivo SemiBold": require("../assets/fonts/Archivo-SemiBold.ttf"),
    "Archivo Bold": require("../assets/fonts/Archivo-Bold.ttf"),
  });

  const hydrate = useSettingsStore((s) => s.hydrate);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    hydrate();
    SecureStore.getItemAsync(ONBOARDING_KEY)
      .then((v) => setOnboarded(v === "true"))
      .catch(() => setOnboarded(true));
  }, [hydrate]);

  const finishOnboarding = () => {
    setOnboarded(true);
    SecureStore.setItemAsync(ONBOARDING_KEY, "true").catch(() => {});
  };

  if (!fontsLoaded || onboarded === null) {
    return <View style={styles.splash} />;
  }

  if (!onboarded) {
    return <OnboardingScreen onDone={finishOnboarding} />;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <OfflineBanner />
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.ink,
            headerTitleStyle: {
              fontFamily: fonts.bodySemiBold,
              fontSize: 17,
            },
            headerBackTitle: "",
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "" }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.bg },
  offlineBanner: {
    backgroundColor: colors.ink,
    paddingBottom: 8,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  offlineText: {
    color: colors.bg,
    fontSize: 13,
    fontWeight: "600",
  },
});
