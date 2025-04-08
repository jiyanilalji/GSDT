import { KYCStatus } from '../../../services/kyc';

interface Props {
  filterStatus: KYCStatus | 'ALL';
  filterMethod: 'manual' | 'sumsub' | 'ALL';
  onStatusChange: (status: KYCStatus | 'ALL') => void;
  onMethodChange: (method: 'manual' | 'sumsub' | 'ALL') => void;
}

export default function KYCFilters({
  filterStatus,
  filterMethod,
  onStatusChange,
  onMethodChange
}: Props) {
  return (
    <div className="mt-4 flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg">
      <div>
        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status-filter"
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value as KYCStatus | 'ALL')}
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
          onChange={(e) => onMethodChange(e.target.value as 'manual' | 'sumsub' | 'ALL')}
          className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
        >
          <option value="ALL">All Methods</option>
          <option value="manual">Manual</option>
          <option value="sumsub">Automated (SumSub)</option>
        </select>
      </div>
    </div>
  );
}