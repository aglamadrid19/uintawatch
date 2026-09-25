import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type Units = 'metric' | 'imperial';
export type MapType = 'standard' | 'satellite' | 'terrain';

interface SettingsState {
  units: Units;
  mapType: MapType;
  hydrated: boolean;
  setUnits: (units: Units) => void;
  setMapType: (mapType: MapType) => void;
  hydrate: () => Promise<void>;
}

const KEYS = {
  units: 'settings.units',
  mapType: 'settings.mapType',
} as const;

async function persist(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Settings are best-effort; app still works without persistence
  }
}

export const useSettingsStore = create<SettingsState>((set) => ({
  units: 'metric',
  mapType: 'standard',
  hydrated: false,

  setUnits: (units) => {
    set({ units });
    persist(KEYS.units, units);
  },

  setMapType: (mapType) => {
    set({ mapType });
    persist(KEYS.mapType, mapType);
  },

  hydrate: async () => {
    try {
      const [units, mapType] = await Promise.all([
        SecureStore.getItemAsync(KEYS.units),
        SecureStore.getItemAsync(KEYS.mapType),
      ]);
      set({
        units: (units as Units) || 'metric',
        mapType: (mapType as MapType) || 'standard',
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
}));

/** Format temperature according to the unit preference. */
export function formatTemp(tempC: number, units: Units): { value: string; label: string } {
  if (units === 'imperial') {
    return { value: `${((tempC * 9) / 5 + 32).toFixed(1)}`, label: '°F' };
  }
  return { value: `${tempC.toFixed(1)}`, label: '°C' };
}

/** Format wind speed according to the unit preference. */
export function formatWind(ms: number, units: Units): { value: string; label: string } {
  if (units === 'imperial') {
    return { value: `${(ms * 2.23694).toFixed(1)}`, label: 'mph' };
  }
  return { value: `${ms.toFixed(1)}`, label: 'm/s' };
}
