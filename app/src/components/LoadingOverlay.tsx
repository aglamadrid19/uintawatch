import React from "react";
import { View, ActivityIndicator, StyleSheet, Modal, Text } from "react-native";
import { colors, spacing, radius, shadows } from "../theme";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message }) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" hardwareAccelerated>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.spinnerWrap}>
            <ActivityIndicator size="large" color={colors.fire} />
          </View>
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(28, 24, 20, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    minWidth: 140,
    ...shadows.lg,
  },
  spinnerWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.fireGlow,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    marginTop: spacing.md,
    fontSize: 15,
    color: colors.ink,
    fontWeight: "500",
  },
});
