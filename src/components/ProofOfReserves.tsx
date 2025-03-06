import { motion } from 'framer-motion';
import { useReserves, formatCurrency } from '../services/reserves';

export default function ProofOfReserves() {
  const { data, isLoading, isError } = useReserves();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading reserves data...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading reserves data. Please try again later.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-primary-900 p-6">
        <h3 className="text-xl font-bold text-white">Proof of Reserves</h3>
        <p className="text-sm text-gray-300 mt-1">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Summary Section */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-xl p-6 border border-gray-200"
          >
            <h4 className="text-sm font-medium text-gray-500">Total GSDT Supply</h4>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {formatCurrency(data.total_supply, 'GSDT')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50 rounded-xl p-6 border border-gray-200"
          >
            <h4 className="text-sm font-medium text-gray-500">USDC Reserves</h4>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              ${formatCurrency(data.total_reserves.usdc, 'USDC')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-50 rounded-xl p-6 border border-gray-200"
          >
            <h4 className="text-sm font-medium text-gray-500">Backing Ratio</h4>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {(data.backing_ratio * 100).toFixed(2)}%
            </p>
          </motion.div>
        </div>

        {/* Custodians Section */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Custodian Details</h4>
          {data.custodians.map((custodian, index) => (
            <motion.div
              key={custodian.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-xl p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h5 className="text-lg font-semibold text-gray-900">{custodian.name}</h5>
                  <p className="text-sm text-gray-500">
                    Last Audit: {new Date(custodian.last_audit).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={custodian.audit_report}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View Audit Report →
                </a>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(custodian.reserves).map(([currency, amount]) => (
                  <div key={currency} className="text-sm">
                    <p className="text-gray-500 uppercase">{currency}</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(amount, currency)}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}