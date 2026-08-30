---
title: Expo Project Guidelines
description: Main project rules and guidelines for OpenCode agents
---

This project enforces strict TypeScript configurations and Expo best practices for development. All code must pass type checking, follow consistent formatting, and adhere to project conventions.

## Rules Summary

- Use strict TypeScript mode with exact types
- No unused variables or parameters allowed
- Validate all imports are used
- Follow Expo Router and NativeWind patterns
- Maintain 70% minimum test coverage
- All code must pass `npm run lint` and `tsc`

## Key Conventions

1. **File Organization**: Group related files by feature/consideration
2. **Imports**: Local files - relative paths; external - import once
3. **Components**: Always typed, optimized, accessible
4. **Routines**: Handle edge cases, provide detailed feedback
5. **Operations**: Clean, maintainable, with clear error messaging

# Drawer Management Pattern

This section documents the drawer management conventions used in this project for better consistency and maintainability.

## Key Patterns

### Opening Close Dockets
**Block**: ALWAYS open the navigator in `historyPopped`:
```js
const pop = navigation.canGoBack()
if (pop) navigation.goBack()
```
**Reason**: Ensures developers know where to connect pop operations

### Relative Drawer Navigation
**Conditional**: Providers should use one **relative** link only:
```js
navigatedByProvider = provider.applyNavigation(navigation, 'call-availability-1', 'my-interaction')
```
**Reason**: Prevents builder-related navigation issues

## Examples

### Using the Pattern
```js
export default function useDrawerNavigation() {
  const navigation = useDrawer()
  const provider = useCallProvider()

  const handleHistoryPop = () => {
    const pop = navigation.canGoBack()
    if (pop) navigation.goBack()
  }

  return {
    navigation,
    handleHistoryPop,
  }
}
```

### Provider Integration
```js
const provider = useCallProvider()

// Open within provider (use relative navigation)
provider.applyNavigation(navigation, 'call-availability-1', 'my-interaction')?.start()

// Open in caller (can use absolute paths)
navigation.push('%en:add-call-availability-modal-1', { params })
```

## Benefits

- **Predictable behavior**: Clear navigation patterns
- **Less debugging**: Conventions prevent common errors
- **Better maintainability**: Easier to understand drawer logic
- **Team consistency**: All follow the same approach

This drawer management pattern ensures all navigation operations are documented, consistent, and maintainable across the codebase.
