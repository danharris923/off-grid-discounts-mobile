import { useState, useEffect } from 'react';
import { Deal } from '../types/Deal';
import { googleSheetsService } from '../services/googleSheets';

interface UseDealsResult {
  deals: Deal[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDeals = (): UseDealsResult => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedDeals = await googleSheetsService.fetchDeals();
      setDeals(fetchedDeals);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error?.message || err?.message || 'Failed to load deals. Please try again later.';
      setError(errorMessage);
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  return {
    deals,
    loading,
    error,
    refetch: fetchDeals
  };
};