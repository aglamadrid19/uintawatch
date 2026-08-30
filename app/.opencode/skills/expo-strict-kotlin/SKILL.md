---
name: expo-strict-kotlin
description: A strict, type-safe Kotlin configuration for Expo projects. Use this skill when setting up Expo Kotlin configurations, NativeWind, exponention, scaling layers, or expert-level Expo Kotlin deployments. Validates project structure, TypeScript settings, and Kotlin build configurations for strict compliance with Expo standards.
---

# Expo Strict Kotlin Configuration

This skill enforces strict TypeScript and Expo Kotlin configurations for production-grade Expo projects.

## Strict TypeScript Configuration

### Required Settings in `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "checkJs": false
  }
}
```

### Strict TypeScript Rules to Enforce

1. **Type Safety**:
   - Always enable strict mode: `"strict": true`
   - No implicit any types in asserts
   - Always annotate dependencies in NativeWind types

2. **Null Safety**:
   - `noUncheckedIndexedAccess`: Arrays and objects return `T | undefined`
   - `noImplicitOverride`: Enforce override signatures
   - `noPropertyAccessFromIndexSignature`: Use bracket notation consistently

3. **Unused Detection**:
   - `noUnusedLocals`: Remove all unused variables
   - `noUnusedParameters`: Remove all unused parameters
   - Add eslint-plugin-unused-imports for CI

4. **Optional Properties**:
   - `exactOptionalPropertyTypes`: `{ prop?: string }` !== `{ prop?: string | undefined }`
   - Always annotate optional properties explicitly

## Expo Kotlin Configuration

### Recommended `app.json` Structure

```json
{
  "expo": {
    "name": "Your App",
    "version": "1.0.0",
    "schema": "1.0",
    "orientation": "portrait",
    "ios": {
      "bundleIdentifier": "com.yourapp",
      "supportsTablet": false,
      "infoPlist": {
        "NSCameraUsageDescription": "We need camera access for photo uploads.",
        "NSPhotoLibraryUsageDescription": "We need photo library access to select photos."
      }
    },
    "android": {
      "package": "com.yourapp",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "plugins": [
      "expo-router",
      [
        "expo-localization",
        {
          "locales": ["en-US"],
          "defaultLocale": "en-US"
        }
      ]
    ]
  }
}
```

## NativeWind Strict Mode

### TypeScript Config for Tailwind

In `.tailwindrc.ts`:

```typescript
export default {
  mode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        secondary: '#5856D6',
        // ... extend theme
      },
      spacing: {
        '4': '1rem',
        '8': '2rem',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Enable in production
  },
  // Strict mode validation
  safeListMatchers: [],
}
```

## Build Configuration

### Android Build Optimization

In `android/gradle.properties`:

```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
android.useAndroidX=true
android.enableJetifier=true
```

### iOS Build Optimization

In `ios/Podfile` (rarely need to modify):

```ruby
platform :ios, '13.0'
use_frameworks!
```

## Strict Validation Checklist

- [ ] `tsconfig.json` has all strict mode settings enabled
- [ ] No implicit any types in code
- [ ] All file exports are typed properly
- [ ] No unused imports/variables
- [ ] All optional properties use exact typing
- [ ] Expo config in `app.json` has all required fields.
- [ ] iOS bundle identifier follows reverse domain format
- [ ] Android package follows reverse domain format
- [ ] All plugins are properly configured
- [ ] Build configuration includes proper memory settings
- [ ] All native permissions are properly declared
- [ ] TypeScript types are generated for all components

## Code Style Guidelines

1. **React Components**:
   - Always use prop types or TypeScript interfaces
   - Use Arrow Functions for components
   - Default to deterministic component names

2. **TypeScript Interfaces**:
   - Use `interface` for object shapes
   - Use `type` for unions/aliases
   - Always include JSDoc comments for exported types

3. **Imports**:
   - Use relative imports: `import { Component } from './components/Component'`
   - Never use wildcard imports
   - Group imports in order: React, Third-Party, Local

4. **Spacing**:
   - Two spaces per indentation level
   - 200-character line limit
   - Trailing whitespace is a violation

## Common Strict Mode Errors

### Error: Property 'X' of type 'Y' is missing in type 'Z'
**Fix**: Ensure exact type matching, check `exactOptionalPropertyTypes` setting

### Error: 'X' is declared but its value is never read
**Fix**: Remove unused variables or prefix with underscore: `_x`

### Error: Type 'X' is not assignable to type 'Y'
**Fix**: Use `as` with explicit types or fix the type definition

### Error: Property access from index signature is not allowed
**Fix**: Use bracket notation: `obj['key']` instead of `obj.key`
