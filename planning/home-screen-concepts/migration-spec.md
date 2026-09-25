# Home Screen Visual Migration Spec — Concept 1 "Live Ops Map-First"

Reference image: `planning/home-screen-concepts/concept-01.png`
Target file: `app/app/(tabs)/index.tsx` (+ new components in `app/src/components/`)
Approved decisions (from user, 2026-09-23):

1. The vertical sensor card list becomes a **horizontal snap carousel** (most urgent sensor first).
2. **Community reports move to the Alerts tab** (they already exist there as the "Community Reports" segment — so they are simply removed from the home screen).
3. **No "ALL SYSTEMS WATCHING" chip.** The glass header keeps the existing `SimulatedBadge` instead (positioning doc requires the simulated-data disclosure).
4. **Proper animation is required**, especially on the map and transitions (see "Animation" below).

## Hard constraints

- Strict TypeScript, no unused vars; `npm run lint` and `npx tsc --noEmit` must pass.
- Reuse existing theme tokens (`src/theme`: `colors`, `spacing`, `radius`, `shadows`, `fonts`, `motion`). **No new colors.** Fire orange `#E8593A` is reserved for alert/urgency moments only.
- No new native dependencies (no reanimated/moti/gesture-handler/blur). Use RN core `Animated`, `LayoutAnimation`, `FlatList` snap.
- Keep: pull-to-refresh, loading/error states, offline + simulated-data disclosure, units store (`formatTemp`/`formatWind`), deep links (`uintawatch://` routes), map type setting, a11y labels on every tappable element, 44pt minimum tap targets, Dynamic Island safe area (glass header must use `useSafeAreaInsets().top`).
- Light mode is locked in `app.json` — design for light only.

## Layout (top to bottom)

1. **Full-bleed map zone** — `MapView` fills ~66% of screen height, edge to edge, `mapType` from settings.
2. **Glass header overlay** (absolute, top) — `BrandedHeader` gains a `glass` prop: transparent `colors.surfaceGlass` background, logo + wordmark left, `SimulatedBadge` right. Wordmark/tagline row condensed (no tagline in glass mode).
3. **AlertRibbon** (new component, absolute under header) — fire-orange banner, only when `alertSensors > 0`:
   - Text: `{n} ACTIVE ALERT{n>1?"S":""} — {firstAlertingSensor.name} · {temp}` (units-aware).
   - Trailing chevron. Whole banner is a `TouchableOpacity` → `router.push("/(tabs)/alerts")`, a11y label `"{n} active alerts, view alert feed"`.
4. **NetworkChips** (new component, replaces the old `statsBar`) — three floating pill chips: `{n} online` (forest dot), `{n} alerts` (fire dot; filled fire bg + white text when > 0, otherwise neutral), `{n} nodes`. Alerts chip taps through to the Alerts tab.
5. **MapLegend** stays floating bottom-left of the map zone (above the sheet edge).
6. **Bottom sheet** (cream `colors.bg`, rounded top corners `radius.xxl`, negative top margin so it overlaps the map edge, height ~34%):
   - Grab handle bar (48×4, `colors.bgAlt`, centered).
   - Title row: "Active Sensors & Alerts" (brand serif) + subtitle `{n} nodes · {n} online`.
   - **Horizontal sensor carousel** (`FlatList`, `snapToInterval`, `decelerationRate="fast"`): compact cards (`SensorCarouselCard`, width ~72% of screen), sorted **alert → online → offline**.
   - **Report Smoke pill** — solid `colors.fire`, white bold text, flame icon, shadow; centered in the thumb zone → `router.push("/(tabs)/report")`; a11y label `"Report smoke or fire"`.
7. Empty state (no sensors) and offline state render inside the sheet, unchanged content.

The old `mapFade`, `statsBar`, vertical `SensorCard` list, and the Community Reports section on home are **removed** (reports still on Alerts tab; report map markers + callouts stay and still deep-link to `/(tabs)/alerts`).

## SensorCarouselCard content

Name (semibold, 1 line) · status badge (existing status colors) · big temp value (`formatTemp`, `tabular-nums`, label smaller than value) · RH % · battery V · "seen Xm ago" + flame/eye context line for alerting nodes · "View Details →" hint. Alerting cards get `colors.fireGlow` background + 1px fire border; tap → `/sensor/{id}` detail.

## Animation (decision 4 — required, not optional)

RN core `Animated` only:

| Element | Animation |
|---|---|
| AlertRibbon | Spring slide-down + fade on mount; continuous gentle opacity "breathing" pulse on the alert icon (`Animated.loop`, 1.6s) |
| NetworkChips | Staggered entrance: fade + scale-up (0.9 → 1), 60ms apart, `useNativeDriver: true` |
| Bottom sheet | Slide-up from below its height + fade on mount (spring) |
| Carousel ↔ map link | Snapping to a card **pans the map**: on active index change, `mapRef.animateToRegion` (600ms ease) centers on that sensor (lat offset ≈ −0.015 so the pin sits above the sheet); never animate while user is dragging the map |
| Active carousel card | Scale spring (0.96 inactive → 1.0 active) driven by scroll position |
| Sensor markers | Unchanged (static views, `tracksViewChanges={false}` for perf — no per-marker animation) |

All animated entrances must settle (no infinite loops except the 1.6s ribbon pulse).

## QA acceptance criteria (for the verification agent)

See `app/qa/MIGRATION-QA-PROMPT.md`. In brief: fresh-bundle pre-flight (qa README gotcha 9), a11y tree shows ribbon/chips/Report Smoke with correct labels, tap-throughs work, one screenshot per turn compared against `concept-01.png`, scorecard in `qa/QA-FINDINGS.md`.
