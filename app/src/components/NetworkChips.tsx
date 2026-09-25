import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radius, shadows } from "../theme";

interface NetworkChipsProps {
  total: number;
  online: number;
  alerts: number;
}

/**
 * Floating status chips over the map ("5 online · 2 alerts · 8 nodes"),
 * replacing the old stats bar. Staggered fade + scale entrance; the alerts
 * chip fills fire-orange when there is something to see and taps through to
 * the Alerts tab.
 */
export const NetworkChips: React.FC<NetworkChipsProps> = ({ total, online, alerts }) => {
  const router = useRouter();
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const a3 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.stagger(
      60,
      [a1, a2, a3].map((v) =>
        Animated.parallel([
          Animated.timing(v, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.spring(v, {
            toValue: 1,
            useNativeDriver: true,
            speed: 24,
            bounciness: 5,
          }),
        ]),
      ),
    );
    anim.start();
  }, [a1, a2, a3]);

  const hasAlerts = alerts > 0;

  return (
    <View style={styles.row}>
      <Animated.View
        style={[
          styles.chip,
          { opacity: a1, transform: [{ scale: a1 }] },
        ]}
      >
        <View style={[styles.dot, { backgroundColor: colors.status.online }]} />
        <Text style={styles.chipText}>{online} online</Text>
      </Animated.View>

      <Animated.View style={[{ opacity: a2, transform: [{ scale: a2 }] }]}>
        <TouchableOpacity
          style={[styles.chip, hasAlerts ? styles.chipAlert : null]}
          activeOpacity={0.8}
          disabled={!hasAlerts}
          onPress={() => router.push("/(tabs)/alerts")}
          accessibilityRole="button"
          accessibilityLabel={`${alerts} active alert${alerts === 1 ? "" : "s"}, view alert feed`}
        >
          <View style={[styles.dot, { backgroundColor: hasAlerts ? "#fff" : colors.status.alert }]} />
          <Text style={[styles.chipText, hasAlerts ? { color: "#fff" } : null]}>
            {alerts} alert{alerts === 1 ? "" : "s"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.chip,
          { opacity: a3, transform: [{ scale: a3 }] },
        ]}
      >
        <IoniconsNode />
        <Text style={styles.chipText}>{total} nodes</Text>
      </Animated.View>
    </View>
  );
};

const IoniconsNode: React.FC = () => (
  <View style={[styles.nodeIcon, { backgroundColor: colors.status.online + "22" }]}>
    <View style={[styles.nodeIconInner, { backgroundColor: colors.status.online }]} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    minHeight: 44,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    ...shadows.md,
  },
  chipAlert: {
    backgroundColor: colors.fire,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.1,
  },
  nodeIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  nodeIconInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
