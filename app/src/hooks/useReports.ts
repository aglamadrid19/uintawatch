import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { FireReport } from '../types';

export function useReports(): UseQueryResult<FireReport[], Error> {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => apiService.getReports(),
    enabled: true,
    staleTime: Infinity,
    retry: false,
  });
}
