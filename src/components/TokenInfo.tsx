import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAccount } from '../utils/web3';
import { getReadOnlyContract, getContract } from '../lib/web3';
import { ethers } from 'ethers';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function TokenInfo() {
  const { address, isConnected, connect } = useAccount();
  const [balance, setBalance] = useState('0');
  const [price, setPrice] = useState('0');
  const [isKYCApproved, setIsKYCApproved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionAttemptInProgress, setConnectionAttemptInProgress] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) return;

    const fetchData = async () => {
      try {
        const readOnlyContract = getReadOnlyContract();
        const contract = getContract();
        
        try {
          const [balanceData, priceData, kycStatus] = await Promise.all([
            contract.balanceOf(address),
            readOnlyContract.currentPrice(),
            readOnlyContract.kycApproved(address)
          ]);

          setBalance(ethers.utils.formatEther(balanceData));
          setPrice(ethers.utils.formatEther(priceData));
          setIsKYCApproved(kycStatus);
          setError(null);
        } catch (err) {
          console.error('Error fetching token data:', err);
          // Use default values
          setBalance('0');
          setPrice('1.00');
          setIsKYCApproved(false);
        }        
      } catch (err) {
        console.error('Error in fetchData:', err);
      }
    };

    fetchData();
  }, [address, isConnected]);

  const handleConnect = async () => {
    // Prevent multiple simultaneous connection attempts
    if (connectionAttemptInProgress) {
      return;
    }

    try {
      setConnectionAttemptInProgress(true);
      setLoading(true);
      setError(null);
      await connect();
    } catch (err: any) {
      // Don't show error for user rejection
      if (err.message && (
        err.message.includes('User rejected') || 
        err.message.includes('user rejected') ||
        err.message.includes('User denied')
      )) {
        // User rejected connection, don't show error
      } else {
        setError(err.message || 'Error connecting wallet');
      }
    } finally {
      setLoading(false);
      setConnectionAttemptInProgress(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4"
          >
            <svg 
              className="w-8 h-8 text-primary-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-semibold text-gray-900 mb-2"
          >
            Connect Your Wallet
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 mb-6"
          >
            Connect your wallet to view your GSDT balance, manage tokens, and access all features
          </motion.p>

          {(error) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-red-50 rounded-lg text-sm text-red-600"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConnect}
            disabled={loading || connectionAttemptInProgress}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading || connectionAttemptInProgress ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              <span className="flex items-center">
                Connect Wallet
                <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
              </span>
            )}
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6 py-8 bg-white rounded-xl shadow-lg"
      >
        <dt className="text-sm font-medium text-gray-600 truncate">Balance</dt>
        <dd className="mt-2 text-3xl font-bold text-primary-600">{balance} GSDT</dd>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6 py-8 bg-white rounded-xl shadow-lg"
      >
        <dt className="text-sm font-medium text-gray-600 truncate">Current Price</dt>
        <dd className="mt-2 text-3xl font-bold text-primary-600">${price} USDC</dd>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="px-6 py-8 bg-white rounded-xl shadow-lg"
      >
        <dt className="text-sm font-medium text-gray-600 truncate">KYC Status</dt>
        <dd className="mt-2 text-3xl font-bold">
          {isKYCApproved ? (
            <span className="text-green-600">Approved</span>
          ) : (
            <span className="text-red-600">Not Approved</span>
          )}
        </dd>
      </motion.div>
    </dl>
  );
}