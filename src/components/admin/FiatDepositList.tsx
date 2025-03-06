import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiatDeposit, TransactionStatus, approveFiatDeposit, rejectFiatDeposit } from '../../services/admin';

interface Props {
  deposits: FiatDeposit[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function FiatDepositList({ deposits, isLoading, onRefresh }: Props) {
  const [selectedDeposit, setSelectedDeposit] = useState<FiatDeposit | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async (deposit: FiatDeposit) => {
    try {
      setLoading(true);
      await approveFiatDeposit(deposit.id);
      onRefresh();
    } catch (error) {
      console.error('Error approving deposit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDeposit || !rejectReason) return;
    
    try {
      setLoading(true);
      await rejectFiatDeposit(selectedDeposit.id, rejectReason);
      setSelectedDeposit(null);
      setRejectReason('');
      onRefresh();
    } catch (error) {
      console.error('Error rejecting deposit:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading deposits...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Currency
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Method
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 bg-gray-50"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {deposits.map((deposit) => (
            <motion.tr
              key={deposit.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {deposit.userId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {deposit.amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {deposit.currency}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {deposit.paymentMethod}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${deposit.status === TransactionStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                    deposit.status === TransactionStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}`}>
                  {deposit.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => handleApprove(deposit)}
                    disabled={loading}
                    className="text-green-600 hover:text-green-900"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setSelectedDeposit(deposit)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-900"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Reject Deposit Modal */}
      {selectedDeposit && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Deposit</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Reason for Rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setSelectedDeposit(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectReason}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Rejecting...' : 'Reject Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}