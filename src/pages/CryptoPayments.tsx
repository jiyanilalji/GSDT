import { motion } from 'framer-motion';
import CryptoMinting from '../components/CryptoMinting';
import { useWallet } from '../hooks/useWallet';

export default function CryptoPayments() {
  const { isConnected, connect } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold leading-6 text-gray-900"
            >
              Crypto Payments
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-sm text-gray-600"
            >
              Mint GSDT tokens using cryptocurrency payments
            </motion.p>
          </div>
          {!isConnected && (
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={connect}
                className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Connect Wallet
              </motion.button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="mt-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <CryptoMinting />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}