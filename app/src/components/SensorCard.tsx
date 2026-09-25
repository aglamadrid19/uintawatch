import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SensorWithReading } from "../types";
import { colors, spacing, radius, shadows, MAP_MARKER_COLORS } from "../theme";
import { compassLabel } from "./WindChip";
import { useSettingsStore, formatTemp, formatWind } from "../store/settings";

interface SensorCardProps {
  sensor: SensorWithReading;
  onPress: () => void;
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export const SensorCard: React.FC<SensorCardProps> = ({ sensor, onPress }) => {
  const reading = sensor.latestReading;
  const units = useSettingsStore((s) => s.units);
  const temp = reading ? formatTemp(reading.tempC, units) : null;
  const wind = reading?.windMs != null ? formatWind(reading.windMs, units) : null;
  const statusColor = MAP_MARKER_COLORS[sensor.status];
  const isAlert = sensor.status === "alert";
  const bgColor = isAlert ? colors.fireGlow : "transparent";

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${sensor.name}, ${temp ? `${temp.value}${temp.label}` : "no reading"}, ${sensor.status}`}
      accessibilityState={{ disabled: sensor.status === 'offline' }}
      style={[styles.container, isAlert && { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <View style={styles.statusDotWrap}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <View style={[styles.statusPulse, { borderColor: statusColor }]} />
        </View>
        <View style={styles.titleArea}>
          <Text style={styles.name} numberOfLines={1}>{sensor.name}</Text>
          <Text style={styles.meta}>
            {sensor.nodeConfig ?? sensor.id} · {formatRelativeTime(new Date(sensor.lastSeen))}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "18" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{sensor.status}</Text>
        </View>
      </View>

      {reading && temp && (
        <View style={styles.metrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{temp.value}°</Text>
            <Text style={styles.metricLabel}>{temp.label === "°F" ? "Temp °F" : "Temp °C"}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{reading.humidityPct.toFixed(0)}%</Text>
            <Text style={styles.metricLabel}>Humidity</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <View style={styles.windRow}>
              {reading.windDirDeg != null && (
                <Ionicons
                  name="arrow-down"
                  size={11}
                  color={colors.sky}
                  style={{ transform: [{ rotate: `${reading.windDirDeg + 180}deg` }] }}
                />
              )}
              <Text style={styles.metricValue}>
                {wind ? wind.value : "–"}
              </Text>
            </View>
            <Text style={styles.metricLabel}>
              {wind ? wind.label : ""} {reading.windDirDeg != null ? compassLabel(reading.windDirDeg) : ""}
            </Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{reading.voc}</Text>
            <Text style={styles.metricLabel}>VOC</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{(reading.batteryMv / 1000).toFixed(2)}V</Text>
            <Text style={styles.metricLabel}>Battery</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "transparent",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  statusDotWrap: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    position: "relative",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusPulse: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    opacity: 0.3,
  },
  titleArea: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  meta: {
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "capitalize",
  },
  metrics: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.bgAlt,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  windRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.ink,
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: colors.inkMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.bgAlt,
  },
});
