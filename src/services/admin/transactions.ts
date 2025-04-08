import { ethers } from 'ethers';
import { Transaction, TransactionStatus, TransactionType } from './types';
import { getContract } from '../../lib/web3';

const BSC_SCAN_API_KEY = import.meta.env.VITE_BSC_SCAN_API_KEY;
const BSC_SCAN_API_LINK = import.meta.env.VITE_BSC_SCAN_API_LINK;

const contract = getContract();
const CONTRACT_ADDRESS = contract.address;

interface BscScanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  isError: string;
  txreceipt_status: string;
  functionName: string;
  input: string;
}

const extractMintBurnAmount = (transaction: BscScanTransaction): string => {
  const { functionName, input } = transaction;

  if (!functionName.toLowerCase().includes("mint") && !functionName.toLowerCase().includes("burn")) {
    return '0';
  }

  const amountHex = input.slice(-64);
  return BigInt("0x" + amountHex).toString();
};

const mapBscScanTransaction = (tx: BscScanTransaction): Transaction => {
  let type = TransactionType.TRANSFER;
  if (tx.to.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
    type = TransactionType.MINT;
  } else if (tx.from.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
    type = TransactionType.REDEEM;
  }

  let status = TransactionStatus.COMPLETED;
  if (tx.isError === '1' || tx.txreceipt_status === '0') {
    status = TransactionStatus.FAILED;
  }

  const value = extractMintBurnAmount(tx);

  if(tx.functionName.includes("mint")){
    type = TransactionType.MINT;
  } else if(tx.functionName.includes("burn")){
    type = TransactionType.BURN;
  } else if(tx.functionName.includes("updateKYCStatus")){
    type = TransactionType.UPDATE_KYC;
  } else if(tx.functionName.includes("requestRedemption")){
    type = TransactionType.REQUEST_REDEEM;
  } else if(tx.functionName.includes("processRedemption")){
    type = TransactionType.PROCESS_REDEEM;
  } else if(tx.functionName.includes("grantRole")){
    type = TransactionType.GRANT_ROLE;
  } else if(tx.functionName.includes("revokeRole")){
    type = TransactionType.REVOKE_ROLE;
  }

  return {
    id: tx.hash,
    type,
    status,
    amount: value,
    fromAddress: tx.from,
    toAddress: tx.to,
    timestamp: new Date(parseInt(tx.timeStamp) * 1000),
    blockNumber: parseInt(tx.blockNumber),
    txHash: tx.hash
  };
};

export const fetchTransactions = async (
  status?: TransactionStatus,
  type?: TransactionType,
  currentPage = 1,
  pageSize = 10
): Promise<{
  transactions: Transaction[];
  totalItems: number;
}> => {
  try {
    if (!BSC_SCAN_API_KEY) {
      throw new Error('BscScan API key is missing');
    }

    const url = `${BSC_SCAN_API_LINK}api?module=account&action=txlist&address=${CONTRACT_ADDRESS}&startblock=0&endblock=99999999&sort=desc&apikey=${BSC_SCAN_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === '1' && Array.isArray(data.result)) {
      let txs = data.result.map(mapBscScanTransaction);
      
      // Apply filters
      if (status) {
        txs = txs.filter(tx => tx.status === status);
      }
      if (type) {
        txs = txs.filter(tx => tx.type === type);
      }

      // Apply pagination
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      
      return {
        transactions: txs.slice(start, end),
        totalItems: txs.length
      };
    }
    
    throw new Error(data.message || 'Failed to fetch transactions');
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const flagTransaction = async (txId: string, reason: string): Promise<boolean> => {
  try {
    // In a real implementation, this would update a database
    console.log('Flagging transaction:', txId, 'Reason:', reason);
    return true;
  } catch (error) {
    console.error('Error flagging transaction:', error);
    return false;
  }
};