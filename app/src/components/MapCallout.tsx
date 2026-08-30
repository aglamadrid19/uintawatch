import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SensorWithReading } from "../types";
import { colors, spacing, radius, shadows } from "../constants/theme";

interface MapCalloutProps {
  sensor: SensorWithReading;
}

const statusColors = {
  online: colors.success,
  offline: colors.inkMuted,
  alert: colors.fire,
};

export const MapCallout: React.FC<MapCalloutProps> = ({ sensor }) => {
  const reading = sensor.latestReading;
  const statusColor = statusColors[sensor.status];

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.name} numberOfLines={1}>{sensor.name}</Text>
        <View style={[styles.dot, { backgroundColor: statusColor }]} />
      </View>
      {reading && (
        <View style={styles.readings}>
          <Text style={styles.reading}>{reading.tempC.toFixed(1)}°C</Text>
          <Text style={styles.sep}>·</Text>
          <Text style={styles.reading}>{reading.humidityPct.toFixed(0)}%</Text>
          <Text style={styles.sep}>·</Text>
          <Text style={styles.reading}>VOC {reading.voc}</Text>
        </View>
      )}
      <Text style={styles.hint}>Tap for details →</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    minWidth: 140,
    ...shadows.md,
    borderCurve: "continuous",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
    flex: 1,
    marginRight: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  readings: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  reading: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.inkSoft,
  },
  sep: {
    fontSize: 12,
    color: colors.inkDim,
  },
  hint: {
    fontSize: 10,
    color: colors.fire,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
});
