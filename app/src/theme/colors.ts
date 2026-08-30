import { Platform } from 'react-native';
import { Color } from 'expo-router';

export const colors = {
  bg: '#FAF8F5',
  bgAlt: '#F5F0EB',
  surface: '#FFFFFF',
  surfaceAlt: '#FAF8F5',
  surfaceGlass: 'rgba(250, 248, 245, 0.8)',

  ios: {
    primary: '#1C1814',
    secondary: '#4A443E',
    tertiary: '#8B8580',
    disabled: '#B5B0AB',
  },

  android: {
    primary: '#1C1814',
    glass: '#FFFFFF',
    surface: '#FAF8F5',
  },

  web: {
    white: '#FFFFFF',
    grayLight: '#FAF8F5',
    grayMedium: '#F5F0EB',
    grayDark: '#1C1814',
  },

  ink: '#1C1814',
  inkSoft: '#4A443E',
  inkMuted: '#8B8580',
  inkDim: '#B5B0AB',

  fire: '#E8593A',
  fireDark: '#C94A2E',
  fireLight: '#FF6B4A',
  fireGlow: 'rgba(232, 89, 58, 0.12)',

  ember: '#F59E3A',
  emberLight: '#FFB84D',
  emberGlow: 'rgba(245, 158, 58, 0.12)',

  forest: '#2D7A4D',
  forestDark: '#1F5E38',
  forestLight: '#3A9D62',
  forestGlow: 'rgba(45, 122, 77, 0.10)',

  sky: '#1E6091',
  skyLight: '#4A90C4',

  danger: '#DC2626',
  success: '#2D7A4D',
  warning: '#F59E3A',

  status: {
    online: '#2D7A4D',
    offline: '#8B8580',
    alert: '#E8593A',
    elevated: '#E8593A',
    critical: '#DC2626',
  },

  severity: {
    warning: '#F59E3A',
    elevated: '#E8593A',
    critical: '#DC2626',
  },
};

export const MAP_MARKER_COLORS = {
  online: colors.status.online,
  offline: colors.status.offline,
  alert: colors.status.alert,
};


export type ThemeColors = typeof colors;

export type PlatformColors = typeof colors.ios | typeof colors.android | typeof colors.web;
