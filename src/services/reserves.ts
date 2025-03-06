import axios from 'axios';
import useSWR from 'swr';

// Mock data for development
const MOCK_RESERVES = {
  total_reserves: {
    usdc: 10000000,
    cnh: 72934000,
    rub: 987623000,
    inr: 832741000,
    brl: 50432000,
    zar: 192845000,
    idr: 156834500000
  },
  custodians: [
    {
      name: 'Fireblocks',
      reserves: {
        usdc: 4000000,
        cnh: 29173600,
        rub: 395049200,
        inr: 333096400,
        brl: 20172800,
        zar: 77138000,
        idr: 62733800000
      },
      last_audit: '2025-01-15T00:00:00Z',
      audit_report: 'https://example.com/fireblocks-audit-2025-q1.pdf'
    },
    {
      name: 'BitGo',
      reserves: {
        usdc: 3500000,
        cnh: 25526900,
        rub: 345668050,
        inr: 291459350,
        brl: 17651200,
        zar: 67495750,
        idr: 54892075000
      },
      last_audit: '2025-01-15T00:00:00Z',
      audit_report: 'https://example.com/bitgo-audit-2025-q1.pdf'
    },
    {
      name: 'Copper',
      reserves: {
        usdc: 2500000,
        cnh: 18233500,
        rub: 246905750,
        inr: 208185250,
        brl: 12608000,
        zar: 48211250,
        idr: 39208625000
      },
      last_audit: '2025-01-15T00:00:00Z',
      audit_report: 'https://example.com/copper-audit-2025-q1.pdf'
    }
  ],
  last_update: Date.now(),
  total_supply: 10000000, // Total GSDT supply
  backing_ratio: 1.00, // Ratio of reserves to total supply
  timestamp: Date.now()
};

export interface CustodianReserves {
  name: string;
  reserves: Record<string, number>;
  last_audit: string;
  audit_report: string;
}

export interface ReservesData {
  total_reserves: Record<string, number>;
  custodians: CustodianReserves[];
  last_update: number;
  total_supply: number;
  backing_ratio: number;
  timestamp: number;
}

// Mock fetch function for development
const fetchReserves = async (): Promise<ReservesData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Update timestamp to current time
  return {
    ...MOCK_RESERVES,
    timestamp: Date.now()
  };
};

// Custom hook to fetch reserves data
export const useReserves = () => {
  const { data, error, isLoading } = useSWR<ReservesData>(
    'reserves',
    fetchReserves,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true
    }
  );

  return {
    data,
    isLoading,
    isError: error
  };
};

// Format currency values
export const formatCurrency = (value: number, currency: string) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  return formatter.format(value);
};