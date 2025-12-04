import { useState, useCallback } from 'react';
import { BankEntry } from '../../../core/domain/entities';
import { apiClient } from '../../infrastructure/api/HttpApiClient';

export function useBanking() {
  const [records, setRecords] = useState<BankEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (shipId: string, year: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getBankingRecords(shipId, year);
      setRecords(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch banking records';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const bankSurplus = useCallback(async (shipId: string, year: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.bankSurplus(shipId, year);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to bank surplus';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const applyBanked = useCallback(async (shipId: string, year: number, amount: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.applyBanked(shipId, year, amount);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply banked amount';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { records, loading, error, fetchRecords, bankSurplus, applyBanked };
}
