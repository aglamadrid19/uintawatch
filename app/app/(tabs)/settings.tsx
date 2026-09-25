import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BrandedHeader } from "../../src/components";
import { colors, spacing, radius, shadows } from "../../src/theme";
import { fonts } from "../../src/theme/typography";
import { useSettingsStore, Units, MapType } from "../../src/store/settings";

const SITE = "https://uintawatch.com";

function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <View style={styles.rowGroup}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.segmentBar}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.segmentBtn, value === opt.value && styles.segmentActive]}
            onPress={() => onChange(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === opt.value }}
            accessibilityLabel={`${label}: ${opt.label}`}
          >
            <Text style={[styles.segmentText, value === opt.value && styles.segmentTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { units, mapType, setUnits, setMapType } = useSettingsStore();

  return (
    <View style={styles.container}>
      <BrandedHeader hideBadge />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Preferences</Text>
        </View>
        <View style={styles.card}>
          <Segmented
            label="UNITS"
            value={units}
            onChange={(v: Units) => setUnits(v)}
            options={[
              { value: 'metric', label: 'Metric (°C, m/s)' },
              { value: 'imperial', label: 'Imperial (°F, mph)' },
            ]}
          />
          <View style={styles.divider} />
          <Segmented
            label="MAP TYPE"
            value={mapType}
            onChange={(v: MapType) => setMapType(v)}
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'satellite', label: 'Satellite' },
              { value: 'terrain', label: 'Terrain' },
            ]}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Data Source</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.dataRow}>
            <View style={styles.dataIconWrap}>
              <Ionicons name="sparkles" size={16} color={colors.ember} />
            </View>
            <View style={styles.dataInfo}>
              <Text style={styles.dataTitle}>Simulated dataset</Text>
              <Text style={styles.dataText}>
                No physical sensor nodes are deployed yet. Every reading, alert,
                and report in this app is a scripted simulation of the network we
                are building. When hardware and backend ingest go live, the app
                switches to real data automatically.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>About</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.aboutText}>
            UintaWatch is an open, off-grid sensing lab for the detection gaps
            that cameras and satellites provably cannot cover — night smoldering,
            cloud-obscured events, and low-intensity smoldering on contained
            fires. We publish hardware, firmware, protocols, raw data, and
            failures.
          </Text>
          <View style={styles.divider} />
          {[
            { icon: "globe-outline" as const, label: "uintawatch.com", url: SITE },
            { icon: "document-text-outline" as const, label: "Privacy policy", url: `${SITE}/privacy` },
            { icon: "help-circle-outline" as const, label: "Open questions", url: `${SITE}/open-questions` },
          ].map((l, i) => (
            <TouchableOpacity
              key={i}
              style={styles.linkRow}
              onPress={() => Linking.openURL(l.url).catch(() => {})}
              accessibilityRole="link"
              accessibilityLabel={l.label}
            >
              <Ionicons name={l.icon} size={17} color={colors.forest} />
              <Text style={styles.linkRowText}>{l.label}</Text>
              <Ionicons name="chevron-forward" size={15} color={colors.inkDim} />
            </TouchableOpacity>
          ))}
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Open source · Apache-2.0</Text>
            <Text style={styles.metaText}>Built in the open on the Uintah Basin</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 120 },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    ...shadows.sm,
    borderCurve: "continuous",
  },
  rowGroup: {
    marginBottom: spacing.lg,
  },
  rowLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.inkMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  segmentBar: {
    flexDirection: "row",
    backgroundColor: colors.bgAlt,
    borderRadius: radius.full,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing.sm - 3,
    minHeight: 44,
    justifyContent: "center",
    borderRadius: radius.full,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: colors.ink,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.inkMuted,
  },
  segmentTextActive: {
    color: colors.surface,
  },
  divider: {
    height: 1,
    backgroundColor: colors.bgAlt,
    marginVertical: spacing.lg,
  },
  dataRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  dataIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.emberGlow,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  dataInfo: {
    flex: 1,
  },
  dataTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.emberText,
    marginBottom: spacing.xs,
  },
  dataText: {
    fontSize: 13,
    color: colors.inkSoft,
    lineHeight: 19,
  },
  aboutText: {
    fontSize: 14,
    color: colors.inkSoft,
    lineHeight: 21,
    letterSpacing: -0.1,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  linkRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
    letterSpacing: -0.2,
  },
  metaRow: {
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 11,
    color: colors.inkMuted,
    fontFamily: fonts.mono,
  },
});
