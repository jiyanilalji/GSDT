import { motion } from 'framer-motion';
import { useTransactions, useFiatDeposits, TransactionStatus } from '../../services/admin';

export default function AdminStats() {
  const { transactions } = useTransactions(undefined, undefined, 1, 1000);
  const { deposits } = useFiatDeposits();

  const stats = [
    {
      name: 'Total Transactions',
      value: transactions?.length || 0,
      change: '+4.75%',
      changeType: 'positive'
    },
    {
      name: 'Pending Approvals',
      value: deposits?.filter(d => d.status === TransactionStatus.PENDING).length || 0,
      change: '-1.5%',
      changeType: 'negative'
    },
    {
      name: 'Flagged Transactions',
      value: transactions?.filter(t => t.status === TransactionStatus.FLAGGED).length || 0,
      change: '+2.1%',
      changeType: 'positive'
    },
    {
      name: 'Average Risk Score',
      value: transactions?.reduce((acc, tx) => acc + (tx.riskScore || 0), 0) / (transactions?.length || 1),
      format: (value: number) => value.toFixed(2),
      change: '-0.5%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {stat.format ? stat.format(stat.value) : stat.value}
                </p>
              </div>
              <div className="ml-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${stat.changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}