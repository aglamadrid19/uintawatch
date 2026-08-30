import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNetInfo } from "@react-native-community/netinfo";

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

function OfflineBanner() {
  const netInfo = useNetInfo();
  const offline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
  if (!offline) return null;
  return (
    <View style={{ backgroundColor: "#1C1814", paddingVertical: 8, alignItems: "center" }}>
      <Text style={{ color: "#FAF8F5", fontSize: 13, fontWeight: "600" }}>Offline — showing cached data</Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <OfflineBanner />
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
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
