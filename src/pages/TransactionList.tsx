import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import TransactionListComponent from '../components/TransactionList';

export default function TransactionListPage() {
  const { isConnected } = useWallet();
  const navigate = useNavigate();

  // Redirect to home if not connected
  if (!isConnected) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold leading-6 text-gray-900"
            >
              Transaction History
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-sm text-gray-600"
            >
              View all your GSDT token transactions
            </motion.p>
          </div>
        </div>

        <div className="mt-8">
          <TransactionListComponent />
        </div>
      </div>
    </div>
  );
}