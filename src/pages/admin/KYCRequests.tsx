import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';
import { KYCStatus, fetchKYCRequests, KYCRequest, approveKYCRequest, rejectKYCRequest, getKYCStats, KYCStats } from '../../services/kyc';
import { format } from 'date-fns';
import { TrashIcon, EyeIcon, FilterIcon } from '@heroicons/react/24/outline';
import AdminLayout from './layout/AdminLayout';

export default function KYCRequests() {
  const { address, isConnected } = useWallet();
  const { isAdmin, adminRole, isSuperAdmin } = useAdmin();
  const navigate = useNavigate();
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [kycStats, setKycStats] = useState<KYCStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<KYCStatus | 'ALL'>('ALL');
  const [filterMethod, setFilterMethod] = useState<'manual' | 'sumsub' | 'ALL'>('ALL');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load KYC requests
        try {
          // Fetch all KYC requests first
          const allKycData = await fetchKYCRequests();
          
          // Filter based on selected filters
          let filteredData = [...allKycData];
          
          // Filter by status if not ALL
          if (filterStatus !== 'ALL') {
            filteredData = filteredData.filter(req => req.status === filterStatus);
          }
          
          // Filter by verification method if not ALL
          if (filterMethod !== 'ALL') {
            filteredData = filteredData.filter(req => req.verification_method === filterMethod);
          }
          
          setKycRequests(filteredData);
          
          // Get KYC stats
          const stats = await getKYCStats();
          setKycStats(stats);
        } catch (err) {
          console.error('Error loading KYC data:', err);
        }
      } catch (error: any) {
        console.error('Error loading admin data:', error);
        //setError(err.message || 'Error loading admin data');

        if (error.message?.includes('missing role')) {
          setError('You do not have permission to mint tokens. Only users with MINTER_ROLE can mint.');
        } else if (error.message?.includes('execution reverted')) {
          const revertReason = error.data?.message || error.message;
          if (revertReason.includes('KYC')) {
            setError('KYC verification required before minting tokens.');
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
        setLoading(false);
      }
    };

    loadData();
  }, [filterStatus, filterMethod]);

  const handleApprove = async (request: KYCRequest) => {
    // Only super admins can approve KYC requests
    if (!isSuperAdmin) {
      setError('Only Super Admins can approve KYC requests');
      return;
    }
    
    try {
      setActionLoading(true);
      await approveKYCRequest(request.id, request.user_address);
      
      // Update UI optimistically
      setKycRequests(prev => 
        prev.map(r => 
          r.id === request.id 
            ? {...r, status: KYCStatus.APPROVED} 
            : r
        )
      );
      
      setKycStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1
      }));
    } catch (error: any) {
      console.error('Error approving request:', error);
      //setError(err.message || 'Error approving request');

      if (error.message?.includes('missing role')) {
        setError('You do not have permission to mint tokens. Only users with MINTER_ROLE can mint.');
      } else if (error.message?.includes('execution reverted')) {
        const revertReason = error.data?.message || error.message;
        if (revertReason.includes('KYC')) {
          setError('KYC verification required before minting tokens.');
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
    // Only super admins can reject KYC requests
    if (!isSuperAdmin) {
      setError('Only Super Admins can reject KYC requests');
      return;
    }
    
    if (!selectedRequest || !rejectReason) return;

    try {
      setActionLoading(true);
      await rejectKYCRequest(selectedRequest.id, selectedRequest.user_address, rejectReason);
      
      // Update UI optimistically
      setKycRequests(prev => 
        prev.map(r => 
          r.id === selectedRequest.id 
            ? {...r, status: KYCStatus.REJECTED} 
            : r
        )
      );
      
      setKycStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1
      }));
      
      setSelectedRequest(null);
      setRejectReason('');
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      //setError(err.message || 'Error rejecting request');

      if (error.message?.includes('missing role')) {
        setError('You do not have permission to mint tokens. Only users with MINTER_ROLE can mint.');
      } else if (error.message?.includes('execution reverted')) {
        const revertReason = error.data?.message || error.message;
        if (revertReason.includes('KYC')) {
          setError('KYC verification required before minting tokens.');
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case KYCStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case KYCStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case KYCStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (request: KYCRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  return (
    <AdminLayout activeTab="kyc">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { name: 'Total KYC Requests', value: kycStats.total },
          { name: 'Pending Requests', value: kycStats.pending },
          { name: 'Approved Requests', value: kycStats.approved },
          { name: 'Rejected Requests', value: kycStats.rejected }
        ].map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white overflow-hidden shadow rounded-lg p-5"
          >
            <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
          </motion.div>
        ))}
      </div>

      {/* Add this section after the stats section and before the KYC Requests Table */}
      {/*
      <div className="mt-4 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as KYCStatus | 'ALL')}
              className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            >
              <option value="ALL">All Statuses</option>
              <option value={KYCStatus.PENDING}>Pending</option>
              <option value={KYCStatus.APPROVED}>Approved</option>
              <option value={KYCStatus.REJECTED}>Rejected</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="method-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Method
            </label>
            <select
              id="method-filter"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as 'manual' | 'sumsub' | 'ALL')}
              className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            >
              <option value="ALL">All Methods</option>
              <option value="manual">Manual</option>
              <option value="sumsub">Automated (SumSub)</option>
            </select>
          </div>
        </div>
      </div>
      */}
      {/* KYC Requests Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h3 className="text-lg font-medium leading-6 text-gray-900">KYC Requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                Review and manage user KYC verification requests
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
                onChange={(e) => setFilterStatus(e.target.value as KYCStatus | 'ALL')}
                className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
              >
                <option value="ALL">All Statuses</option>
                <option value={KYCStatus.PENDING}>Pending</option>
                <option value={KYCStatus.APPROVED}>Approved</option>
                <option value={KYCStatus.REJECTED}>Rejected</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="method-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Method
              </label>
              <select
                id="method-filter"
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value as 'manual' | 'sumsub' | 'ALL')}
                className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
              >
                <option value="ALL">All Methods</option>
                <option value="manual">Manual</option>
                <option value="sumsub">Automated (SumSub)</option>
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
              <p className="mt-4 text-gray-500">Loading KYC requests...</p>
            </div>
          ) : kycRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No KYC requests found</p>
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
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verification
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kycRequests.map((request) => (
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
                        {request.first_name} {request.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.document_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(request.submitted_at), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.verification_method === 'sumsub' ? (
                          <span className="text-blue-600">Automated (Sumsub)</span>
                        ) : (
                          <span>Manual</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          
                          {request.status === KYCStatus.PENDING && isSuperAdmin && (
                            <>
                              <button
                                onClick={() => handleApprove(request)}
                                disabled={actionLoading}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setSelectedRequest(request)}
                                disabled={actionLoading}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {request.status === KYCStatus.PENDING && !isSuperAdmin && (
                            <span className="text-gray-400">Awaiting Super Admin</span>
                          )}
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

      {/* KYC Reject Modal */}
      {selectedRequest && !showDetailModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <TrashIcon className="h-6 w-6 text-red-600 mr-2" />
              Reject KYC Request
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold leading-6 text-gray-900">
                Reason for Rejection
              </label>
              <div className="mt-2.5">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Reject Request
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* KYC Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <EyeIcon className="h-6 w-6 text-indigo-600 mr-2" />
              KYC Request Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-black">
              <div>
                <h4 className="text-sm font-medium text-gray-500">User Information</h4>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm"><span className="font-medium">Name:</span> {selectedRequest.first_name} {selectedRequest.last_name}</p>
                  <p className="text-sm mt-2"><span className="font-medium">Address:</span> {selectedRequest.user_address}</p>
                  <p className="text-sm mt-2"><span className="font-medium">Nationality:</span> {selectedRequest.nationality}</p>
                  <p className="text-sm mt-2"><span className="font-medium">Date of Birth:</span> {selectedRequest.date_of_birth}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Verification Details</h4>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm"><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </p>
                  <p className="text-sm mt-2"><span className="font-medium">Document Type:</span> {selectedRequest.document_type}</p>
                  <p className="text-sm mt-2"><span className="font-medium">Submitted:</span> {format(new Date(selectedRequest.submitted_at), 'MMM d, yyyy HH:mm')}</p>
                  <p className="text-sm mt-2"><span className="font-medium">Method:</span> {selectedRequest.verification_method === 'sumsub' ? 'Automated (Sumsub)' : 'Manual'}</p>
                  
                  {selectedRequest.reviewed_at && (
                    <p className="text-sm mt-2"><span className="font-medium">Reviewed:</span> {format(new Date(selectedRequest.reviewed_at), 'MMM d, yyyy HH:mm')}</p>
                  )}
                  
                  {selectedRequest.rejection_reason && (
                    <p className="text-sm mt-2"><span className="font-medium">Rejection Reason:</span> {selectedRequest.rejection_reason}</p>
                  )}
                </div>
              </div>
            </div>
            
            {selectedRequest.document_url && selectedRequest.verification_method !== 'sumsub' && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Document</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <a 
                    href={selectedRequest.document_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-800 flex items-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Document
                  </a>
                </div>
              </div>
            )}
            
            {selectedRequest.verification_method === 'sumsub' && selectedRequest.sumsub_data && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Sumsub Verification Data</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(selectedRequest.sumsub_data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Close
              </button>
              
              {selectedRequest.status === KYCStatus.PENDING && isSuperAdmin && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleApprove(selectedRequest);
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedRequest(selectedRequest);
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}