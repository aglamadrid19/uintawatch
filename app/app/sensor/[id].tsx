import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiService } from "../../src/services/api";
import { SensorWithReading, Reading } from "../../src/types";
import { colors, spacing, radius, shadows, MAP_MARKER_COLORS } from "../../src/theme";
import { fonts } from "../../src/theme/typography";
import { MetricChart, WindChip, compassLabel } from "../../src/components";
import { useSettingsStore, formatTemp, formatWind } from "../../src/store/settings";

export default function SensorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const units = useSettingsStore((s) => s.units);
  const [sensor, setSensor] = useState<SensorWithReading | null>(null);
  const [history, setHistory] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sensorData, historyData] = await Promise.all([
          apiService.getSensor(id),
          apiService.getSensorHistory(id, { limit: 24 }),
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

  function batteryHealth(mv?: number): { label: string; color: string } | null {
    if (mv == null) return null;
    if (mv >= 4000) return { label: "Healthy", color: colors.forest };
    if (mv >= 3700) return { label: "Good", color: colors.emberText };
    return { label: "Low — solar needed", color: colors.danger };
  }

  function signalQuality(rssi?: number): { label: string; color: string } | null {
    if (rssi == null) return null;
    if (rssi >= -70) return { label: "Strong", color: colors.forest };
    if (rssi >= -85) return { label: "Moderate", color: colors.emberText };
    return { label: "Weak", color: colors.danger };
  }

  const battery = batteryHealth(reading?.batteryMv);
  const signal = signalQuality(reading?.rssi);

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
                <Text style={styles.name} selectable accessibilityLabel={`${sensor.name} sensor, ${sensor.status} status`}>{sensor.name}</Text>
                <Text style={styles.id}>{sensor.id}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + "18" }]} accessibilityLabel={`${sensor.name} sensor, ${sensor.status} status`}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>{sensor.status}</Text>
              </View>
            </View>
            <Text style={styles.lastSeen} selectable>
              Last reading {formatRelativeTime(new Date(sensor.lastSeen))}
            </Text>
            {sensor.nodeConfig && (
              <View style={styles.configChip}>
                <Ionicons name="hardware-chip-outline" size={12} color={colors.forest} />
                <Text style={styles.configText}>{sensor.nodeConfig}</Text>
              </View>
            )}
          </View>

          {reading && (
            <>
              <Text style={styles.sectionTitle}>Current Readings</Text>
              <View style={styles.readingsGrid}>
                <View style={styles.readingCard}>
                  <Text style={styles.readingLabel} selectable>Temperature</Text>
                  <Text style={styles.readingValue} selectable>
                    {formatTemp(reading.tempC, units).value}{formatTemp(reading.tempC, units).label}
                  </Text>
                </View>
                <View style={styles.readingCard}>
                  <Text style={styles.readingLabel} selectable>Humidity</Text>
                  <Text style={styles.readingValue} selectable>{reading.humidityPct.toFixed(0)}%</Text>
                </View>
                <View style={styles.readingCard}>
                  <Text style={styles.readingLabel} selectable>Pressure</Text>
                  <Text style={styles.readingValue} selectable>{reading.pressureHPa.toFixed(0)} hPa</Text>
                </View>
                <View style={styles.readingCard}>
                  <Text style={styles.readingLabel} selectable>Air Quality</Text>
                  <Text style={styles.readingValue} selectable>{reading.voc.toFixed(0)} VOC</Text>
                </View>
                <View style={styles.readingCard}>
                  <Text style={styles.readingLabel} selectable>Battery</Text>
                  <Text style={[styles.readingValue, { color: battery?.color ?? colors.ink }]} selectable>
                    {(reading.batteryMv / 1000).toFixed(2)}V
                  </Text>
                  {battery && <Text style={[styles.readingSub, { color: battery.color }]}>{battery.label}</Text>}
                </View>
                <View style={styles.readingCard}>
                  <Text style={styles.readingLabel} selectable>Signal</Text>
                  <Text style={[styles.readingValue, { color: signal?.color ?? colors.ink }]} selectable>
                    {reading.rssi} dBm
                  </Text>
                  {signal && <Text style={[styles.readingSub, { color: signal.color }]}>{signal.label}</Text>}
                </View>
              </View>

              {/* Wind — first-class measurement */}
              <Text style={styles.sectionTitle}>Wind at Node</Text>
              <View style={styles.windCard}>
                <View style={styles.windLgRow}>
                  <View style={styles.windArrowBox}>
                    <Ionicons
                      name="arrow-down"
                      size={26}
                      color={colors.sky}
                      style={{ transform: [{ rotate: `${(reading.windDirDeg ?? 0) + 180}deg` }] }}
                    />
                  </View>
                  <View style={styles.windLgInfo}>
                    <Text style={styles.windLgValue}>
                      {reading.windMs != null ? formatWind(reading.windMs, units).value + " " + formatWind(reading.windMs, units).label : "No data"}
                    </Text>
                    <Text style={styles.windLgMeta}>
                      from {reading.windDirDeg != null ? `${compassLabel(reading.windDirDeg)} (${Math.round(reading.windDirDeg)}°)` : "—"}
                    </Text>
                  </View>
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

          {/* Mesh health */}
          <Text style={styles.sectionTitle}>Mesh Health</Text>
          <View style={styles.meshCard}>
            <MeshRow icon="git-branch-outline" label="Hops to gateway" value={sensor.hops != null ? `${sensor.hops}` : "—"} />
            <MeshRow icon="server-outline" label="Gateway" value={sensor.gateway ?? "—"} />
            <MeshRow icon="sparkles-outline" label="Firmware" value={sensor.firmware ?? "—"} />
            <MeshRow icon="time-outline" label="Uptime" value={sensor.uptimeH != null ? `${sensor.uptimeH} h` : "—"} />
          </View>

          {history.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>24h Charts</Text>
              <MetricChart readings={history} units={units} />
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const MeshRow: React.FC<{ icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.meshRow}>
    <Ionicons name={icon} size={15} color={colors.inkMuted} />
    <Text style={styles.meshLabel}>{label}</Text>
    <Text style={styles.meshValue}>{value}</Text>
  </View>
);

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
    paddingBottom: spacing.xxl + spacing.md,
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
    fontFamily: fonts.mono,
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
  configChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    backgroundColor: colors.forestGlow,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
  },
  configText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.forest,
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.inkMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    marginTop: spacing.xl,
    textTransform: "uppercase",
  },
  readingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  readingCard: {
    width: "48%",
    flexGrow: 1,
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
    fontVariant: ['tabular-nums'],
  },
  readingSub: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  windCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.sm,
    borderCurve: "continuous",
  },
  windLgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  windArrowBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.skyLight + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  windLgInfo: {
    flex: 1,
  },
  windLgValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  windLgMeta: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
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
    fontFamily: fonts.mono,
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
  meshCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.sm,
    borderCurve: "continuous",
  },
  meshRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgAlt,
  },
  meshLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.inkSoft,
  },
  meshValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    fontFamily: fonts.mono,
  },
});
