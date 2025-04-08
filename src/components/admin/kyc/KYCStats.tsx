import { motion } from 'framer-motion';
import { KYCStats } from '../../../services/kyc';

interface Props {
  stats: KYCStats;
}

export default function KYCStatsDisplay({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {[
        { name: 'Total KYC Requests', value: stats.total },
        { name: 'Pending Requests', value: stats.pending },
        { name: 'Approved Requests', value: stats.approved },
        { name: 'Rejected Requests', value: stats.rejected }
      ].map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white overflow-hidden shadow rounded-lg p-5"
        >
          <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
        </motion.div>
      ))}
    </div>
  );
}