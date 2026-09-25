import {
  Sensor,
  SensorWithReading,
  Reading,
  FireReport,
  Alert,
  CreateReportPayload,
} from '../types';
import { API_BASE_URL } from '../theme';
import {
  getSimulatedSensors,
  getSimulatedHistory,
  getSimulatedAlerts,
  getSimulatedReports,
  addSimulatedReport,
} from './simulation';

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

/**
 * REST client for the UintaWatch backend.
 *
 * The backend does not exist yet (roadmap Phase 3), so every call resolves to
 * the clearly-labeled simulated dataset. When a real backend becomes reachable
 * at API_BASE_URL, flip `useSimulatedData` to false and the network paths
 * below take over, falling back to simulation when unreachable.
 */
class ApiService {
  private useSimulatedData = true;

  async getSensors(): Promise<SensorWithReading[]> {
    if (this.useSimulatedData) {
      return getSimulatedSensors();
    }
    try {
      return await fetchWithErrorHandling<SensorWithReading[]>(
        `${API_BASE_URL}/sensors`
      );
    } catch {
      return getSimulatedSensors();
    }
  }

  async getSensor(id: string): Promise<SensorWithReading> {
    if (this.useSimulatedData) {
      const sensor = getSimulatedSensors().find(s => s.id === id);
      if (!sensor) throw new ApiError('Sensor not found', 404);
      return sensor;
    }
    try {
      return await fetchWithErrorHandling<SensorWithReading>(
        `${API_BASE_URL}/sensors/${id}`
      );
    } catch {
      const sensor = getSimulatedSensors().find(s => s.id === id);
      if (!sensor) throw new ApiError('Sensor not found', 404);
      return sensor;
    }
  }

  async getSensorHistory(
    id: string,
    options: { from?: string; to?: string; limit?: number } = {}
  ): Promise<Reading[]> {
    const limit = options.limit || 24;
    if (this.useSimulatedData) {
      return getSimulatedHistory(id, limit);
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
      return getSimulatedHistory(id, limit);
    }
  }

  async getReports(): Promise<FireReport[]> {
    if (this.useSimulatedData) {
      return getSimulatedReports();
    }
    try {
      return await fetchWithErrorHandling<FireReport[]>(
        `${API_BASE_URL}/reports`
      );
    } catch {
      return getSimulatedReports();
    }
  }

  async createReport(payload: CreateReportPayload): Promise<FireReport> {
    if (this.useSimulatedData) {
      return addSimulatedReport({
        lat: payload.lat,
        lng: payload.lng,
        text: payload.text,
        photoUrl: payload.photoUri ?? null,
      });
    }
    return await fetchWithErrorHandling<FireReport>(
      `${API_BASE_URL}/reports`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  async getAlerts(): Promise<Alert[]> {
    if (this.useSimulatedData) {
      return getSimulatedAlerts();
    }
    try {
      return await fetchWithErrorHandling<Alert[]>(
        `${API_BASE_URL}/alerts`
      );
    } catch {
      return getSimulatedAlerts();
    }
  }

  async createAlert(payload: Omit<Alert, 'id' | 'triggeredAt'>): Promise<Alert> {
    if (this.useSimulatedData) {
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
