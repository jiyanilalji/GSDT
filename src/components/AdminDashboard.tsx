import { motion } from 'framer-motion';
import { useState } from 'react';
import { getContract } from '../lib/web3';
import { ethers } from 'ethers';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleKYCApproval = async (address: string, status: boolean) => {
    setError('');
    
    try {
      setLoading(true);
      const contract = getContract();
      const tx = await contract.updateKYCStatus(address, status);
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Error updating KYC status');
    } finally {
      setLoading(false);
    }
  };

  const handleRedemptionApproval = async (requestId: number, approved: boolean) => {
    setError('');
    
    try {
      setLoading(true);
      const contract = getContract();
      const tx = await contract.processRedemption(requestId, approved);
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Error processing redemption');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Controls</h3>
        
        {/* KYC Approval Section */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-4">KYC Approvals</h4>
          <div className="space-y-4">
            {/* Add KYC approval interface here */}
          </div>
        </div>

        {/* Redemption Requests Section */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4">Pending Redemptions</h4>
          <div className="space-y-4">
            {/* Add redemption requests interface here */}
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-600">{error}</div>
        )}
      </div>
    </div>
  );
}