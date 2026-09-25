import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FireReport } from "../types";
import { colors, spacing, radius, shadows, fonts } from "../theme";

interface ReportCardProps {
  report: FireReport;
  onPress?: () => void;
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

/** Community fire/smoke sighting report card. */
export const ReportCard: React.FC<ReportCardProps> = ({ report, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Community report, ${formatRelativeTime(new Date(report.submittedAt))}, ${report.text.substring(0, 60)}`}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="eye" size={16} color={colors.ember} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.time}>{formatRelativeTime(new Date(report.submittedAt))}</Text>
          <View style={[styles.verifiedBadge, report.verified && styles.verifiedBadgeYes]}>
            <Text style={[styles.verifiedText, report.verified && styles.verifiedTextYes]}>
              {report.verified ? "Verified" : "Unverified"}
            </Text>
          </View>
        </View>
        {report.photoUrl ? (
          <Image source={{ uri: report.photoUrl }} style={styles.photo} />
        ) : null}
        <Text style={styles.text} numberOfLines={3} selectable>
          {report.text}
        </Text>
        <Text style={styles.coords} selectable>
          {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: "row",
    ...shadows.sm,
    borderCurve: "continuous",
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.emberGlow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  time: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.emberText,
    letterSpacing: 0.3,
  },
  verifiedBadge: {
    backgroundColor: colors.bgAlt,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  verifiedBadgeYes: {
    backgroundColor: colors.forestGlow,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.inkMuted,
    letterSpacing: 0.3,
  },
  verifiedTextYes: {
    color: colors.forest,
  },
  photo: {
    width: "100%",
    height: 90,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  coords: {
    fontSize: 10,
    color: colors.inkMuted,
    fontFamily: fonts.mono,
    marginTop: spacing.sm,
  },
});
