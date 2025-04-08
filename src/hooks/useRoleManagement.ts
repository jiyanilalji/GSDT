import { useState, useEffect } from 'react';
import { AdminRole, AdminUser, getAdminUsers } from '../services/admin';

export const useRoleManagement = () => {
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
    role: ''
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

    if (!formData.userAddress) {
      errors.userAddress = 'Ethereum address is required';
      isValid = false;
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.userAddress)) {
      errors.userAddress = 'Invalid Ethereum address format';
      isValid = false;
    }

    if (!formData.role) {
      errors.role = 'Role selection is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
  };

  const handleCloseModal = (modal: 'add' | 'edit' | 'remove') => {
    switch (modal) {
      case 'add':
        setShowAddModal(false);
        break;
      case 'edit':
        setShowEditModal(false);
        setSelectedUser(null);
        break;
      case 'remove':
        setShowRemoveModal(false);
        setSelectedUser(null);
        break;
    }
    setFormData({ userAddress: '', role: '' });
    setFormErrors({ userAddress: '', role: '' });
  };

  return {
    adminUsers,
    loading,
    error,
    success,
    showAddModal,
    showEditModal,
    showRemoveModal,
    selectedUser,
    formData,
    formErrors,
    actionLoading,
    setShowAddModal,
    setShowEditModal,
    setShowRemoveModal,
    setSelectedUser,
    setFormData,
    setFormErrors,
    setActionLoading,
    setError,
    setSuccess,
    validateForm,
    handleFormChange,
    handleCloseModal
  };
};