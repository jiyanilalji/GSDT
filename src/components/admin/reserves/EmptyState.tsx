import { motion } from 'framer-motion';
import { DocumentIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  message: string;
  onAction?: () => void;
  actionLabel?: string;
}

export default function EmptyState({ message, onAction, actionLabel }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="flex justify-center">
        <DocumentIcon className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
      {onAction && actionLabel && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </motion.div>
  );
}