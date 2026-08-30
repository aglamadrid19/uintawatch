import React, { useCallback, useState } from "react";
import { View, StyleSheet, RefreshControl, ScrollView, Text, useWindowDimensions, ActivityIndicator } from "react-native";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import { useRouter } from "expo-router";
import { useSensors } from "../../src/hooks";
import { SensorWithReading } from "../../src/types";
import { SensorCard, MapCallout } from "../../src/components";
import { colors, spacing, radius, shadows, UTAH_REGION, MAP_MARKER_COLORS } from "../../src/theme";

export default function MapScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const mapHeight = Math.min(width * 0.6, 320);
  const { data: sensors, isLoading, error, refetch } = useSensors(true);
  const [refreshing, setRefreshing] = useState(false);
  const [region] = useState<Region>(UTAH_REGION);
  const [mapReady, setMapReady] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleCardPress = (sensor: SensorWithReading) => {
    router.push(`/sensor/${sensor.id}`);
  };

  const handleCalloutPress = (sensor: SensorWithReading) => {
    router.push(`/sensor/${sensor.id}`);
  };

  if (isLoading && !sensors) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.fire} />
        <Text style={styles.loadingText}>Loading sensor network...</Text>
      </View>
    );
  }

  if (error && !sensors) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMessage}>Unable to load sensor data. Please check your connection and try again.</Text>
      </View>
    );
  }

  const list = sensors ?? [];
  const onlineSensors = list.filter(s => s.status === "online").length;
  const alertSensors = list.filter(s => s.status === "alert").length;
  const totalSensors = list.length;

  return (
    <View style={styles.container}>
      <View style={[styles.mapWrap, { height: mapHeight }]}>
        <MapView
          style={styles.map}
          initialRegion={region}
          showsUserLocation={false}
          showsMyLocationButton={false}
          zoomEnabled={true}
          rotateEnabled={true}
          scrollEnabled={true}
          onMapReady={() => setMapReady(true)}
        >
          {mapReady && sensors?.map((sensor) => (
            <Marker
              key={sensor.id}
              coordinate={{ latitude: sensor.lat, longitude: sensor.lng }}
              pinColor={MAP_MARKER_COLORS[sensor.status]}
            >
              <Callout onPress={() => handleCalloutPress(sensor)}>
                <MapCallout sensor={sensor} />
              </Callout>
            </Marker>
          ))}
        </MapView>

        <View style={styles.statsWrap}>
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalSensors}</Text>
              <Text style={styles.statLabel}>Sensors</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.forest }]}>{onlineSensors}</Text>
              <Text style={styles.statLabel}>Online</Text>
            </View>
            {alertSensors > 0 && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.fire }]}>{alertSensors}</Text>
                  <Text style={styles.statLabel}>Alerts</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.mapFade} pointerEvents="none" />
      </View>

      <View style={styles.listSection}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Sensor Network</Text>
          <Text style={styles.listSubtitle}>{totalSensors} active nodes</Text>
        </View>
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.fire} />
          }
        >
          {sensors?.map((sensor) => (
            <SensorCard key={sensor.id} sensor={sensor} onPress={() => handleCardPress(sensor)} />
          ))}
          {!sensors && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Text style={styles.emptyIcon}>⊙</Text>
              </View>
              <Text style={styles.emptyText}>No sensors detected</Text>
              <Text style={styles.emptySubtext}>Pull down to refresh the network</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 15,
    color: colors.inkMuted,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  mapWrap: {
    width: "100%",
    backgroundColor: colors.bgAlt,
    position: "relative",
  },
  map: { flex: 1 },
  mapFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  statsWrap: {
    position: "absolute",
    top: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: "center",
  },
  statsBar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    ...shadows.md,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.inkMuted,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.bgAlt,
    alignSelf: "center",
  },
  listSection: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.sm,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  listSubtitle: {
    fontSize: 13,
    color: colors.inkMuted,
  },
  list: { flex: 1 },
  listContent: {
    paddingTop: spacing.xs,
    paddingBottom: 100,
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bgAlt,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  emptyIcon: {
    fontSize: 28,
    color: colors.inkMuted,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.inkSoft,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: "center",
  },
});
