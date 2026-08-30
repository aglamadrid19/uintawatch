import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useNetInfo } from '@react-native-community/netinfo';
import { apiService } from '../services/api';
import { Alert } from '../types';

export function useAlerts(): UseQueryResult<Alert[], Error> {
  const netInfo = useNetInfo();
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => apiService.getAlerts(),
    enabled: netInfo.isInternetReachable !== false,
    staleTime: 2 * 60 * 1000,
  });
}
