import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ExchangeRate, getExchangeRates } from '../services/exchangeRates';
import { format } from 'date-fns';

interface Props {
  refreshInterval?: number;
}

export default function ExchangeRatesList({ refreshInterval = 60000 }: Props) {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = async () => {
    try {
      const data = await getExchangeRates();
      setRates(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Error fetching rates:', err);
      setError(err.message || 'Error fetching exchange rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchRates, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading exchange rates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
        <div className="text-center py-12 text-red-400">
          {error}
          <button
            onClick={fetchRates}
            className="block mx-auto mt-4 text-white hover:text-gray-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Live Exchange Rates</h3>
        {lastUpdated && (
          <p className="text-sm text-gray-300">
            Last updated: {format(lastUpdated, 'HH:mm:ss')}
          </p>
        )}
      </div>
      <div className="overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200/20">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">From</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">To</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Rate</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/20">
            {rates.map((rate) => (
              <motion.tr
                key={rate.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hover:bg-white/5"
              >
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-white">{rate.currency_from}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-white">{rate.currency_to}</div>
                </td>
                <td className="px-4 py-3 text-sm text-white">
                  {rate.rate.toFixed(6)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {format(new Date(rate.last_updated), 'HH:mm:ss')}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}