import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme";

/**
 * Persistent "Simulated data" indicator. Every node, reading, and alert in
 * the app comes from the scripted simulation dataset (no physical nodes are
 * deployed); this badge keeps the demo honest (positioning doc: never imply
 * the network is live when it is not).
 */
export const SimulatedBadge: React.FC<{ compact?: boolean }> = ({ compact }) => {
  if (compact) {
    return (
      <View style={styles.compactWrap}>
        <View style={styles.dot} />
        <Text style={styles.compactText}>Simulated data</Text>
      </View>
    );
  }
  return (
    <View style={styles.wrap} accessibilityLabel="Simulated data — scripted demo network, no real sensor nodes deployed yet">
      <Ionicons name="sparkles" size={12} color={colors.emberText} />
      <Text style={styles.text}>Simulated data</Text>
      <Text style={styles.hint}>· scripted demo network</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.emberGlow,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    gap: spacing.xs,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.emberText,
    letterSpacing: 0.3,
  },
  hint: {
    fontSize: 11,
    color: colors.inkMuted,
  },
  compactWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.ember,
  },
  compactText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.inkMuted,
    letterSpacing: 0.3,
  },
});
