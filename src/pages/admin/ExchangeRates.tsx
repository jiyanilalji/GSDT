import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';
import { ExchangeRate, createExchangeRate, updateExchangeRate, deleteExchangeRate } from '../../services/exchangeRates';
import AdminLayout from './layout/AdminLayout';
import ExchangeRatesList from '../../components/admin/exchange-rates/ExchangeRatesList';
import AddRateModal from '../../components/admin/exchange-rates/AddRateModal';
import EditRateModal from '../../components/admin/exchange-rates/EditRateModal';

export default function ExchangeRates() {
  const { isConnected } = useWallet();
  const { isSuperAdmin, isPriceUpdater } = useAdmin();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreate = async (data: Omit<ExchangeRate, 'id' | 'last_updated'>) => {
    try {
      setLoading(true);
      setError(null);
      
      await createExchangeRate(
        data.currency_from.toUpperCase(),
        data.currency_to.toUpperCase(),
        data.rate
      );
      
      setSuccess('Exchange rate created successfully');
      setShowAddModal(false);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating rate:', err);
      setError(err.message || 'Error creating exchange rate');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, data: Partial<ExchangeRate>) => {
    try {
      setLoading(true);
      setError(null);
      
      await updateExchangeRate(id, data.rate!);
      
      setSuccess('Exchange rate updated successfully');
      setShowEditModal(false);
      setSelectedRate(null);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating rate:', err);
      setError(err.message || 'Error updating exchange rate');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rate: ExchangeRate) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteExchangeRate(rate.id);
      setSuccess('Exchange rate deleted successfully');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting rate:', err);
      setError(err.message || 'Error deleting exchange rate');
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin && !isPriceUpdater) {
    return (
      <AdminLayout activeTab="rates">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              Only Super Admins and Price Updaters can manage exchange rates.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="rates">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Exchange Rates</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage currency exchange rates
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
                >
                  Add Rate
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="mt-8">
              <ExchangeRatesList 
                refreshInterval={30000}
                onEdit={(rate) => {
                  setSelectedRate(rate);
                  setShowEditModal(true);
                }}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddRateModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreate}
          loading={loading}
        />
      )}

      {showEditModal && selectedRate && (
        <EditRateModal
          rate={selectedRate}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRate(null);
          }}
          onSubmit={handleUpdate}
          loading={loading}
        />
      )}
    </AdminLayout>
  );
}