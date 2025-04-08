import { motion } from 'framer-motion';
import { Transaction, TransactionStatus } from '../../services/admin';
import { format } from 'date-fns';
import { utils } from 'ethers';

const bscscan_explorer_link = import.meta.env.VITE_BSC_SCAN_EXPLORER_LINK;

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const getStatusBadgeClass = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TransactionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case TransactionStatus.FAILED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Hash</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {transactions.map((tx) => (
          <motion.tr
            key={tx.txHash}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hover:bg-gray-50"
          >
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {tx.type}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {parseFloat(utils.formatEther(tx.amount)).toFixed(2)} GSDT
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <a
                href={`${bscscan_explorer_link}address/${tx.fromAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-900"
              >
                {tx.fromAddress.slice(0, 6)}...{tx.fromAddress.slice(-4)}
              </a>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <a
                href={`${bscscan_explorer_link}address/${tx.toAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-900"
              >
                {tx.toAddress.slice(0, 6)}...{tx.toAddress.slice(-4)}
              </a>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {format(tx.timestamp, 'MMM d, yyyy HH:mm')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(tx.status)}`}>
                {tx.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <a
                href={`${bscscan_explorer_link}tx/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-900"
              >
                {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
              </a>
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  );
}