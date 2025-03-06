'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useGSDTContract } from '../hooks/useContract';
import { motion } from 'framer-motion';
import { parseEther } from 'ethers/lib/utils';

export default function TokenActions() {
  const { address, isConnected } = useAccount();
  const contract = useGSDTContract();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMint = async () => {
    if (!isConnected || !amount) return;
    setError('');
    
    try {
      setLoading(true);
      const tx = await contract.mint(address, parseEther(amount));
      await tx.wait();
      setAmount('');
    } catch (error: any) {
      console.error('Error minting tokens:', error);
      setError(error.message || 'Error minting tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!isConnected || !amount) return;
    setError('');
    
    try {
      setLoading(true);
      const tx = await contract.requestRedemption(parseEther(amount));
      await tx.wait();
      setAmount('');
    } catch (error: any) {
      console.error('Error requesting redemption:', error);
      setError(error.message || 'Error requesting redemption');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Actions</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount (GSDT)
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="0.0"
            />
          </div>
        </div>
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMint}
            disabled={loading || !amount}
            className="flex-1 rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Mint Tokens'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRedeem}
            disabled={loading || !amount}
            className="flex-1 rounded-md bg-secondary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-secondary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Redeem Tokens'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}