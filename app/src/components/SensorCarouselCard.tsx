import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SensorWithReading } from "../types";
import { colors, spacing, radius, shadows, MAP_MARKER_COLORS } from "../theme";
import { useSettingsStore, formatTemp } from "../store/settings";

export const CARD_WIDTH = 280;
export const CARD_GAP = 12;

interface SensorCarouselCardProps {
  sensor: SensorWithReading;
  active: boolean;
  onPress: () => void;
}

/**
 * Compact horizontal-carousel sensor card (detailed-mockup layout): leading
 * status disc with antenna glyph, name + location, status badge, then a
 * temperature | battery/RH metric row. The active card springs from 0.96 to
 * 1.0 scale; alerting nodes get the fire-glow treatment.
 */
export const SensorCarouselCard: React.FC<SensorCarouselCardProps> = ({ sensor, active, onPress }) => {
  const units = useSettingsStore(s => s.units);
  const scale = useRef(new Animated.Value(active ? 1 : 0.96)).current;
  const reading = sensor.latestReading;
  const statusColor = MAP_MARKER_COLORS[sensor.status];
  const isAlert = sensor.status === "alert";
  const temp = reading ? formatTemp(reading.tempC, units) : null;
  // Full name at card size ("HFENS-Burner-Ridge-01" fits at 14pt); the
  // location line carries the node's basin identity without duplicating the name
  // Card display name: drop the "HFENS-" prefix so the full node name fits
  // the card width without truncation
  const displayName = sensor.name.replace(/^HFENS-/, "");
  const location = "Uintah Basin node";

  useEffect(() => {
    Animated.spring(scale, {
      toValue: active ? 1 : 0.96,
      useNativeDriver: true,
      speed: 26,
      bounciness: 6,
    }).start();
  }, [active, scale]);

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[styles.card, isAlert ? styles.cardAlert : null]}
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`${sensor.name}, ${temp ? `${temp.value}${temp.label}` : "no reading"}, ${sensor.status}, view details`}
      >
        <View style={styles.topRow}>
          <View style={[styles.iconDisc, { backgroundColor: statusColor }]}>
            <Ionicons name="radio-outline" size={18} color="#fff" />
          </View>
          <View style={styles.nameCol}>
            <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.location} numberOfLines={1}>{location}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{sensor.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {reading && temp ? (
          <View style={styles.metrics}>
            <View style={styles.metricItem}>
              <Ionicons
                name="thermometer"
                size={18}
                color={isAlert ? colors.fireText : colors.inkSoft}
              />
              <Text style={[styles.metricValue, isAlert && styles.metricValueAlert]}>
                {temp.value}°
              </Text>
              <Text style={styles.metricLabel}>Temp</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Ionicons name="battery-half" size={18} color={colors.inkSoft} />
              <Text style={styles.metricValue}>
                {Math.round((reading.batteryMv / 4200) * 100)}%
              </Text>
              <Text style={styles.metricLabel}>Batt</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noReading}>No recent reading</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.sm,
    borderCurve: "continuous",
  },
  cardAlert: {
    backgroundColor: colors.fireGlow,
    borderWidth: 1,
    borderColor: colors.fire + "55",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
  },
  iconDisc: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  nameCol: {
    flex: 1,
    gap: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.2,
  },
  location: {
    fontSize: 11,
    color: colors.inkMuted,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.bgAlt,
    marginTop: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  metrics: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.3,
    fontVariant: ["tabular-nums"],
  },
  metricValueAlert: {
    color: colors.fireText,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.inkMuted,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.bgAlt,
  },
  noReading: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: "center",
  },
});
