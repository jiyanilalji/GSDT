import { motion } from 'framer-motion';
import { KYCRequest, KYCStatus } from '../../../services/kyc';
import { format } from 'date-fns';
import { EyeIcon } from '@heroicons/react/24/outline';

interface Props {
  requests: KYCRequest[];
  loading: boolean;
  actionLoading: boolean;
  onViewDetails: (request: KYCRequest) => void;
  onApprove: (request: KYCRequest) => void;
  onReject: (request: KYCRequest) => void;
  isSuperAdmin: boolean;
}

export default function KYCRequestTable({
  requests,
  loading,
  actionLoading,
  onViewDetails,
  onApprove,
  onReject,
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading KYC requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No KYC requests found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
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
                    onClick={() => onViewDetails(request)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  
                  {request.status === KYCStatus.PENDING && isSuperAdmin && (
                    <>
                      <button
                        onClick={() => onApprove(request)}
                        disabled={actionLoading}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(request)}
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
  );
}