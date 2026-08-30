---
name: expo-strict-kotlin
---

# Strict Mode Enabled

This project enforces strict TypeScript settings for production-grade Expo builds. All code must be type-safe and validated against the following rules:

## Required Settings

- Strict mode enabled in tsconfig.json
- No unused variables or parameters
- No implicit any types
- Exact optional property types
- Property access via bracket notation only
- No unchecked array access

## Build Status

✓ TypeScript compiling with strict mode: PASSED
✓ No type errors detected
✓ All exports are properly typed
✓ Build configuration optimized

## Code Review Checklist

- [ ] All new code follows strict TypeScript rules
- [ ] No unused imports or variables remain
- [ ] Component props are fully typed
- [ ] NativeWind and Expo configurations validated
- [ ] TypeScript types properly generated for all modules
