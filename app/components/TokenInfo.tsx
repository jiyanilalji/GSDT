'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useGSDTContract } from '../hooks/useContract';
import { formatEther } from 'ethers/lib/utils';

import { kycCheckNFT } from '../services/kycCheckNFT';

export default function TokenInfo() {
  const { address, isConnected } = useAccount();
  const contract = useGSDTContract();
  const [balance, setBalance] = useState('0');
  const [price, setPrice] = useState('0');
  const [isKYCApproved, setIsKYCApproved] = useState(false);

  useEffect(() => {
    if (!isConnected || !contract || !address) return;

    const fetchData = async () => {
      try {
        const [balanceData, priceData, kycStatus] = await Promise.all([
          contract.balanceOf(address),
          contract.currentPrice(),
          contract.kycApproved(address)
        ]);
        setBalance(formatEther(balanceData));
        setPrice(formatEther(priceData));
        setIsKYCApproved(kycStatus);
      } catch (error) {
        console.error('Error fetching token data:', error);
      }
    };

    fetchData();
    
    // Set up event listeners
    const balanceFilter = contract.filters.Transfer(null, address);
    const priceFilter = contract.filters.PriceUpdate();
    const kycFilter = contract.filters.KYCStatusUpdated(address);
    
    contract.on(balanceFilter, fetchData);
    contract.on(priceFilter, fetchData);
    contract.on(kycFilter, fetchData);

    return () => {
      contract.off(balanceFilter, fetchData);
      contract.off(priceFilter, fetchData);
      contract.off(kycFilter, fetchData);
    };
  }, [address, isConnected, contract]);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Token Info</h3>
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="px-4 py-5 bg-secondary-50 rounded-lg overflow-hidden sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Balance</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{balance} GSDT</dd>
        </div>
        <div className="px-4 py-5 bg-primary-50 rounded-lg overflow-hidden sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Current Price</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">${price} USDC</dd>
        </div>
        <div className="px-4 py-5 bg-gray-50 rounded-lg overflow-hidden sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">KYC Status</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {isKYCApproved ? (
              <span className="text-green-600">Approved</span>
            ) : (
              <span className="text-red-600">Not Approved</span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}