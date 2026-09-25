import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SensorWithReading } from "../types";
import { colors, spacing, radius, shadows } from "../theme";
import { fonts } from "../theme/typography";
import { compassLabel } from "./WindChip";
import { useSettingsStore, formatTemp, formatWind } from "../store/settings";

interface MapCalloutProps {
  sensor: SensorWithReading;
}

const statusColors = {
  online: colors.status.online,
  offline: colors.status.offline,
  alert: colors.status.alert,
};

/**
 * Sensor callout — dark translucent glass pill (matches the map legend and
 * alert ribbon language): status dot + label, node name, big temperature,
 * secondary readings, and a tappable hint. Rendered with tooltip={false} so
 * the dark surface replaces the stock white bubble.
 */
export const MapCallout: React.FC<MapCalloutProps> = ({ sensor }) => {
  const reading = sensor.latestReading;
  const units = useSettingsStore((s) => s.units);
  const temp = reading ? formatTemp(reading.tempC, units) : null;
  const wind = reading?.windMs != null ? formatWind(reading.windMs, units) : null;
  const statusColor = statusColors[sensor.status];
  const displayName = sensor.name.replace(/^HFENS-/, "");

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>{sensor.status}</Text>
        </View>
      </View>
      {reading && temp && (
        <View style={styles.readingsRow}>
          <Text style={styles.temp}>
            {temp.value}
            <Text style={styles.tempUnit}>{temp.label}</Text>
          </Text>
          <View style={styles.secondary}>
            <Text style={styles.secondaryText}>{reading.humidityPct.toFixed(0)}% RH</Text>
            <Text style={styles.secondaryText}>VOC {reading.voc.toFixed(0)}</Text>
          </View>
        </View>
      )}
      {wind && reading?.windDirDeg != null && (
        <Text style={styles.windText}>
          Wind {wind.value} {wind.label} · from {compassLabel(reading.windDirDeg)}
        </Text>
      )}
      <Text style={styles.hint}>Tap for details →</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(28, 24, 20, 0.92)",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minWidth: 180,
    maxWidth: 240,
    ...shadows.md,
    borderCurve: "continuous",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    marginBottom: spacing.xs + 1,
  },
  name: {
    flex: 1,
    fontFamily: fonts.serif,
    fontSize: 14,
    color: "#fff",
    letterSpacing: -0.2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  readingsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.md,
  },
  temp: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
    fontVariant: ["tabular-nums"],
    lineHeight: 26,
  },
  tempUnit: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.6)",
  },
  secondary: {
    paddingBottom: 2,
    gap: 1,
  },
  secondaryText: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.72)",
    fontVariant: ["tabular-nums"],
  },
  windText: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.72)",
    marginTop: spacing.xs + 1,
  },
  hint: {
    fontSize: 10,
    color: colors.emberLight,
    fontWeight: "700",
    marginTop: spacing.sm - 2,
  },
});
