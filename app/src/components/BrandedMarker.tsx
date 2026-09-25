import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Platform, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "../theme";

interface BrandedMarkerProps {
  status: 'online' | 'offline' | 'alert';
  /** Small count of nearby reports, optional */
}

/**
 * Ripple ring behind a marker — a single looping native-driver Animated.Value
 * (transform + opacity only, no JS thread work), so it stays cheap even with
 * the whole network on screen.
 */
const PulseRing: React.FC<{
  color: string;
  duration: number;
  maxOpacity: number;
  scaleTo?: number;
}> = ({ color, duration, maxOpacity, scaleTo = 2.1 }) => {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, duration]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulse,
        {
          backgroundColor: color,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [maxOpacity, 0] }),
          transform: [{
            scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, scaleTo] }),
          }],
        },
      ]}
    />
  );
};

/**
 * Custom branded map marker for sensor nodes — a filled status disc with a
 * white core and a soft outer ring; alert nodes show a flame glyph. Rendered
 * as a native View so it inherits the brand palette (no image assets needed).
 */
export const SensorMarker: React.FC<BrandedMarkerProps> = ({ status }) => {
  // Android markers are rendered natively; freeze re-renders once mounted
  const [track, setTrack] = useState(Platform.OS === "android");
  useEffect(() => {
    if (Platform.OS === "android") {
      const t = setTimeout(() => setTrack(false), 700);
      return () => clearTimeout(t);
    }
  }, []);

  const statusColor =
    status === 'online' ? colors.status.online
    : status === 'alert' ? colors.status.alert
    : colors.status.offline;

  return (
    <View style={styles.wrap} pointerEvents="none">
      {status === 'alert' && (
        <PulseRing color={statusColor} duration={1600} maxOpacity={0.45} />
      )}
      {status === 'online' && (
        <PulseRing color={statusColor} duration={3600} maxOpacity={0.2} scaleTo={1.7} />
      )}
      <View style={[styles.ring, { borderColor: statusColor }]} />
      <View style={[styles.disc, { backgroundColor: statusColor }, track && styles.tracking]}>
        {status === 'alert' ? (
          <Ionicons name="flame" size={13} color="#fff" />
        ) : (
          <View style={[styles.core, { backgroundColor: status === 'offline' ? colors.surface : '#fff' }]} />
        )}
      </View>
      {status === 'alert' && (
        <View style={[styles.alertFlag, { backgroundColor: colors.fireDark }]}>
          <Text style={styles.alertFlagText}>!</Text>
        </View>
      )}
    </View>
  );
};

/** Marker for community reports (ember disc with eye glyph). */
export const ReportMarker: React.FC = () => {
  const [track, setTrack] = useState(Platform.OS === "android");
  useEffect(() => {
    if (Platform.OS === "android") {
      const t = setTimeout(() => setTrack(false), 700);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <View style={styles.wrap} pointerEvents="none">
      <PulseRing color={colors.ember} duration={3600} maxOpacity={0.2} scaleTo={1.7} />
      <View style={[styles.disc, { backgroundColor: colors.ember }, track && styles.tracking]}>
        <Ionicons name="eye" size={13} color="#fff" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    opacity: 0.28,
  },
  pulse: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  disc: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    ...shadows.sm,
  },
  core: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertFlag: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  alertFlagText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#fff",
    marginTop: -1,
  },
  tracking: {
    opacity: 0.999,
  },
});
