// Admin role types
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MINTER = 'MINTER',
  BURNER = 'BURNER',
  PAUSER = 'PAUSER',
  PRICE_UPDATER = 'PRICE_UPDATER'
}

// Transaction types for monitoring
export enum TransactionType {
  MINT = 'MINT',
  BURN = 'BURN',
  PROCESS_REDEEM = 'PROCESS_REDEEM',
  REQUEST_REDEEM = 'REQUEST_REDEEM',
  UPDATE_KYC = 'UPDATE_KYC',
  GRANT_ROLE = 'GRANT_ROLE',
  REVOKE_ROLE = 'REVOKE_ROLE',
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