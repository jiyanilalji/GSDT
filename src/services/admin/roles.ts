import { ethers } from 'ethers';
import { getContract } from '../../lib/web3';
import { supabase } from '../../lib/supabase';
import { AdminRole, AdminUser } from './types';

// Role mapping constants
const ROLE_HASHES = {
  [AdminRole.SUPER_ADMIN]: ethers.constants.HashZero, // DEFAULT_ADMIN_ROLE
  [AdminRole.MINTER]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
  [AdminRole.BURNER]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE")),
  [AdminRole.PAUSER]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PAUSER_ROLE")),
  [AdminRole.PRICE_UPDATER]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PRICE_UPDATER_ROLE"))
};

// Check if role needs contract interaction
const isContractRole = (role: AdminRole): boolean => {
  return [
    AdminRole.SUPER_ADMIN,
    AdminRole.MINTER,
    AdminRole.BURNER,
    AdminRole.PAUSER,
    AdminRole.PRICE_UPDATER
  ].includes(role);
};

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as AdminUser[];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
};

export const getUserRole = async (address: string): Promise<AdminRole | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_address', address.toLowerCase())
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data.role as AdminRole;
  } catch (error) {
    console.error('Error getting user role:', error);
    throw error;
  }
};

export const assignUserRole = async (
  address: string, 
  role: AdminRole, 
  assignedBy: string
): Promise<boolean> => {
  try {
    // Check if the assigner is a super admin
    const assignerRole = await getUserRole(assignedBy);
    if (assignerRole !== AdminRole.SUPER_ADMIN) {
      throw new Error('Only super admins can assign roles');
    }

    // If it's a contract role, update the smart contract first
    if (isContractRole(role)) {
      const contract = getContract();
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const roleHash = ROLE_HASHES[role];
      if (!roleHash) {
        throw new Error('Invalid contract role');
      }

      const tx = await contract.grantRole(roleHash, address);
      await tx.wait();
    }
    
    // Update database
    const { data: existingRole } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('user_address', address.toLowerCase())
      .single();
    
    if (existingRole) {
      const { error: updateError } = await supabase
        .from('admin_roles')
        .update({ role })
        .eq('user_address', address.toLowerCase());
      
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('admin_roles')
        .insert([{
          user_address: address.toLowerCase(),
          role,
          created_at: new Date().toISOString()
        }]);
      
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error('Error assigning user role:', error);
    throw error;
  }
};

export const removeUserRole = async (address: string, removedBy: string): Promise<boolean> => {
  try {
    // Check if the remover is a super admin
    const removerRole = await getUserRole(removedBy);
    if (removerRole !== AdminRole.SUPER_ADMIN) {
      throw new Error('Only super admins can remove roles');
    }

    // Get the user's current role before removing it
    const { data: userData } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_address', address.toLowerCase())
      .single();

    if (!userData) {
      throw new Error('User role not found');
    }

    const currentRole = userData.role as AdminRole;

    // If it's a contract role, revoke it from the smart contract first
    if (isContractRole(currentRole)) {
      const contract = getContract();
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const roleHash = ROLE_HASHES[currentRole];
      if (!roleHash) {
        throw new Error('Invalid contract role');
      }

      const tx = await contract.revokeRole(roleHash, address);
      await tx.wait();
    }
    
    // Delete from database
    const { error } = await supabase
      .from('admin_roles')
      .delete()
      .eq('user_address', address.toLowerCase());
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing user role:', error);
    throw error;
  }
};

export const hasPermission = (userRole: AdminRole | null, requiredRole: AdminRole): boolean => {
  if (!userRole) return false;
  
  // Role hierarchy: SUPER_ADMIN > ADMIN > MODERATOR > other roles
  switch (requiredRole) {
    case AdminRole.SUPER_ADMIN:
      return userRole === AdminRole.SUPER_ADMIN;
    case AdminRole.ADMIN:
      return userRole === AdminRole.SUPER_ADMIN || userRole === AdminRole.ADMIN;
    case AdminRole.MODERATOR:
      return userRole === AdminRole.SUPER_ADMIN || userRole === AdminRole.ADMIN || userRole === AdminRole.MODERATOR;
    case AdminRole.MINTER:
    case AdminRole.BURNER:
    case AdminRole.PAUSER:
    case AdminRole.PRICE_UPDATER:
      return userRole === AdminRole.SUPER_ADMIN || userRole === requiredRole;
    default:
      return false;
  }
};