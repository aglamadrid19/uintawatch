import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useAlerts } from "../../src/hooks";
import { AlertItem } from "../../src/components";
import { Alert } from "../../src/types";
import { colors, spacing, radius, shadows } from "../../src/theme";

export default function AlertFeedScreen() {
  const { data: alerts, isLoading, error, refetch } = useAlerts();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(({ item }: { item: Alert }) => (
    <AlertItem alert={item} />
  ), []);

  const keyExtractor = useCallback((item: Alert) => item.id, []);

  const activeAlerts = alerts?.filter((a) => !a.resolved) || [];
  const resolvedAlerts = alerts?.filter((a) => a.resolved) || [];

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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={[...activeAlerts, ...resolvedAlerts]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
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
                Fire detection alerts will appear here.{'\n'}The network is monitoring 24/7.
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
  list: {
    paddingTop: spacing.sm,
    paddingBottom: 100,
    flexGrow: 1,
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
    fontSize: 32,
    fontWeight: "700",
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
    fontSize: 20,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: "center",
    lineHeight: 22,
  },
});
