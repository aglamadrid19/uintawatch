import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { colors, spacing, radius, shadows, fonts } from "../src/theme";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "moon" as const,
    iconColor: colors.sky,
    bg: colors.skyLight + "18",
    title: "The gaps satellites miss",
    body:
      "Night smoldering. Cloud-covered ignitions. Low-intensity smoldering on fires that were already 'contained'. These are exactly where cameras and satellites provably can't see, and where ground smoke sensors can.",
  },
  {
    icon: "flask-outline" as const,
    iconColor: colors.forest,
    bg: colors.forestGlow,
    title: "An open field lab",
    body:
      "We build open sensor nodes, test them against real fire and real noise, and publish everything — including failures. No vendor black boxes, no internet backhaul. That means measuring exactly where cheap detection works, and where it stops.",
  },
  {
    icon: "sparkles" as const,
    iconColor: colors.ember,
    bg: colors.emberGlow,
    title: "Simulated for now",
    body:
      "No physical nodes are deployed yet, so everything you'll see is a clearly-labeled scripted simulation of the finished app. When real hardware and the backend come online, the app goes live with the same screens and real data.",
  },
];

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const x = e.nativeEvent.contentOffset.x;
    const p = Math.min(SLIDES.length - 1, Math.max(0, Math.round(x / width)));
    setPage(p);
  };

  const next = () => {
    if (page < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true });
    } else {
      onDone();
    }
  };

  const slide = SLIDES[page];

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <Image source={require("../assets/brand-logo.png")} style={styles.logo} contentFit="contain" />
        <Text style={styles.brandText}>Uinta Watch</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={32}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={[styles.iconWrap, { backgroundColor: s.bg }]}>
              <Ionicons name={s.icon} size={34} color={s.iconColor} />
            </View>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity
          style={styles.btn}
          onPress={next}
          accessibilityRole="button"
          accessibilityLabel={page < SLIDES.length - 1 ? "Next" : "Get started"}
        >
          <Text style={styles.btnText}>
            {page < SLIDES.length - 1 ? "Next" : "Explore the app"}
          </Text>
          <Ionicons
            name={page < SLIDES.length - 1 ? "arrow-forward" : "compass"}
            size={17}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDone} accessibilityRole="button" accessibilityLabel="Skip onboarding">
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <View style={styles.footerSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingTop: spacing.xxl + spacing.lg,
  },
  logo: {
    width: 30,
    height: 30,
  },
  brandText: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.ink,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
    lineHeight: 36,
    color: colors.ink,
    textAlign: "center",
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 16,
    lineHeight: 25,
    color: colors.inkSoft,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl + spacing.md,
    gap: spacing.lg,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.inkDim,
    opacity: 0.4,
  },
  dotActive: {
    backgroundColor: colors.fire,
    opacity: 1,
    width: 20,
  },
  btn: {
    flexDirection: "row",
    backgroundColor: colors.fire,
    borderRadius: radius.full,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadows.md,
  },
  btnText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.inkMuted,
    textAlign: "center",
  },
  footerSpacer: {
    height: spacing.md,
  },
});
