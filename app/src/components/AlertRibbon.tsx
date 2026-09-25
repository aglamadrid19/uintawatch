import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing, radius, shadows } from "../theme";
import { useSettingsStore, formatTemp } from "../store/settings";
import { SensorWithReading } from "../types";

interface AlertRibbonProps {
  /** Sensor nodes currently in alert status */
  alerting: SensorWithReading[];
}

/**
 * Floating fire-orange alert banner pinned over the map. Renders only while
 * at least one sensor is in alert status; taps through to the Alerts tab.
 * Spring slide-down entrance + a gentle "breathing" pulse on the alert icon.
 */
export const AlertRibbon: React.FC<AlertRibbonProps> = ({ alerting }) => {
  const router = useRouter();
  const units = useSettingsStore(s => s.units);
  const slide = useRef(new Animated.Value(-64)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (alerting.length === 0) return;
    Animated.parallel([
      Animated.spring(slide, {
        toValue: 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.45, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [alerting.length, slide, fade, pulse]);

  if (alerting.length === 0) return null;

  const first = alerting[0];
  const reading = first.latestReading;
  const temp = reading ? formatTemp(reading.tempC, units) : null;
  const n = alerting.length;
  const detail =
    temp && temp.label === "°F" ? `${temp.value}°F` : temp ? `${temp.value}°C` : "";
  const relSeen = reading ? relTime(reading.timestamp) : "recently";

  return (
    <Animated.View
      style={[styles.wrap, { transform: [{ translateY: slide }], opacity: fade }]}
    >
      <TouchableOpacity
        style={styles.ribbon}
        activeOpacity={0.85}
        onPress={() => router.push("/(tabs)/alerts")}
        accessibilityRole="button"
        accessibilityLabel={`${n} active alert${n > 1 ? "s" : ""}, view alert feed`}
      >
        <Animated.View style={{ opacity: pulse }}>
          <View style={styles.iconRing}>
            <View style={styles.iconCore}>
              <Ionicons name="warning" size={13} color="#fff" />
            </View>
          </View>
        </Animated.View>
        <View style={styles.textCol}>
          <Text style={styles.headline} numberOfLines={1}>
            {n} ALERT{n > 1 ? "S" : ""} — {first.name}
          </Text>
          <Text style={styles.subline} numberOfLines={1}>
            Smoke detected{detail ? ` · ${detail}` : ""} · {relSeen}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.9)" />
      </TouchableOpacity>
    </Animated.View>
  );
};

function relTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
  },
  ribbon: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    backgroundColor: colors.fire,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
    ...shadows.glow,
    borderCurve: "continuous",
  },
  iconRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCore: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: {
    flex: 1,
    gap: 1,
  },
  headline: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
  },
  subline: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
});
