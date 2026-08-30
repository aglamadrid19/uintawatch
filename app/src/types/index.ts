export interface Sensor {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lastSeen: string;
  status: 'online' | 'offline' | 'alert';
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