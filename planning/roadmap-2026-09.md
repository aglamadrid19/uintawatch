# UintaWatch — Roadmap (September 2026)

*Detailed action plan following the positioning pivot in `positioning-2026-09.md`.
Timeline assumes one builder + AI agents, weekends as primary work blocks.*

---

## Success gates (external, published — not self-referential)

- **G1 (replicate):** open-hardware node replicates a published NRCan-class result —
  detect a prescribed burn / smoldering event at ≥1 km, nighttime, with open data +
  methods.
- **G2 (beat on cost/infra):** equivalent or better detection performance at ≤$100/node
  with LoRa (no per-node internet), documented cost BOM.
- **G3 (solve false positives):** demonstrate far-field regional smoke rejection
  (trained/validated on NRCan open data + our data) with measured false-alarm rate.
- **G4 (baseline contribution):** publish first UintaBench table row with real numbers
  (detection vs distance/wind/fire-size, false alarms per node-day, power, cost).

Each gate is positive work. Missing a gate still produces a published boundary — a useful
result in its own right.

---

## Phase 0 — Data bootstrap (Week 1, no hardware needed)

**Goal: the lab exists and has produced something before a single node is built.**

1. **Download + analyze NRCan dataset**
   - Zenodo DOI 10.5281/zenodo.18222779 (34.8 MB, MIT license, RMarkdown build files) →
     clone github.com/nrcan-cfs-fire/Ground-smoke-sensors.
   - Deliverable: `lab/` (new top-level folder) with a Jupyter/Quarto notebook that
     reproduces their headline numbers (6/10 fires beat satellites; 100% @ >100 ha;
     30% @ ≤1 ha) and charts time-to-first-detection vs distance/wind.
   - This becomes Experiment #001 content and the foundation of UintaBench.
2. **Define the UintaBench schema** (align field names with NRCan so results are directly
   comparable): fire (fuel, size, ignition time, flaming/smoldering state), sensor
   (model, firmware, height, enclosure, sample interval), geometry (distance, bearing,
   elevation delta), environment (wind speed/dir, T/RH/P), results (first anomaly,
   detection time, max response, delivery latency, packet loss) + **negative tests**.
3. **UintaBench scaffold:** `lab/bench/` README with the leaderboard table (all `?` rows:
   BME688 / PM-only / CO+PM / VOC+PM / VOC+PM+wind × detection @ 25/50/100m, false
   alerts/day, median detection, power/day, cost) and the networking benchmark table
   (Meshtastic / raw LoRa / LoRaWAN × 500m/1km/3km/canyon/forest/power).
4. **X post #001:** "DHS's wildfire sensors failed the federal audit — but the DHS-funded
   data shows exactly where ground sensors win. We downloaded all of it. Thread." (The
   DHS-failure-then-data hook is verified, citable, and positive.)

## Phase 1 — Website & message surgery (Week 1–2, same sprint)

Goal: stop making claims the DHS audit + physics disprove; adopt the lab identity.

File-level checklist (website/):
- [ ] `src/pages/sensors.astro`: BME688 role "Primary detection — gas sensing picks up
  combustion before smoke is visible" → "Gas sensing (VOC/CO/H₂) — under test as one
  detection input; performance is unknown and being measured in public."
- [ ] `src/pages/index.astro`: "Satellites capture images hours old" → replace with
  accurate gap framing (revisit geometry, cloud, small ignitions, night smoldering —
  cite FIRMS URT honestly).
- [ ] `src/pages/get-involved.astro` + about: "No cell towers, no satellites / fully
  autonomous" → "Most nodes need no internet; a few gateway nodes bridge to the
  internet; alert delivery through community mesh is itself an experiment."
- [ ] Remove/qualify any acres-per-node or coverage-radius wording anywhere in `src/`
  (grep for `acres`, `coverage`, `radius`, `100+`).
- [ ] Remove "notify the fire department/local FD" from alert flows in copy, or qualify
  explicitly as experimental, unverified.
- [ ] Add an **Open Questions** page: the questions from the lab thesis, each with
  current best-known answer (cite DHS OIG + NRCan numbers) and status (measuring now /
  planned).
- [ ] Add a **Bench** page (or link to the repo leaderboard) so the public artifact
  exists even before hardware.
- [ ] Update meta/OG copy and RSS.
- [ ] Run the existing Playwright suite; keep zero-console-error gates green.

## Phase 2 — Open-hardware node configs (Weeks 2–6)

Goal: 3–5 deliberately different node configurations — the first real UintaBench rows.

- **Config A:** BME688 only (v1 baseline, T-Echo + BME688 on Grove) — cheap, direct
  comparison to BioBot/Heltec/Dryad lineage.
- **Config B:** BME688 + PM2.5 (e.g. PMS5003/SPS30 — verify power budget vs solar).
- **Config C:** BME688 + PM2.5 + CO (e.g. electrochemical CO cell) — NRCan/MIT evidence
  says CO/CO₂/NOx improve detection.
- **Config D:** Config C + wind (ultrasonic or cup anemometer + vane) — wind is
  first-class data; enables plume-direction gating.
- **Config E (env-only negative control):** BME280 temp/RH/P, no combustion sensors —
  the false-positive reference node.
- All nodes: GPS + battery telemetry + sample-interval logging to SD (buffer for mesh
  loss), enclosure with documented insect/dust/rain provisions.
- Build 2 copies of each config (~10 nodes total, ~$600–1,000 total budget, consistent
  with pilot budget).
- Deliverable: `lab/uintanode/` with per-config BOMs, wiring docs, firmware
  (Meshtastic telemetry config + custom logging firmware), enclosure STLs.

## Phase 3 — Backend + ingest (Weeks 2–6, parallel with Phase 2)

Goal: real data path replaces mock data; app freezes except minimal changes.

- Stand up `backend/` (currently an empty directory — nothing exists yet) per the
  existing `technical-architecture.md` design: Node/TS + Express + SQLite + MQTT, but
  **schema-first around the UintaBench schema** from Phase 0.
- Endpoints: nodes/configs registry, raw time-series ingest (gateway MQTT → store),
  event annotations (known burn events, negative events), export endpoint (CSV/Parquet)
  matching NRCan field names.
- App: point at the real backend when available; keep the offline mock as fallback.
  **No new app features until ingest + export work.**
- Deliverable: a public-ish data endpoint + a repo `lab/data/README` explaining how to
  export and reproduce.

## Phase 4 — Field access & burns (start Week 2; long lead — humans take weeks)

- Contact (in parallel, low-stakes intro emails citing the DHS audit + NRCan study):
  - **Utah FFSL** — prescribed fire / Smoke Management Program windows, pilot burn
    participation.
  - **Utah DEQ Smoke Management Program** — burn registrations, sensor placement ok.
  - **University of Utah AirU** — calibration collaboration (they already co-locate
    low-cost sensors against reference monitors; SmokeReadyUtah deploys PM/CO₂ at ~40
    schools — approach, don't compete).
  - Local fire districts / prescribed fire councils for burn windows.
- Ask for exactly one thing first: **permission to place 3–6 nodes around one planned
  burn**, with our own visual observers and safety sign-off.
- Long-lead note: land access rules (Trust Lands ROE, USFS special use) mean private WUI
  property and partnered burns come first; public-ridge deployments later with permits.

## Phase 5 — First burns + first Bench row (Months 2–4)

- Deploy configs A–E around 3–5 partnered burns; log per the UintaBench schema; run
  negative-control nodes on non-burn weeks (campfires, BBQs, dust, vehicles).
- Analysis: detection probability vs distance/wind/fuel/size; time-to-detection vs
  GOES/VIIRS FIRMS + 911/Watch Duty timelines for the same events; false alarms per
  node-day; packet delivery stats through real terrain.
- Deliverable: **G4** — first populated leaderboard row + dataset release + Experiment
  #002–#00N posts.

## Later (explicitly deferred)

- BurnOps productization (rental kit per burn) — only after Phase 5 produces a working
  kit and real user feedback.
- Early-detection resurrection in one bounded WUI community — only if Phase 5 data
  shows repeatable earlier-than-alternatives detections (G1–G3 clean).
- LoRaWAN/custom protocol migration away from Meshtastic for production — evaluate with
  networking benchmark data.
- Grants/LLC — revisit only when there is data worth funding.

---

## Budget

| Item | Cost |
|---|---|
| Phase 0–1 (data, notebook, site) | $0 |
| 10 nodes, 5 configs (Phase 2) | ~$600–1,000 |
| 1–2 gateways (T-Beam + cellular, or WiFi-first) | ~$150–400 |
| SD cards, enclosures, mounting, batteries, solar | ~$200–400 |
| Burn trips / logistics | ~$300–600 |
| **Total to first Bench row** | **~$1,250–2,400** |

Fits the original Phase-1 pilot envelope. No grant dependency for anything except the
deferred multi-county vision.

## Immediate next 3 actions (this weekend)

1. Clone NRCan repo + download Zenodo data; scaffold `lab/`; start reproduction notebook.
2. Website copy surgery (Phase 1 checklist) + Open Questions page.
3. Send the three intro emails (FFSL, DEQ, AirU) — long-lead items start now.
