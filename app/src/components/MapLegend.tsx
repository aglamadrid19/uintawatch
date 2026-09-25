import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, shadows } from "../theme";

/**
 * Map legend — dark translucent pill (per the detailed concept mockup):
 * status dots + labels in white on smoked glass, bottom-left over the map.
 */
export const MapLegend: React.FC = () => {
  return (
    <View style={styles.wrap} accessibilityLabel="Map legend: online, alert, community report">
      <LegendItem color={colors.status.online} label="Online" shape="dot" />
      <LegendItem color={colors.status.alert} label="Alert" shape="dot" />
      <LegendItem color={colors.ember} label="Report" shape="dot" />
    </View>
  );
};

const LegendItem: React.FC<{ color: string; label: string; shape: 'dot' | 'disc' }> = ({ color, label, shape }) => (
  <View style={styles.item}>
    <View style={[shape === 'dot' ? styles.dot : styles.disc, { backgroundColor: color }]} />
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: "rgba(28, 24, 20, 0.78)",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    ...shadows.md,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  disc: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.1,
  },
});
