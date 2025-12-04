import { useState, useCallback } from 'react';
import { RouteComparison } from '../../../core/domain/entities/value-objects';
import { apiClient } from '../../infrastructure/api/HttpApiClient';

export function useComparison() {
  const [comparisons, setComparisons] = useState<RouteComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getComparison();
      setComparisons(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch comparison data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { comparisons, loading, error, fetchComparison };
}
