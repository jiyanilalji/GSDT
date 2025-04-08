import { supabase } from '../lib/supabase';

export interface ReserveAsset {
  id: string;
  symbol: string;
  name: string;
  amount: string;
  value_usd: string;
  custodian: string;
  last_updated: string;
  audit_url?: string;
  created_at: string;
  custodian_id?: string;
}

export interface ReserveSummary {
  id: string;
  total_value_usd: string;
  total_supply_gsdt: string;
  backing_ratio: string;
  last_updated: string;
}

// Format currency values with proper separators
export const formatCurrency = (value: string | number, currency: string = '') => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numValue) + (currency ? ` ${currency}` : '');
};

// Create a new reserve asset
export const createReserveAsset = async (asset: Omit<ReserveAsset, 'id' | 'created_at'>): Promise<ReserveAsset> => {
  try {
    const { data, error } = await supabase
      .from('reserve_assets')
      .insert([{
        ...asset,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');
    
    return data;
  } catch (error) {
    console.error('Error creating reserve asset:', error);
    throw error;
  }
};

// Get all reserve assets
export const getReserveAssets = async (): Promise<ReserveAsset[]> => {
  try {
    const { data, error } = await supabase
      .from('reserve_assets')
      .select('*')
      .order('symbol');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reserve assets:', error);
    throw error;
  }
};

// Update a reserve asset

export const updateReserveAsset = async (id: string, updates: Partial<ReserveAsset>): Promise<ReserveAsset> => {
  try {
    const { data, error } = await supabase
      .from('reserve_assets')
      .update({
        ...updates,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from update');
    
    return data;
  } catch (error) {
    console.error('Error updating reserve asset:', error);
    throw error;
  }
};

// Delete a reserve asset
export const deleteReserveAsset = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reserve_assets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting reserve asset:', error);
    throw error;
  }
};

// Get reserve summary
export const getReserveSummary = async (): Promise<ReserveSummary | null> => {
  try {
    const { data, error } = await supabase
      .from('reserve_summary')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching reserve summary:', error);
    throw error;
  }
};