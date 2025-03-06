import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';
import { 
  AdminRole, 
  AdminUser, 
  getAdminUsers, 
  assignUserRole, 
  removeUserRole 
} from '../../services/admin';

export default function RoleManagement() {
  const { address } = useWallet();
  const { isSuperAdmin } = useAdmin();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    userAddress: '',
    role: AdminRole.MODERATOR,
    name: '',
    email: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadAdminUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const users = await getAdminUsers();
        setAdminUsers(users);
      } catch (err: any) {
        console.error('Error loading admin users:', err);
        setError(err.message || 'Error loading admin users');
      } finally {
        setLoading(false);
      }
    };

    loadAdminUsers();
  }, []);

  const handleAddUser = async () => {
    if (!address || !formData.userAddress || !isSuperAdmin) return;
    
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      // Validate Ethereum address
      if (!/^0x[a-fA-F0-9]{40}$/.test(formData.userAddress)) {
        setError('Invalid Ethereum address');
        return;
      }
      
      const result = await assignUserRole(formData.userAddress, formData.role, address);
      
      if (result) {
        setSuccess(`Successfully assigned ${formData.role} role to ${formData.userAddress}`);
        setShowAddModal(false);
        
        // Refresh admin users list
        const users = await getAdminUsers();
        setAdminUsers(users);
        
        // Reset form
        setFormData({
          userAddress: '',
          role: AdminRole.MODERATOR,
          name: '',
          email: ''
        });
      } else {
        setError('Failed to assign role. Please try again.');
      }
    } catch (err: any) {
      console.error('Error assigning role:', err);
      setError(err.message || 'Error assigning role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!address || !selectedUser || !isSuperAdmin) return;
    
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await removeUserRole(selectedUser.user_address, address);
      
      if (result) {
        setSuccess(`Successfully removed ${selectedUser.role} role from ${selectedUser.user_address}`);
        setShowRemoveModal(false);
        
        // Refresh admin users list
        const users = await getAdminUsers();
        setAdminUsers(users);
        
        // Reset selected user
        setSelectedUser(null);
      } else {
        setError('Failed to remove role. Please try again.');
      }
    } catch (err: any) {
      console.error('Error removing role:', err);
      setError(err.message || 'Error removing role');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            Only Super Admins can manage user roles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">Role Management</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Assign and manage admin roles for users
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Add Admin User
        </button>
      </div>

      {error && (
        <div className="mx-4 my-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mx-4 my-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading admin users...</p>
        </div>
      ) : adminUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No admin users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adminUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.user_address.slice(0, 6)}...{user.user_address.slice(-4)}
                    {user.user_address.toLowerCase() === address?.toLowerCase() && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${user.role === AdminRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-800' :
                        user.role === AdminRole.ADMIN ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.user_address.toLowerCase() !== address?.toLowerCase() && (
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRemoveModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Admin User</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Ethereum Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.userAddress}
                  onChange={(e) => setFormData({...formData, userAddress: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="0x..."
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as AdminRole})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value={AdminRole.MODERATOR}>Moderator</option>
                  <option value={AdminRole.ADMIN}>Admin</option>
                  <option value={AdminRole.SUPER_ADMIN}>Super Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={actionLoading || !formData.userAddress}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {actionLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  'Add User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove User Modal */}
      {showRemoveModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Remove Admin User</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to remove {selectedUser.user_address.slice(0, 6)}...{selectedUser.user_address.slice(-4)} from the {selectedUser.role} role?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveUser}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Removing...
                  </span>
                ) : (
                  'Remove User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}