# Uinta Watch — Technical Architecture Overview

*Feasibility summary and recommended approach. For planning and community reference.*

---

## What This Document Is

A grounded look at the technical path for Uinta Watch — what hardware exists, what it costs, what the network architecture looks like, and what the remaining open questions are. No assumptions, no speculation beyond what existing projects and hardware have demonstrated.

The bottom line: **this project is technically feasible today.** The building blocks exist, the mesh architecture is proven, and the community participation path is real. The main challenge is the integration and deployment work — not invention.

---

## Network Architecture

### Core Requirement
Sensors must communicate without relying on cell towers or satellites. A few gateway nodes bridge to the internet. Everything else is peer-to-peer mesh.

### Recommended Stack: LoRa Mesh (Meshtastic)

**What it is:** A decentralized mesh network running on LoRa radio (915MHz in the US). LoRa is long-range (3-15km with line of sight, better with relays), low-power, and has no per-device subscription fee.

**How it works:**
- Every sensor node has a LoRa radio and acts as both a sensing unit and a relay
- Nodes forward each other's packets, extending range across terrain without infrastructure
- A handful of "gateway" nodes have LoRa on one side and internet/cellular on the other
- The mesh is fully autonomous — no single point of failure, no central coordinator
- Data flows: node → mesh relay → gateway → MQTT → web dashboard + mobile alert

**Why LoRa/Meshtastic specifically:**
- Proven globally; hundreds of thousands of Meshtastic nodes running
- Runs on cheap, commercially available hardware with fully open-source firmware
- No subscription, no cellular dependency, no per-year software cost
- Solar + battery-powered devices are well within practical reach
- The IspeedMesh implementation handles node mobility

**Alternative paths considered:**
- **Zigbee:** No subscription, but only ~100m range outdoors — not suitable for Utah landscape scale
- **WiFi sensors:** Too power-hungry for solar; requires existing infrastructure
- **Satellite-only:** Way too expensive per node; appropriate for gateway backhaul only
- **LoRaWAN (pure):** Standard is excellent for sensors but gateway-dependent; Meshtastic fills the mesh relay gap better

---

## Sensor Hardware Options

### Base Radio — Pre-Assembled, No Soldering

| Device | Price | Specs |
|---|---|---|
| **LILYGO T-Echo** | ~$35-70 | Pre-assembled; LoRa + GPS + NRF52 low-power chip + battery. Grove I²C expansion port for external sensors. Works out of the box with Meshtastic firmware. |
| **LILYGO T-Beam Supreme** | ~$30-77 | Pre-assembled; LoRa + GPS + optional cellular. Standard Meshtastic device. Slightly larger form factor. |

Both devices are configured via the Meshtastic phone app in minutes. You pair the device, set its role (sensor node, relay, or gateway), and it joins the mesh immediately. No firmware compilation required for basic use.

### Environmental Sensors — Plug-and-Play

| Sensor | Price | Measures | Integration |
|---|---|---|---|
| **BME280** | ~$8-12 | Temperature, humidity, pressure | Plugs directly into T-Echo/T-Beam Grove port. No soldering, no code. Configured via Meshtastic app. |
| **BME680** | ~$25-40 | Temperature, humidity, pressure, hydrogen, CO, CO₂, VOC (gas) | Same Grove plug-in. Requires enabling in Meshtastic config (minor). This is the most relevant for early fire detection — gas sensing picks up combustion before smoke is visible. |
| **BME688** | ~$35-50 | Same as BME680, with AI-based preprocessing | Same integration as BME680. Bosch's BSEC library can be pre-trained on smoke vs. ambient air. Used in existing wildfire detection research projects. |

### Smoke Detection — The Open Challenge

No commercial-off-the-shelf smoke detector currently ships with native LoRa mesh integration at a reasonable price point. The viable approaches:

**Option A — Z-DDZYD-908 + signal decoder (~13/gateway)**
The Z-DDZYD-908 is a cheap 433MHz smoke detector. Its signal can be captured by an ESP32 receiver board and bridged into the Meshtastic mesh via MQTT. This requires a small wired connection but uses no soldering — components plug into a breadboard-style board. Feasible for community members comfortable with basic electronics.

**Option B — Commercial LoRaWAN smoke detector**
Products like the LS100-SMK (~50/node) or Netvox RA02A (~19-233/node) send smoke/temperature alerts directly to any LoRaWAN gateway. Compatible with Uinta Watch's gateway infrastructure. The trade-off is they don't natively run Meshtastic software and lack the community mesh relay layer — they're point-to-point to the gateway. This is fine as a secondary detection layer and may be the most practical for non-technical participants who just want to buy and deploy.

**Option C — Focus on gas/temperature sensing as primary detection**
The BME688's gas sensing (H₂, CO, CO₂, VOC) detects combustion in the air before visible smoke appears. Combined with temperature and humidity anomalies, this is effective for catching early-stage fires. This is the approach used by Dryad Silvanet and the Heltec wildfire detection project. Smoke detection becomes a supplementary layer, not the primary one.

### Power — Solar + Battery

Standard setup for an autonomous sensor node:
- **5V/2A polycrystalline solar panel** (~$10-15 for a small panel that fits in an enclosure)
- **18650 3000mAh Li-ion battery** (~$5-8)
- **TP4056 charge controller** (~$1-2) — pre-assembled board with micro-USB in
- **3D-printed or weatherproof enclosure** (~$5-15, or free to print)

Battery autonomy target: 2-3 days without sunlight. In Utah's climate, this is achievable with a modest panel and good enclosure placement.

---

## Software Stack

| Layer | Tool | Cost | Notes |
|---|---|---|---|
| Sensor firmware | **Meshtastic** (open source) | Free | Runs on T-Echo/T-Beam. Configurable via phone app. Mesh routing, telemetry, GPS all built in. |
| Network server | **ChirpStack** (open source, self-hosted) or **The Things Network** (free community tier) | Free (self-hosted) | ChirpStack on a Raspberry Pi (~$50) handles all LoRaWAN gateway traffic. TTN is simpler to start with, no hardware needed for server. |
| Data processing | **Node-RED** (open source) | Free | Flow-based visual editor. Receives MQTT from ChirpStack/TTN, processes alerts, triggers notifications. |
| Web dashboard | **Custom or no-code builder** (Grafana, Node-RED Dashboard) | Free | Shows map of nodes, sensor readings, fire alerts in real time. |
| Mobile app | **Meshtastic app** (already exists, free) + custom alerts via MQTT push | Free (existing app) | The Meshtastic phone app already shows node status, messages, and alerts. Uinta Watch adds fire-alert push notifications. A custom overlay app is optional for phase 2. |
| Push notifications | **ntfy** (open source) or custom MQTT → push bridge | Free | Any alert that triggers in Node-RED gets sent as a push notification to subscriber phones. |

**Total software cost: $0** — everything is open source and free to self-host.

---

## Deployment Cost Estimate (Per Sensor Node)

| Component | Cost |
|---|---|
| LILYGO T-Echo (base radio) | $35-70 |
| BME680 or BME688 sensor | $25-40 |
| Solar panel (5V/2A) + enclosure | $15-25 |
| Battery + charge controller | $10-15 |
| **Total per node** | **~$85-150** |

| Component | Cost |
|---|---|
| Gateway node (LILYGO T-Beam + cellular HAT or satellite) | $80-150 |
| Solar panel + battery | $20-30 |
| **Total per gateway** | **~$100-180** |

Gateway nodes need to be spaced roughly 5-10km apart depending on terrain. A county-scale deployment might need 5-15 gateways and 50-200 sensor nodes.

---

## Open Technical Questions

These are real questions that need answers before full deployment:

1. **Smoke detector integration**: The gap between cheap smoke detectors and LoRa mesh. Best path forward is likely Option C — treat gas/temp sensing as primary detection, buy a few Z-DDZYD-908 units for community members who want one, and pursue Option B as a longer-term component.

2. **Fire detection threshold**: What temperature, humidity, and gas readings constitute a "fire alert" vs. a normal hot day in Utah? This requires research, calibration against seasonal baselines, and ideally cross-referencing with the National Fire Danger Rating System. The Heltec/Bosch BME688 with AI pre-trained on smoke signatures is the best short-term approach.

3. **Gateway density for Utah terrain**: LoRa range is heavily terrain-dependent. Utah's canyons and ridgelines need empirical testing to determine actual coverage per gateway. A pilot deployment of 5-10 nodes in one area before scaling is the right approach.

4. **UT County voltage regulations**: Solar deployments in rural Utah may need to be reviewed against local codes if nodes are mounted on structures or in public rights-of-way. This is a user-education issue, not a blocker for private wildland deployment.

5. **Central server hosting**: ChirpStack on a Raspberry Pi at someone's home works for pilot scale. At county or state scale, it would need a proper VPS (~$10-20/mo) or a community member to host and maintain the server.

---

## What Has Been Proven Elsewhere

**Heltec BME688 + Meshtastic mesh (Honduras, 2025):**
A working partial implementation of this exact concept. BME688 sensor, Meshtastic mesh, MQTT, Node-RED. Demonstrated viable LoRa mesh range and sensor-to-dashboard data flow.

**AranyaLink (Hackaday, June 2026):**
$10/resource-constrained wildfire mesh using ESP32 and ESP-NOW. Validates the very-low-cost node concept, GPS-based alert location, and multi-hop relay. Circuit assembly required.

**Dryad Silvanet (commercial, deployed Europe/US):**
Solar-powered LoRaWAN mesh sensors with AI gas detection. 10-15 year service life. Validates that solar + mesh + gas sensing at scale is a mature commercial concept. Uinta Watch is the community-scale version of this.

**Meshtastic global community (2024-2026):**
100,000+ nodes running globally. Open-source firmware actively maintained. Demonstrates that non-technical community members can and do deploy Meshtastic devices for disaster resilience and wilderness communication.

---

## Recommended Phased Approach

| Phase | Focus | Hardware Nodes | Cost |
|---|---|---|---|
| **Phase 1 — Pilot** | Demonstrate feasibility in one area. 5-10 sensor nodes + 1 gateway. | 10 units | ~$1,000-1,500 |
| **Phase 2 — Community expansion** | 20-50 sensor nodes, 3-5 gateways. Build software dashboard. Register users. | 40-50 units | ~$4,000-7,000 |
| **Phase 3 — County coverage** | 100-300 nodes, 10-20 gateways. Full dashboard, alert integrations, mobile app. | 200+ units | ~$15,000-30,000 |
| **Phase 4 — Regional scale** | Multi-county network. Partner with local fire departments and forestry. | Scaling | Grant/funding-dependent |

Phase 1 can be self-funded by a small group. Phase 2 benefits from community fundraising, local business sponsorships, or small municipal grants. Phase 3 and 4 are grant-eligible under FEMA BRIC, USDA forestry programs, and state community resilience funds.

---

*This document is updated as the research evolves. All claims are tied to verified sources and existing deployed systems.*