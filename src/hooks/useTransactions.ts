import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Transaction, TransactionStatus, TransactionType } from '../services/admin';
import { getContract } from '../lib/web3';
import { BigNumber } from 'ethers';

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
}

const mapBscScanTransaction = (tx: BscScanTransaction): Transaction => {
  // Determine transaction type based on contract interaction
  let type = TransactionType.TRANSFER;
  if (tx.to.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
    type = TransactionType.MINT;
  } else if (tx.from.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
    type = TransactionType.REDEEM;
  }

  // Determine status
  let status = TransactionStatus.COMPLETED;
  if (tx.isError === '1' || tx.txreceipt_status === '0') {
    status = TransactionStatus.FAILED;
  }

  var newValue = extractMintBurnAmount(tx);
  tx.value = newValue;

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
    amount: BigNumber.from(tx.value).toString(),
    fromAddress: tx.from,
    toAddress: tx.to,
    timestamp: new Date(parseInt(tx.timeStamp) * 1000),
    blockNumber: parseInt(tx.blockNumber),
    txHash: tx.hash
  };
};

function extractMintBurnAmount(transaction) {
    const { functionName, input } = transaction;

    // Check if functionName indicates a Mint or Burn event
    if (!functionName.toLowerCase().includes("mint") && !functionName.toLowerCase().includes("burn")) {
        return 0; // Not a relevant transaction
    }

    // Extract amount from the last 32 bytes (64 hex characters) of input
    const amountHex = input.slice(-64);
    const amount = BigInt("0x" + amountHex).toString();  // Convert to decimal

    return amount;
}

export const useTransactions = (
  status?: TransactionStatus,
  type?: TransactionType,
  currentPage = 1,
  pageSize = 10
) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!BSC_SCAN_API_KEY) {
        throw new Error('BscScan API key is missing');
      }

      const url = `${BSC_SCAN_API_LINK}api?module=account&action=txlist&address=${CONTRACT_ADDRESS}&startblock=0&endblock=99999999&sort=desc&apikey=${BSC_SCAN_API_KEY}`;
      
      const response = await axios.get(url);
      
      if (response.data.status === '1' && Array.isArray(response.data.result)) {
        let txs = response.data.result.map(mapBscScanTransaction);
        
        // Apply filters
        if (status) {
          txs = txs.filter(tx => tx.status === status);
        }
        if (type) {
          txs = txs.filter(tx => tx.type === type);
        }

        setTotalItems(txs.length);

        // Apply pagination
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        setTransactions(txs.slice(start, end));
      } else {
        throw new Error(response.data.message || 'Failed to fetch transactions');
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Error fetching transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [status, type, currentPage, pageSize]);

  return {
    transactions,
    pagination: {
      currentPage,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
      pageSize
    },
    isLoading: loading,
    error,
    refresh: fetchTransactions
  };
};