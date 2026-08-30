/// <reference path="./env.d.ts" />

import "react-native";
import type { Meta } from "@storybook/react-native";
import type { Story } from "@storybook/react-native/types";

// expo-router
import { Stack } from "expo-router";
const meta: Meta<typeof Stack> = {
  title: "app/(tabs)",
};
export default meta;

// types
export type { SensorWithReading } from "../../src/types";
export type { Alert } from "../../src/types";
export type { Reading } from "../../src/types";

// services
export { apiService } from "../../src/services/api";
export type { ApiService } from "../../src/services/api";

// constants
export { MAP_MARKER_COLORS } from "../../src/theme/constants";

// components
export { SensorCard } from "../../src/components/SensorCard";
export { AlertItem } from "../../src/components/AlertItem";
export { LoadingOverlay } from "../../src/components/LoadingOverlay";

// theme
export { colors, spacing, radius, shadows } from "../../src/theme";

// location
export type { LocationObject } from "expo-location";
export type { LocationObject as LocationRaw } from "expo-location";

// image picker
export type { ImagePickerResult, Asset } from "expo-image-picker";

// React Native
export type { ViewStyle, TextProps, ViewProps, ScrollViewProps } from "react-native";

// Platform
export type { Platform } from "react-native";

// Router
export type { ScreenOptions } from "@react-navigation/native-stack";

// Modules
export { View, Text, TouchableOpacity, ScrollView, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";