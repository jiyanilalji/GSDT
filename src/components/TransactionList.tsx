import { useState } from 'react';
import { TransactionStatus, TransactionType } from '../services/admin';
import TransactionFilters from './transaction/TransactionFilters';
import TransactionTable from './transaction/TransactionTable';
import TransactionPagination from './transaction/TransactionPagination';
import { useTransactions } from '../hooks/useTransactions';
import LoadingSpinner from './LoadingSpinner';

export default function TransactionList() {
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus>();
  const [selectedType, setSelectedType] = useState<TransactionType>();
  const [currentPage, setCurrentPage] = useState(1);

  const { transactions, pagination, isLoading, error, refresh } = useTransactions(
    selectedStatus,
    selectedType,
    currentPage,
    10
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={refresh}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TransactionFilters
        selectedStatus={selectedStatus}
        selectedType={selectedType}
        onStatusChange={setSelectedStatus}
        onTypeChange={setSelectedType}
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <TransactionTable transactions={transactions} />

        <TransactionPagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}