export interface Sensor {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lastSeen: string;
  status: 'online' | 'offline' | 'alert';
  /** Node configuration label, e.g. "BME688 + PM2.5" (optional, lab configs A–E) */
  nodeConfig?: string;
  /** Firmware version reported by the node */
  firmware?: string;
  /** Mesh hop count from this node to a gateway */
  hops?: number;
  /** Gateway node the mesh currently routes through */
  gateway?: string;
  /** Uptime in hours since last reboot */
  uptimeH?: number;
}

export interface Reading {
  sensorId: string;
  timestamp: string;
  tempC: number;
  humidityPct: number;
  pressureHPa: number;
  voc: number;
  batteryMv: number;
  rssi: number;
  /** Wind speed at the node, m/s */
  windMs?: number;
  /** Wind direction at the node, degrees from north */
  windDirDeg?: number;
}

export interface SensorWithReading extends Sensor {
  latestReading?: Reading;
}

export interface FireReport {
  id: string;
  lat: number;
  lng: number;
  text: string;
  photoUrl: string | null;
  submittedAt: string;
  verified: boolean;
}

export interface Alert {
  id: string;
  sensorId: string | null;
  type: 'sensor' | 'user_report' | 'system';
  severity: 'warning' | 'elevated' | 'critical';
  message: string;
  triggeredAt: string;
  resolved: boolean;
}

export interface CreateReportPayload {
  lat: number;
  lng: number;
  text: string;
  photoUri?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}