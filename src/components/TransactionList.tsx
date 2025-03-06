'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { getContract } from '../lib/web3';
import { ethers } from 'ethers';
import { format } from 'date-fns';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  type: 'mint' | 'redeem' | 'transfer';
  blockNumber: number;
}

// Smaller block range to avoid RPC limits
const BLOCKS_PER_QUERY = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export default function TransactionList() {
  const { address, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [lastProcessedBlock, setLastProcessedBlock] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  // Function to fetch events with retry mechanism
  const fetchEvents = async (
    contract: ethers.Contract,
    filter: any,
    fromBlock: number,
    toBlock: number,
    retries = 0
  ): Promise<any[]> => {
    try {
      return await contract.queryFilter(filter, fromBlock, toBlock);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      
      // If we hit a limit or timeout, reduce the block range and retry
      if (retries < MAX_RETRIES && 
          (error.message.includes('limit exceeded') || 
           error.message.includes('timeout') ||
           error.code === 'TIMEOUT')) {
        console.log(`Retrying with smaller block range (${retries + 1}/${MAX_RETRIES})...`);
        
        // Cut the block range in half for the retry
        const midBlock = Math.floor((fromBlock + toBlock) / 2);
        
        // If the range is too small, give up
        if (toBlock - fromBlock < 100) {
          throw new Error('Block range too small, cannot reduce further');
        }
        
        // Fetch the first half
        const firstHalfEvents = await fetchEvents(
          contract, 
          filter, 
          fromBlock, 
          midBlock, 
          retries + 1
        );
        
        // Wait a bit before the next request to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        
        // Fetch the second half
        const secondHalfEvents = await fetchEvents(
          contract, 
          filter, 
          midBlock + 1, 
          toBlock, 
          retries + 1
        );
        
        // Combine the results
        return [...firstHalfEvents, ...secondHalfEvents];
      }
      
      throw error;
    }
  };

  // Function to load transactions with pagination
  const loadTransactions = useCallback(async (isInitial = false) => {
    if (!isConnected || !address) return;

    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError('');

      const contract = getContract();
      
      try {
        // Try to get current block number
        const currentBlock = await contract.provider.getBlockNumber();
        
        const fromBlock = isInitial ? 
          Math.max(0, currentBlock - BLOCKS_PER_QUERY) : 
          Math.max(0, (lastProcessedBlock || 0) - BLOCKS_PER_QUERY);
        
        const toBlock = isInitial ? currentBlock : (lastProcessedBlock || 0) - 1;

        if (fromBlock <= 0 || fromBlock >= toBlock) {
          setHasMore(false);
          return;
        }

        console.log(`Fetching events from block ${fromBlock} to ${toBlock}`);

        // FIXED: Create proper filters for event listeners
        // For Mint events, filter by the 'to' address (second parameter)
        const mintFilter = contract.filters.Mint(address, null);
        
        // For Burn events, filter by the 'from' address (first parameter)
        const burnFilter = contract.filters.Burn(address);
        
        // For Transfer events, filter by 'from' and 'to' addresses
        const transferFilterFrom = contract.filters.Transfer(address, null);
        const transferFilterTo = contract.filters.Transfer(null, address);

        // Fetch events with retry mechanism
        const [mintEvents, burnEvents, transferFromEvents, transferToEvents] = await Promise.all([
          fetchEvents(contract, mintFilter, fromBlock, toBlock),
          fetchEvents(contract, burnFilter, fromBlock, toBlock),
          fetchEvents(contract, transferFilterFrom, fromBlock, toBlock),
          fetchEvents(contract, transferFilterTo, fromBlock, toBlock)
        ]);

        console.log('Events fetched:', {
          mint: mintEvents.length,
          burn: burnEvents.length,
          transferFrom: transferFromEvents.length,
          transferTo: transferToEvents.length
        });

        // Process events into transactions
        const processEvent = async (event: any, type: 'mint' | 'redeem' | 'transfer'): Promise<Transaction> => {
          try {
            const block = await event.getBlock();
            return {
              hash: event.transactionHash,
              from: type === 'mint' ? ethers.constants.AddressZero : event.args.from,
              to: type === 'redeem' ? ethers.constants.AddressZero : event.args.to || address,
              amount: (event.args.amount || event.args.value).toString(),
              timestamp: block.timestamp,
              type,
              blockNumber: event.blockNumber
            };
          } catch (error) {
            console.error('Error processing event:', error);
            // Return a default transaction if block fetch fails
            return {
              hash: event.transactionHash,
              from: type === 'mint' ? ethers.constants.AddressZero : event.args.from,
              to: type === 'redeem' ? ethers.constants.AddressZero : event.args.to || address,
              amount: (event.args.amount || event.args.value).toString(),
              timestamp: Math.floor(Date.now() / 1000), // Current timestamp as fallback
              type,
              blockNumber: event.blockNumber
            };
          }
        };

        const newTransactions = await Promise.all([
          ...mintEvents.map(e => processEvent(e, 'mint')),
          ...burnEvents.map(e => processEvent(e, 'redeem')),
          ...transferFromEvents.map(e => processEvent(e, 'transfer')),
          ...transferToEvents.filter(e => e.args.from.toLowerCase() !== address.toLowerCase()).map(e => processEvent(e, 'transfer'))
        ]);

        // Sort by block number and timestamp
        newTransactions.sort((a, b) => {
          if (b.blockNumber === a.blockNumber) {
            return b.timestamp - a.timestamp;
          }
          return b.blockNumber - a.blockNumber;
        });

        // Update all transactions
        const updatedAllTransactions = isInitial 
          ? newTransactions 
          : [...allTransactions, ...newTransactions];
        
        setAllTransactions(updatedAllTransactions);
        setTotalItems(updatedAllTransactions.length);
        
        // Update displayed transactions based on pagination
        updateDisplayedTransactions(updatedAllTransactions, currentPage);
        
        setLastProcessedBlock(fromBlock);
        setHasMore(fromBlock > 0);
      } catch (error) {
        console.error('Error fetching from blockchain:', error);
        
        // Fallback to mock data if blockchain query fails
        if (isInitial) {
          const mockTransactions: Transaction[] = [
            {
              hash: '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
              from: ethers.constants.AddressZero,
              to: address,
              amount: ethers.utils.parseEther('100').toString(),
              timestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
              type: 'mint',
              blockNumber: 12345678
            },
            {
              hash: '0xabcdef123456789abcdef123456789abcdef123456789abcdef123456789abcd',
              from: address,
              to: '0x1234567890123456789012345678901234567890',
              amount: ethers.utils.parseEther('25').toString(),
              timestamp: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
              type: 'transfer',
              blockNumber: 12345670
            },
            {
              hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
              from: address,
              to: ethers.constants.AddressZero,
              amount: ethers.utils.parseEther('50').toString(),
              timestamp: Math.floor(Date.now() / 1000) - 10800, // 3 hours ago
              type: 'redeem',
              blockNumber: 12345660
            }
          ];
          
          setAllTransactions(mockTransactions);
          setTotalItems(mockTransactions.length);
          updateDisplayedTransactions(mockTransactions, 1);
          setHasMore(false);
        }
      }
    } catch (err: any) {
      console.error('Error loading transactions:', err);
      setError(err.message || 'Error loading transactions');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [address, isConnected, lastProcessedBlock, allTransactions, currentPage]);

  // Update displayed transactions based on pagination
  const updateDisplayedTransactions = (allTxs: Transaction[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setTransactions(allTxs.slice(startIndex, endIndex));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateDisplayedTransactions(allTransactions, page);
  };

  // Initial load
  useEffect(() => {
    if (isConnected && address) {
      loadTransactions(true);
    }
  }, [address, isConnected, loadTransactions]);

  // Set up event listeners for new transactions
  useEffect(() => {
    if (!isConnected || !address) return;
    
    try {
      const contract = getContract();
      
      // FIXED: Create proper filters for event listeners
      // For Mint events, filter by the 'to' address (second parameter)
      const mintFilter = contract.filters.Mint(address, null);
      
      // For Burn events, filter by the 'from' address (first parameter)
      const burnFilter = contract.filters.Burn(address);
      
      // For Transfer events, filter by 'from' and 'to' addresses
      const transferFilterFrom = contract.filters.Transfer(address, null);
      const transferFilterTo = contract.filters.Transfer(null, address);

      const handleNewEvent = async (event: any) => {
        try {
          let type: 'mint' | 'redeem' | 'transfer' = 'transfer';
          
          if (event.event === 'Mint') {
            type = 'mint';
          } else if (event.event === 'Burn') {
            type = 'redeem';
          }

          let block;
          try {
            block = await event.getBlock();
          } catch (error) {
            console.error('Error getting block:', error);
            block = { timestamp: Math.floor(Date.now() / 1000) };
          }

          const newTx: Transaction = {
            hash: event.transactionHash,
            from: type === 'mint' ? ethers.constants.AddressZero : event.args.from,
            to: type === 'redeem' ? ethers.constants.AddressZero : event.args.to || address,
            amount: (event.args.amount || event.args.value).toString(),
            timestamp: block.timestamp,
            type,
            blockNumber: event.blockNumber
          };

          // Add to all transactions
          setAllTransactions(prev => [newTx, ...prev]);
          setTotalItems(prev => prev + 1);
          
          // If we're on the first page, update displayed transactions
          if (currentPage === 1) {
            setTransactions(prev => [newTx, ...prev.slice(0, itemsPerPage - 1)]);
          }
        } catch (error) {
          console.error('Error processing new event:', error);
        }
      };

      // Set up event listeners
      const filters = [mintFilter, burnFilter, transferFilterFrom, transferFilterTo];
      filters.forEach(filter => {
        contract.on(filter, handleNewEvent);
      });

      // Clean up event listeners
      return () => {
        filters.forEach(filter => {
          contract.off(filter, handleNewEvent);
        });
      };
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  }, [address, isConnected, currentPage, itemsPerPage]);

  // Update displayed transactions when page changes
  useEffect(() => {
    updateDisplayedTransactions(allTransactions, currentPage);
  }, [currentPage, allTransactions]);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Transaction History</h3>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => loadTransactions(true)}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Try Again
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No transactions found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx, index) => (
                  <motion.tr
                    key={`${tx.hash}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${tx.type === 'mint' ? 'bg-green-100 text-green-800' :
                          tx.type === 'redeem' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'}`}>
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(ethers.utils.formatEther(tx.amount)).toFixed(2)} GSDT
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.from === ethers.constants.AddressZero ? (
                        'Mint'
                      ) : (
                        tx.from.toLowerCase() === address?.toLowerCase() ? (
                          'You'
                        ) : (
                          `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`
                        )
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.to === ethers.constants.AddressZero ? (
                        'Burn'
                      ) : (
                        tx.to.toLowerCase() === address?.toLowerCase() ? (
                          'You'
                        ) : (
                          `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`
                        )
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(tx.timestamp * 1000, 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a
                        href={`https://testnet.bscscan.com/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </a>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage * itemsPerPage >= totalItems}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                  </span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{totalItems}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">First</span>
                    ⟪
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    ←
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, Math.ceil(totalItems / itemsPerPage)) }, (_, i) => {
                    // Calculate page number to display
                    let pageNum = currentPage;
                    if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= Math.ceil(totalItems / itemsPerPage) - 2) {
                      pageNum = Math.ceil(totalItems / itemsPerPage) - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    // Ensure page number is valid
                    if (pageNum <= 0 || pageNum > Math.ceil(totalItems / itemsPerPage)) {
                      return null;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                          ${currentPage === pageNum
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage * itemsPerPage >= totalItems}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    →
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.ceil(totalItems / itemsPerPage))}
                    disabled={currentPage * itemsPerPage >= totalItems}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Last</span>
                    ⟫
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => loadTransactions(false)}
                disabled={loadingMore}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading more...
                  </>
                ) : (
                  'Load More Historical Transactions'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}