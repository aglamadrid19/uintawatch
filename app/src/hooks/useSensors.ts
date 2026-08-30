import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { SensorWithReading } from '../types';

export interface UseSensorsOptions {
  enabled?: boolean;
}

export function useSensors(enabled = true): UseQueryResult<SensorWithReading[], Error> {
  return useQuery({
    queryKey: ['sensors'],
    queryFn: () => apiService.getSensors(),
    enabled,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
}
