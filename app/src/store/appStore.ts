import { create } from 'zustand';
import { SensorWithReading, Alert, FireReport } from '../types';
import { apiService, ApiError } from '../services/api';
import { POLLING_INTERVAL } from '../theme';

interface AppState {
  sensors: SensorWithReading[];
  alerts: Alert[];
  reports: FireReport[];
  isLoading: boolean;
  error: string | null;
  selectedSensor: SensorWithReading | null;

  fetchSensors: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchReports: () => Promise<void>;
  fetchSensorDetails: (id: string) => Promise<void>;
  selectSensor: (sensor: SensorWithReading | null) => void;
  clearError: () => void;
  startPolling: () => () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  sensors: [],
  alerts: [],
  reports: [],
  isLoading: false,
  error: null,
  selectedSensor: null,

  fetchSensors: async () => {
    set({ isLoading: true, error: null });
    try {
      const sensors = await apiService.getSensors();
      set({ sensors, isLoading: false, error: null });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NETWORK_ERROR') {
        set({ isLoading: false, error: null });
      } else {
        set({ error: err instanceof Error ? err.message : 'Failed to fetch sensors', isLoading: false });
      }
    }
  },

  fetchAlerts: async () => {
    try {
      const alerts = await apiService.getAlerts();
      set({ alerts });
    } catch {
      // Errors are handled gracefully - alerts will be empty on network error
    }
  },

  fetchReports: async () => {
    try {
      const reports = await apiService.getReports();
      set({ reports });
    } catch {
      // Errors are handled gracefully
    }
  },

  fetchSensorDetails: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const sensor = await apiService.getSensor(id);
      set({ selectedSensor: sensor, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch sensor details', isLoading: false });
    }
  },

  selectSensor: (sensor) => {
    set({ selectedSensor: sensor });
  },

  clearError: () => {
    set({ error: null });
  },

  startPolling: () => {
    const { fetchSensors, fetchAlerts } = get();
    fetchSensors();
    fetchAlerts();

    const interval = setInterval(() => {
      fetchSensors();
      fetchAlerts();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  },
}));