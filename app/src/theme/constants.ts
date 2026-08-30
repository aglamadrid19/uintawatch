export const shadows = {
  sm: {
    boxShadow: '0 1px 3px rgba(28, 24, 20, 0.06)',
  },
  md: {
    boxShadow: '0 4px 12px rgba(28, 24, 20, 0.08)',
  },
  lg: {
    boxShadow: '0 8px 24px rgba(28, 24, 20, 0.10)',
  },
  xl: {
    boxShadow: '0 16px 48px rgba(28, 24, 20, 0.12)',
  },
  glow: {
    boxShadow: '0 0 20px rgba(232, 89, 58, 0.15)',
  },
};

export const gradients = {
  fire: ['#E8593A', '#F59E3A'],
  forest: ['#2D7A4D', '#3A9D62'],
  sky: ['#1E6091', '#4A90C4'],
  warm: ['#FAF8F5', '#F5F0EB'],
};

export const UTAH_REGION = {
  latitude: 39.5,
  longitude: -111.5,
  latitudeDelta: 4.5,
  longitudeDelta: 5.0,
};

export const API_BASE_URL = (typeof process !== 'undefined' &&
  process.env.EXPO_PUBLIC_API_URL) ||
  'http://localhost:3000/api/v1';

export const POLLING_INTERVAL = (typeof process !== 'undefined' &&
  process.env.EXPO_PUBLIC_POLL_INTERVAL) ? parseInt(process.env.EXPO_PUBLIC_POLL_INTERVAL, 10) : 30000;
