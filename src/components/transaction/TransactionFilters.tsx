import { TransactionStatus, TransactionType } from '../../services/admin';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface TransactionFiltersProps {
  selectedStatus?: TransactionStatus;
  selectedType?: TransactionType;
  onStatusChange: (status: TransactionStatus | undefined) => void;
  onTypeChange: (type: TransactionType | undefined) => void;
}

export default function TransactionFilters({
  selectedStatus,
  selectedType,
  onStatusChange,
  onTypeChange
}: TransactionFiltersProps) {
  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TransactionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case TransactionStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case TransactionStatus.FLAGGED:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.MINT:
        return 'bg-green-100 text-green-800';
      case TransactionType.BURN:
        return 'bg-red-100 text-red-800';
      case TransactionType.PROCESS_REDEEM:
        return 'bg-green-100 text-green-800';
      case TransactionType.REQUEST_REDEEM:
        return 'bg-red-100 text-red-800';
      case TransactionType.UPDATE_KYC:
        return 'bg-blue-100 text-blue-800';
      case TransactionType.GRANT_ROLE:
        return 'bg-green-100 text-green-800';
      case TransactionType.REVOKE_ROLE:
        return 'bg-red-100 text-red-800';
      case TransactionType.TRANSFER:
        return 'bg-blue-100 text-blue-800';
      case TransactionType.FIAT_DEPOSIT:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Transactions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="relative">
            <select
              value={selectedStatus || ''}
              onChange={(e) => onStatusChange(e.target.value ? e.target.value as TransactionStatus : undefined)}
              className="appearance-none block w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 ease-in-out"
            >
              <option value="">All Statuses</option>
              {Object.values(TransactionStatus).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDownIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.values(TransactionStatus).map((status) => (
              <span
                key={status}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <div className="relative">
            <select
              value={selectedType || ''}
              onChange={(e) => onTypeChange(e.target.value ? e.target.value as TransactionType : undefined)}
              className="appearance-none block w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 ease-in-out"
            >
              <option value="">All Types</option>
              {Object.values(TransactionType).map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replace('_', ' ')}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDownIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.values(TransactionType).map((type) => (
              <span
                key={type}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(type)}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}