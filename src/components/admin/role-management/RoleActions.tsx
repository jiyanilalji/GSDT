import { AdminRole, AdminUser } from '../../../services/admin';
import { useWallet } from '../../../hooks/useWallet';
import { useAdmin } from '../../../hooks/useAdmin';

interface RoleActionsProps {
  selectedUser: AdminUser | null;
  formData: {
    userAddress: string;
    role: string;
  };
  validateForm: () => boolean;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setActionLoading: (loading: boolean) => void;
  onClose: (modal: 'add' | 'edit' | 'remove') => void;
  refreshUsers: () => void;
}

export const useRoleActions = ({
  selectedUser,
  formData,
  validateForm,
  setError,
  setSuccess,
  setActionLoading,
  onClose,
  refreshUsers
}: RoleActionsProps) => {
  const { address } = useWallet();
  const { isSuperAdmin } = useAdmin();

  const handleAddUser = async () => {
    if (!address || !isSuperAdmin || !validateForm()) return;
    
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      // Add user logic here
      await refreshUsers();
      onClose('add');
    } catch (error: any) {
      console.error('Error adding user:', error);
      setError(error.message || 'Error adding user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!address || !selectedUser || !isSuperAdmin || !validateForm()) return;
    
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      // Edit user logic here
      await refreshUsers();
      onClose('edit');
    } catch (error: any) {
      console.error('Error editing user:', error);
      setError(error.message || 'Error editing user');
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
      
      // Remove user logic here
      await refreshUsers();
      onClose('remove');
    } catch (error: any) {
      console.error('Error removing user:', error);
      setError(error.message || 'Error removing user');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    handleAddUser,
    handleEditUser,
    handleRemoveUser
  };
};