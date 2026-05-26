import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export const useStock = (symbol: string) => {
  return useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => apiClient.get(`/stocks/${symbol}`),
    enabled: !!symbol,
  });
};

export const useHistorical = (symbol: string, days: number = 30) => {
  return useQuery({
    queryKey: ['historical', symbol, days],
    queryFn: () => apiClient.get(`/stocks/${symbol}/historical?days=${days}`),
    enabled: !!symbol,
  });
};

export const usePrediction = (symbol: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['prediction', symbol],
    queryFn: () => apiClient.post(`/real-predictions/${symbol}`),
    enabled: !!symbol && enabled,
    retry: false, // Don't keep retrying if it fails (e.g. 404 or 500)
  });
};
