import { motion } from 'framer-motion';
import { AdminRole, AdminUser } from '../../../services/admin';
import { UserPlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import RoleForm from './RoleForm';

interface RoleModalsProps {
  showAddModal: boolean;
  showEditModal: boolean;
  showRemoveModal: boolean;
  selectedUser: AdminUser | null;
  formData: {
    userAddress: string;
    role: string;
  };
  formErrors: {
    userAddress: string;
    role: string;
  };
  actionLoading: boolean;
  onFormChange: (field: string, value: string) => void;
  onAdd: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onClose: (modal: 'add' | 'edit' | 'remove') => void;
}

export default function RoleModals({
  showAddModal,
  showEditModal,
  showRemoveModal,
  selectedUser,
  formData,
  formErrors,
  actionLoading,
  onFormChange,
  onAdd,
  onEdit,
  onRemove,
  onClose
}: RoleModalsProps) {
  return (
    <>
      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <UserPlusIcon className="h-6 w-6 text-primary-600 mr-2" />
              Assign Smart Contract Role
            </h3>
            <RoleForm
              formData={formData}
              formErrors={formErrors}
              onFormChange={onFormChange}
            />
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => onClose('add')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={onAdd}
                disabled={actionLoading || !formData.userAddress || !formData.role}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Assign Role
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <PencilSquareIcon className="h-6 w-6 text-indigo-600 mr-2" />
              Edit Smart Contract Role
            </h3>
            <RoleForm
              formData={formData}
              formErrors={formErrors}
              onFormChange={onFormChange}
              isEdit
            />
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => onClose('edit')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={onEdit}
                disabled={actionLoading || !formData.role}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <PencilSquareIcon className="h-4 w-4 mr-2" />
                    Update Role
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Remove Modal */}
      {showRemoveModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <TrashIcon className="h-6 w-6 text-red-600 mr-2" />
              Remove Admin Role
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to remove the <span className="font-semibold">{selectedUser.role}</span> role from <span className="font-semibold">{selectedUser.user_address.slice(0, 6)}...{selectedUser.user_address.slice(-4)}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => onClose('remove')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={onRemove}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Removing...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Remove Role
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}