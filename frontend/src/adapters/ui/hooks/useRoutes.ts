import { useState, useEffect, useCallback } from 'react';
import { Route } from '../../../core/domain/entities';
import { apiClient } from '../../infrastructure/api/HttpApiClient';

interface UseRoutesReturn {
  routes: Route[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRoutes(): UseRoutesReturn {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getRoutes();
      setRoutes(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch routes';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  return { routes, loading, error, refetch: fetchRoutes };
}
