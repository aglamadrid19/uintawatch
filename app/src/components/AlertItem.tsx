import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Alert } from "../types";
import { colors, spacing, radius, shadows } from "../theme";

interface AlertItemProps {
  alert: Alert;
  onPress?: () => void;
}

const severityConfig = {
  warning: { color: colors.severity.warning, glow: colors.emberGlow, label: "Warning" },
  elevated: { color: colors.severity.elevated, glow: colors.fireGlow, label: "Elevated" },
  critical: { color: colors.severity.critical, glow: "rgba(220, 38, 38, 0.12)", label: "Critical" },
};

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export const AlertItem: React.FC<AlertItemProps> = ({ alert, onPress }) => {
  const severity = severityConfig[alert.severity] || severityConfig.warning;
  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    if (onPress) onPress();
    setExpanded((e) => !e);
  };

  const truncated = !expanded && alert.message.length > 100;

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityRole={alert.resolved ? "summary" : "alert"}
      accessibilityLabel={`${severity.label}, ${formatRelativeTime(new Date(alert.triggeredAt))}, ${alert.message.substring(0, 50)}${alert.message.length > 50 ? '...' : ''}`}
      accessibilityState={{ disabled: alert.resolved }}
      accessibilityHint={alert.resolved ? "Tap to expand" : "Tap to expand or collapse"}
      style={[styles.container, !alert.resolved && { backgroundColor: severity.glow }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.timeline}>
        <View style={[styles.timelineDot, { backgroundColor: severity.color }]} />
        {!alert.resolved && <View style={[styles.timelinePulse, { borderColor: severity.color }]} />}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.severityText, { color: severity.color }]}>{severity.label}</Text>
          <View style={styles.headerRight}>
            {alert.resolved && (
              <View style={styles.resolvedBadge}>
                <Text style={styles.resolvedText} selectable>Resolved</Text>
              </View>
            )}
            <Text style={styles.time} selectable>{formatRelativeTime(new Date(alert.triggeredAt))}</Text>
          </View>
        </View>

        <Text
          style={styles.message}
          numberOfLines={expanded ? undefined : 2}
          selectable={true}
        >
          {alert.message}
        </Text>

        {truncated && (
          <Text style={styles.expandHint} selectable={true}>Tap to expand</Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.source} selectable={true}>{alert.type.replace("_", " ")}</Text>
          {alert.sensorId && (
            <Text style={styles.sensorId} selectable={true}>{alert.sensorId}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: "row",
    overflow: "hidden",
    ...shadows.sm,
    padding: spacing.lg,
    borderCurve: "continuous",
  },
  timeline: {
    width: 24,
    alignItems: "center",
    marginRight: spacing.md,
    paddingTop: 2,
    position: "relative",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelinePulse: {
    position: "absolute",
    top: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    opacity: 0.35,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  time: {
    fontSize: 11,
    color: colors.inkMuted,
  },
  message: {
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  expandHint: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: "600",
    color: colors.fire,
  },
  resolvedBadge: {
    backgroundColor: colors.forestGlow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  resolvedText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.forest,
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  source: {
    fontSize: 11,
    color: colors.inkMuted,
    textTransform: "capitalize",
  },
  sensorId: {
    fontSize: 10,
    color: colors.inkDim,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
