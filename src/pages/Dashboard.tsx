import { motion } from 'framer-motion';
import { useState } from 'react';
import ExchangeRates from '../components/ExchangeRates';
import ProofOfReserves from '../components/ProofOfReserves';
import KYCVerification from '../components/KYCVerification';
import SumsubKYC from '../components/SumsubKYC';
import TokenInfo from '../components/TokenInfo';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [kycMethod, setKycMethod] = useState<'manual' | 'sumsub'>('sumsub');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold leading-6 text-gray-900"
            >
              Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-sm text-gray-600"
            >
              Manage your GSDT tokens and view market information
            </motion.p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              to="/token-minting"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Mint Tokens
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 space-y-8">
          {/* Token Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TokenInfo />
          </motion.div>

          {/* KYC Verification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">KYC Verification</h3>
              
              <div className="flex space-x-4 mb-6">
                <button
                  data-kyc-method="sumsub"
                  onClick={() => setKycMethod('sumsub')}
                  className={`px-4 py-2 rounded-md ${
                    kycMethod === 'sumsub'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Automated Verification
                </button>
                <button
                  data-kyc-method="manual"
                  onClick={() => setKycMethod('manual')}
                  className={`px-4 py-2 rounded-md ${
                    kycMethod === 'manual'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Manual Verification
                </button>
              </div>
              
              {kycMethod === 'sumsub' ? <SumsubKYC /> : <KYCVerification />}
            </div>
          </motion.div>

          {/* Exchange Rates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ExchangeRates />
          </motion.div>

          {/* Proof of Reserves */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ProofOfReserves />
          </motion.div>
        </div>
      </div>
    </div>
  );
}