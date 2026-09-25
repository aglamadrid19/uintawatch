# Home Screen Migration Spec v2 — "Live Ops Map-First, Detailed"

Reference: the user-supplied detailed mockup (2026-09-23, saved conversation image).
Builds on `migration-spec.md` (v1, already implemented + QA-passed). v2 changes:

## User decisions (2026-09-23)

1. **Center tab = Agent chat.** Raised orange circle button (mockup's "+" position)
   opens a dedicated agent chat screen. NOT wired to any external OpenAI API —
   it uses the **local antseed proxy** (`http://localhost:8377/v1/chat/completions`,
   same endpoint the dev tooling uses; iOS simulators share the host network so
   `localhost` works). Streaming SSE (the proxy streams by default).
2. **Bee logo too small** in the glass header — make it visibly a bee.
3. **Bottom sheet must expand** — it looks expandable but isn't. Add a real
   draggable 2-snap sheet for sensor info.
4. **Legend / map summary look bad** — restyle the legend to the mockup's dark
   translucent pill; chips stay (they match the mockup).
5. Carousel cards restyled to the mockup (icon disc + name + location + status
   badge + metric row), sheet header becomes "Sensors" + "View All ›".

## Changes by file

### `app/app/(tabs)/_layout.tsx`
- Screen order: index (Network), alerts, **agent (center)**, lab, settings.
- `report` becomes hidden from the bar (`href: null`) but stays routable —
  reached via the Report Smoke CTA and deep links.
- Agent tab icon: 54pt fire-orange circle, raised ~14pt above the bar line,
  white chat/sparkle glyph, soft glow shadow; label "Agent" below.

### `app/app/(tabs)/agent.tsx` (new — chat screen)
- Own branded header (solid variant, larger bee logo): "Uinta Agent" + tagline
  "Field intelligence assistant · simulated data".
- Inverted `FlatList` message list: user bubbles (fire bg, white text, right),
  agent bubbles (surface, ink, left, max ~85% width), timestamps omitted.
- Empty state: agent avatar, greeting copy ("Ask me about the network…"), and
  3 suggested-prompt chips: fire risk right now / which sensors are alerting /
  summarize today's conditions.
- Input bar pinned above keyboard (`KeyboardAvoidingView`), send button
  (fire circle, disabled when empty or streaming), 44pt targets.
- Typing indicator: 3 bouncing dots while streaming.
- A11y: role="text" labels on bubbles, "Send message" on button.

### `app/src/services/agent.ts` (new)
- `streamAgentReply(messages, onDelta): Promise<string>` — POST to
  `process.env.EXPO_PUBLIC_AGENT_URL || "http://localhost:8377/v1/chat/completions"`,
  model `process.env.EXPO_PUBLIC_AGENT_MODEL || "claude-haiku-4-5"`,
  `stream: true`. Parses SSE `data:` lines, concatenates `delta.content`,
  calls `onDelta` per token; handles `[DONE]`, aborts via `AbortSignal`.
- System prompt (built per request): Uinta Watch field-agent persona —
  explains the project (open wildfire sensing lab, Uintah Basin, HFENS nodes,
  BME688 + PM2.5, mesh), plus a **live context snapshot** injected from the
  app's simulated data: sensor list w/ status + readings, active alerts,
  recent community reports. Instructs: concise, field-practical, always note
  data is simulated; never invent sensors/readings not in the snapshot.
- Errors throw typed `AgentError` (network/model) → chat shows inline error
  bubble with retry.

### `app/src/components/BrandedHeader.tsx`
- Glass variant logo circle 36 → **48pt** (logo image 36pt), wordmark 20 → 21.
- Solid variant logo 46 → 52pt (image 40) so the bee reads at list headers.

### `app/app/(tabs)/index.tsx` — draggable bottom sheet
- Map now fills the **entire** screen (absolute, full-bleed behind everything).
- Sheet: absolute bottom, height 68% of the screen-minus-tab-bar container
  (capped so the expanded top edge stays below the glass header + ribbon +
  chips — map chrome stays visible); `translateY` animates between
  `peekOffset` (only the top slice, ~42% of the container, is visible —
  handle/title/carousel/Report Smoke) and `0` (expanded, revealing the full
  vertical sensor list).
- `PanResponder` attached to the handle + sheet header row only (never the
  carousel/list — they keep their own gestures): track dy, clamp, on release
  spring-snap to nearest offset (threshold 25% of delta + velocity boost).
- Legend translateY is linked to the sheet offset so it rides above the
  sheet edge as it expands (interpolated, never occluded).
- Content (top→bottom): handle, "Sensors" title + `{n} nodes · {n} online`
  subtitle + "View All ›" toggle (label switches to "Collapse"), then either
  the **carousel (peek)** or the **full scrollable sensor list (expanded)**
  (they swap with a LayoutAnimation cross-reflow; Report Smoke stays pinned
  at the bottom of the visible slice in both states), then the Report Smoke
  pill (fire, glow shadow) → `/(tabs)/report`.

### `app/src/components/MapLegend.tsx`
- Dark translucent pill: `rgba(28, 24, 20, 0.78)`, white 11pt labels, colored
  dots, radius.full, shadow. Items: Online · Alert · Report (drop "Nominal"/
  "Offline" wording; offline still exists in the app but keeps the legend scannable).

### `app/src/components/SensorCarouselCard.tsx`
- Mockup layout: leading status disc (fire for alert / forest for online,
  antenna glyph white) · name (bold) + location subtitle · status badge right.
  Hairline divider; metric row: `🌡 41.6° Temperature | 🔋 88% Battery` (temp
  first slot fire-colored when alerting; second slot battery for alerting,
  RH for others — units-aware via `formatTemp`).
- Alerting card keeps fireGlow bg + hairline fire border.

### `app/src/components/AlertRibbon.tsx`
- Mockup layout: leading icon in concentric-ring badge; text column line 1
  `2 ALERTS — smoke detected at {name}` (bold count), line 2 `{relative time} ·
  {temp}`; trailing chevron. Still one tappable → Alerts tab, spring entrance
  + icon pulse retained.

## Hard constraints (unchanged from v1)
- Strict TS, `npx tsc --noEmit` must pass (no lint script exists).
- Reuse theme tokens only; no new native deps (RN core `Animated` +
  `PanResponder` for the sheet, `KeyboardAvoidingView` for chat).
- Keep: a11y labels on all tappables, 44pt targets, pull-to-refresh, loading/
  error states, SimulatedBadge disclosure, units store, light mode.
- Agent requests never block UI: chat degrades gracefully if proxy is down.

## QA acceptance
See `app/qa/MIGRATION-QA-PROMPT-v2.md`: agent chat streams a real reply from
the local proxy, sheet snaps + drags correctly, logo legibility, legend
restyle, no regressions of v1 checks.
