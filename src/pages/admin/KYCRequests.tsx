import { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';
import { KYCStatus, fetchKYCRequests, KYCRequest, approveKYCRequest, rejectKYCRequest, getKYCStats } from '../../services/kyc';
import AdminLayout from './layout/AdminLayout';
import KYCStatsDisplay from '../../components/admin/kyc/KYCStats';
import KYCFilters from '../../components/admin/kyc/KYCFilters';
import KYCRequestTable from '../../components/admin/kyc/KYCRequestTable';
import KYCDetailModal from '../../components/admin/kyc/KYCDetailModal';

export default function KYCRequests() {
  const { isConnected } = useWallet();
  const { isAdmin, isSuperAdmin } = useAdmin();
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [kycStats, setKycStats] = useState({
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
        
        // Load KYC requests and stats
        const [allKycData, stats] = await Promise.all([
          fetchKYCRequests(),
          getKYCStats()
        ]);
        
        // Apply filters
        let filteredData = [...allKycData];
        if (filterStatus !== 'ALL') {
          filteredData = filteredData.filter(req => req.status === filterStatus);
        }
        if (filterMethod !== 'ALL') {
          filteredData = filteredData.filter(req => req.verification_method === filterMethod);
        }
        
        setKycRequests(filteredData);
        setKycStats(stats);
      } catch (error: any) {
        console.error('Error loading KYC data:', error);
        setError(error.message || 'Error loading KYC data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filterStatus, filterMethod]);

  const handleApprove = async (request: KYCRequest) => {
    if (!isSuperAdmin) {
      setError('Only Super Admins can approve KYC requests');
      return;
    }
    
    try {
      setActionLoading(true);
      await approveKYCRequest(request.id, request.user_address);
      
      // Update UI
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
      //setError(error.message || 'Error approving request');

      if (error.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected by user.');
      } else {
        setError('Error approving kyc request. Please try again.');
      }
      
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (request: KYCRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(false);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest || !rejectReason) return;
    
    try {
      setActionLoading(true);
      await rejectKYCRequest(selectedRequest.id, selectedRequest.user_address, rejectReason);
      
      // Update UI
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
      //setError(error.message || 'Error rejecting request');

      if (error.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected by user.');
      } else {
        setError('Error rejecting kyc request. Please try again.');
      }
      
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout activeTab="kyc">
      <KYCStatsDisplay stats={kycStats} />
      
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

          <KYCFilters
            filterStatus={filterStatus}
            filterMethod={filterMethod}
            onStatusChange={setFilterStatus}
            onMethodChange={setFilterMethod}
          />

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg word-break">
              {error}
            </div>
          )}

          <KYCRequestTable
            requests={kycRequests}
            loading={loading}
            actionLoading={actionLoading}
            onViewDetails={(request) => {
              setSelectedRequest(request);
              setShowDetailModal(true);
            }}
            onApprove={handleApprove}
            onReject={handleReject}
            isSuperAdmin={isSuperAdmin}
          />
        </div>
      </div>

      {showDetailModal && selectedRequest && (
        <KYCDetailModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
          }}
          onApprove={() => {
            setShowDetailModal(false);
            handleApprove(selectedRequest);
          }}
          onReject={() => {
            setShowDetailModal(false);
            handleReject(selectedRequest);
          }}
          actionLoading={actionLoading}
          isSuperAdmin={isSuperAdmin}
        />
      )}
    </AdminLayout>
  );
}