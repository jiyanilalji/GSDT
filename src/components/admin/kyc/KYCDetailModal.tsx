import { motion } from 'framer-motion';
import { KYCRequest, KYCStatus } from '../../../services/kyc';
import { format } from 'date-fns';
import { EyeIcon } from '@heroicons/react/24/outline';

interface Props {
  request: KYCRequest;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  actionLoading: boolean;
  isSuperAdmin: boolean;
}

export default function KYCDetailModal({
  request,
  onClose,
  onApprove,
  onReject,
  actionLoading,
  isSuperAdmin
}: Props) {
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

  return (
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">User Information</h4>
            <div className="mt-2 bg-gray-50 p-4 rounded-lg text-black">
              <p className="text-sm"><span className="font-medium">Name:</span> {request.first_name} {request.last_name}</p>
              <p className="text-sm mt-2"><span className="font-medium">Address:</span> {request.user_address}</p>
              <p className="text-sm mt-2"><span className="font-medium">Nationality:</span> {request.nationality}</p>
              <p className="text-sm mt-2"><span className="font-medium">Date of Birth:</span> {request.date_of_birth}</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Verification Details</h4>
            <div className="mt-2 bg-gray-50 p-4 rounded-lg text-black">
              <p className="text-sm"><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}>
                  {request.status}
                </span>
              </p>
              <p className="text-sm mt-2"><span className="font-medium">Document Type:</span> {request.document_type}</p>
              <p className="text-sm mt-2"><span className="font-medium">Submitted:</span> {format(new Date(request.submitted_at), 'MMM d, yyyy HH:mm')}</p>
              <p className="text-sm mt-2"><span className="font-medium">Method:</span> {request.verification_method === 'sumsub' ? 'Automated (Sumsub)' : 'Manual'}</p>
              
              {request.reviewed_at && (
                <p className="text-sm mt-2"><span className="font-medium">Reviewed:</span> {format(new Date(request.reviewed_at), 'MMM d, yyyy HH:mm')}</p>
              )}
              
              {request.rejection_reason && (
                <p className="text-sm mt-2"><span className="font-medium">Rejection Reason:</span> {request.rejection_reason}</p>
              )}
            </div>
          </div>
        </div>
        
        {request.document_url && request.verification_method !== 'sumsub' && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Document</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <a 
                href={request.document_url} 
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
        
        {request.verification_method === 'sumsub' && request.sumsub_data && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Sumsub Verification Data</h4>
            <div className="bg-gray-50 p-4 rounded-lg text-black">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(request.sumsub_data, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
          
          {request.status === KYCStatus.PENDING && isSuperAdmin && (
            <>
              <button
                onClick={onApprove}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={onReject}
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
  );
}