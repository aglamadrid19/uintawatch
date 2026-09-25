import { Platform } from 'react-native';

const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export const fonts = {
  serif: 'DM Serif Display',
  body: 'Archivo',
  bodyMedium: 'Archivo Medium',
  bodySemiBold: 'Archivo SemiBold',
  bodyBold: 'Archivo Bold',
  mono: MONO,
};

export const typography = {
  largeTitle: { fontSize: 34, lineHeight: 38, fontWeight: '700' },
  title: { fontSize: 22, lineHeight: 26, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 24, fontWeight: '400' },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },

  // Brand style presets — DM Serif Display for display headings,
  // Archivo for UI text.
  display: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 40,
  },
  displaySmall: {
    fontFamily: fonts.serif,
    fontSize: 24,
    lineHeight: 30,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } as const,
};
