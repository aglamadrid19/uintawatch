import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, type ViewStyle } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useReports } from "../../src/hooks";
import { colors, spacing, radius, shadows, UTAH_REGION } from "../../src/theme";
import { fonts } from "../../src/theme/typography";
import { ReportMarker } from "../../src/components";
import { useSettingsStore } from "../../src/store/settings";
import { FireReport } from "../../src/types";

/**
 * Community report detail: full observation text, photo, verified state,
 * time, and where it was seen on the map.
 */
export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: reports } = useReports();
  const mapType = useSettingsStore((s) => s.mapType);

  const report: FireReport | undefined = reports?.find((r) => r.id === id);

  if (!report) {
    return (
      <>
        <Stack.Screen options={{ title: "Report" }} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Report not found</Text>
        </View>
      </>
    );
  }

  const submitted = new Date(report.submittedAt);
  const region = {
    ...UTAH_REGION,
    latitude: report.lat,
    longitude: report.lng,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <>
      <Stack.Screen options={{ title: "Report detail" }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.banner, report.verified ? styles.bannerVerified : styles.bannerUnverified]}>
          <Ionicons name="eye" size={16} color={colors.ember} />
          <Text style={[styles.bannerText, report.verified ? styles.bannerTextVerified : null]}>
            {report.verified ? "Verified sighting" : "Unverified · community observation"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>WHAT WAS SEEN</Text>
          <Text style={styles.message} selectable>{report.text}</Text>
        </View>

        {report.photoUrl ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>PHOTO</Text>
            <Image source={{ uri: report.photoUrl }} style={styles.photo} accessible={true} accessibilityLabel="Report photo" />
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>SUBMITTED</Text>
          <Text style={styles.detailText} selectable>
            {submitted.toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        <View style={styles.mapCard}>
          <MapView
            style={styles.map}
            initialRegion={region}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            mapType={mapType}
          >
            <Marker coordinate={{ latitude: report.lat, longitude: report.lng }} tracksViewChanges={false}>
              <ReportMarker />
            </Marker>
          </MapView>
          <View style={styles.coordsRow}>
            <Ionicons name="location-outline" size={14} color={colors.inkMuted} />
            <Text style={styles.coordsText} selectable>
              {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
            </Text>
          </View>
        </View>

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={16} color={colors.inkMuted} />
          <Text style={styles.noteText}>
            Community reports are unverified observations from people on the
            ground. They are information, not confirmation — always verify
            smoke visually before acting.
          </Text>
        </View>

        <TouchableOpacity
          style={backLinkStyle}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to feed"
        >
          <Ionicons name="chevron-back" size={16} color={colors.fire} />
          <Text style={styles.backLinkText}>Back to feed</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const backLinkStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center" as const,
  justifyContent: "center" as const,
  paddingVertical: spacing.md,
  marginTop: spacing.xs,
};

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
    color: colors.fireText,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerUnverified: {
    backgroundColor: colors.emberGlow,
  },
  bannerVerified: {
    backgroundColor: colors.forestGlow,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.emberText,
    letterSpacing: 0.2,
  },
  bannerTextVerified: {
    color: colors.forest,
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
  detailText: {
    fontSize: 15,
    color: colors.ink,
  },
  photo: {
    width: "100%",
    height: 200,
    borderRadius: radius.lg,
  },
  mapCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing.md,
    ...shadows.sm,
    borderCurve: "continuous",
  },
  map: {
    width: "100%",
    height: 180,
  },
  coordsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.md,
  },
  coordsText: {
    fontSize: 13,
    color: colors.inkMuted,
    fontFamily: fonts.mono,
  },
  note: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 18,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.fireText,
  },
});
