/**
 * UintaWatch simulation engine.
 *
 * There are no physical sensor nodes deployed yet. Until the backend ingest
 * (roadmap Phase 3) and nodes (Phase 2) exist, this module produces a scripted,
 * clearly-labeled "simulated" dataset that exercises every app feature:
 * ticking readings, wind, mesh health, a burn-event alert timeline, and
 * community reports.
 *
 * Everything here is invented for demo purposes — the Lab tab and the
 * simulated-data badge make that explicit in the UI.
 */
import { SensorWithReading, Reading, Alert, FireReport } from '../types';
import * as SecureStore from 'expo-secure-store';

const MIN = 60_000;

interface SensorProfile {
  id: string;
  name: string;
  lat: number;
  lng: number;
  nodeConfig: string;
  firmware: string;
  hops: number;
  gateway: string;
  uptimeH: number;
  base: { tempC: number; humidityPct: number; pressureHPa: number; voc: number; batteryMv: number; rssi: number };
  /** Baseline wind at the site, m/s */
  baseWindMs: number;
  baseWindDir: number;
  /** Behaviour profile */
  behavior: 'nominal' | 'elevated' | 'burn' | 'offline';
}

const PROFILES: SensorProfile[] = [
  {
    id: 'sensor-001',
    name: 'HFENS-Uintah-01',
    lat: 40.3712,
    lng: -109.5147,
    nodeConfig: 'A — BME688',
    firmware: 'uw-fw 0.3.1',
    hops: 1,
    gateway: 'GW-Duchesne',
    uptimeH: 312,
    base: { tempC: 30.2, humidityPct: 30, pressureHPa: 1013, voc: 156, batteryMv: 4100, rssi: -67 },
    baseWindMs: 3.4,
    baseWindDir: 215,
    behavior: 'nominal',
  },
  {
    id: 'sensor-002',
    name: 'HFENS-Uintah-02',
    lat: 40.4521,
    lng: -109.4289,
    nodeConfig: 'A — BME688',
    firmware: 'uw-fw 0.3.1',
    hops: 1,
    gateway: 'GW-Duchesne',
    uptimeH: 312,
    base: { tempC: 29.8, humidityPct: 31, pressureHPa: 1011, voc: 142, batteryMv: 3950, rssi: -72 },
    baseWindMs: 2.9,
    baseWindDir: 228,
    behavior: 'nominal',
  },
  {
    id: 'sensor-003',
    name: 'HFENS-Ouray-01',
    lat: 40.2856,
    lng: -109.6792,
    nodeConfig: 'B — BME688 + PM2.5',
    firmware: 'uw-fw 0.3.1',
    hops: 2,
    gateway: 'GW-Duchesne',
    uptimeH: 178,
    base: { tempC: 31.1, humidityPct: 27, pressureHPa: 1015, voc: 189, batteryMv: 3800, rssi: -81 },
    baseWindMs: 4.8,
    baseWindDir: 241,
    behavior: 'nominal',
  },
  {
    id: 'sensor-004',
    name: 'HFENS-Fort-Duchene-01',
    lat: 40.6189,
    lng: -109.8823,
    nodeConfig: 'A — BME688',
    firmware: 'uw-fw 0.2.9',
    hops: 1,
    gateway: 'GW-Duchesne',
    uptimeH: 96,
    base: { tempC: 28.4, humidityPct: 35, pressureHPa: 1012, voc: 98, batteryMv: 3600, rssi: -89 },
    baseWindMs: 2.2,
    baseWindDir: 195,
    behavior: 'offline',
  },
  {
    id: 'sensor-005',
    name: 'HFENS-Vernal-01',
    lat: 40.4556,
    lng: -109.5287,
    nodeConfig: 'C — BME688 + PM2.5 + CO',
    firmware: 'uw-fw 0.3.1',
    hops: 2,
    gateway: 'GW-Vernal',
    uptimeH: 240,
    base: { tempC: 36.4, humidityPct: 18, pressureHPa: 1008, voc: 456, batteryMv: 4050, rssi: -65 },
    baseWindMs: 5.1,
    baseWindDir: 262,
    behavior: 'elevated',
  },
  {
    id: 'sensor-006',
    name: 'HFENS-Jensen-01',
    lat: 40.3715,
    lng: -109.9134,
    nodeConfig: 'A — BME688',
    firmware: 'uw-fw 0.3.1',
    hops: 1,
    gateway: 'GW-Jensen',
    uptimeH: 512,
    base: { tempC: 30.6, humidityPct: 29, pressureHPa: 1014, voc: 167, batteryMv: 4200, rssi: -58 },
    baseWindMs: 3.1,
    baseWindDir: 233,
    behavior: 'nominal',
  },
  {
    id: 'sensor-007',
    name: 'HFENS-Ashley-01',
    lat: 40.6845,
    lng: -109.7256,
    nodeConfig: 'E — BME280 (negative control)',
    firmware: 'uw-fw 0.3.1',
    hops: 3,
    gateway: 'GW-Vernal',
    uptimeH: 88,
    base: { tempC: 28.2, humidityPct: 33, pressureHPa: 1016, voc: 134, batteryMv: 3900, rssi: -76 },
    baseWindMs: 3.8,
    baseWindDir: 205,
    behavior: 'nominal',
  },
  {
    id: 'sensor-008',
    name: 'HFENS-Burner-Ridge-01',
    lat: 40.1987,
    lng: -109.4123,
    nodeConfig: 'D — BME688 + PM2.5 + CO + wind',
    firmware: 'uw-fw 0.3.2',
    hops: 2,
    gateway: 'GW-Duchesne',
    uptimeH: 64,
    base: { tempC: 45.1, humidityPct: 12, pressureHPa: 1005, voc: 523, batteryMv: 3700, rssi: -82 },
    baseWindMs: 6.7,
    baseWindDir: 288,
    behavior: 'burn',
  },
];

/** Smooth pseudo-noise in [-1, 1] from a seed, stable within a second. */
function noise(seed: number): number {
  const t = Date.now() / 1000;
  return (
    Math.sin(t / 97 + seed * 12.9898) * 0.5 +
    Math.sin(t / 23 + seed * 78.233) * 0.3 +
    Math.sin(t / 7 + seed * 37.719) * 0.2
  );
}

function readSensor(profile: SensorProfile): Reading {
  const n = noise(PROFILES.indexOf(profile) + 1);
  let tempC = profile.base.tempC + n * 1.2;
  let humidityPct = profile.base.humidityPct - n * 2;
  let voc = profile.base.voc + n * 40;
  let batteryMv = profile.base.batteryMv - Math.abs(n) * 40;

  // Diurnal-ish pressure wobble
  const pressureHPa = profile.base.pressureHPa + n * 2;

  // Wind — gusty on ridges, drifting direction
  const windMs = Math.max(0.2, profile.baseWindMs + n * 1.4);
  const windDirDeg = (profile.baseWindDir + n * 25 + 360) % 360;

  switch (profile.behavior) {
    case 'burn': {
      // Scripted burn event: slowly escalating smolder signature
      const phase = (Date.now() / (25 * MIN)) % 1; // 25-minute demo loop
      const ramp = 0.65 + phase * 0.35;
      tempC = profile.base.tempC * ramp + 12 * ramp;
      humidityPct = Math.max(4, profile.base.humidityPct * (1.15 - ramp * 0.4));
      voc = profile.base.voc * ramp + 120 * ramp;
      break;
    }
    case 'elevated': {
      // Downwind smoke plume from the burn site
      const phase = (Date.now() / (25 * MIN)) % 1;
      tempC = profile.base.tempC + phase * 3.5;
      humidityPct = profile.base.humidityPct - phase * 4;
      voc = profile.base.voc + phase * 130;
      break;
    }
    case 'offline': {
      // Node dropped off the mesh; show stale values so UI can depict offline state
      return {
        sensorId: profile.id,
        timestamp: new Date(Date.now() - 45 * MIN).toISOString(),
        tempC: profile.base.tempC,
        humidityPct: profile.base.humidityPct,
        pressureHPa: profile.base.pressureHPa,
        voc: profile.base.voc,
        batteryMv: 3480,
        rssi: -105,
        windMs: undefined,
        windDirDeg: undefined,
      };
    }
  }

  return {
    sensorId: profile.id,
    timestamp: new Date().toISOString(),
    tempC: Math.round(tempC * 10) / 10,
    humidityPct: Math.round(humidityPct),
    pressureHPa: Math.round(pressureHPa),
    voc: Math.round(voc),
    batteryMv: Math.round(batteryMv),
    rssi: Math.round(profile.base.rssi + n * 6),
    windMs: Math.round(windMs * 10) / 10,
    windDirDeg: Math.round(windDirDeg),
  };
}

export function getSimulatedSensors(): SensorWithReading[] {
  return PROFILES.map((profile) => {
    const reading = readSensor(profile);
    const status = profile.behavior === 'burn' ? 'alert' : profile.behavior === 'offline' ? 'offline' : 'online';
    return {
      id: profile.id,
      name: profile.name,
      lat: profile.lat,
      lng: profile.lng,
      lastSeen: reading.timestamp,
      status: status as SensorWithReading['status'],
      nodeConfig: profile.nodeConfig,
      firmware: profile.firmware,
      hops: profile.hops,
      gateway: profile.gateway,
      uptimeH: profile.uptimeH,
      latestReading: reading,
    };
  });
}

/**
 * 24h history that ends at "now" and respects the burn script:
 * the last few hours ramp up exactly like the live reading does, so the
 * charts visibly tell the same story as the map/alerts.
 */
export function getSimulatedHistory(sensorId: string, limit = 24): Reading[] {
  const profile = PROFILES.find((p) => p.id === sensorId);
  if (!profile) return [];

  const now = Date.now();
  const points: Reading[] = [];
  const count = Math.min(Math.max(limit, 1), 48);

  for (let i = count - 1; i >= 0; i--) {
    const hoursAgo = i;
    const ts = new Date(now - hoursAgo * 60 * MIN).toISOString();
    const n = noise(profile.id.length * 3 + i * 5);
    const diurnal = Math.sin(((hoursAgo % 24) / 24) * Math.PI * 2) * 2.5;

    let tempC = profile.base.tempC + diurnal + n * 1.5;
    let humidityPct = profile.base.humidityPct + Math.abs(n) * 4;
    let voc = profile.base.voc + n * 50;
    const pressureHPa = profile.base.pressureHPa + n * 2;
    const batteryMv = profile.base.batteryMv - (hoursAgo / 24) * 120 + Math.abs(n) * 30;
    const rssi = profile.base.rssi + n * 6;
    const windMs = Math.max(0.2, profile.baseWindMs + n * 1.4);
    const windDirDeg = Math.round((profile.baseWindDir + n * 30 + 360) % 360);

    if (profile.behavior === 'burn') {
      // Burn started ~4h ago: ramp in the last quarter of the window
      const burnStart = 4;
      if (hoursAgo < burnStart) {
        const ramp = (burnStart - hoursAgo) / burnStart;
        tempC += ramp * 16;
        humidityPct = Math.max(5, humidityPct - ramp * 18);
        voc += ramp * 260;
      }
    }
    if (profile.behavior === 'elevated') {
      if (hoursAgo < 3) {
        const ramp = (3 - hoursAgo) / 3;
        tempC += ramp * 6;
        voc += ramp * 180;
        humidityPct -= ramp * 8;
      }
    }

    points.push({
      sensorId,
      timestamp: ts,
      tempC: Math.round(tempC * 10) / 10,
      humidityPct: Math.round(humidityPct),
      pressureHPa: Math.round(pressureHPa),
      voc: Math.round(voc),
      batteryMv: Math.round(batteryMv),
      rssi: Math.round(rssi),
      windMs: Math.round(windMs * 10) / 10,
      windDirDeg,
    });
  }

  return points;
}

export function getSimulatedAlerts(): Alert[] {
  return [
    {
      id: 'alert-001',
      sensorId: 'sensor-008',
      type: 'sensor',
      severity: 'critical',
      message:
        'Sustained temperature rise with VOC spike at HFENS-Burner-Ridge-01, a multi-metric smolder signature crossing alert thresholds for 40+ minutes. Corroborating node HFENS-Vernal-01 downwind.',
      triggeredAt: new Date(Date.now() - 6 * MIN).toISOString(),
      resolved: false,
    },
    {
      id: 'alert-002',
      sensorId: 'sensor-005',
      type: 'sensor',
      severity: 'elevated',
      message:
        'VOC and CO rising at HFENS-Vernal-01 with north-west wind. Pattern is consistent with a plume drifting from the Burner Ridge area, and the alert escalates if the trend holds.',
      triggeredAt: new Date(Date.now() - 8 * MIN).toISOString(),
      resolved: false,
    },
    {
      id: 'alert-003',
      sensorId: 'sensor-002',
      type: 'sensor',
      severity: 'warning',
      message:
        'Humidity below 30% at HFENS-Uintah-02 for two hours. Elevated fire-weather conditions; no combustion signature.',
      triggeredAt: new Date(Date.now() - 60 * MIN).toISOString(),
      resolved: true,
    },
    {
      id: 'alert-004',
      sensorId: null,
      type: 'user_report',
      severity: 'elevated',
      message:
        'Community report: visible smoke column near US-40 corridor, ~3 km east of Jensen. Two separate observers within 10 minutes.',
      triggeredAt: new Date(Date.now() - 120 * MIN).toISOString(),
      resolved: true,
    },
  ];
}

const SEEDED_REPORTS: FireReport[] = [
  {
    id: 'report-seed-001',
    lat: 40.2382,
    lng: -109.3904,
    text: 'Light gray smoke column rising off the ridge east of the winter range. Looks like it is smoldering, not flaming yet.',
    photoUrl: null,
    submittedAt: new Date(Date.now() - 55 * MIN).toISOString(),
    verified: false,
  },
  {
    id: 'report-seed-002',
    lat: 40.5107,
    lng: -109.4809,
    text: 'Passing US-40 at mile marker 91 — smell of smoke in the cab, no visible plume. Posting in case others confirm.',
    photoUrl: null,
    submittedAt: new Date(Date.now() - 118 * MIN).toISOString(),
    verified: false,
  },
  {
    id: 'report-seed-003',
    lat: 40.1645,
    lng: -109.371,
    text: 'Campfire from last night at the dispersed site off the forest road was still smoking this morning. Doused it with water.',
    photoUrl: null,
    submittedAt: new Date(Date.now() - 300 * MIN).toISOString(),
    verified: true,
  },
];

/** In-memory community reports — user submissions append here. */
const userReports: FireReport[] = [];

/**
 * User reports survive app restarts: appended reports are written to
 * SecureStore and hydrated back on module init. This queue later becomes
 * the offline upload queue once the real backend ingest exists.
 */
const USER_REPORTS_KEY = 'sim.userReports';
const USER_REPORTS_LIMIT = 50;

let persistScheduled = false;

function persistUserReports() {
  // Coalesce bursts of writes; SecureStore is keychain-backed so keep it small
  if (persistScheduled) return;
  persistScheduled = true;
  setTimeout(() => {
    persistScheduled = false;
    SecureStore.setItemAsync(
      USER_REPORTS_KEY,
      JSON.stringify(userReports.slice(0, USER_REPORTS_LIMIT))
    ).catch(() => {
      // Persistence is best-effort; the session keeps working in memory
    });
  }, 300);
}

SecureStore.getItemAsync(USER_REPORTS_KEY)
  .then((raw) => {
    if (!raw) return;
    const parsed = JSON.parse(raw) as FireReport[];
    if (Array.isArray(parsed)) userReports.push(...parsed);
  })
  .catch(() => {
    // Missing/corrupt stored reports just start the session empty
  });

export function getSimulatedReports(): FireReport[] {
  return [...userReports, ...SEEDED_REPORTS];
}

export function addSimulatedReport(payload: {
  lat: number;
  lng: number;
  text: string;
  photoUrl?: string | null;
}): FireReport {
  const report: FireReport = {
    id: `report-user-${Date.now()}`,
    lat: payload.lat,
    lng: payload.lng,
    text: payload.text,
    photoUrl: payload.photoUrl ?? null,
    submittedAt: new Date().toISOString(),
    verified: false,
  };
  userReports.unshift(report);
  persistUserReports();
  return report;
}
