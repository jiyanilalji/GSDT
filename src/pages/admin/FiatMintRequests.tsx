import { BigNumber } from 'ethers';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';
import { useGSDTContract } from '../../hooks/useContract';

import { 
  FiatMintRequest, 
  FiatMintStatus, 
  getFiatMintRequests,
  approveFiatMintRequest,
  rejectFiatMintRequest 
} from '../../services/fiatMinting';
import { format } from 'date-fns';
import { 
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import AdminLayout from './layout/AdminLayout';

export default function FiatMintRequests() {
  const { address, isConnected } = useWallet();
  const contract = useGSDTContract();
  const { isSuperAdmin } = useAdmin();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FiatMintRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<FiatMintRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FiatMintStatus | 'ALL'>('ALL');
  const [minMintAmount, setMinMintAmount] = useState<string>('100'); // Default min amount

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getFiatMintRequests(filterStatus === 'ALL' ? undefined : filterStatus);
        setRequests(data);
      } catch (err: any) {
        console.error('Error loading fiat mint requests:', err);
        setError(err.message || 'Error loading requests');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [filterStatus]);

  const handleApprove = async () => {
    if (!selectedRequest || !address) return;

    try {
      setActionLoading(true);

      const minMintAmt = await contract.MIN_MINT_AMOUNT();
      const decimals = await contract.decimals();
      const minMintAmnt = await minMintAmt.div(BigNumber.from(10).pow(decimals));  // Dividing by 10^18 for ERC20 tokens
      await setMinMintAmount(minMintAmnt.toNumber());

      await approveFiatMintRequest(selectedRequest.id, address, adminNotes);
      
      // Update the local state
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: FiatMintStatus.APPROVED, admin_notes: adminNotes, processed_by: address }
          : req
      ));
      
      setShowApproveModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error: any) {
      console.error('Error approving request:', error);
      //setError(err.message || 'Error approving request');

      if (error.message?.includes('missing role')) {
        setError('You do not have permission to mint tokens. Only users with MINTER_ROLE can mint.');
      } else if (error.message?.includes('execution reverted')) {
        const revertReason = error.data?.message || error.message;
        if (revertReason.includes('KYC')) {
          setError('KYC verification required before minting tokens.');
        } else if (revertReason.includes('amount below minimum')) {
          setError(`Amount must be at least ${minMintAmount} GSDT.`);
        } else if (revertReason.includes('amount above maximum')) {
          setError('Amount exceeds maximum minting limit.');
        } else if (revertReason.includes('daily mint limit')) {
          setError('Daily minting limit exceeded. Please try again tomorrow.');
        } else {
          setError(revertReason || 'Transaction failed. Please try again.');
        }
      } else if (error.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected by user.');
      } else {
        setError('Error minting tokens. Please try again.');
      }
      
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !address || !adminNotes) return;

    try {
      setActionLoading(true);
      await rejectFiatMintRequest(selectedRequest.id, address, adminNotes);
      
      // Update the local state
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: FiatMintStatus.REJECTED, admin_notes: adminNotes, processed_by: address }
          : req
      ));
      
      setShowRejectModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      setError(err.message || 'Error rejecting request');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status: FiatMintStatus) => {
    switch (status) {
      case FiatMintStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case FiatMintStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case FiatMintStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isSuperAdmin) {
    return (
      <AdminLayout activeTab="fiat">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              Only Super Admins can manage fiat mint requests.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="fiat">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Fiat Mint Requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                Review and process fiat payment requests for token minting
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FiatMintStatus | 'ALL')}
                className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
              >
                <option value="ALL">All Statuses</option>
                <option value={FiatMintStatus.PENDING}>Pending</option>
                <option value={FiatMintStatus.APPROVED}>Approved</option>
                <option value={FiatMintStatus.REJECTED}>Rejected</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg word-break">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No fiat mint requests found</p>
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Currency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.user_address.slice(0, 6)}...{request.user_address.slice(-4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.payment_reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(request.created_at), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-center space-x-3">
                          {request.payment_proof_url && (
                            <a
                              href={request.payment_proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-900"
                              title="View Payment Proof"
                            >
                              <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                            </a>
                          )}
                          
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowApproveModal(true);
                            }}
                            disabled={request.status !== FiatMintStatus.PENDING || actionLoading}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve Request"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectModal(true);
                            }}
                            disabled={request.status !== FiatMintStatus.PENDING || actionLoading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reject Request"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
              Approve Mint Request
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold leading-6 text-gray-900">
                Admin Notes (Optional)
              </label>
              <div className="mt-2.5">
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                  rows={3}
                  placeholder="Add any notes about this approval..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedRequest(null);
                  setAdminNotes('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Approve & Mint
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <XCircleIcon className="h-6 w-6 text-red-600 mr-2" />
              Reject Mint Request
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold leading-6 text-gray-900">
                Reason for Rejection
              </label>
              <div className="mt-2.5">
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setAdminNotes('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !adminNotes}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    Reject Request
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}