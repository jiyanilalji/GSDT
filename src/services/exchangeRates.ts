import { supabase } from '../lib/supabase';
import useSWR from 'swr';

export interface ExchangeRate {
  id: string;
  currency_from: string;
  currency_to: string;
  rate: number;
  last_updated: string;
}

// BRICS currencies and their weights in the basket
export const BRICS_CURRENCIES = {
  CNH: 0.30, // Chinese Yuan (30%)
  RUB: 0.20, // Russian Ruble (20%)
  INR: 0.20, // Indian Rupee (20%)
  BRL: 0.15, // Brazilian Real (15%)
  ZAR: 0.10, // South African Rand (10%)
  IDR: 0.05  // Indonesian Rupiah (5%)
};

// Fetch exchange rates from the database
const fetchExchangeRates = async (): Promise<ExchangeRate[]> => {
  const { data, error } = await supabase
    .from('exchange_rates')
    .select('*')
    .order('last_updated', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Calculate GSDT price in USDC based on BRICS currency basket
export const calculateGSDTPrice = (rates: ExchangeRate[]): number => {
  let gsdtPrice = 0;

  // Calculate weighted average of BRICS currencies against USDC
  Object.entries(BRICS_CURRENCIES).forEach(([currency, weight]) => {
    const rate = rates.find(r => r.currency_from === currency && r.currency_to === 'USDC');
    if (rate) {
      gsdtPrice += rate.rate * weight;
    }
  });

  // Round to 6 decimal places (USDC precision)
  return Number(gsdtPrice.toFixed(6));
};

// Custom hook to fetch and calculate GSDT price
export const useGSDTPrice = () => {
  const { data, error, isLoading } = useSWR<ExchangeRate[]>(
    'exchange-rates',
    fetchExchangeRates,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true
    }
  );

  return {
    price: data ? calculateGSDTPrice(data) : null,
    rates: data,
    isLoading,
    isError: error,
    timestamp: data?.[0]?.last_updated
  };
};

export const getExchangeRates = async (): Promise<ExchangeRate[]> => {
  try {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .order('last_updated', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};

export const getCurrencyRates = (rates: ExchangeRate[]) => {
  if (!rates || rates.length === 0) return null;

  return rates.reduce((acc, rate) => {
    acc[rate.currency_from] = {
      rate: rate.rate,
      lastUpdated: rate.last_updated
    };
    return acc;
  }, {} as Record<string, { rate: number; lastUpdated: string }>);
};

export const createExchangeRate = async (
  currencyFrom: string,
  currencyTo: string,
  rate: number
): Promise<ExchangeRate> => {
  try {
    const { data, error } = await supabase
      .from('exchange_rates')
      .insert([{
        currency_from: currencyFrom,
        currency_to: currencyTo,
        rate
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating exchange rate:', error);
    throw error;
  }
};

export const updateExchangeRate = async (
  id: string,
  rate: number
): Promise<ExchangeRate> => {
  try {
    const { data, error } = await supabase
      .from('exchange_rates')
      .update({ rate })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating exchange rate:', error);
    throw error;
  }
};

export const deleteExchangeRate = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('exchange_rates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting exchange rate:', error);
    throw error;
  }
};