import { motion } from 'framer-motion';
import TokenActions from '../components/TokenActions';
import FiatMinting from '../components/FiatMinting';
import CryptoMinting from '../components/CryptoMinting';
import { useWallet } from '../hooks/useWallet';
import { useState } from 'react';

export default function TokenMinting() {
  const { isConnected, connect } = useWallet();
  const [activeTab, setActiveTab] = useState<'fiat' | 'crypto'>('fiat');

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
              Token Minting
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-sm text-gray-600"
            >
              Mint GSDT tokens
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
          {/* Token Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TokenActions />
          </motion.div>

          {/* Minting Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('fiat')}
                    className={`w-1/2 py-4 px-1 text-center border-b-2 text-sm font-medium ${
                      activeTab === 'fiat'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Fiat Payment
                  </button>
                  <button
                    onClick={() => setActiveTab('crypto')}
                    className={`w-1/2 py-4 px-1 text-center border-b-2 text-sm font-medium ${
                      activeTab === 'crypto'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Crypto Payment
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'fiat' ? <FiatMinting /> : <CryptoMinting />}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}