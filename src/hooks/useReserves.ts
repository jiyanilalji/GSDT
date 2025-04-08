import { useState, useEffect } from 'react';
import { 
  ReserveAsset, 
  ReserveSummary,
  getReserveAssets,
  getReserveSummary,
  createReserveAsset,
  updateReserveAsset,
  deleteReserveAsset
} from '../services/reserves';

interface ReservesData {
  summary: ReserveSummary | null;
  reserves: ReserveAsset[];
}

export const useReserves = () => {
  const [data, setData] = useState<ReservesData | null>(null);
  const [reserves, setReserves] = useState<ReserveAsset[]>([]);
  const [summary, setSummary] = useState<ReserveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [reservesData, summaryData] = await Promise.all([
        getReserveAssets(),
        getReserveSummary()
      ]);
      
      setData({
        summary: summaryData,
        reserves: reservesData
      });

      setReserves(reservesData);
      setSummary(summaryData);

    } catch (err: any) {
      console.error('Error loading reserves data:', err);
      setError(err.message || 'Error loading reserves data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (assetData: Omit<ReserveAsset, 'id' | 'created_at'>) => {
    try {
      setActionLoading(true);
      setError(null);
      await createReserveAsset(assetData);
      await loadData();
    } catch (err: any) {
      console.error('Error creating reserve asset:', err);
      throw new Error(err.message || 'Error creating reserve asset');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<ReserveAsset>) => {
    try {
      setActionLoading(true);
      setError(null);
      await updateReserveAsset(id, updates);
      await loadData();
    } catch (err: any) {
      console.error('Error updating reserve asset:', err);
      throw new Error(err.message || 'Error updating reserve asset');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (reserve: ReserveAsset) => {
    try {
      setActionLoading(true);
      setError(null);
      await deleteReserveAsset(reserve.id);
      await loadData();
    } catch (err: any) {
      console.error('Error deleting reserve asset:', err);
      throw new Error(err.message || 'Error deleting reserve asset');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    data,
    reserves,
    summary,
    loading,
    error,
    actionLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
    refresh: loadData
  };
};