import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useLocalSearchParams, Stack } from "expo-router";
import { apiService } from "../../src/services/api";
import { SensorWithReading, Reading } from "../../src/types";
import { colors, spacing, radius, shadows, MAP_MARKER_COLORS } from "../../src/constants/theme";

const { width } = Dimensions.get("window");

export default function SensorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sensor, setSensor] = useState<SensorWithReading | null>(null);
  const [history, setHistory] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sensorData, historyData] = await Promise.all([
          apiService.getSensor(id),
          apiService.getSensorHistory(id, { limit: 50 }),
        ]);
        setSensor(sensorData);
        setHistory(historyData);
      } catch (err) {
        console.error("Failed to fetch sensor data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.fire} />
        <Text style={styles.loadingText}>Loading sensor...</Text>
      </View>
    );
  }

  if (!sensor) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Sensor not found</Text>
      </View>
    );
  }

  const reading = sensor.latestReading;
  const last24h = history.slice(-24);
  const statusColor = MAP_MARKER_COLORS[sensor.status];

  function formatRelativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <>
      <Stack.Screen options={{ title: sensor.name }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.mapSection}>
          <MapView
            style={styles.map}
            initialRegion={{ latitude: sensor.lat, longitude: sensor.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker coordinate={{ latitude: sensor.lat, longitude: sensor.lng }} pinColor={statusColor} />
          </MapView>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.titleArea}>
                <Text style={styles.name}>{sensor.name}</Text>
                <Text style={styles.id}>{sensor.id}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + "18" }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>{sensor.status}</Text>
              </View>
            </View>
            <Text style={styles.lastSeen}>
              Last reading {formatRelativeTime(new Date(sensor.lastSeen))}
            </Text>
          </View>

          {reading && (
            <>
              <Text style={styles.sectionTitle}>Current Readings</Text>
              <View style={styles.readingsGrid}>
                <View style={styles.readingCard}>
                  <Text style={styles.readingLabel}>Temperature</Text>
                  <Text style={styles.readingValue}>{reading.tempC.toFixed(1)}°C</Text>
                </View>
                <View style={styles.readingCard}>
                  <Text style={styles.readingLabel}>Humidity</Text>
                  <Text style={styles.readingValue}>{reading.humidityPct.toFixed(0)}%</Text>
                </View>
                <View style={styles.readingCard}>
                  <Text style={styles.readingLabel}>Pressure</Text>
                  <Text style={styles.readingValue}>{reading.pressureHPa.toFixed(0)} hPa</Text>
                </View>
                <View style={styles.readingCard}>
                  <Text style={styles.readingLabel}>Air Quality</Text>
                  <Text style={styles.readingValue}>{reading.voc.toFixed(0)} VOC</Text>
                </View>
                <View style={styles.readingCard}>
                  <Text style={styles.readingLabel}>Battery</Text>
                  <Text style={styles.readingValue}>{(reading.batteryMv / 1000).toFixed(2)}V</Text>
                </View>
                <View style={styles.readingCard}>
                  <Text style={styles.readingLabel}>Signal</Text>
                  <Text style={styles.readingValue}>{reading.rssi} dBm</Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.sectionRow}>
            <View style={styles.sectionHalf}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.coordsBox}>
                <Text style={styles.coordsText} selectable>
                  {sensor.lat.toFixed(6)}
                </Text>
                <Text style={styles.coordsText} selectable>
                  {sensor.lng.toFixed(6)}
                </Text>
              </View>
            </View>
            <View style={styles.sectionHalf}>
              <Text style={styles.sectionTitle}>Network</Text>
              <View style={styles.networkBox}>
                <View style={styles.networkStat}>
                  <Text style={styles.networkLabel}>Status</Text>
                  <Text style={[styles.networkValue, { color: statusColor }]}>{sensor.status}</Text>
                </View>
              </View>
            </View>
          </View>

          {last24h.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>24h History</Text>
              <View style={styles.historyCard}>
                {last24h.slice(-10).reverse().map((r, i) => (
                  <View
                    key={i}
                    style={[styles.historyRow, i < Math.min(last24h.length, 10) - 1 && styles.historyRowBorder]}
                  >
                    <Text style={styles.historyTime}>{formatTime(new Date(r.timestamp))}</Text>
                    <View style={styles.historyCapsule}>
                      <Text style={styles.historyTemp}>{r.tempC.toFixed(1)}°C</Text>
                    </View>
                    <View style={styles.historyBar}>
                      <View
                        style={[
                          styles.historyBarFill,
                          {
                            width: `${Math.min((r.tempC / 60) * 100, 100)}%`,
                            backgroundColor:
                              r.tempC > 42 ? colors.fire : r.tempC > 35 ? colors.ember : colors.forest,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.historyHumidity}>{r.humidityPct.toFixed(0)}%</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </>
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
  errorText: {
    fontSize: 16,
    color: colors.fire,
  },
  mapSection: {
    width: "100%",
    height: 200,
  },
  map: { flex: 1 },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  titleArea: {
    flex: 1,
    marginRight: spacing.md,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  id: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: spacing.xs,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "capitalize",
  },
  lastSeen: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.inkMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    textTransform: "uppercase",
  },
  readingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  readingCard: {
    width: (width - spacing.lg * 2 - spacing.sm) / 2,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: "center",
    ...shadows.sm,
    borderCurve: "continuous",
  },
  readingLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.inkMuted,
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  readingValue: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  sectionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  sectionHalf: {
    flex: 1,
  },
  coordsBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.sm,
    borderCurve: "continuous",
  },
  coordsText: {
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: colors.inkSoft,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  networkBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.sm,
    borderCurve: "continuous",
  },
  networkStat: {},
  networkLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.inkMuted,
    marginBottom: spacing.xs,
  },
  networkValue: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: -0.3,
    textTransform: "capitalize",
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.sm,
    borderCurve: "continuous",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  historyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.bgAlt,
  },
  historyTime: {
    fontSize: 12,
    color: colors.inkMuted,
    width: 46,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  historyCapsule: {
    backgroundColor: colors.bgAlt,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 48,
    alignItems: "center",
  },
  historyTemp: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
  },
  historyBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.bgAlt,
    borderRadius: 3,
    overflow: "hidden",
  },
  historyBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  historyHumidity: {
    fontSize: 11,
    color: colors.sky,
    fontWeight: "600",
    width: 32,
    textAlign: "right",
  },
});
