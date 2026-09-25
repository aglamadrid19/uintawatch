import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../theme";

interface WindChipProps {
  windMs?: number;
  windDirDeg?: number;
  /** Optional unit formatter output */
  speedLabel?: string;
  size?: 'sm' | 'lg';
}

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

export function compassLabel(deg: number): string {
  return COMPASS[Math.round(deg / 22.5) % 16];
}

/**
 * Wind speed + direction chip. Meteorological convention: direction is where
 * the wind comes FROM, so the arrow points where the air is going (dir + 180°).
 */
export const WindChip: React.FC<WindChipProps> = ({ windMs, windDirDeg, speedLabel, size = 'sm' }) => {
  if (windMs == null || windDirDeg == null) {
    return (
      <View style={[styles.chip, styles.muted]}>
        <Ionicons name="leaf" size={size === 'lg' ? 14 : 11} color={colors.inkDim} />
        <Text style={[styles.text, styles.mutedText]}>No wind data</Text>
      </View>
    );
  }

  const dir = compassLabel(windDirDeg);
  return (
    <View style={[styles.chip, size === 'lg' && styles.chipLg]}>
      <View style={[styles.arrowWrap, { transform: [{ rotate: `${windDirDeg + 180}deg` }] }]}>
        <Ionicons
          name="arrow-down"
          size={size === 'lg' ? 15 : 11}
          color={colors.sky}
        />
      </View>
      <Text style={[styles.text, size === 'lg' && styles.textLg]}>
        {speedLabel ?? `${windMs.toFixed(1)} m/s`} {dir}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  chipLg: {
    gap: spacing.sm,
  },
  arrowWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.inkSoft,
    fontVariant: ['tabular-nums'],
  },
  textLg: {
    fontSize: 15,
  },
  muted: {
    opacity: 0.7,
  },
  mutedText: {
    color: colors.inkMuted,
    fontWeight: "400",
  },
});
