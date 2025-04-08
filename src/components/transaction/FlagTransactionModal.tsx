import { motion } from 'framer-motion';
import { Transaction } from '../../services/admin';

interface FlagTransactionModalProps {
  transaction: Transaction | null;
  flagReason: string;
  loading: boolean;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function FlagTransactionModal({
  transaction,
  flagReason,
  loading,
  onReasonChange,
  onClose,
  onSubmit
}: FlagTransactionModalProps) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 max-w-md w-full"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Flag Transaction</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Reason
          </label>
          <textarea
            value={flagReason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            rows={3}
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading || !flagReason}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Flagging...' : 'Flag Transaction'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}