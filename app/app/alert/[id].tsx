import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAlerts, useSensors } from "../../src/hooks";
import { colors, spacing, radius, shadows, MAP_MARKER_COLORS } from "../../src/theme";
import { fonts } from "../../src/theme/typography";
import { Alert, SensorWithReading } from "../../src/types";

const severityConfig = {
  warning: { color: colors.severity.warning, label: "Warning" },
  elevated: { color: colors.severity.elevated, label: "Elevated" },
  critical: { color: colors.severity.critical, label: "Critical" },
};

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: alerts } = useAlerts();
  const { data: sensors } = useSensors();

  const alert: Alert | undefined = alerts?.find((a) => a.id === id);
  const sensor: SensorWithReading | undefined =
    alert?.sensorId ? sensors?.find((s) => s.id === alert.sensorId) : undefined;

  if (!alert) {
    return (
      <>
        <Stack.Screen options={{ title: "Alert" }} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Alert not found</Text>
        </View>
      </>
    );
  }

  const severity = severityConfig[alert.severity] ?? severityConfig.warning;
  const triggered = new Date(alert.triggeredAt);

  return (
    <>
      <Stack.Screen options={{ title: "Alert detail" }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.banner, { backgroundColor: severity.color + "14" }]}>
          <View style={[styles.bannerDot, { backgroundColor: severity.color }]} />
          <View style={styles.bannerTextWrap}>
            <Text style={[styles.severityText, { color: severity.color }]}>
              {severity.label} · {alert.type.replace("_", " ")}
            </Text>
            <Text style={styles.timeText}>
              {triggered.toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" · "}
              {alert.resolved ? "Resolved" : "Active"}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Event</Text>
          <Text style={styles.message} selectable>{alert.message}</Text>
        </View>

        {sensor && (
          <TouchableOpacity
            style={styles.sensorCard}
            onPress={() => router.push(`/sensor/${sensor.id}`)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`View sensor ${sensor.name}`}
          >
            <View style={styles.sensorLeft}>
              <View style={[styles.sensorDot, { backgroundColor: MAP_MARKER_COLORS[sensor.status] }]} />
              <View>
                <Text style={styles.sensorName}>{sensor.name}</Text>
                <Text style={styles.sensorMeta}>{sensor.nodeConfig ?? sensor.id}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.inkDim} />
          </TouchableOpacity>
        )}

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={16} color={colors.inkMuted} />
          <Text style={styles.noteText}>
            Detection logic is under active test in the lab. Sensor alerts are
            observations, so always verify smoke visually before acting. Report
            what you see from the Report tab.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + spacing.md,
  },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
    color: colors.fire,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  bannerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  bannerTextWrap: {
    flex: 1,
  },
  severityText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  timeText: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
    borderCurve: "continuous",
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.inkMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 16,
    color: colors.ink,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  sensorCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.sm,
    borderCurve: "continuous",
  },
  sensorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  sensorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sensorName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
    letterSpacing: -0.2,
  },
  sensorMeta: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 1,
  },
  note: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 18,
  },
});
