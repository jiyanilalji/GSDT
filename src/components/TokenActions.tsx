'use client';

import { BigNumber } from 'ethers';
import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useGSDTContract } from '../hooks/useContract';
import { motion } from 'framer-motion';
import { parseEther } from 'ethers/lib/utils';
import { useAdmin } from '../hooks/useAdmin';
import { getUserKYCStatus, KYCStatus } from '../services/kyc';

export default function TokenActions() {
  const { address, isConnected } = useWallet();
  const { isMinter } = useAdmin();
  const contract = useGSDTContract();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [minMintAmount, setMinMintAmount] = useState<string>('100'); // Default min amount
  const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.NOT_SUBMITTED);
  const [checkingKYC, setCheckingKYC] = useState(true);

  // Check KYC status
  useEffect(() => {
    const checkKYC = async () => {
      if (!address) return;
      
      try {
        setCheckingKYC(true);
        const response = await getUserKYCStatus(address);
        setKycStatus(response.status);
      } catch (err) {
        console.error('Error checking KYC status:', err);
        setKycStatus(KYCStatus.NOT_SUBMITTED);
      } finally {
        setCheckingKYC(false);
      }
    };

    checkKYC();
  }, [address]);

  const handleMint = async () => {
    if (!isConnected || !amount || !contract) return;
    setError('');
    setSuccess('');
    
    // Check KYC status first
    if (kycStatus !== KYCStatus.APPROVED) {
      setError('KYC verification is required before minting tokens. Please complete KYC verification first.');
      return;
    }

    try {
      setLoading(true);

      // Check if user has minter role
      if (!isMinter) {
        throw new Error('You do not have permission to mint tokens. Only users with MINTER_ROLE can mint.');
      }
      
      const minMintAmt = await contract.MIN_MINT_AMOUNT();
      const decimals = await contract.decimals();
      const minMintAmnt = await minMintAmt.div(BigNumber.from(10).pow(decimals));  // Dividing by 10^18 for ERC20 tokens
      await setMinMintAmount(minMintAmnt.toNumber());
      
      // Convert amount to wei
      const mintAmount = parseEther(amount);
      
      // Call contract mint function
      const tx = await contract.mint(address, mintAmount);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      setSuccess(`Successfully minted ${amount} GSDT`);
      setAmount('');
    } catch (error: any) {
      console.error('Error minting tokens:', error);
      
      // Handle specific error messages
      if (error.message?.includes('missing role')) {
        setError('You do not have permission to mint tokens. Only users with MINTER_ROLE can mint.');
      } else if (error.message?.includes('execution reverted')) {
        const revertReason = error.data?.message || error.message;
        if (revertReason.includes('KYC')) {
          setError('KYC verification required before minting tokens.');
        } else if (revertReason.includes('amount below minimum')) {
          setError(`Amount must be at least ${minMintAmount} GSDT.`);
        } else if (revertReason.includes('amount above maximum')) {
          setError('Amount exceeds maximum minting limit.');
        } else if (revertReason.includes('daily mint limit')) {
          setError('Daily minting limit exceeded. Please try again tomorrow.');
        } else {
          setError(revertReason || 'Transaction failed. Please try again.');
        }
      } else if (error.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected by user.');
      } else {
        setError('Error minting tokens. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!isConnected || !amount || !contract) return;
    setError('');
    setSuccess('');
    
    // Check KYC status first
    if (kycStatus !== KYCStatus.APPROVED) {
      setError('KYC verification is required before redeeming tokens. Please complete KYC verification first.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert amount to wei
      const redeemAmount = parseEther(amount);
      
      // Call contract requestRedemption function
      const tx = await contract.requestRedemption(redeemAmount);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      setSuccess(`Successfully requested redemption of ${amount} GSDT`);
      setAmount('');
    } catch (error: any) {
      console.error('Error requesting redemption:', error);
      
      // Handle specific error messages
      if (error.message?.includes('execution reverted')) {
        const revertReason = error.data?.message || error.message;
        if (revertReason.includes('KYC')) {
          setError('KYC verification required before redeeming tokens.');
        } else if (revertReason.includes('insufficient balance')) {
          setError('Insufficient token balance for redemption.');
        } else if (revertReason.includes('daily redemption limit')) {
          setError('Daily redemption limit exceeded. Please try again tomorrow.');
        } else {
          setError(revertReason || 'Transaction failed. Please try again.');
        }
      } else if (error.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected by user.');
      } else {
        setError('Error requesting redemption. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  if (checkingKYC) {
    return (
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking KYC status...</p>
        </div>
      </div>
    );
  }

  if (kycStatus !== KYCStatus.APPROVED) {
    return (
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">KYC Required</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to complete KYC verification before you can perform token actions.
            Please complete your KYC verification first.
          </p>
          <div className="mt-6">
            <a
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Complete KYC
            </a>
          </div>
        </div>
      </div>
    );
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
              className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
              placeholder="0.0"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Minimum amount: {minMintAmount} GSDT
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md word-break">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
            {success}
          </div>
        )}

        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMint}
            disabled={loading || !amount || !isMinter}
            className="flex-1 rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
            title={!isMinter ? 'You do not have permission to mint tokens' : undefined}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Mint Tokens'
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRedeem}
            disabled={loading || !amount}
            className="flex-1 rounded-md bg-secondary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-secondary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-600 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Redeem Tokens'
            )}
          </motion.button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>Connected Address: {address}</p>
          <p className="text-green-600">✓ KYC Verified</p>
          {!isMinter && (
            <p className="text-yellow-600">⚠️ You need MINTER_ROLE to mint tokens</p>
          )}
        </div>
      </div>
    </div>
  );
}