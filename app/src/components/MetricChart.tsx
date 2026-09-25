import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Reading } from "../types";
import { colors, spacing, radius, shadows } from "../theme";
import { fonts } from "../theme/typography";

type MetricKey = 'tempC' | 'humidityPct' | 'voc' | 'batteryMv' | 'rssi' | 'windMs';

const METRICS: {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
  get: (r: Reading) => number | undefined;
  /** Typical range for color grading */
  warn?: number;
  alarm?: number;
}[] = [
  { key: 'tempC', label: 'Temp', unit: '°C', color: colors.fire, get: r => r.tempC, warn: 40, alarm: 47 },
  { key: 'humidityPct', label: 'Humidity', unit: '%', color: colors.sky, get: r => r.humidityPct, warn: 20, alarm: 12 },
  { key: 'voc', label: 'VOC', unit: '', color: colors.ember, get: r => r.voc, warn: 350, alarm: 480 },
  { key: 'batteryMv', label: 'Battery', unit: 'mV', color: colors.forest, get: r => r.batteryMv },
  { key: 'rssi', label: 'Signal', unit: 'dBm', color: colors.inkMuted, get: r => r.rssi },
  { key: 'windMs', label: 'Wind', unit: 'm/s', color: colors.skyLight, get: r => r.windMs },
];

interface MetricChartProps {
  readings: Reading[];
  /** Unit preference — converts temp/wind series and labels when imperial */
  units?: 'metric' | 'imperial';
}

/**
 * Lightweight 24h bar chart. Deliberately built from plain Views — no native
 * chart/SVG dependency to prebuild. Good enough to show the story each
 * metric tells; the real charting pass comes with live data.
 */
export const MetricChart: React.FC<MetricChartProps> = ({ readings, units = 'metric' }) => {
  const metrics = useMemo(() => METRICS.map((m) => {
    if (units === 'imperial' && m.key === 'tempC') {
      const toF = (c: number) => (c * 9) / 5 + 32;
      return {
        ...m,
        unit: '°F',
        get: (r: Reading) => (r.tempC != null ? toF(r.tempC) : undefined),
        warn: toF(40),
        alarm: toF(47),
      };
    }
    if (units === 'imperial' && m.key === 'windMs') {
      return {
        ...m,
        unit: 'mph',
        get: (r: Reading) => (r.windMs != null ? r.windMs * 2.23694 : undefined),
      };
    }
    return m;
  }), [units]);

  const available = metrics.filter(m => readings.some(r => m.get(r) !== undefined && m.get(r) !== null));
  const [metricKey, setMetricKey] = useState<MetricKey>(available[0]?.key ?? 'tempC');
  const metric = metrics.find(m => m.key === metricKey) ?? available[0] ?? metrics[0];

  const values = useMemo(
    () => readings.map(r => metric.get(r)).filter((v): v is number => v != null),
    [readings, metric]
  );

  const stats = useMemo(() => {
    if (values.length === 0) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const first = values[0];
    const last = values[values.length - 1];
    return { min, max, first, last };
  }, [values]);

  const range = stats && stats.max !== stats.min ? stats.max - stats.min : 1;

  return (
    <View style={styles.card}>
      <View style={styles.tabs}>
        {available.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[styles.tab, metricKey === m.key && styles.tabActive]}
            onPress={() => setMetricKey(m.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: metricKey === m.key }}
            accessibilityLabel={`Chart ${m.label}`}
          >
            <Text style={[styles.tabText, metricKey === m.key && styles.tabTextActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.plot}>
        {readings.map((r, i) => {
          const v = metric.get(r);
          if (v == null) return null;
          const t = (v - stats!.min) / range;
          const heightPct = 12 + t * 88;
          const graded =
            metric.alarm != null && v >= metric.alarm ? colors.danger
            : metric.warn != null && v >= metric.warn ? metric.color
            : metric.color;
          const isLast = i === readings.length - 1;
          return (
            <View
              key={i}
              style={styles.barSlot}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`${new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${v}${metric.unit}`}
            >
              <View style={[styles.bar, { height: `${heightPct}%`, backgroundColor: graded, opacity: isLast ? 1 : 0.75 }]} />
            </View>
          );
        })}
      </View>

      {stats && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {stats.min.toFixed(metric.key === 'rssi' ? 0 : 1)}
            {metric.unit} low
          </Text>
          <Text style={[styles.footerText, styles.footerNow]}>
            now {stats.last.toFixed(metric.key === 'rssi' ? 0 : 1)}{metric.unit}
          </Text>
          <Text style={styles.footerText}>
            {stats.max.toFixed(metric.key === 'rssi' ? 0 : 1)}
            {metric.unit} high
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.sm,
    borderCurve: "continuous",
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  tab: {
    backgroundColor: colors.bgAlt,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    minHeight: 44,
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: colors.ink,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.inkSoft,
  },
  tabTextActive: {
    color: colors.surface,
  },
  plot: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 96,
    gap: 2,
  },
  barSlot: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 2,
    minHeight: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: 11,
    color: colors.inkMuted,
    fontFamily: fonts.mono,
  },
  footerNow: {
    fontWeight: "700",
    color: colors.ink,
  },
});
