# Uinta Watch — Technical Architecture
## Project: uintawatch
## Stack: React Native (app) + Node.js/TypeScript (backend) + Meshtastic (mesh hardware)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PHYSICAL SENSOR LAYER                     │
│  [T-Echo + BME688] [T-Echo + BME280] [T-Echo + BME688]     │
│         Solar-powered · LoRa mesh · GPS · temp/gas         │
└──────────────────────────┬──────────────────────────────────┘
                           │ LoRa (915MHz mesh)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    GATEWAY NODES (mesh ↔ net)               │
│  [T-Beam + cellular/satellite] · · · [T-Beam + cellular]  │
│          Meshtastic gateway role · MQTT out                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ MQTT (port 1883)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  UINTA WATCH BACKEND                         │
│         Node.js · TypeScript · Docker · REST API            │
│                                                              │
│  MQTT Client ──► Data Pipeline ──► SQLite/DB                 │
│                                       │                     │
│                              REST API (Express)              │
│                         GET /sensors                        │
│                         GET /sensors/:id                    │
│                         GET /sensors/:id/history           │
│                         POST /reports                       │
│                         GET /reports                        │
│                         POST /alerts                        │
│                         GET /alerts                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              UINTA WATCH MOBILE APP                         │
│       React Native (TypeScript) · iOS + Android              │
│                                                              │
│  Map screen: sensor pins · tap for readings                 │
│  Sensor cards: temp · humidity · pressure · gas · battery │
│  Fire report form: GPS · text · photo · submit              │
│  Alert feed: fire detections · node status changes        │
│  Real-time: polling or WebSocket                            │
└─────────────────────────────────────────────────────────────┘
                           │ public app store (no gated access)
                           ▼
                      ANYONE CAN DOWNLOAD
```

---

## Project Structure

```
uintawatch/
├── app/                    React Native project (TypeScript)
│   ├── src/
│   │   ├── screens/        MapScreen, SensorDetailScreen, ReportScreen
│   │   ├── components/     SensorCard, MapPin, AlertFeed, ReportForm
│   │   ├── services/       api.ts (REST client), websocket.ts
│   │   ├── types/         sensor.ts, report.ts, alert.ts
│   │   └── navigation/     React Navigation stack
│   └── android/ + ios/    Platform builds
│
├── backend/                Node.js project (TypeScript) Dockerized
│   ├── src/
│   │   ├── mqtt/          MQTT client — subscribes to gateway topic
│   │   ├── store/         data store (SQLite via better-sqlite3 or Prisma)
│   │   ├── api/           Express router — REST endpoints
│   │   └── types/         shared interfaces
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
└── website/               Astro static site (already exists)
    └── src/
```

---

## Sensor Hardware

### Device Stack
| Component | Product | Price | Role |
|---|---|---|---|
| Base radio | LILYGO T-Echo (915MHz) | ~$35-70 | Pre-assembled LoRa + GPS + NRF52. Config via Meshtastic phone app. |
| Environmental sensor | BME688 | ~$25-40 | Temperature, humidity, pressure, H₂/CO/CO₂/VOC gas. Grove plug-in. No soldering. Primary fire detection sensor. |
| Alt env sensor | BME280 | ~$8-12 | Temp, humidity, pressure only. Lower cost option for relay-only nodes. |
| Power | 5V/2A solar panel + 18650 Li-ion + TP4056 | ~$15-20 | 2-3 day battery autonomy |
| Enclosure | 3D print or IP66 box | ~$5-15 | Weatherproofing |

### Per-node cost: **~$85-140**

### Meshtastic firmware handles:
- Mesh networking (relay between nodes)
- GPS coordinates per node
- Temperature/humidity/pressure telemetry (via BME280/BME688 via I2C)
- Alert packet broadcast (via Node-RED logic or custom firmware)
- Phone app configuration

### Fire detection logic:
- Threshold-based: temperature ≥ X°C AND humidity ≤ Y% AND VOC spike
- Escalates to alert packet over mesh broadcast
- Meshtastic or custom firmware; Node-RED pipeline can also process MQTT → alert generation server-side
- Gas sensor (BME688) is the primary early-detection signal — picks up combustion gases before visible smoke

### One open item: smoke detector integration
- No commercial LoRa smoke detector at reasonable cost with native mesh integration today
- Options: (A) Z-DDZYD-908 + ESP32 signal bridge, (B) ignore as primary detection given BME688 gas sensing is effective, (C) buy commercial LoRaWAN smoke detectors as a secondary layer
- **Recommendation**: Build on BME688 gas detection as primary. Add smoke detector via option A as community-built add-on separately.

---

## Gateway Nodes

Every 5-10km of terrain needs one gateway node to bridge the mesh to the internet.

| Component | Product | Price |
|---|---|---|
| Base | LILYGO T-Beam Supreme (915MHz) | ~$30-77 |
| Connectivity | Cellular HAT (SIM7600) or satellite (RockBlock) | ~$40-100 |
| Power | Solar + battery same as sensor nodes | ~$15-20 |
| Enclosure | IP66 box | ~$10-15 |

**Estimated per gateway: ~$100-200**

Meshtastic runs the gateway role — no custom firmware needed. MQTT broker connection is configured via the phone app.

---

## Backend (Node.js + TypeScript + Docker)

### Responsibilities
1. Connect to the MQTT broker (shared with gateway nodes) and subscribe to the sensor topic namespace
2. Parse incoming telemetry packets (node ID, temp, humidity, pressure, gas readings, GPS, battery, signal)
3. Store readings in a time-series data store
4. Serve REST API to the React Native app:
   - `GET /sensors` — list all nodes with latest reading
   - `GET /sensors/:id` — single node detail
   - `GET /sensors/:id/history?from=&to=` — reading history
   - `POST /reports` — user-submitted fire/smoke sighting report
   - `GET /reports` — public fire report feed
   - `POST /alerts` — write a fire alert (from Node-RED or backend processing)
   - `GET /alerts` — active alert feed
5. Optionally: WebSocket push for real-time updates to the app

### Stack choices
| Layer | Choice | Notes |
|---|---|---|
| Runtime | Node.js 20 LTS | Docker image `node:20-alpine` |
| Language | TypeScript | Strict mode |
| HTTP framework | Express | Standard, well-documented |
| Data store | SQLite via better-sqlite3 | File-based, self-hosted, zero ops overhead for pilot. Swap to Postgres when scaling. |
| MQTT client | mqtt.js | Works in Node.js, handles reconnection |
| Validation | Zod | Runtime type validation for incoming MQTT payloads and API inputs |
| Config | dotenv | Environment variables in `.env` |
| Container | Docker + Docker Compose | `uintawatch-backend.dockerfile` + compose |

### Data model
```
Sensor {
  id: string (Meshtastic node ID / MAC)
  name: string
  lat: number
  lng: number
  lastSeen: timestamp
  status: 'online' | 'offline' | 'alert'
}

Reading {
  sensorId: string
  timestamp: timestamp
  tempC: number
  humidityPct: number
  pressureHPa: number
  voc: number (BME688)
  batteryMv: number
  rssi: number
}

FireReport {
  id: string
  lat: number
  lng: number
  text: string
  photoUrl: string | null
  submittedAt: timestamp
  verified: boolean
}

Alert {
  id: string
  sensorId: string | null
  type: 'sensor' | 'user_report' | 'system'
  severity: 'warning' | 'elevated' | 'critical'
  message: string
  triggeredAt: timestamp
  resolved: boolean
}
```

### REST API shape
```
GET  /api/v1/sensors
GET  /api/v1/sensors/:id
GET  /api/v1/sensors/:id/readings?from=&to=&limit=
POST /api/v1/reports
GET  /api/v1/reports
GET  /api/v1/alerts
POST /api/v1/alerts
```

All endpoints return `application/json`. Auth: none for public reads; POST endpoints use a simple shared token for the pilot phase. No user accounts.

---

## React Native App

### Framework: React Native (TypeScript)
### Why React Native: One codebase for iOS + Android. Large contributor pool. Good map library ecosystem (react-native-maps, Mapbox).

### Screens
1. **Map Screen** — full-screen map (Mapbox GL or MapLibre GL) with:
   - Sensor pins (color-coded: green=nominal, yellow=warning, red=alert)
   - Tap pin → slide-up sensor card with readings
   - Scrollable sensor list panel below map
2. **Sensor Detail Screen** — full readings view, 24h chart (temp, humidity, pressure, gas), location on map, battery signal
3. **Report Screen** — fire sighting form: GPS pre-fill, text description, optional photo, submit button
4. **Alert Feed Screen** — scrollable feed of fire alerts and fire reports with timestamps

### Key libraries
| Purpose | Library |
|---|---|
| Navigation | @react-navigation/native (stack) |
| Maps | react-native-maps (Mapbox GL or Apple/Google) |
| Charts | react-native-chart-kit or victory-native |
| HTTP client | axios |
| State | Zustand or React Context |
| Styling | StyleSheet + design tokens |

### Real-time updates
- Polling interval (~30s) is fine for pilot scale
- WebSocket upgrade path when the app deserves it
- Backend exposes a WebSocket endpoint at `ws://host/alerts` for future

---

## Docker Setup

### backend/Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### backend/docker-compose.yml
```yaml
version: '3.9'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      MQTT_BROKER_URL: mqtt://host.docker.internal:1883
      DB_PATH: /data/uintawatch.db
    volumes:
      - ./data:/data
    restart: unless-stopped
```

### Running locally (dev)
```bash
cd backend
npm install
docker compose up       # with Docker
# OR
npm run dev            # direct node (MQTT_BROKER_URL=... node dist/index.js)
```

---

## Open Technical Items

1. **Fire detection threshold logic** — needs calibration per Utah seasonal baselines. Node-RED or backend pipeline makes sense here. BME688 AI (Bosch BSEC) pre-trained on smoke signatures is a solid option; otherwise threshold-based is fine for pilot.

2. **Gas sensor calibration** — BME688 readings need to be baseline-adjusted for Utah's specific elevation and ambient air quality. One-time setup per node.

3. **Right-to-left Solana mesh** — Meshtastic mesh can route around dead nodes but in the D23-LS or similar modular approach, a donated old phone with Meshtastic app can act as a relay-only device for places with no cell.

4. **Push notifications** — React Native uses Expo for push. Firebase Cloud Messaging (FCM) for Android, APNs for iOS. Expo handles both. This is a Phase 2 feature.

5. **Photo upload for fire reports** — `POST /reports` accepts a photo. File storage: local disk for pilot, S3/Cloudflare R2 for scaling.

---

*This document reflects the agreed stack as of the planning phase. Backend and app documented here.*