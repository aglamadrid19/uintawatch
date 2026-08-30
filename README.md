# Uinta Watch

**Community wildfire detection. Open source. Open access. Built by Utahns, for Utah.**

Uinta Watch is a community-driven, open-source early wildfire detection network for Utah's wildlands. Solar-powered LoRa mesh sensors are deployed across the canyons, ridgelines, and rangelands where fires start unannounced — they talk to each other, relay through gateway nodes to the internet, and feed a real-time warning system that anyone can view.

The network is designed to work when nothing else does: no cell signal, no power grid, no satellite coverage. The mesh keeps carrying data, and the sensors keep watching.

## The Problem

Utah is burning, and it's getting worse:

- **1.2M+ acres** burned in Utah since 2015
- **$240M** spent fighting the 2025 fire season
- **180+ structures** destroyed and **3 on-duty firefighter deaths** in 2026
- **75%** of Utah wildfires are human-caused — and catchable early

The gap between smoke and response is measured in hours. Cell towers don't reach every ridge, satellites capture images hours old, and the first person to spot smoke is usually a hiker, rancher, or neighbor with no way to feed that sighting into the emergency network. Uinta Watch exists to close that gap.

## How It Works

```
┌──────────────────────────────────────────────────────────────┐
│                   PHYSICAL SENSOR LAYER                        │
│    [T-Echo + BME688]  [T-Echo + BME280]  [T-Echo + BME688]    │
│          Solar-powered · LoRa mesh · GPS · temp/gas            │
└──────────────────────────────┬────────────────────────────────┘
                               │ LoRa (915MHz mesh)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                     GATEWAY NODES (mesh ↔ net)                │
│        [T-Beam + cellular/satellite] · Meshtastic gateway     │
└──────────────────────────────┬────────────────────────────────┘
                               │ MQTT
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                        UINTA WATCH BACKEND                     │
│              Node.js · TypeScript · REST API                   │
│              MQTT → pipeline → store → API                     │
└──────────────────────────────┬────────────────────────────────┘
                               │ HTTPS / REST
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  UINTA WATCH MOBILE APP                        │
│              React Native (iOS + Android)                      │
│              Map · sensor cards · fire reports · alerts        │
└──────────────────────────────────────────────────────────────┘
```

- **Sensors** — LILYGO T-Echo LoRa radios with BME280/BME688 environmental sensors (temperature, humidity, pressure, and combustion gas detection via the BME688) run on Meshtastic firmware, forming a peer-to-peer mesh with no central coordinator and no subscription fees.
- **Gateways** — a handful of T-Beam nodes with cellular or satellite backhaul bridge the mesh to the internet via MQTT.
- **Backend** — a Node.js/TypeScript REST API ingests MQTT telemetry, stores readings, and serves sensors, readings, fire reports, and alerts to the app.
- **Mobile app** — a React Native (Expo) app showing sensors on a map, live readings, a fire/smoke report form, and an alert feed. Currently runs on realistic mock data until the backend is deployed.
- **Website** — an Astro static site explaining the project and how to get involved.

## Repository Structure

```
uintawatch/
├── app/          React Native mobile app (Expo, TypeScript)
│   └── src/
│       ├── components/   SensorCard, MapCallout, AlertItem, etc.
│       ├── constants/    design tokens, API config
│       ├── services/     REST client with mock-data fallback
│       ├── store/        Zustand state
│       └── types/        Sensor, Reading, FireReport, Alert
├── backend/      Node.js + TypeScript API server (planned)
│                 MQTT client → data pipeline → SQLite → REST API
├── website/      Astro + Tailwind static site (uintawatch.com)
└── planning/     Architecture, research, and approach documents
```

## Getting Started

### Mobile App (`app/`)

Requirements: Node.js 22+, Expo SDK 57.

```bash
cd app
npm install
npm start          # Expo dev server
```

Launch on a platform:

```bash
npm run ios        # iOS simulator
npm run android    # Android emulator/device
npm run web        # web preview
```

The app currently ships with realistic mock sensor data and fails over to it automatically if no backend is reachable. Set `API_BASE_URL` in `app/src/constants/theme.ts` to point at a live backend.

### Website (`website/`)

```bash
cd website
npm install
npm run dev        # astro dev, localhost:4321
```

Other commands: `npm run build` (production build), `npm run check` (Astro type check), `npm run test` (Playwright e2e).

### Backend (`backend/`)

The backend is in early planning. See [`planning/technical-architecture.md`](planning/technical-architecture.md) for the target design: an MQTT client subscribing to gateway telemetry, a data pipeline persisting to SQLite, and a REST API serving:

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

A sensor node costs roughly **$85–150**:

| Component | Product | Role |
|---|---|---|
| Base radio | LILYGO T-Echo (915MHz) | LoRa + GPS + low-power NRF52, configurable via the Meshtastic app |
| Environmental sensor | BME688 or BME280 | Temp, humidity, pressure; BME688 adds H₂/CO/CO₂/VOC gas sensing — the primary early-fire signal |
| Power | 5V solar panel + 18650 Li-ion + TP4056 | 2–3 day battery autonomy |
| Enclosure | 3D print or IP66 box | Weatherproofing |

Gateway nodes (T-Beam + cellular/satellite HAT, ~$100–180) bridge the mesh to the internet every 5–10 km of terrain.

See [`planning/technical-approach.md`](planning/technical-approach.md) for the full feasibility research, including the smoke-detector options analysis and a recommended phased deployment plan.

## Get Involved

The network is only as strong as its community. Ways to contribute:

- **Run a sensor node** — pre-assembled units work out of the box: configure with a phone app, mount with solar, and the node joins the mesh automatically.
- **Build your own** — open-source designs, parts lists, and community help for assembling nodes from off-the-shelf components.
- **Deploy a sensor** — be the local anchor of the network in your wildland community.
- **Report what you see** — when you see smoke or fire, file a report through the app; it feeds straight into the warning system.
- **Write code** — React Native, Node.js, and firmware contributions are all welcome. See [`CONTRIBUTING`](CONTRIBUTING.md).
- **Educate and organize** — help your neighbors and local officials understand what Uinta Watch is and why it matters.

No cell signal? The mesh still carries the data. Power outage? The sensors keep watching. The network doesn't go dark when you need it most.

## Status

The project is in early, pre-release development:

- ✅ Website (uintawatch.com) live, built with Astro
- 🚧 Mobile app in development — maps, sensor cards, reports, alerts
- 🚧 Backend in planning — architecture finalized, implementation starting
- 🚧 Sensor hardware — feasibility researched, pilot deployment planned

## License

This project is open source and free to use — a community network should be owned by the community. Software is licensed under the MIT License; see [`LICENSE`](LICENSE). Hardware designs and documentation are open as well.

*The ridges are watching. The canyons are watching. Now it's your turn.*
