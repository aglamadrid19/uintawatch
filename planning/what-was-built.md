# Uinta Watch — What Was Built (source-of-truth for blog post / AntSeed contest)

> ⚠️ **Status update (Sep 2026):** The project thesis below has been revised after a
> stress-test + verification cycle. The "community early wildfire detection network"
> framing described here was substantially disproven (see
> `research-verification-2026-09.md`); the current stance and roadmap live in
> `positioning-2026-09.md` and `roadmap-2026-09.md`. Everything below remains accurate
> as a record of what was built — but website/app copy making detection claims is
> scheduled for revision (Phase 1 of the roadmap).

> Everything below verified directly from the repo + live X extractions
> (see `x-research.md`, `aglamadrid_posts.json`, `uintawatch_posts.json`, `assets/`).

## The purpose

Uinta Watch is a **community-powered, open-source early wildfire detection network for Utah's wildlands**. The thesis: fires in Utah start where infrastructure ends — no cell signal, no grid power, no satellite freshness — and the gap between smoke starting and someone reacting is measured in hours. Solar-powered LoRa mesh sensors on canyons and ridgelines detect heat/dry-air/combustion-gas signatures before smoke is visible, relay over a self-healing Meshtastic mesh to internet gateways, and feed a public map, alert feed, and citizen-reporting app. Built for and by the Utah community.

Problem stats used consistently across README, website, and X posts:
- 1.2M+ acres burned in Utah since 2015
- $240M firefighting costs in the 2025 season
- 180+ structures destroyed, 3 on-duty firefighter deaths in 2026
- 75% of Utah wildfires are human-caused → catchable early

## Timeline

- **Aug 29, 2026 (sprint day 1):** first commit (22:22), opencode config/skills (23:22). Project X account launched same day ("ridges are watching" posts).
- **Aug 30 (sprint day 2 + polish):** React Query + offline migration in app (10:22), public threads, iPhone/iPad demo posts, AntSeed/opencode credit thread.
- **Sept 19:** second weekend sprint — AI image generation round (AntSeed image models), GLM 5.3 Flash; post anticipating AntSeed's **Sept 25 build contest**.

## What was built

### 1. Mobile app (`app/`) — the flagship deliverable
- **React Native 0.86 + React 19 + Expo SDK 57**, TypeScript 6 (strict), Expo Router file-based navigation.
- **Tabs:** Map (sensor network over react-native-maps with green/yellow/red status pins), Alerts (fire alert feed), Report (fire/smoke sighting form with GPS pre-fill + optional photo via expo-image-picker).
- **Sensor detail route** (`/sensor/[id]`) — temp, humidity, pressure, VOC index, battery mV, RSSI.
- **Architecture:** TanStack React Query hooks (useSensors / useAlerts / useReports) with 30s polling + 5-min staleTime; Zustand app store; full design-token theme system (colors/spacing/typography/motion/radius).
- **Offline-first behavior:** NetInfo detection + automatic fallback to a realistic mock dataset (8 HFENS-* sensor nodes in the Uintah Basin — Ouray, Fort Duchesne, Jensen, etc.) when no backend is reachable.
- **iOS native build**: ios/ + android/ prebuilt, EAS build configured (bundle id com.uintawatch.app), permissions wired (location, camera, photo library).
- Notable: a `postinstall` sed patch of expo-modules-core native files (WorkletsAdapter) — a real-world bleeding-edge React Native war story.

### 2. Website (`website/`) — live at uintawatch.com
- **Astro 7 + Tailwind CSS 4** (@tailwindcss/vite), static-first, prefetch-all, view transitions.
- **Pages:** home, about, sensors, get-involved, support (donations), privacy, 404, RSS feed.
- **Content system:** FAQ + stats JSON, and a phased rollout story (pilot → county → community → regional) as markdown content collections.
- **Polish:** self-hosted subsetted fonts (DM Serif Display + Archivo via fontsource), full favicon-icon set, web manifest, sitemap, robots, OG image, AI-generated landscape photography (auto-optimized).
- **QA:** Playwright e2e suite covering navigation, accessibility (skip links, alt text), zero-console-error checks, and mobile overflow.
- Deployed production (dist/ built out).

### 3. AI-agent build infrastructure
Built with **opencode** + **AntSeed free models** as the LLM provider:
- Custom **sub-agents**: Gemini-vision agents for image understanding/QA of screenshots, image-generation agents for landing-page art.
- **Custom Chrome-control tooling** (CDP plugin): lets agents do live web research in a real browser with wait/notification flow for captchas.
- **Skills** encoding design rules + project conventions; planning sub-agent produced the technical-architecture docs that kicked off coding.
- Workflow: agents built the site, generated its imagery, and QA'd both website and app visually.

### 4. Hardware architecture (designed in detail; physical deployment is next)
- **Sensor nodes:** LILYGO T-Echo (915 MHz LoRa + GPS + NRF52) on Meshtastic firmware + BME280/BME688 environmental sensors (BME688's H₂/CO/CO₂/VOC gas sensing is the early-fire signal). Solar + 18650 + TP4056, 2–3 day autonomy, ~$85–150/node.
- **Gateways:** T-Beam + SIM7600 cellular or RockBLOCK satellite HAT bridging mesh→MQTT (~$100–200 each, one per 5–10 km of terrain).
- **Detection logic:** threshold rules (temp ≥ X, humidity ≤ Y, VOC spike) with option of Bosch BSEC AI smoke-signature classification; alert packets broadcast over the mesh.
- **Backend design (specified, greenfield):** Node.js + TypeScript + Express + SQLite (better-sqlite3) + mqtt.js + Zod, Dockerized; REST API v1 (sensors/readings/reports/alerts), shared-token writes, public reads, HTTPS 30s-poll → WebSocket planned.
- **Research docs:** Utah wildfire research, technical approach + architecture docs, phased deployment plan, presentation deck preview, logo assets.

## Full tool / framework / SaaS inventory (cite these on the blog)

**AI / agent stack (the AntSeed angle):**
- opencode (AI coding agent) + sub-agents + skills + custom Chrome/CDP plugin
- AntSeed — free model provider (vision + text; GLM 5.3 Flash used in the Sept 19 round)
- Grok via X integration (progress-check posts)
- AI image generation for all website photography and promo banners

**Mobile:** Expo (SDK 57, EAS), React Native 0.86, React 19, TypeScript 6, Expo Router, react-native-maps, TanStack React Query 5, Zustand 5, NetInfo, expo-location/image-picker/secure-store/.Constants/fonts, babel-preset-expo.

**Web:** Astro 7, Tailwind CSS 4 (@tailwindcss/vite), @astrojs/rss, @astrojs/sitemap, fontsource (self-hosted DM Serif Display + Archivo), Playwright (e2e), Python script for image generation/optimization.

**Backend (planned):** Node.js 20+, Express, SQLite/better-sqlite3, mqtt.js, Zod, dotenv, Docker.

**Hardware/firmware:** Meshtastic, LoRa 915 MHz, LILYGO T-Echo / T-Beam, Bosch BME280 / BME688 / BSEC, SIM7600 cellular, RockBLOCK satellite, TP4056 solar charging.

**Distribution:** App Store + Google Play via EAS; GitHub (open-source repo, LICENSE file); X (moon_kidR + @UintaWatch) for build-in-public comms.

## Blog-ready narrative hooks
1. Hardware-as-community-infrastructure — "the network works when nothing else does."
2. AI agents as real builders, not autocomplete — free AntSeed models, vision subagents QA'ing UI, Chrome-driving research agents.
3. Bleeding-edge stack discipline: Expo 57 / React 19 / TS 6 / Astro 7 / Tailwind 4 — with the concrete expos-native-patch war story.
4. Mock-first development: a convincing live-feeling app while the backend is greenfield.
5. Build-in-public engagement: founder answered every reply; community message "a building-in-public project that touches actual grass."
6. What's next (good closing section): Sept 25 AntSeed contest weekend, first two physical sensors, backend, real meshes over Uintah Basin.
