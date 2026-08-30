import { Platform } from "react-native";

export const colors = {
  bg: "#FAF8F5",
  bgAlt: "#F5F0EB",
  surface: "#FFFFFF",
  surfaceAlt: "#FAF8F5",
  surfaceGlass: "rgba(250, 248, 245, 0.8)",

  ink: "#1C1814",
  inkSoft: "#4A443E",
  inkMuted: "#8B8580",
  inkDim: "#B5B0AB",

  fire: "#E8593A",
  fireDark: "#C94A2E",
  fireLight: "#FF6B4A",
  fireGlow: "rgba(232, 89, 58, 0.12)",

  ember: "#F59E3A",
  emberLight: "#FFB84D",
  emberGlow: "rgba(245, 158, 58, 0.12)",

  forest: "#2D7A4D",
  forestDark: "#1F5E38",
  forestLight: "#3A9D62",
  forestGlow: "rgba(45, 122, 77, 0.10)",

  sky: "#1E6091",
  skyLight: "#4A90C4",

  danger: "#DC2626",
  success: "#2D7A4D",
  warning: "#F59E3A",

  status: {
    online: "#2D7A4D",
    offline: "#8B8580",
    alert: "#E8593A",
    warning: "#F59E3A",
    elevated: "#E8593A",
    critical: "#DC2626",
  },

  severity: {
    warning: "#F59E3A",
    elevated: "#E8593A",
    critical: "#DC2626",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const typography = {
  huge: { fontSize: 48, lineHeight: 52, letterSpacing: -1.5 },
  display: { fontSize: 32, lineHeight: 38, letterSpacing: -0.8 },
  title1: { fontSize: 24, lineHeight: 30, letterSpacing: -0.5 },
  title2: { fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  body: { fontSize: 17, lineHeight: 24, letterSpacing: 0 },
  bodySmall: { fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  caption: { fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  captionSmall: { fontSize: 11, lineHeight: 14, letterSpacing: 0.2 },
  overline: { fontSize: 10, lineHeight: 12, letterSpacing: 0.8 },
  mono: { fontSize: 14, lineHeight: 18, letterSpacing: -0.2 },
  monoSmall: { fontSize: 11, lineHeight: 14, letterSpacing: 0 },
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

export const UTAH_REGION = {
  latitude: 39.5,
  longitude: -111.5,
  latitudeDelta: 4.5,
  longitudeDelta: 5.0,
};

export const API_BASE_URL = "http://localhost:3000/api/v1";

export const POLLING_INTERVAL = 30000;

export const MAP_MARKER_COLORS = {
  online: colors.status.online,
  offline: colors.status.offline,
  alert: colors.status.alert,
};

export const shadows = {
  sm: {
    boxShadow: "0 1px 3px rgba(28, 24, 20, 0.06)",
  },
  md: {
    boxShadow: "0 4px 12px rgba(28, 24, 20, 0.08)",
  },
  lg: {
    boxShadow: "0 8px 24px rgba(28, 24, 20, 0.10)",
  },
  xl: {
    boxShadow: "0 16px 48px rgba(28, 24, 20, 0.12)",
  },
  glow: {
    boxShadow: "0 0 20px rgba(232, 89, 58, 0.15)",
  },
};

export const gradients = {
  fire: ["#E8593A", "#F59E3A"],
  forest: ["#2D7A4D", "#3A9D62"],
  sky: ["#1E6091", "#4A90C4"],
  warm: ["#FAF8F5", "#F5F0EB"],
};
