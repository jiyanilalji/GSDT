import { ethers } from 'ethers';
import { supabase } from '../lib/supabase';

// Admin role types
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
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

// Interface definitions
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

export interface AdminUser {
  id: string;
  user_address: string;
  role: AdminRole;
  created_at: string;
  email?: string;
  name?: string;
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

// Mock admin users
const mockAdminUsers: AdminUser[] = [
  {
    id: '1',
    user_address: '0x1234567890123456789012345678901234567890',
    role: AdminRole.SUPER_ADMIN,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    name: 'Super Admin',
    email: 'superadmin@dbdk.com'
  },
  {
    id: '2',
    user_address: '0x2345678901234567890123456789012345678901',
    role: AdminRole.ADMIN,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    name: 'Regular Admin',
    email: 'admin@dbdk.com'
  },
  {
    id: '3',
    user_address: '0x3456789012345678901234567890123456789012',
    role: AdminRole.MODERATOR,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    name: 'Content Moderator',
    email: 'moderator@dbdk.com'
  }
];

// Mock data
const mockTransactions = generateMockTransactions(50); // Generate 50 mock transactions
const mockDeposits = generateMockDeposits(20); // Generate 20 mock deposits

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

// Fraud detection helpers
export const calculateRiskScore = (tx: Transaction): number => {
  let score = 0;
  
  // Amount-based risk
  const amount = parseFloat(ethers.utils.formatEther(tx.amount));
  if (amount > 100000) score += 30;
  else if (amount > 10000) score += 20;
  else if (amount > 1000) score += 10;

  // Time-based risk (unusual hours)
  const hour = new Date(tx.timestamp).getHours();
  if (hour < 6 || hour > 22) score += 10;

  return Math.min(score, 100);
};

export const getFraudDetectionFlags = (tx: Transaction): string[] => {
  const flags: string[] = [];
  const amount = parseFloat(ethers.utils.formatEther(tx.amount));

  // Large transaction amount
  if (amount > 100000) flags.push('LARGE_AMOUNT');

  // Unusual hours
  const hour = new Date(tx.timestamp).getHours();
  if (hour < 6 || hour > 22) flags.push('UNUSUAL_HOURS');

  return flags;
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
      return mockAdminUsers; // Return mock data if error
    }
    
    return data as AdminUser[];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return mockAdminUsers; // Return mock data if error
  }
};

export const getUserRole = async (address: string): Promise<AdminRole | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_address', address)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return null;
      }
      console.error('Error fetching user role:', error);
      
      // Return mock role for testing
      const mockUser = mockAdminUsers.find(user => user.user_address.toLowerCase() === address.toLowerCase());
      return mockUser?.role || null;
    }
    
    return data.role as AdminRole;
  } catch (error) {
    console.error('Error fetching user role:', error);
    
    // Return mock role for testing
    const mockUser = mockAdminUsers.find(user => user.user_address.toLowerCase() === address.toLowerCase());
    return mockUser?.role || null;
  }
};

export const assignUserRole = async (address: string, role: AdminRole, assignedBy: string): Promise<boolean> => {
  try {
    // Check if the assigner is a super admin
    const assignerRole = await getUserRole(assignedBy);
    if (assignerRole !== AdminRole.SUPER_ADMIN) {
      throw new Error('Only super admins can assign roles');
    }
    
    // Check if user already has a role
    const { data: existingRole } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('user_address', address)
      .single();
    
    if (existingRole) {
      // Update existing role
      const { error } = await supabase
        .from('admin_roles')
        .update({ role })
        .eq('user_address', address);
      
      if (error) throw error;
    } else {
      // Insert new role
      const { error } = await supabase
        .from('admin_roles')
        .insert([{
          user_address: address,
          role,
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error assigning user role:', error);
    return false;
  }
};

export const removeUserRole = async (address: string, removedBy: string): Promise<boolean> => {
  try {
    // Check if the remover is a super admin
    const removerRole = await getUserRole(removedBy);
    if (removerRole !== AdminRole.SUPER_ADMIN) {
      throw new Error('Only super admins can remove roles');
    }
    
    // Delete the role
    const { error } = await supabase
      .from('admin_roles')
      .delete()
      .eq('user_address', address);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error removing user role:', error);
    return false;
  }
};

export const hasPermission = (userRole: AdminRole | null, requiredRole: AdminRole): boolean => {
  if (!userRole) return false;
  
  // Role hierarchy: SUPER_ADMIN > ADMIN > MODERATOR
  switch (requiredRole) {
    case AdminRole.SUPER_ADMIN:
      return userRole === AdminRole.SUPER_ADMIN;
    case AdminRole.ADMIN:
      return userRole === AdminRole.SUPER_ADMIN || userRole === AdminRole.ADMIN;
    case AdminRole.MODERATOR:
      return userRole === AdminRole.SUPER_ADMIN || userRole === AdminRole.ADMIN || userRole === AdminRole.MODERATOR;
    default:
      return false;
  }
};