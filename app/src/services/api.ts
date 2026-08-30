import {
  Sensor,
  SensorWithReading,
  Reading,
  FireReport,
  Alert,
  CreateReportPayload,
} from '../types';
import { API_BASE_URL } from '../theme';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const MOCK_UTAH_SENSORS: SensorWithReading[] = [
  {
    id: 'sensor-001',
    name: 'HFENS-Uintah-01',
    lat: 40.3712,
    lng: -109.5147,
    lastSeen: new Date(Date.now() - 5 * 60000).toISOString(),
    status: 'online',
    latestReading: {
      sensorId: 'sensor-001',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      tempC: 34.2,
      humidityPct: 28,
      pressureHPa: 1013,
      voc: 156,
      batteryMv: 4100,
      rssi: -67,
    },
  },
  {
    id: 'sensor-002',
    name: 'HFENS-Uintah-02',
    lat: 40.4521,
    lng: -109.4289,
    lastSeen: new Date(Date.now() - 3 * 60000).toISOString(),
    status: 'online',
    latestReading: {
      sensorId: 'sensor-002',
      timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
      tempC: 32.8,
      humidityPct: 31,
      pressureHPa: 1011,
      voc: 142,
      batteryMv: 3950,
      rssi: -72,
    },
  },
  {
    id: 'sensor-003',
    name: 'HFENS-Ouray-01',
    lat: 40.2856,
    lng: -109.6792,
    lastSeen: new Date(Date.now() - 12 * 60000).toISOString(),
    status: 'online',
    latestReading: {
      sensorId: 'sensor-003',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      tempC: 35.1,
      humidityPct: 24,
      pressureHPa: 1015,
      voc: 189,
      batteryMv: 3800,
      rssi: -81,
    },
  },
  {
    id: 'sensor-004',
    name: 'HFENS-Fort-Duchene-01',
    lat: 40.6189,
    lng: -109.8823,
    lastSeen: new Date(Date.now() - 45 * 60000).toISOString(),
    status: 'offline',
    latestReading: {
      sensorId: 'sensor-004',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      tempC: 28.4,
      humidityPct: 35,
      pressureHPa: 1012,
      voc: 98,
      batteryMv: 3600,
      rssi: -89,
    },
  },
  {
    id: 'sensor-005',
    name: 'HFENS-Vernal-01',
    lat: 40.4556,
    lng: -109.5287,
    lastSeen: new Date(Date.now() - 8 * 60000).toISOString(),
    status: 'alert',
    latestReading: {
      sensorId: 'sensor-005',
      timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
      tempC: 47.3,
      humidityPct: 12,
      pressureHPa: 1008,
      voc: 456,
      batteryMv: 4050,
      rssi: -65,
    },
  },
  {
    id: 'sensor-006',
    name: 'HFENS-Jensen-01',
    lat: 40.3715,
    lng: -109.9134,
    lastSeen: new Date(Date.now() - 2 * 60000).toISOString(),
    status: 'online',
    latestReading: {
      sensorId: 'sensor-006',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      tempC: 33.6,
      humidityPct: 29,
      pressureHPa: 1014,
      voc: 167,
      batteryMv: 4200,
      rssi: -58,
    },
  },
  {
    id: 'sensor-007',
    name: 'HFENS-Ashley-01',
    lat: 40.6845,
    lng: -109.7256,
    lastSeen: new Date(Date.now() - 15 * 60000).toISOString(),
    status: 'online',
    latestReading: {
      sensorId: 'sensor-007',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      tempC: 31.2,
      humidityPct: 33,
      pressureHPa: 1016,
      voc: 134,
      batteryMv: 3900,
      rssi: -76,
    },
  },
  {
    id: 'sensor-008',
    name: 'HFENS-Burner-Ridge-01',
    lat: 40.1987,
    lng: -109.4123,
    lastSeen: new Date(Date.now() - 6 * 60000).toISOString(),
    status: 'alert',
    latestReading: {
      sensorId: 'sensor-008',
      timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
      tempC: 52.1,
      humidityPct: 8,
      pressureHPa: 1005,
      voc: 523,
      batteryMv: 3700,
      rssi: -82,
    },
  },
];

const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    sensorId: 'sensor-005',
    type: 'sensor',
    severity: 'critical',
    message: 'Elevated temperature detected at HFENS-Vernal-01. Temperature reading of 47.3°C exceeds threshold of 42°C. Possible wildfire ignition.',
    triggeredAt: new Date(Date.now() - 8 * 60000).toISOString(),
    resolved: false,
  },
  {
    id: 'alert-002',
    sensorId: 'sensor-008',
    type: 'sensor',
    severity: 'critical',
    message: 'Extreme temperature and VOC levels detected at HFENS-Burner-Ridge-01. Active fire signature confirmed.',
    triggeredAt: new Date(Date.now() - 6 * 60000).toISOString(),
    resolved: false,
  },
  {
    id: 'alert-003',
    sensorId: 'sensor-002',
    type: 'sensor',
    severity: 'warning',
    message: 'Humidity levels dropping below 35% at HFENS-Uintah-02. Elevated fire risk conditions.',
    triggeredAt: new Date(Date.now() - 60 * 60000).toISOString(),
    resolved: true,
  },
  {
    id: 'alert-004',
    sensorId: null,
    type: 'user_report',
    severity: 'elevated',
    message: 'Smoke sighting reported near US-40 corridor. User reports visible smoke column on eastern horizon.',
    triggeredAt: new Date(Date.now() - 120 * 60000).toISOString(),
    resolved: true,
  },
];

function getMockSensorHistory(sensorId: string, limit: number): Reading[] {
  const history: Reading[] = [];
  const baseTemp = 30 + Math.random() * 10;
  
  for (let i = 0; i < limit; i++) {
    const offset = i * 60 * 60000;
    history.push({
      sensorId,
      timestamp: new Date(Date.now() - offset).toISOString(),
      tempC: baseTemp + (Math.random() - 0.5) * 8,
      humidityPct: 25 + (Math.random() - 0.5) * 15,
      pressureHPa: 1010 + (Math.random() - 0.5) * 10,
      voc: 150 + (Math.random() - 0.5) * 80,
      batteryMv: 4000 + (Math.random() - 0.5) * 300,
      rssi: -70 + (Math.random() - 0.5) * 30,
    });
  }
  
  return history;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        (errorData as { message?: string }).message || `HTTP ${response.status}`,
        response.status
      );
    }

    const data = await response.json() as ApiResponse<T>;
    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes('Network')) {
      throw new ApiError('Network error', 0, 'NETWORK_ERROR');
    }
    throw new ApiError('An unexpected error occurred', 0, 'UNKNOWN');
  }
}

class ApiService {
  private useMockData = true;

  async getSensors(): Promise<SensorWithReading[]> {
    if (this.useMockData) {
      return MOCK_UTAH_SENSORS;
    }
    try {
      return await fetchWithErrorHandling<SensorWithReading[]>(
        `${API_BASE_URL}/sensors`
      );
    } catch {
      this.useMockData = true;
      return MOCK_UTAH_SENSORS;
    }
  }

  async getSensor(id: string): Promise<SensorWithReading> {
    if (this.useMockData) {
      const sensor = MOCK_UTAH_SENSORS.find(s => s.id === id);
      if (!sensor) throw new ApiError('Sensor not found', 404);
      return sensor;
    }
    try {
      return await fetchWithErrorHandling<SensorWithReading>(
        `${API_BASE_URL}/sensors/${id}`
      );
    } catch {
      this.useMockData = true;
      const sensor = MOCK_UTAH_SENSORS.find(s => s.id === id);
      if (!sensor) throw new ApiError('Sensor not found', 404);
      return sensor;
    }
  }

  async getSensorHistory(
    id: string,
    options: { from?: string; to?: string; limit?: number } = {}
  ): Promise<Reading[]> {
    const limit = options.limit || 50;
    if (this.useMockData) {
      return getMockSensorHistory(id, limit);
    }
    try {
      const params = new URLSearchParams();
      if (options.from) params.append('from', options.from);
      if (options.to) params.append('to', options.to);
      if (limit) params.append('limit', limit.toString());

      return await fetchWithErrorHandling<Reading[]>(
        `${API_BASE_URL}/sensors/${id}/readings?${params.toString()}`
      );
    } catch {
      this.useMockData = true;
      return getMockSensorHistory(id, limit);
    }
  }

  async getReports(): Promise<FireReport[]> {
    if (this.useMockData) {
      return [];
    }
    try {
      return await fetchWithErrorHandling<FireReport[]>(
        `${API_BASE_URL}/reports`
      );
    } catch {
      this.useMockData = true;
      return [];
    }
  }

  async createReport(payload: CreateReportPayload): Promise<FireReport> {
    const mockReport: FireReport = {
      id: `report-${Date.now()}`,
      lat: payload.lat,
      lng: payload.lng,
      text: payload.text,
      photoUrl: null,
      submittedAt: new Date().toISOString(),
      verified: false,
    };
    return mockReport;
  }

  async getAlerts(): Promise<Alert[]> {
    if (this.useMockData) {
      return MOCK_ALERTS;
    }
    try {
      return await fetchWithErrorHandling<Alert[]>(
        `${API_BASE_URL}/alerts`
      );
    } catch {
      this.useMockData = true;
      return MOCK_ALERTS;
    }
  }

  async createAlert(payload: Omit<Alert, 'id' | 'triggeredAt'>): Promise<Alert> {
    if (this.useMockData) {
      return { ...payload, id: `alert-${Date.now()}`, triggeredAt: new Date().toISOString() };
    }
    try {
      return await fetchWithErrorHandling<Alert>(
        `${API_BASE_URL}/alerts`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to create alert', 0, 'CREATE_FAILED');
    }
  }
}

export const apiService = new ApiService();