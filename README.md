# Uinta Watch

**An open field lab for low-cost wildfire sensing — built in Utah, in public.**

> **Version 2.0, September 2026.** This project started as a "community early
> wildfire detection network." A stress-test and verification cycle (see
> [`planning/research-verification-2026-09.md`](planning/research-verification-2026-09.md))
> showed that framing rested on claims the evidence doesn't support — a federal audit
> (DHS OIG-26-05) found that far more sophisticated commercial ground sensors still
> failed to reliably detect fires. We kept the mission, changed the thesis. What's
> below describes the project as it actually stands today.

Wildfire detection is full of impressive demos. UintaWatch is an open field lab for
low-cost wildfire sensing: we build open sensor nodes, run reproducible tests against
real fire, and publish everything — including failures. Published federal research shows
ground smoke sensors beat satellites at night and during smoldering events that cameras
and satellites miss; we're rebuilding that capability on open hardware, off-grid, for a
fraction of the cost, and measuring exactly where cheap detection stops working.

## Why here, why now

Utah is burning, and it's getting worse:

- **1.2M+ acres** burned in Utah since 2015
- **$240M** spent fighting the 2025 fire season
- **180+ structures** destroyed and **3 on-duty firefighter deaths** in 2026
- **75%** of Utah wildfires are human-caused

Figures compiled from Deseret News' wildfire reporting (Aug 2026), the Utah State
Forester, and federal incident reports; year-by-year detail and citations in
[`planning/utah-wildfire-research.md`](planning/utah-wildfire-research.md), with the
verification trail in [`planning/research-verification-2026-09.md`](planning/research-verification-2026-09.md).

We don't claim a $100 node closes the gap between ignition and response — the federal
audit of far better-funded ground sensors shows that problem is physics, placement,
validation, and trust, not just cost. But the specific gaps below are real, and ground
sensors are the one instrument class that provably reaches them.

## The gaps we target

We aim at the detection gaps that cameras and satellites provably cannot cover:

- **Night smoldering** — our primary target; satellites see nothing
- **Cloud-obscured events**
- **Low-intensity smoldering** on contained / "extinguished" fires
- **Far-field smoke discrimination** — the major unsolved false-positive source

These come with published, external bars to clear — the January 2026 NRCan study
(Fire 9(4):141, DHS-funded sensors) reports 100% detection on fires >100 ha, 30%
detection on fires ≤1 ha, and nighttime smoldering detections where satellites see
nothing. The goal is to *match or beat those results on radically cheaper open
hardware, off-grid* — and to publish exactly when cheap detection works and when it
doesn't. Our gates, phases, and budget live in
[`planning/roadmap-2026-09.md`](planning/roadmap-2026-09.md).

## What we're building

The lab has three pillars:

1. **UintaNode — open hardware sensor configs.** 3–5 deliberately different
   node designs (BME688-only baseline up to BME688 + PM2.5 + CO + wind, plus an
   env-only negative-control node), each documented down to wiring, firmware, and
   enclosure. Deliberately different so the bench can compare detection approaches.
2. **UintaBench — an honest leaderboard.** A shared schema (aligned with NRCan's
   open MIT-licensed dataset for direct comparability) covering detection vs
   distance/wind/fire-size, false alarms per node-day, power, and cost. Negative
   tests count as results. Every row starts as `?` and gets filled in against real
   burns — starting with the first table in the app's Lab tab.
3. **An off-grid data path.** Nodes talk over Meshtastic mesh, a few gateway nodes
   bridge to the internet, and a backend stores time series and serves the public
   app. Whether community mesh can carry alert traffic reliably is itself one of the
   experiments, not a claim.

```
 PHYSICAL SENSOR LAYER  (planned — Phase 2)     LILYGO T-Echo nodes, configs A–E
   BME688 / PM2.5 / CO / anemometer · solar · GPS
            │  LoRa 915 MHz, Meshtastic mesh  (one tested transport)
            ▼
 GATEWAY NODES  (planned)                       T-Beam + cellular/ WiFi backhaul
            │  MQTT
            ▼
 UINTA WATCH BACKEND  (not started — Phase 3)   Node.js · TypeScript · SQLite
   schema-first around the UintaBench schema → REST API + open data export
            │  HTTPS / REST
            ▼
 UINTA WATCH APP  (built)                       React Native · Expo · iOS + Android
   map · sensor detail · reports · alerts · agent · Lab leaderboard
            +
 UINTA WATCH WEBSITE  (live)                    Astro · uintawatch.com
   the lab's public face: journal, open questions, how to get involved
```

## Repository Structure

```
uintawatch/
├── app/            React Native 0.86 + Expo SDK 57 app (TypeScript, Expo Router)
│   ├── app/        Routes: (tabs)/ Network · Alerts · Report · Agent · Lab · Settings,
│   │               plus sensor/[id], alert/[id], report/[id] detail screens
│   ├── src/
│   │   ├── components/   SensorCard, MapCallout, MetricChart, WindChip, ReportCard, …
│   │   ├── hooks/        TanStack React Query hooks (useSensors / useAlerts / useReports)
│   │   ├── services/     api.ts (REST client), simulation.ts (simulated network),
│   │   │                 agent.ts (Uinta Agent chat client)
│   │   ├── store/        Zustand app store + persisted units/map-type settings
│   │   ├── theme/        design tokens, API_BASE_URL (env: EXPO_PUBLIC_API_URL)
│   │   └── types/        Sensor, Reading, FireReport, Alert
│   ├── qa/         Headless iOS simulator QA harness (idb + simctl) + QA-FINDINGS.md
│   ├── ios/ · android/ · eas.json   Native prebuilts + EAS build config
├── backend/        Empty — Phase 3 of the roadmap (see planning/technical-architecture.md)
├── website/        Astro 7 + Tailwind 4 static site (uintawatch.com): journal,
│                   open-questions page, Playwright e2e suite
└── planning/       Research, verification, positioning, roadmap, architecture docs
```

## Getting Started

### Mobile App (`app/`)

Requirements: Node.js 22+.

```bash
cd app
npm install
npm start          # Expo dev server
```

Launch on a platform:

```bash
npm run ios        # iOS simulator (native build)
npm run android    # Android emulator/device
npm run web        # web preview
```

**No physical sensors are deployed and the backend doesn't exist yet**, so the app
runs on a scripted, clearly-labeled simulated network: 8 HFENS-Uintah nodes in the
Uintah Basin with ticking readings, wind, mesh health, a burn-event alert timeline,
and persisted community reports. A badge in the UI says so at all times — the app
must never pass simulation off as real data.

- The REST client (`app/src/services/api.ts`) already targets the backend contract
  below; flipping `useSimulatedData` to false enables live paths with automatic
  fallback to simulation when unreachable.
- Point at a live backend with `EXPO_PUBLIC_API_URL` (default
  `http://localhost:3000/api/v1`, defined in `app/src/theme/constants.ts`).
- The **Agent tab** is an experimental field-intelligence assistant. It streams from
  a local OpenAI-compatible endpoint (`EXPO_PUBLIC_AGENT_URL`, default
  `localhost:8377`) and answers are grounded in the same simulated network the app
  shows.
- Before touching UI code, read `app/qa/README.md` and verify changes with the
  `./qa` simulator harness; findings live in `app/qa/QA-FINDINGS.md`.

### Website (`website/`)

```bash
cd website
npm install
npm run dev        # astro dev, localhost:4321
```

Other commands: `npm run build` (production build), `npm run check` (Astro type check), `npm run test` (Playwright e2e).

### Backend (`backend/`)

The backend directory is empty — implementation is Phase 3 of the roadmap and will
be **schema-first around the UintaBench schema**: nodes/configs registry, raw
time-series ingest (gateway MQTT → store), event annotations (burn events and
negative events), and CSV/Parquet export aligned with NRCan field names. The app's
REST client defines the v1 contract it will serve:

```
GET  /api/v1/sensors
GET  /api/v1/sensors/:id
GET  /api/v1/sensors/:id/readings?from=&to=&limit=
POST /api/v1/reports
GET  /api/v1/reports
GET  /api/v1/alerts
POST /api/v1/alerts
```

## Hardware

Sensor nodes are deliberately varied so the bench can compare them. Target cost is
roughly **$40–110 per node**:

| Config | Sensors | Purpose | Cost |
|---|---|---|---|
| A | BME688 | v1 baseline; direct comparison to commercial lineage | ~$55 |
| B | BME688 + PM2.5 | adds particulates | ~$75 |
| C | BME688 + PM2.5 + CO | NRCan/MIT evidence favors CO for detection | ~$95 |
| D | C + wind (speed + direction) | wind is first-class data, enables plume gating | ~$110 |
| E | BME280 only | negative control — the false-positive reference node | ~$40 |

All nodes: LILYGO T-Echo (915 MHz LoRa + GPS) on Meshtastic firmware, solar + 18650 +
TP4056 power, GPS/battery telemetry, SD logging. The BME688's gas sensing is **one
input under test — not the fire detector**. Gateway nodes (T-Beam + cellular or
WiFi-first backhaul) bridge the mesh to the internet.

The full feasibility research, the smoke-detector options analysis, and the DHS/NRCan
evidence trail live in [`planning/technical-approach.md`](planning/technical-approach.md)
and [`planning/research-verification-2026-09.md`](planning/research-verification-2026-09.md).

## Get Involved

The lab works because people around it make it work:

- **Run an experiment node** — once configs land, a node in your yard is a Bench
  data point, including (especially) negative tests: campfires, BBQs, dust, vehicles.
- **Build your own** — per-config BOMs, wiring docs, firmware, and enclosure STLs
  will be published under `lab/uintanode/` as they're built.
- **Get us near real fire** — we're reaching out to Utah FFSL, DEQ's Smoke Management
  Program, and University of Utah AirU about placing 3–6 nodes around one planned
  prescribed burn. Introductions help.
- **Report what you see** — the app's report form exists; note that with no backend
  and no deployed nodes it does not yet reach any emergency system, and it is not a
  substitute for 911.
- **Write code** — React Native, Node.js, and firmware contributions are all welcome.
- **Follow along** — the website's journal and open-questions pages track what we
  learn, including what breaks.

## Status

Version 2.0 — post-pivot, pre-hardware:

- ✅ **Website** (uintawatch.com) live — Phase 1 message surgery done: retired
  detection claims replaced with lab framing, open-questions page and journal live
- ✅ **Mobile app** v2 — Network/Alerts/Report/Agent/Lab/Settings tabs, simulated
  network, units + map settings, offline report persistence, QA'd on simulator
  (all confirmed bugs fixed per `app/qa/QA-FINDINGS.md`); iOS/Android prebuilts + EAS
- ✅ **Verification & positioning docs** — DHS OIG + NRCan evidence checked directly,
  roadmap with external success gates written
- 🚧 **Phase 0 — data bootstrap** — not started: NRCan dataset reproduction notebook,
  UintaBench schema + `lab/` scaffold
- 🚧 **Phase 2 — node configs** — not started: build configs A–E
- 🚧 **Phase 3 — backend** — not started: `backend/` is an empty directory
- 🚧 **Physical deployment** — none; field access outreach (FFSL / DEQ / AirU) is the
  long-lead item

## License

This project is intended to be fully open — software MIT, hardware designs and
documentation open as well. Project-level `LICENSE` and `CONTRIBUTING.md` files are
not in the repo yet; they're part of the public release checklist.

*The ridges are watching. The canyons are watching. Now it's your turn.*
