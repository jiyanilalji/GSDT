import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';
import { ReserveAsset } from '../../services/reserves';
import AdminLayout from './layout/AdminLayout';
import ReserveSummary from '../../components/admin/reserves/ReserveSummary';
import ReserveList from '../../components/admin/reserves/ReserveList';
import ReserveForm from '../../components/admin/reserves/ReserveForm';
import DeleteConfirmModal from '../../components/admin/reserves/DeleteConfirmModal';
import { useReserves } from '../../hooks/useReserves';

export default function ProofOfReserves() {
  const { isConnected } = useWallet();
  const { isSuperAdmin } = useAdmin();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReserve, setSelectedReserve] = useState<ReserveAsset | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    reserves,
    summary,
    loading,
    error,
    actionLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
    refresh
  } = useReserves();

  const handleCreateSubmit = async (data: Omit<ReserveAsset, 'id'>) => {
    try {
      await handleCreate(data);
      setSuccessMessage('Reserve asset created successfully');
      setShowAddModal(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error creating reserve asset:', err);
      throw err;
    }
  };

  const handleUpdateSubmit = async (id: string, data: Partial<ReserveAsset>) => {
    try {
      await handleUpdate(id, data);
      setSuccessMessage('Reserve asset updated successfully');
      setShowEditModal(false);
      setSelectedReserve(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error updating reserve asset:', err);
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReserve) return;
    
    try {
      await handleDelete(selectedReserve);
      setSuccessMessage('Reserve asset deleted successfully');
      setShowDeleteModal(false);
      setSelectedReserve(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error deleting reserve asset:', err);
      throw err;
    }
  };

  if (!isSuperAdmin) {
    return (
      <AdminLayout activeTab="reserves">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              Only Super Admins can manage proof of reserves.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="reserves">
      <div className="space-y-6">
        {/* Summary Section */}
        <ReserveSummary 
          summary={summary} 
          loading={loading} 
          error={error} 
          onRetry={refresh}
        />

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Reserves List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Proof of Reserves</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage and update reserve assets and their allocations
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
                >
                  Add Reserve Asset
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading reserves...</p>
              </div>
            ) : (
              <div className="mt-8">
                <ReserveList
                  reserves={reserves}
                  loading={loading}
                  error={error}
                  onEdit={(reserve) => {
                    setSelectedReserve(reserve);
                    setShowEditModal(true);
                  }}
                  onDelete={(reserve) => {
                    setSelectedReserve(reserve);
                    setShowDeleteModal(true);
                  }}
                  onRetry={refresh}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Reserve Asset</h3>
            <ReserveForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setShowAddModal(false)}
              isLoading={actionLoading}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedReserve && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Reserve Asset</h3>
            <ReserveForm
              initialData={selectedReserve}
              onSubmit={(data) => handleUpdateSubmit(selectedReserve.id, data)}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedReserve(null);
              }}
              isLoading={actionLoading}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={showDeleteModal}
        asset={selectedReserve}
        loading={actionLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedReserve(null);
        }}
      />
    </AdminLayout>
  );
}