import { ethers } from 'ethers';
import { getContract } from '../lib/web3';
import { supabase } from '../lib/supabase';

// Admin role types
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MINTER = 'MINTER_ROLE',
  BURNER = 'BURNER_ROLE',
  PAUSER = 'PAUSER_ROLE',
  PRICE_UPDATER = 'PRICE_UPDATER_ROLE',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

// Transaction types for monitoring
export enum TransactionType {
  MINT = 'MINT',
  REDEEM = 'REDEEM',
  TRANSFER = 'TRANSFER',
  FIAT_DEPOSIT = 'FIAT_DEPOSIT'
}

// Transaction status
export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  FLAGGED = 'FLAGGED'
}

// Add role mapping constants
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

// Interface definitions
export interface AdminUser {
  id: string;
  user_address: string;
  role: AdminRole;
  created_at: string;
  email?: string;
  name?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  fromAddress: string;
  toAddress: string;
  timestamp: Date;
  blockNumber: number;
  txHash: string;
  riskScore?: number;
  flags?: string[];
}

export interface FiatDeposit {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: string;
  timestamp: Date;
  verificationDocument?: string;
}

// Generate mock transactions
const generateMockTransactions = (count: number): Transaction[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    type: Object.values(TransactionType)[Math.floor(Math.random() * 4)],
    status: Object.values(TransactionStatus)[Math.floor(Math.random() * 4)],
    amount: ethers.utils.parseEther((Math.random() * 1000).toFixed(2)).toString(),
    fromAddress: `0x${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
    toAddress: `0x${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    blockNumber: 12345678 + i,
    txHash: `0x${Math.random().toString(36).substring(2, 10)}`,
    riskScore: Math.floor(Math.random() * 100)
  }));
};

// Generate mock deposits
const generateMockDeposits = (count: number): FiatDeposit[] => {
  const currencies = ['USD', 'EUR', 'GBP', 'JPY'];
  const paymentMethods = ['Bank Transfer', 'Credit Card', 'Wire Transfer', 'SEPA'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    userId: `0x${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
    amount: Math.floor(Math.random() * 10000),
    currency: currencies[Math.floor(Math.random() * currencies.length)],
    status: TransactionStatus.PENDING,
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
  }));
};

// Mock data
const mockTransactions = generateMockTransactions(50);
const mockDeposits = generateMockDeposits(20);

// Admin API functions
export const useTransactions = (
  status?: TransactionStatus,
  type?: TransactionType,
  currentPage = 1,
  pageSize = 10
) => {
  // Filter transactions based on status and type
  const filteredTransactions = mockTransactions
    .filter(tx => !status || tx.status === status)
    .filter(tx => !type || tx.type === type);

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const pagination = {
    currentPage,
    totalPages: Math.ceil(filteredTransactions.length / pageSize),
    totalItems: filteredTransactions.length,
    pageSize
  };

  return {
    transactions: paginatedTransactions,
    pagination,
    isLoading: false,
    refresh: () => {} // Mock refresh function
  };
};

export const useFiatDeposits = (status?: TransactionStatus) => {
  // Filter deposits based on status
  const filteredDeposits = mockDeposits
    .filter(deposit => !status || deposit.status === status);

  return {
    deposits: filteredDeposits,
    isLoading: false,
    refresh: () => {} // Mock refresh function
  };
};

export const approveFiatDeposit = async (depositId: string) => {
  console.log('Approving deposit:', depositId);
  return true;
};

export const rejectFiatDeposit = async (depositId: string, reason: string) => {
  console.log('Rejecting deposit:', depositId, 'Reason:', reason);
  return true;
};

export const flagTransaction = async (txId: string, reason: string) => {
  console.log('Flagging transaction:', txId, 'Reason:', reason);
  return true;
};

// Admin role management functions
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
    
    return data as AdminUser[];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
};

export const assignUserRole = async (
  address: string, 
  role: AdminRole, 
  assignedBy: string,
  name?: string,
  email?: string
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

      // Grant role on the smart contract
      const roleHash = ROLE_HASHES[role];
      if (!roleHash) {
        throw new Error('Invalid contract role');
      }

      const tx = await contract.grantRole(roleHash, address);
      await tx.wait();
    }
    
    // Normalize the address to lowercase
    const normalizedAddress = address.toLowerCase();
    
    // Check if user already has a role
    const { data: existingRole, error: checkError } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('user_address', normalizedAddress)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing role:', checkError);
      throw new Error('Error checking existing role');
    }
    
    if (existingRole) {
      // Update existing role
      const { error: updateError } = await supabase
        .from('admin_roles')
        .update({ 
          role,
          updated_at: new Date().toISOString(),
          name: name || `User ${normalizedAddress.slice(0, 6)}`,
          email: email || `${normalizedAddress.slice(0, 6)}@example.com`
        })
        .eq('user_address', normalizedAddress);
      
      if (updateError) {
        console.error('Error updating role:', updateError);
        throw new Error('Error updating role');
      }
    } else {
      // Insert new role
      const { error: insertError } = await supabase
        .from('admin_roles')
        .insert([{
          user_address: normalizedAddress,
          role,
          created_at: new Date().toISOString(),
          name: name || `User ${normalizedAddress.slice(0, 6)}`,
          email: email || `${normalizedAddress.slice(0, 6)}@example.com`
        }]);
      
      if (insertError) {
        console.error('Error inserting role:', insertError);
        throw new Error('Error inserting role');
      }
    }
    
    return true;
  } catch (error: any) {
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
    const { data: userData, error: userError } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_address', address.toLowerCase())
      .single();

    if (userError) {
      throw new Error('Error fetching user role');
    }

    const currentRole = userData?.role as AdminRole;

    // If it's a contract role, revoke it from the smart contract first
    if (isContractRole(currentRole)) {
      const contract = getContract();
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      // Revoke role on the smart contract
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
    
    if (error) {
      console.error('Error deleting role:', error);
      throw new Error('Error deleting role');
    }
    
    return true;
  } catch (error: any) {
    console.error('Error removing user role:', error);
    throw error;
  }
};

// Get user role function
export const getUserRole = async (address: string): Promise<AdminRole | null> => {
  if (!address) return null;
  
  try {
    // Normalize the address to lowercase
    const normalizedAddress = address.toLowerCase();
    
    // Query the admin_roles table from Supabase
    const { data, error } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_address', normalizedAddress)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user role from Supabase:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    return data.role as AdminRole;
  } catch (error) {
    console.error('Error checking user role:', error);
    return null;
  }
};

export const hasPermission = (userRole: AdminRole | null, requiredRole: AdminRole): boolean => {
  if (!userRole) return false;
  
  // Role hierarchy: SUPER_ADMIN > other roles
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