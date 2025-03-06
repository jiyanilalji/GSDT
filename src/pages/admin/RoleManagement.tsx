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
import { 
  UserPlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  ShieldCheckIcon, 
  KeyIcon,
  BanknotesIcon,
  PauseCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import AdminLayout from './layout/AdminLayout';

export default function RoleManagement() {
  const { address } = useWallet();
  const { isSuperAdmin } = useAdmin();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    userAddress: '',
    role: '',
    name: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState({
    userAddress: '',
    role: ''
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

  const validateForm = () => {
    const errors = {
      userAddress: '',
      role: ''
    };
    let isValid = true;

    // Validate Ethereum address
    if (!formData.userAddress) {
      errors.userAddress = 'Ethereum address is required';
      isValid = false;
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.userAddress)) {
      errors.userAddress = 'Invalid Ethereum address format';
      isValid = false;
    }

    // Validate role selection
    if (!formData.role) {
      errors.role = 'Role selection is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAddUser = async () => {
    if (!address || !isSuperAdmin) return;
    
    if (!validateForm()) return;
    
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await assignUserRole(formData.userAddress, formData.role as AdminRole, address);
      
      if (result) {
        setSuccess(`Successfully assigned ${formData.role} role to ${formData.userAddress}`);
        setShowAddModal(false);
        
        // Refresh admin users list
        const users = await getAdminUsers();
        setAdminUsers(users);
        
        // Reset form
        setFormData({
          userAddress: '',
          role: '',
          name: '',
          email: ''
        });
        setFormErrors({
          userAddress: '',
          role: ''
        });
      } else {
        setError('Failed to assign role. Please try again.');
      }
    } catch (error: any) {
      console.error('Error assigning role:', error);
      //setError(err.message || 'Error assigning role');

      if (error.message?.includes('missing role')) {
        setError('You do not have permission to assign roles. Only users with SUPER_ADMIN can assign roles.');
      } else if (error.message?.includes('execution reverted')) {
        const revertReason = error.data?.message || error.message;
        if (revertReason.includes('KYC')) {
          setError('KYC verification required before assign roles.');                
        } else {
          setError(revertReason || 'Transaction failed. Please try again.');
        }
      } else if (error.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected by user.');
      } else {
        setError('Failed to assign role. Please try again.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!address || !selectedUser || !isSuperAdmin) return;
    
    if (!validateForm()) return;
    
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await assignUserRole(selectedUser.user_address, formData.role as AdminRole, address);
      
      if (result) {
        setSuccess(`Successfully updated ${selectedUser.user_address} to ${formData.role} role`);
        setShowEditModal(false);
        
        // Refresh admin users list
        const users = await getAdminUsers();
        setAdminUsers(users);
        
        // Reset selected user and form
        setSelectedUser(null);
        setFormData({
          userAddress: '',
          role: '',
          name: '',
          email: ''
        });
        setFormErrors({
          userAddress: '',
          role: ''
        });
      } else {
        setError('Failed to update role. Please try again.');
      }
    } catch (error: any) {
      console.error('Error assigning role:', error);
      //setError(err.message || 'Error assigning role');

      if (error.message?.includes('missing role')) {
        setError('You do not have permission to assign roles. Only users with SUPER_ADMIN can update roles.');
      } else if (error.message?.includes('execution reverted')) {
        const revertReason = error.data?.message || error.message;
        if (revertReason.includes('KYC')) {
          setError('KYC verification required before update roles.');                
        } else {
          setError(revertReason || 'Transaction failed. Please try again.');
        }
      } else if (error.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected by user.');
      } else {
        setError('Failed to update role. Please try again.');
      }
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
    } catch (error: any) {
      console.error('Error assigning role:', error);
      //setError(err.message || 'Error assigning role');

      if (error.message?.includes('missing role')) {
        setError('You do not have permission to removing role. Only users with SUPER_ADMIN can removing role.');
      } else if (error.message?.includes('execution reverted')) {
        const revertReason = error.data?.message || error.message;
        if (revertReason.includes('KYC')) {
          setError('KYC verification required before removing roles.');                
        } else {
          setError(revertReason || 'Transaction failed. Please try again.');
        }
      } else if (error.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected by user.');
      } else {
        setError('Failed to removing role. Please try again.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleIcon = (role: AdminRole) => {
    switch (role) {
      case AdminRole.SUPER_ADMIN:
        return <ShieldCheckIcon className="h-5 w-5 text-purple-600" />;
      case AdminRole.MINTER:
        return <BanknotesIcon className="h-5 w-5 text-green-600" />;
      case AdminRole.BURNER:
        return <KeyIcon className="h-5 w-5 text-red-600" />;
      case AdminRole.PAUSER:
        return <PauseCircleIcon className="h-5 w-5 text-yellow-600" />;
      case AdminRole.PRICE_UPDATER:
        return <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <ShieldCheckIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleBadgeClass = (role: AdminRole) => {
    switch (role) {
      case AdminRole.SUPER_ADMIN:
        return 'bg-purple-100 text-purple-800';
      case AdminRole.MINTER:
        return 'bg-green-100 text-green-800';
      case AdminRole.BURNER:
        return 'bg-red-100 text-red-800';
      case AdminRole.PAUSER:
        return 'bg-yellow-100 text-yellow-800';
      case AdminRole.PRICE_UPDATER:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDescription = (role: AdminRole) => {
    switch (role) {
      case AdminRole.SUPER_ADMIN:
        return 'Full admin access to all functions';
      case AdminRole.MINTER:
        return 'Can mint new tokens';
      case AdminRole.BURNER:
        return 'Can burn tokens and process redemptions';
      case AdminRole.PAUSER:
        return 'Can pause/unpause contract operations';
      case AdminRole.PRICE_UPDATER:
        return 'Can update token price';
      default:
        return '';
    }
  };

  if (!isSuperAdmin) {
    return (
      <AdminLayout activeTab="roles">
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
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="roles">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Smart Contract Role Management</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Assign and manage smart contract roles for users
            </p>
          </div>
          <button
            onClick={() => {
              setFormData({
                userAddress: '',
                role: '',
                name: '',
                email: ''
              });
              setFormErrors({
                userAddress: '',
                role: ''
              });
              setShowAddModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Role
          </button>
        </div>

        {error && (
          <div className="mx-4 my-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg word-break">
            {error}
          </div>
        )}

        {success && (
          <div className="mx-4 my-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Role descriptions */}
        <div className="mx-4 my-4 bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Available Smart Contract Roles:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(AdminRole).map((role) => (
              <div key={role} className="flex items-start space-x-2">
                {getRoleIcon(role)}
                <div>
                  <span className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${getRoleBadgeClass(role)}`}>
                    {role}
                  </span>
                  <p className="text-xs text-gray-600 mt-1">{getRoleDescription(role)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex justify-center space-x-3">
                        {user.user_address.toLowerCase() !== address?.toLowerCase() && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setFormData({
                                  userAddress: user.user_address,
                                  role: user.role,
                                  name: user.name || '',
                                  email: user.email || ''
                                });
                                setFormErrors({
                                  userAddress: '',
                                  role: ''
                                });
                                setShowEditModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                              title="Edit Role"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowRemoveModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 flex items-center"
                              title="Remove Role"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
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
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <UserPlusIcon className="h-6 w-6 text-primary-600 mr-2" />
                Assign Smart Contract Role
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="userAddress" className="block text-sm font-semibold leading-6 text-gray-900">
                    Ethereum Address <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2.5">
                    <input
                      type="text"
                      id="userAddress"
                      value={formData.userAddress}
                      onChange={(e) => {
                        setFormData({...formData, userAddress: e.target.value});
                        if (formErrors.userAddress) {
                          setFormErrors({...formErrors, userAddress: ''});
                        }
                      }}
                      className={`block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ${
                        formErrors.userAddress ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-primary-500'
                      } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                      placeholder="0x..."
                    />
                    {formErrors.userAddress && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.userAddress}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-semibold leading-6 text-gray-900">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2.5 relative">
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => {
                        setFormData({...formData, role: e.target.value});
                        if (formErrors.role) {
                          setFormErrors({...formErrors, role: ''});
                        }
                      }}
                      className={`block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ${
                        formErrors.role ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-primary-500'
                      } focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                    >
                      <option value="">Select Role</option>
                      {Object.values(AdminRole).map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    {formErrors.role && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
                    )}
                  </div>
                  {formData.role && (
                    <p className="mt-1 text-xs text-gray-500">
                      {getRoleDescription(formData.role as AdminRole)}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      userAddress: '',
                      role: '',
                      name: '',
                      email: ''
                    });
                    setFormErrors({
                      userAddress: '',
                      role: ''
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={actionLoading || !formData.userAddress || !formData.role}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 flex items-center"
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

        {/* Edit User Modal */}
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold leading-6 text-gray-900">
                    Ethereum Address
                  </label>
                  <div className="mt-2.5 text-sm text-gray-900 bg-gray-50 px-3.5 py-2 rounded-md ring-1 ring-inset ring-gray-300">
                    {selectedUser.user_address}
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-role" className="block text-sm font-semibold leading-6 text-gray-900">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2.5 relative">
                    <select
                      id="edit-role"
                      value={formData.role}
                      onChange={(e) => {
                        setFormData({...formData, role: e.target.value});
                        if (formErrors.role) {
                          setFormErrors({...formErrors, role: ''});
                        }
                      }}
                      className={`block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ${
                        formErrors.role ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-primary-500'
                      } focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                    >
                      <option value="">Select Role</option>
                      {Object.values(AdminRole).map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    {formErrors.role && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
                    )}
                  </div>
                  {formData.role && (
                    <p className="mt-1 text-xs text-gray-500">
                      {getRoleDescription(formData.role as AdminRole)}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    setFormData({
                      userAddress: '',
                      role: '',
                      name: '',
                      email: ''
                    });
                    setFormErrors({
                      userAddress: '',
                      role: ''
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  disabled={actionLoading || !formData.role}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 flex items-center"
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

        {/* Remove User Modal */}
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
                  onClick={() => {
                    setShowRemoveModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveUser}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
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
      </div>
    </AdminLayout>
  );
}