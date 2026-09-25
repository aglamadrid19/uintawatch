import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, shadows } from "../theme";
import { SimulatedBadge } from "./SimulatedBadge";

interface BrandedHeaderProps {
  /** Hide the simulated-data badge (e.g. on the Lab tab where it is redundant) */
  hideBadge?: boolean;
  /**
   * Overlay variant for map-first screens: floating translucent glass bar,
   * logo + wordmark left, simulated-data badge right, no tagline.
   */
  glass?: boolean;
}

/**
 * App-wide brand header: hornet-in-circle logo + "Uinta Watch" wordmark in
 * the brand serif, with the simulated-data status underneath.
 */
export const BrandedHeader: React.FC<BrandedHeaderProps> = ({ hideBadge, glass }) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        glass ? styles.containerGlass : styles.container,
        { paddingTop: insets.top + spacing.sm },
      ]}
    >
      <View style={styles.row}>
        <View style={glass ? styles.logoWrapGlass : styles.logoWrap}>
          <Image
            source={require("../../assets/brand-logo.png")}
            style={glass ? styles.logoGlass : styles.logo}
            contentFit="contain"
            accessible={true}
            accessibilityLabel="Uinta Watch logo"
          />
        </View>
        <View style={styles.titleArea}>
          <Text style={glass ? styles.wordmarkGlass : styles.wordmark}>Uinta Watch</Text>
          {!glass && <Text style={styles.tagline}>Open wildfire sensing lab · Uintah Basin</Text>}
        </View>
        {glass && !hideBadge && <SimulatedBadge compact />}
      </View>
      {!glass && !hideBadge && (
        <View style={styles.badgeRow}>
          <SimulatedBadge />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg,
  },
  containerGlass: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: colors.surfaceGlass,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    ...shadows.sm,
  },
  logoWrapGlass: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm + 4,
    ...shadows.md,
  },
  logoGlass: {
    width: 38,
    height: 38,
  },
  logo: {
    width: 40,
    height: 40,
  },
  titleArea: {
    flex: 1,
  },
  wordmark: {
    fontFamily: "DM Serif Display",
    fontSize: 26,
    lineHeight: 30,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  wordmarkGlass: {
    fontFamily: "DM Serif Display",
    fontSize: 20,
    lineHeight: 24,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  tagline: {
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 1,
    letterSpacing: 0.2,
  },
  badgeRow: {
    marginTop: spacing.md,
  },
});
