import axios from 'axios';
import useSWR from 'swr';

// BRICS currencies and their weights in the basket
export const BRICS_CURRENCIES = {
  CNH: 0.30, // Chinese Yuan (30%)
  RUB: 0.20, // Russian Ruble (20%)
  INR: 0.20, // Indian Rupee (20%)
  BRL: 0.15, // Brazilian Real (15%)
  ZAR: 0.10, // South African Rand (10%)
  IDR: 0.05  // Indonesian Rupiah (5%)
};

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

// Fetch exchange rates from the API
const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    return {
      base: 'USDC',
      rates: response.data.rates,
      timestamp: Date.now() / 1000
    };
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};

// Calculate GSDT price in USDC based on BRICS currency basket
export const calculateGSDTPrice = (rates: ExchangeRates): number => {
  let gsdtPrice = 0;

  // Calculate weighted average of BRICS currencies against USDC
  Object.entries(BRICS_CURRENCIES).forEach(([currency, weight]) => {
    if (rates.rates[currency]) {
      // Convert each currency to USDC and apply weight
      const rateToUSDC = 1 / rates.rates[currency];
      gsdtPrice += rateToUSDC * weight;
    }
  });

  // Round to 6 decimal places (USDC precision)
  return Number(gsdtPrice.toFixed(6));
};

// Custom hook to fetch and calculate GSDT price
export const useGSDTPrice = () => {
  const { data, error, isLoading } = useSWR<ExchangeRates>(
    'exchange-rates',
    fetchExchangeRates,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true
    }
  );

  return {
    price: data ? calculateGSDTPrice(data) : null,
    rates: data?.rates,
    isLoading,
    isError: error,
    timestamp: data?.timestamp
  };
};

// Get individual currency rates against USDC
export const getCurrencyRates = (rates: Record<string, number> | undefined) => {
  if (!rates) return null;

  return Object.entries(BRICS_CURRENCIES).reduce((acc, [currency, weight]) => {
    acc[currency] = {
      rate: rates[currency] ? 1 / rates[currency] : 0,
      weight: weight * 100
    };
    return acc;
  }, {} as Record<string, { rate: number; weight: number }>);
};