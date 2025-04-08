import { useState } from 'react';
import { ReserveAsset } from '../../../services/reserves';

interface ReserveFormProps {
  initialData?: Partial<ReserveAsset>;
  onSubmit: (data: Omit<ReserveAsset, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export default function ReserveForm({ initialData, onSubmit, onCancel, isLoading }: ReserveFormProps) {
  const [formData, setFormData] = useState({
    symbol: initialData?.symbol || '',
    name: initialData?.name || '',
    amount: initialData?.amount || '',
    value_usd: initialData?.value_usd || '',
    custodian: initialData?.custodian || '',
    audit_url: initialData?.audit_url || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.symbol) newErrors.symbol = 'Symbol is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.amount) newErrors.amount = 'Amount is required';
    if (!formData.value_usd) newErrors.value_usd = 'USD value is required';
    if (!formData.custodian) newErrors.custodian = 'Custodian is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    await onSubmit({
      ...formData,
      last_updated: new Date().toISOString()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="symbol" className="block text-sm font-semibold leading-6 text-gray-900">
            Symbol <span className="text-red-500">*</span>
          </label>
          <div className="mt-2.5">
            <input
              type="text"
              id="symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
              placeholder="e.g., USDC"
            />
            {errors.symbol && <p className="mt-1 text-sm text-red-600">{errors.symbol}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-semibold leading-6 text-gray-900">
            Name <span className="text-red-500">*</span>
          </label>
          <div className="mt-2.5">
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
              placeholder="e.g., USD Coin"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-semibold leading-6 text-gray-900">
            Amount <span className="text-red-500">*</span>
          </label>
          <div className="mt-2.5">
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
              placeholder="e.g., 1000000"
              step="any"
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="value_usd" className="block text-sm font-semibold leading-6 text-gray-900">
            USD Value <span className="text-red-500">*</span>
          </label>
          <div className="mt-2.5">
            <input
              type="number"
              id="value_usd"
              value={formData.value_usd}
              onChange={(e) => setFormData({ ...formData, value_usd: e.target.value })}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
              placeholder="e.g., 1000000"
              step="any"
            />
            {errors.value_usd && <p className="mt-1 text-sm text-red-600">{errors.value_usd}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="custodian" className="block text-sm font-semibold leading-6 text-gray-900">
            Custodian <span className="text-red-500">*</span>
          </label>
          <div className="mt-2.5">
            <input
              type="text"
              id="custodian"
              value={formData.custodian}
              onChange={(e) => setFormData({ ...formData, custodian: e.target.value })}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
              placeholder="e.g., Fireblocks"
            />
            {errors.custodian && <p className="mt-1 text-sm text-red-600">{errors.custodian}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="audit_url" className="block text-sm font-semibold leading-6 text-gray-900">
            Audit URL
          </label>
          <div className="mt-2.5">
            <input
              type="url"
              id="audit_url"
              value={formData.audit_url}
              onChange={(e) => setFormData({ ...formData, audit_url: e.target.value })}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
              placeholder="https://example.com/audit-report.pdf"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </form>
  );
}