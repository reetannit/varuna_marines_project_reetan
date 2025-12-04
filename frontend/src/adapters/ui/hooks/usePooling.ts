import { useState, useCallback } from 'react';
import { Pool } from '../../../core/domain/entities';
import { apiClient } from '../../infrastructure/api/HttpApiClient';

export function usePooling() {
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPool = useCallback(async (shipIds: string[], year: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.createPool(shipIds, year);
      setPool(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create pool';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { pool, loading, error, createPool };
}
