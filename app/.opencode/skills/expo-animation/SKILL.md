---
name: expo-animation
description: Build animations in React Native and Expo, making the decisions in the order that determines whether they feel right — should it animate, which thread it runs on, which properties, spring or timing, how the gesture hands off, how it degrades. Writes the implementation with Reanimated, Gesture Handler, Expo Router and expo-haptics. Use when animating anything in an Expo app, adding gestures, sheets, screen transitions, press feedback or haptics, or fixing motion that stutters on device. For web animation use `animate`.

# Animation Construction Process

Follow this sequence for smooth, professional animations in React Native and Expo:

### Step 1: Determine What to Animate
Ask these questions first:
- What behavior should animate? (transition, reveal, feedback, or full-screen motion)
- Will users see this repeatedly? (potentially heavy to optimize)
- Is this motion critical to the user experience? (smoothness, feedback)
- What happens if the user's device can't handle it? (visual degradation strategy)

### Step 2: Choose the Animation Type
- **Transition/Route transition**: Expo Router native transitions or useTransition/animated
- **Feedback animations**: taps, presses, success states (haptics + visual)
- **State changes**: anything that should feel fluid (slide, fade, scale, spring)
- **Gesture transitions**: pan gestures, swipe acknowledgments, drag-based anims

### Step 3: Decide on Animation Stack
- **Reanimated** for JavaScript thread animations (60/120fps) - preferred for most cases
- **Gesture Handler** for gesture interactions that need low-latency反馈
- **expo-haptics** for tactile feedback on interactions
- **Expo Router** for app navigation transitions

### Step 4: Apply Animation Patterns

#### Basic Transitions
**Fade**: Simple and elegant for overlays/slides
```typescript
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
const opacity = useSharedValue(0)
opacity.value = withTiming(targetOpacity, { duration: 300 })
```

**Slide**: Use for revealing content below or above
```typescript
const translateY = useSharedValue({ startY, endY })
translateY.value = withSpring(targetY, {
  damping: 20,
  mass: 1
})
```

**Scale**: For feedback presses, zoom effects
```typescript
const scale = useSharedValue(initialScale)
scale.value = withSpring(finalScale, {
  stiffness: 300,
  damping: 30
})
```

#### Phase-based Animations (2-pass)
1. **Immediate reductive phase** (always runs first):
   - First characteristic change (typically scale-down or fade-out)
   - Spring physics for attention-grabbing reversion back to baseline
2. **Secondary delayed phase** (runs after reductive returns to baseline):
   - Target characteristic change (typically scale-up or color change)
   - Smooth timing for elegant completion

Example for a modal closing:
```typescript
// Phase 1: Immediate scale-down (very fast spring)
scale.value = withSpring(0.95, {
  stiffness: 900,
  damping: 30
}) && setTimeout(() => {
  // Phase 2: Fade out after scale returns to 1
  opacity.value = withTiming(0, { duration: 200 })
}, 50)
```

#### Reduced Motion Strategy
Provide a data attribute for users who prefer reduced motion:
```typescript
const prefersReducedMotion = useReducedMotion()
// Pass { reduceMotion: prefersReducedMotion } to animations
```

### Step 5: Add Haptic Feedback
```typescript
import * as Haptics from 'expo-haptics'

// Light tap for tap feedback
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

// Success vibration
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

// Prepare with light before heavy
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Prepared)
// Then confirm with success
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
```

### Step 6: Dealing with Performance
- **Use Reanimated's useSharedValue with runOnJS** for writing to React state
- **Single thread approach**: Reanimated animates on JS thread, reads from thread
- **Avoid expensive transformations**: Layout animations should be simple properties
- **Debounce or preview animations** when scrolling lists: useTransition()
- **Fixed lists with ViewWrapper**: add springs to trigger dynamic based on scroll
- **Debounced or conditional animations**: only animate visible items with dynamic animation on render
- **Lazy load animations**:   (Prerender content first, then animate reveal)
- **Stable hook patterns**: separate values from effects to avoid re-renders

### Step 7: Error Handling & Degradation
- **Fallback to CSS-based animations** on web (animate utility)
- **Simplify animations** for older devices: fewer frames, simpler curves
- **Skip expensive features** if reduced motion is detected
- **Show basic content** even if animations fail completely
- **Document animation decisions** in code comments

## Quick Reference: When to Use What

| Use Case | Stack | Pattern |
|----------|-------|---------|
| Screen transitions | Expo Router | native transition patterns |
| Gesture acknowledgments | Gesture Handler + Reanimated | spring sequence |
| Tap feedback | Reanimated + Haptics | Immediate reductive + secondary delayed |
| List transitions | useTransition() | Defer/preview only visible |
| Slide to dismiss | Reanimated | Phase-based 2-pass |
| Theme switching | useSharedValue | Short spring or timing |
| Success states | Haptics + scale-up | Two-phase animation |
| Loading states | useTransition/opacity | Reveal on render |

## Common Pitfalls to Avoid

1. **Not using runOnJS**: Updates React state from animation threads
2. **Full gradient animations**: Avoid animating complex gradients (performance-heavy)
3. **Heavy layout transformations**: Prefer simple properties (scale, fade, slide) over layout positioning
4. **Inconsistent haptics**: Light tap on tap, success on completion, prepared when appropriate
5. **No reduced motion support**: Don't forget users with motion sensitivity or disabilities
6. **Premature layout animating**: Only animate properties that can be calculated on each layout
7. **Complex gestures without cleanup**: Remember to dispose gesture handlers properly
8. **Maximum values in useTransition**: Should be maximum value or percentage, not min/max

## Get Started Examples

### 1. Simple Press Feedback
```typescript
const scale = useSharedValue(1)

const handlePressIn = () => {
  scale.value = withSpring(0.95, {
    stiffness: 300,
    damping: 30
  })
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

const handlePressOut = () => {
  scale.value = withSpring(1, {
    stiffness: 300,
    damping: 30
  })
}
```

### 2. Slide to Dismiss (Best Practice)
```typescript
const translateY = useSharedValue(0)
const handleDrag = Gesture.Pan()
  .onActive(e => {
    translateY.value = e.translationY
  })
  .onEnd(e => {
    if (e.translationY > 200) {
      // Swipe complete - dismiss
      translateY.value = withSpring(1000, {}, () => closeModal())
    } else {
      // Return to origin
      translateY.value = withSpring(0, { damping: 20, stiffness: 300 })
    }
  })
```

### 3. Success State with 2-Phase Animation
```typescript
const [success, setSuccess] = useState(false)

const triggerSuccess = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  setTimeout(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setSuccess(true)
  }, 50) // Minimal delay between phases
}
```

For more details on gesture integration, mechanics and common patterns, read `references/gesture-handoffs.md`.
