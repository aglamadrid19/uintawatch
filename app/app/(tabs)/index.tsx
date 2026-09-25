import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  RefreshControl,
  Text,
  ActivityIndicator,
  Animated,
  FlatList,
  TouchableOpacity,
  PanResponder,
  Platform,
  LayoutAnimation,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import { useRouter } from "expo-router";
import { useSensors, useReports } from "../../src/hooks";
import { SensorWithReading, FireReport } from "../../src/types";
import {
  AlertRibbon,
  NetworkChips,
  SensorCarouselCard,
  CARD_WIDTH,
  CARD_GAP,
  MapCallout,
  SensorMarker,
  ReportMarker,
  MapLegend,
} from "../../src/components";
import { colors, spacing, radius, shadows, MAP_MARKER_COLORS, UTAH_REGION } from "../../src/theme";
import { fonts } from "../../src/theme/typography";
import { useSettingsStore, formatTemp } from "../../src/store/settings";

const STATUS_ORDER: Record<string, number> = { alert: 0, online: 1, offline: 2 };
const TAB_BAR_HEIGHT = Platform.select({ ios: 88, android: 64, default: 64 });

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { data: sensors, isLoading, error, refetch } = useSensors(true);
  const { data: reports } = useReports();
  const mapType = useSettingsStore(s => s.mapType);
  const [refreshing, setRefreshing] = useState(false);
  const [region] = useState<Region>(UTAH_REGION);
  const [mapReady, setMapReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Draggable 2-snap bottom sheet geometry (container = screen minus tab bar).
  // Expanded is capped at 68% so its top edge stays below the glass header +
  // ribbon/chips zone — the map, badge, and alert chrome stay visible (the
  // expanded sheet previously slid under the header and hid the title).
  const containerH = height - TAB_BAR_HEIGHT;
  const SHEET_H = containerH * 0.68;
  // Peek slice sized to the actual peek content (handle + header + carousel +
  // Report CTA) with ~8pt slack, so there is no dead band between the
  // attribution line and the tab bar
  const PEEK_VISIBLE = containerH * 0.39;
  const PEEK_OFFSET = SHEET_H - PEEK_VISIBLE;
  // How far the legend rides up as the sheet expands (stops short of the
  // ribbon zone — V10)
  const LEGEND_RIDE = Math.max(0, PEEK_VISIBLE - (containerH - SHEET_H));

  const mapRef = useRef<MapView>(null);
  const sheetY = useRef(new Animated.Value(PEEK_OFFSET + 90)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const offsetRef = useRef(PEEK_OFFSET);
  const startOffsetRef = useRef(PEEK_OFFSET);
  const expandedRef = useRef(false);
  const isUserPanning = useRef(false);
  // Only pan the map after the USER snaps a card (initial render keeps the
  // full-basin view, matching the mockup)
  const hasSnapped = useRef(false);

  // Track the sheet's live offset (for gesture start + snapping decisions)
  useEffect(() => {
    const listener = sheetY.addListener(({ value }) => {
      offsetRef.current = value;
    });
    return () => sheetY.removeListener(listener);
  }, [sheetY]);

  // Sheet entrance: slide up + fade into the peek position
  useEffect(() => {
    Animated.parallel([
      Animated.spring(sheetY, {
        toValue: PEEK_OFFSET,
        useNativeDriver: true,
        speed: 22,
        bounciness: 5,
      }),
      Animated.timing(sheetOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Snap the sheet to a state; swapping peek ⇄ expanded content is animated
   * with LayoutAnimation so the Report CTA and list reflow smoothly.
   */
  const toggleSheet = useCallback(
    (toExpanded: boolean) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      expandedRef.current = toExpanded;
      setExpanded(toExpanded);
      Animated.spring(sheetY, {
        toValue: toExpanded ? 0 : PEEK_OFFSET,
        useNativeDriver: true,
        speed: 24,
        bounciness: 4,
      }).start();
    },
    [PEEK_OFFSET, sheetY],
  );

  // Drag-to-expand: attached to the grab handle + sheet header row only, so
  // the carousel/list keep their own scroll gestures.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) =>
          Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderGrant: () => {
          startOffsetRef.current = offsetRef.current;
        },
        onPanResponderMove: (_e, g) => {
          const next = Math.min(PEEK_OFFSET, Math.max(0, startOffsetRef.current + g.dy));
          sheetY.setValue(next);
        },
        onPanResponderRelease: (_e, g) => {
          const next = Math.min(PEEK_OFFSET, Math.max(0, startOffsetRef.current + g.dy));
          const velocityBoost = g.vy < -0.3 ? 0 : g.vy > 0.3 ? PEEK_OFFSET : 0;
          const projected = next + velocityBoost;
          toggleSheet(projected < PEEK_OFFSET / 2);
        },
      }),
    [PEEK_OFFSET, sheetY, toggleSheet],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleCardPress = (sensor: SensorWithReading) => {
    router.push(`/sensor/${sensor.id}`);
  };

  // Sorted most-urgent-first: alert → online → offline (stable for ties)
  const sorted = useMemo(() => {
    const list = [...(sensors ?? [])];
    list.sort((a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3));
    return list;
  }, [sensors]);

  const alerting = useMemo(() => sorted.filter(s => s.status === "alert"), [sorted]);
  const onlineSensors = sorted.filter(s => s.status === "online").length;
  const alertSensors = alerting.length;
  const totalSensors = sorted.length;
  const reportList = reports ?? [];

  // Carousel ↔ map link: pans to the snapped-to card, but only after the
  // user has actually snapped the carousel (never on initial render)
  useEffect(() => {
    if (!mapReady || !hasSnapped.current || isUserPanning.current) return;
    const sensor = sorted[activeIndex];
    if (!sensor) return;
    mapRef.current?.animateToRegion(
      {
        latitude: sensor.lat - 0.015,
        longitude: sensor.lng,
        latitudeDelta: 0.12,
        longitudeDelta: 0.2,
      },
      600,
    );
  }, [activeIndex, mapReady, sorted]);

  if (isLoading && !sensors) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.fire} />
        <Text style={styles.loadingText}>Loading sensor network...</Text>
      </View>
    );
  }

  if (error && !sensors) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMessage}>Unable to load sensor data. Please check your connection and try again.</Text>
      </View>
    );
  }

  const cardStride = CARD_WIDTH + CARD_GAP;

  return (
    <View style={styles.container}>
      {/* Full-bleed map behind everything */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        zoomEnabled={true}
        rotateEnabled={true}
        scrollEnabled={true}
        mapType={mapType}
        onMapReady={() => setMapReady(true)}
        onPanDrag={() => { isUserPanning.current = true; }}
      >
        {mapReady && sorted.map((sensor) => (
          <Marker
            key={sensor.id}
            coordinate={{ latitude: sensor.lat, longitude: sensor.lng }}
            tracksViewChanges={false}
          >
            <SensorMarker status={sensor.status} />
            {/* tooltip={true} → react-native-maps swaps the stock white
                bubble for an empty background; our dark pill IS the callout */}
            <Callout onPress={() => router.push(`/sensor/${sensor.id}`)} tooltip={true}>
              <MapCallout sensor={sensor} />
            </Callout>
          </Marker>
        ))}
        {mapReady && reportList.map((report: FireReport) => (
          <Marker
            key={report.id}
            coordinate={{ latitude: report.lat, longitude: report.lng }}
            tracksViewChanges={false}
          >
            <ReportMarker />
            <Callout onPress={() => router.push("/(tabs)/alerts")} tooltip={true}>
              <View style={styles.reportCallout}>
                <Text style={styles.reportCalloutTitle}>Community report</Text>
                <Text style={styles.reportCalloutText} numberOfLines={2}>{report.text}</Text>
                <Text style={styles.reportCalloutHint}>View in feed →</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Overlays — no header and no disclosure pill on the map-first
          screen (per mockup): the ribbon/chips stack sits alone below the
          status bar */}
      <View style={[styles.overlayStack, { top: insets.top + spacing.sm }]}>
        <AlertRibbon alerting={alerting} />
        <NetworkChips total={totalSensors} online={onlineSensors} alerts={alertSensors} />
      </View>

      {/* Legend rides above the sheet edge as it expands, then fades out
          before it can overlap the ribbon/chips zone (V10/U6) */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.legendWrap,
          { bottom: PEEK_VISIBLE + 12 },
          {
            transform: [{
              translateY: sheetY.interpolate({
                inputRange: [0, PEEK_OFFSET],
                outputRange: [-LEGEND_RIDE, 0],
              }),
            }],
            opacity: sheetY.interpolate({
              inputRange: [PEEK_OFFSET * 0.4, PEEK_OFFSET],
              outputRange: [0, 1],
            }),
          },
        ]}
      >
        <MapLegend />
      </Animated.View>

      {/* Draggable bottom sheet — peek (carousel) ⇄ expanded (full list) */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: SHEET_H,
            transform: [{ translateY: sheetY }],
            opacity: sheetOpacity,
          },
        ]}
      >
        <View {...panResponder.panHandlers}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Sensors</Text>
              <Text style={styles.sheetSubtitle}>{totalSensors} nodes · {onlineSensors} online</Text>
            </View>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => toggleSheet(!expanded)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={expanded ? "Collapse sensor list" : "View all sensors"}
              accessibilityState={{ expanded }}
            >
              <Text style={styles.viewAllText}>{expanded ? "Collapse" : "View All"}</Text>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-forward"}
                size={14}
                color={colors.fireText}
              />
            </TouchableOpacity>
          </View>
        </View>

        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Text style={styles.emptyIcon}>⊙</Text>
            </View>
            <Text style={styles.emptyText}>No sensors detected</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh the network</Text>
          </View>
        ) : expanded ? (
          <FlatList
            style={styles.list}
            data={sorted}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <SensorRow sensor={item} onPress={() => handleCardPress(item)} />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.fire} />
            }
          />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
            data={sorted}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.carouselContent}
            snapToInterval={cardStride}
            decelerationRate="fast"
            renderItem={({ item, index }: { item: SensorWithReading; index: number }) => (
              <SensorCarouselCard
                sensor={item}
                active={index === activeIndex}
                onPress={() => handleCardPress(item)}
              />
            )}
            onMomentumScrollEnd={(e) => {
              isUserPanning.current = false;
              hasSnapped.current = true;
              const idx = Math.round(e.nativeEvent.contentOffset.x / cardStride);
              setActiveIndex(Math.max(0, Math.min(idx, sorted.length - 1)));
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.fire} />
            }
          />
        )}

        <View style={[styles.reportWrap, expanded && styles.reportWrapExpanded]}>
          <TouchableOpacity
            style={styles.reportBtn}
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/report")}
            accessibilityRole="button"
            accessibilityLabel="Report smoke or fire"
          >
            <Ionicons name="flame" size={18} color="#fff" />
            <Text style={styles.reportBtnText}>Report Smoke</Text>
          </TouchableOpacity>
          <Text style={styles.attribution}>Maps data © Apple</Text>
        </View>
      </Animated.View>
    </View>
  );
}

/** Compact vertical row for the expanded "all sensors" list. */
const SensorRow: React.FC<{ sensor: SensorWithReading; onPress: () => void }> = ({ sensor, onPress }) => {
  const units = useSettingsStore(s => s.units);
  const reading = sensor.latestReading;
  const statusColor = MAP_MARKER_COLORS[sensor.status];
  const isAlert = sensor.status === "alert";
  const temp = reading ? formatTemp(reading.tempC, units) : null;

  return (
    <TouchableOpacity
      style={[styles.row, isAlert && styles.rowAlert]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${sensor.name}, ${temp ? `${temp.value}${temp.label}` : "no reading"}, ${sensor.status}, view details`}
    >
      <View style={[styles.rowDot, { backgroundColor: statusColor }]} />
      <Text style={styles.rowName} numberOfLines={1}>{sensor.name}</Text>
      <Text style={styles.rowTemp}>{temp ? `${temp.value}°` : "—"}</Text>
      <Text style={styles.rowRh}>{reading ? `${reading.humidityPct.toFixed(0)}%` : "—"}</Text>
      <Text style={styles.rowBatt}>{reading ? `${(reading.batteryMv / 1000).toFixed(2)}V` : "—"}</Text>
      <Ionicons name="chevron-forward" size={14} color={colors.inkDim} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 15,
    color: colors.inkMuted,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: "center",
    lineHeight: 22,
  },

  // Overlays
  overlayStack: {
    position: "absolute",
    left: 0,
    right: 0,
    gap: spacing.sm,
  },
  legendWrap: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
  },
  reportCallout: {
    backgroundColor: "rgba(28, 24, 20, 0.92)",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    width: 190,
    ...shadows.md,
    borderCurve: "continuous",
  },
  reportCalloutTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.emberLight,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  reportCalloutText: {
    fontSize: 12,
    color: "#fff",
    lineHeight: 16,
  },
  reportCalloutHint: {
    fontSize: 10,
    color: colors.emberLight,
    fontWeight: "700",
    marginTop: 6,
  },

  // Bottom sheet
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingBottom: spacing.sm,
    ...shadows.xl,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.inkDim,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm + 2,
  },
  sheetTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: colors.inkMuted,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.fireText,
  },
  carousel: {
    // Fixed height so the Report Smoke CTA stays inside the visible peek
    // slice (FlatList otherwise stretches and pushes it offscreen — V9)
    height: 136,
    flexGrow: 0,
  },
  carouselContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    minHeight: 52,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
    borderCurve: "continuous",
  },
  rowAlert: {
    backgroundColor: colors.fireGlow,
  },
  rowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rowName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.2,
  },
  rowTemp: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
    fontVariant: ["tabular-nums"],
    minWidth: 52,
    textAlign: "right",
  },
  rowRh: {
    fontSize: 13,
    color: colors.inkMuted,
    fontVariant: ["tabular-nums"],
    minWidth: 44,
    textAlign: "right",
  },
  rowBatt: {
    fontSize: 13,
    color: colors.inkMuted,
    fontVariant: ["tabular-nums"],
    minWidth: 48,
    textAlign: "right",
  },
  reportWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  reportWrapExpanded: {
    paddingTop: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.bgAlt,
  },
  reportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 48,
    backgroundColor: colors.fire,
    borderRadius: radius.full,
    ...shadows.glow,
  },
  reportBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.2,
  },
  attribution: {
    fontSize: 9,
    color: colors.inkDim,
    textAlign: "center",
    marginTop: spacing.sm - 2,
  },

  // Empty state (inside sheet) — no flex:1, or it pushes the Report CTA
  // out of the visible peek slice (V9)
  emptyState: {
    minHeight: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bgAlt,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  emptyIcon: {
    fontSize: 24,
    color: colors.inkMuted,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.inkSoft,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: "center",
  },
});
