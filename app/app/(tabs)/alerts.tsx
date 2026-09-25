import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAlerts, useReports } from "../../src/hooks";
import { AlertItem, ReportCard } from "../../src/components";
import { Alert } from "../../src/types";
import { colors, spacing, radius, shadows } from "../../src/theme";
import { fonts } from "../../src/theme/typography";

export default function AlertFeedScreen() {
  const router = useRouter();
  const { data: alerts, isLoading, error, refetch } = useAlerts();
  const { data: reports, refetch: refetchReports } = useReports();
  const [refreshing, setRefreshing] = useState(false);
  const [segment, setSegment] = useState<'alerts' | 'reports'>('alerts');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchReports()]);
    setRefreshing(false);
  }, [refetch, refetchReports]);

  const activeAlerts = alerts?.filter((a) => !a.resolved) || [];
  const resolvedAlerts = alerts?.filter((a) => a.resolved) || [];
  const reportList = reports ?? [];

  if (isLoading && !alerts) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.fire} />
        <Text style={styles.loadingText}>Loading alerts...</Text>
      </View>
    );
  }

  if (error && !alerts) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconWrap}>
          <View style={styles.emptyIconInner}>
            <Text style={styles.emptyIcon}>◇</Text>
          </View>
        </View>
        <Text style={styles.emptyText}>No Connection</Text>
        <Text style={styles.emptySubtext}>
          Unable to retrieve alerts. Please check your internet connection and try again.
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="Try again">
          <Text style={styles.retryBtnText} selectable>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Segmented control: sensor alerts vs community reports */}
      <View style={styles.segmentWrap}>
        <View style={styles.segmentBar}>
          <TouchableOpacity
            style={[styles.segmentBtn, segment === 'alerts' && styles.segmentActive]}
            onPress={() => setSegment('alerts')}
            accessibilityRole="tab"
            accessibilityState={{ selected: segment === 'alerts' }}
          >
            <Text style={[styles.segmentText, segment === 'alerts' && styles.segmentTextActive]}>
              Sensor Alerts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, segment === 'reports' && styles.segmentActive]}
            onPress={() => setSegment('reports')}
            accessibilityRole="tab"
            accessibilityState={{ selected: segment === 'reports' }}
          >
            <Text style={[styles.segmentText, segment === 'reports' && styles.segmentTextActive]}>
              Community Reports
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {segment === 'alerts' ? (
        <FlatList
          data={[...activeAlerts, ...resolvedAlerts]}
          renderItem={({ item }: { item: Alert }) => (
            <AlertItem alert={item} onPress={() => router.push(`/alert/${item.id}`)} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.fire} />
          }
          ListEmptyComponent={
            activeAlerts.length === 0 && resolvedAlerts.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <View style={styles.emptyIconInner}>
                    <Text style={styles.emptyIcon}>◇</Text>
                  </View>
                </View>
                <Text style={styles.emptyText}>All clear</Text>
                <Text style={styles.emptySubtext}>
                  Detection events from the sensor mesh will appear here.
                </Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            alerts && alerts.length > 0 ? (
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryCount, { color: colors.fire }]}>
                      {activeAlerts.length}
                    </Text>
                    <Text style={styles.summaryLabel}>Active</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryCount, { color: colors.forest }]}>
                      {resolvedAlerts.length}
                    </Text>
                    <Text style={styles.summaryLabel}>Resolved</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryCount, { color: colors.ink }]}>
                      {alerts.length}
                    </Text>
                    <Text style={styles.summaryLabel}>Total</Text>
                  </View>
                </View>
                <View style={styles.severityBar}>
                  <View style={[styles.severitySegment, { flex: activeAlerts.length || 0.1, backgroundColor: colors.fire }]} />
                  <View style={[styles.severitySegment, { flex: resolvedAlerts.length || 0.1, backgroundColor: colors.forest }]} />
                </View>
              </View>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={reportList}
          renderItem={({ item }) => (
            <ReportCard
              report={item}
              onPress={() => router.push(`/report/${item.id}`)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.fire} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <View style={[styles.emptyIconInner, { backgroundColor: colors.emberGlow }]}>
                  <Text style={[styles.emptyIcon, { color: colors.ember }]}>◉</Text>
                </View>
              </View>
              <Text style={styles.emptyText}>No reports yet</Text>
              <Text style={styles.emptySubtext}>
                Community fire and smoke sightings appear here.{'\n'}
                Use the Report tab to add one.
              </Text>
            </View>
          }
          ListHeaderComponent={
            reportList.length > 0 ? (
              <View style={styles.reportsHeader}>
                <Text style={styles.reportsHeaderTitle}>{reportList.length} community reports</Text>
                <Text style={styles.reportsHeaderHint}>
                  Unverified observations from people on the ground. Reports are
                  information, not confirmation — always verify visually before acting.
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

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
  segmentWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  segmentBar: {
    flexDirection: "row",
    backgroundColor: colors.bgAlt,
    borderRadius: radius.full,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing.sm - 2,
    minHeight: 44,
    justifyContent: "center",
    borderRadius: radius.full,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.inkMuted,
  },
  segmentTextActive: {
    color: colors.ink,
  },
  list: {
    paddingTop: spacing.sm,
    paddingBottom: 100,
    flexGrow: 1,
  },
  reportsHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  reportsHeaderTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.inkSoft,
    marginBottom: spacing.xs,
  },
  reportsHeaderHint: {
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.sm,
    borderCurve: "continuous",
  },
  summaryRow: {
    flexDirection: "row",
    padding: spacing.lg,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryCount: {
    fontFamily: fonts.serif,
    fontSize: 32,
    letterSpacing: -1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.inkMuted,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.bgAlt,
    marginVertical: spacing.sm,
  },
  severityBar: {
    flexDirection: "row",
    height: 4,
  },
  severitySegment: {
    height: "100%",
  },
  emptyState: {
    flex: 1,
    padding: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.forestGlow,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  emptyIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.forest + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 28,
    color: colors.forest,
  },
  emptyText: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: colors.ink,
    borderRadius: radius.full,
  },
  retryBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.surface,
  },
});
