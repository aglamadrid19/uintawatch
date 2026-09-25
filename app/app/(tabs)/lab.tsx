import React from "react";
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BrandedHeader } from "../../src/components";
import { colors, spacing, radius, shadows } from "../../src/theme";
import { fonts } from "../../src/theme/typography";

const SITE = "https://uintawatch.com";

const LEADERBOARD = [
  { config: "A — BME688 only", d25: "?", d50: "?", d100: "?", alerts: "?", median: "?", power: "?", cost: "$55" },
  { config: "B — BME688 + PM", d25: "?", d50: "?", d100: "?", alerts: "?", median: "?", power: "?", cost: "$75" },
  { config: "C — BME688 + PM + CO", d25: "?", d50: "?", d100: "?", alerts: "?", median: "?", power: "?", cost: "$95" },
  { config: "D — C + wind", d25: "?", d50: "?", d100: "?", alerts: "?", median: "?", power: "?", cost: "$110" },
  { config: "E — BME280 (control)", d25: "?", d50: "?", d100: "?", alerts: "?", median: "?", power: "?", cost: "$40" },
];

const NETWORKING = [
  { transport: "Meshtastic", range: "?", delivery: "?", latency: "?" },
  { transport: "Raw LoRa", range: "?", delivery: "?", latency: "?" },
  { transport: "LoRaWAN", range: "?", delivery: "?", latency: "?" },
];

const QUESTIONS = [
  {
    q: "Can a ~$100 open node detect nighttime smoldering at 1 km?",
    status: "Nodes in build — first burns planned",
    done: false,
  },
  {
    q: "What false-alarm rate does far-field regional smoke cause?",
    status: "Measuring now on open data (NRCan)",
    done: true,
  },
  {
    q: "Can multi-node corroboration beat the published 30% small-fire detection?",
    status: "Designing the corroboration experiment",
    done: false,
  },
  {
    q: "What does the mesh actually deliver through real terrain?",
    status: "Networking benchmark planned",
    done: false,
  },
];

/** Reference bar — the published result we are trying to match or beat. */
const REFERENCE_BAR = "Published bar (NRCan 2026, DHS-vendor sensors): 100% detection on fires >100 ha (median 1.5 km); 30% on fires ≤1 ha; nighttime smoldering detection where satellites see nothing.";

export default function LabScreen() {
  const open = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <View style={styles.container}>
      <BrandedHeader hideBadge />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.intro}>
          <View style={styles.introIconWrap}>
            <Ionicons name="flask-outline" size={22} color={colors.forest} />
          </View>
          <Text style={styles.introTitle}>The Lab</Text>
        </View>

        <View style={styles.stanceCard}>
          <Text style={styles.stanceTitle}>What this is</Text>
          <Text style={styles.stanceText}>
            UintaWatch is an open field lab for low-cost wildfire sensing. We build
            open sensor nodes, test them against real fire and real noise, and
            publish everything — including failures. Nothing in this app is a
            live deployment yet: the data you see is a scripted simulation of the
            network we are building.
          </Text>
          <Text style={styles.stanceRef}>{REFERENCE_BAR}</Text>
        </View>

        {/* UintaBench leaderboard */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>UintaBench · Detection</Text>
          <Text style={styles.sectionHint}>First real numbers land after the first partnered burns (G4)</Text>
        </View>
        <View style={styles.tableClip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <View style={[styles.row, styles.headRow]}>
                <Text style={[styles.cell, styles.cellConfig, styles.headText]}>Node config</Text>
                <Text style={[styles.cell, styles.headText]}>@25m</Text>
                <Text style={[styles.cell, styles.headText]}>@50m</Text>
                <Text style={[styles.cell, styles.headText]}>@100m</Text>
                <Text style={[styles.cell, styles.headText]}>False/d</Text>
                <Text style={[styles.cell, styles.headText]}>Power</Text>
                <Text style={[styles.cell, styles.headText]}>Cost</Text>
              </View>
              {LEADERBOARD.map((r, i) => (
                <View key={i} style={[styles.row, i < LEADERBOARD.length - 1 && styles.rowBorder]}>
                  <Text style={[styles.cell, styles.cellConfig]}>{r.config}</Text>
                  <Text style={styles.cell}>{r.d25}</Text>
                  <Text style={styles.cell}>{r.d50}</Text>
                  <Text style={styles.cell}>{r.d100}</Text>
                  <Text style={styles.cell}>{r.alerts}</Text>
                  <Text style={styles.cell}>{r.power}</Text>
                  <Text style={[styles.cell, styles.cellCost]}>{r.cost}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
          <View style={styles.edgeFade} pointerEvents="none">
            <View style={[styles.fadeStrip, { opacity: 0.4 }]} />
            <View style={[styles.fadeStrip, { opacity: 0.75 }]} />
            <View style={[styles.fadeStrip, { opacity: 1 }]} />
          </View>
        </View>

        {/* Networking benchmark */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>UintaBench · Mesh networking</Text>
          <Text style={styles.sectionHint}>Through real Uintah Basin terrain</Text>
        </View>
        <View style={styles.tableClip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.netTable}>
              {NETWORKING.map((r, i) => (
                <View key={i} style={[styles.row, i < NETWORKING.length - 1 && styles.rowBorder]}>
                  <Text style={[styles.cell, styles.cellConfig]}>{r.transport}</Text>
                  <Text style={[styles.cell, styles.cellNet]}>Range {r.range}</Text>
                  <Text style={[styles.cell, styles.cellNet]}>Delivery {r.delivery}</Text>
                  <Text style={[styles.cell, styles.cellNet]}>Latency {r.latency}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
          <View style={styles.edgeFade} pointerEvents="none">
            <View style={[styles.fadeStrip, { opacity: 0.4 }]} />
            <View style={[styles.fadeStrip, { opacity: 0.75 }]} />
            <View style={[styles.fadeStrip, { opacity: 1 }]} />
          </View>
        </View>

        {/* Open questions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Open Questions</Text>
          <TouchableOpacity onPress={() => open(`${SITE}/open-questions`)} accessibilityRole="link">
            <Text style={styles.linkText}>Full list on the site →</Text>
          </TouchableOpacity>
        </View>
        {QUESTIONS.map((item, i) => (
          <View key={i} style={styles.questionCard}>
            <Text style={styles.questionText}>{item.q}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: item.done ? colors.forest : colors.ember }]} />
              <Text style={[styles.statusText, { color: item.done ? colors.forest : colors.emberText }]}>
                {item.status}
              </Text>
            </View>
          </View>
        ))}

        {/* Links */}
        <View style={styles.linksCard}>
          {[
            { icon: "globe-outline" as const, label: "About the project", url: `${SITE}/about` },
            { icon: "hardware-chip-outline" as const, label: "Hardware & sensors", url: `${SITE}/sensors` },
            { icon: "people-outline" as const, label: "Get involved", url: `${SITE}/get-involved` },
            { icon: "heart-outline" as const, label: "Support the lab", url: `${SITE}/support` },
          ].map((l, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.linkRow, i < 3 && styles.rowBorder]}
              onPress={() => open(l.url)}
              accessibilityRole="link"
              accessibilityLabel={l.label}
            >
              <Ionicons name={l.icon} size={18} color={colors.forest} />
              <Text style={styles.linkRowText}>{l.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.inkDim} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    paddingBottom: 120,
  },
  intro: {
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  introIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.forestGlow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  introTitle: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.ink,
  },
  stanceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    ...shadows.sm,
    borderCurve: "continuous",
  },
  stanceTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.inkMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  stanceText: {
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  stanceRef: {
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 18,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.bgAlt,
  },
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
  sectionHint: {
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 2,
  },
  linkText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.fireText,
  },
  table: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.sm,
    borderCurve: "continuous",
  },
  tableClip: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  edgeFade: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    flexDirection: "row",
  },
  fadeStrip: {
    width: 6,
    backgroundColor: colors.bgAlt,
  },
  row: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.bgAlt,
  },
  headRow: {
    backgroundColor: colors.bgAlt,
  },
  headText: {
    fontWeight: "700",
    fontSize: 11,
    color: colors.inkMuted,
  },
  cell: {
    fontSize: 12,
    color: colors.ink,
    width: 46,
    textAlign: "center",
  },
  cellConfig: {
    width: 130,
    textAlign: "left",
    fontWeight: "600",
    fontSize: 11,
    color: colors.inkSoft,
  },
  cellNet: {
    width: 88,
  },
  cellCost: {
    fontWeight: "700",
  },
  netTable: {
    backgroundColor: colors.surface,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
    borderCurve: "continuous",
  },
  questionText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  linksCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    overflow: "hidden",
    ...shadows.sm,
    borderCurve: "continuous",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  linkRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
    letterSpacing: -0.2,
  },
});
