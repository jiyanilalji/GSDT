import { motion } from 'framer-motion';
import { useGSDTPrice } from '../services/exchangeRates';

export default function ExchangeRates() {
  const { price, rates, isLoading, isError } = useGSDTPrice();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading exchange rates...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading exchange rates. Please try again later.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-primary-900 p-6">
        <h3 className="text-xl font-bold text-white">Exchange Rates</h3>
      </div>
      <div className="p-8">
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900">GSDT Price</h4>
          <p className="text-3xl font-bold text-primary-600 mt-2">
            ${price?.toFixed(6)} USDC
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rates && rates.map((rate) => (
            <motion.div
              key={`${rate.currency_from}-${rate.currency_to}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-xl p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-lg font-semibold text-gray-900">{rate.currency_from}</h5>
                  <p className="text-sm text-gray-500">to {rate.currency_to}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-primary-600">
                    {rate.rate.toFixed(6)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}