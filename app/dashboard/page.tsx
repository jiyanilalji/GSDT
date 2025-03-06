'use client';

import { motion } from 'framer-motion';
import TokenInfo from '../components/TokenInfo';
import TokenActions from '../components/TokenActions';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

export default function Dashboard() {
  const { isConnected } = useAccount();
  const { open } = useWeb3Modal();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-semibold leading-6 text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your DBDK tokens and view transaction history
            </p>
          </div>
          {!isConnected && (
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => open()}
                className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Connect Wallet
              </motion.button>
            </div>
          )}
        </div>

        {isConnected ? (
          <>
            <TokenInfo />
            <TokenActions />
          </>
        ) : (
          <div className="mt-16 text-center">
            <h3 className="text-lg font-medium text-gray-900">Connect your wallet to get started</h3>
            <p className="mt-1 text-sm text-gray-500">
              You need to connect your wallet to view your token balance and perform transactions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}