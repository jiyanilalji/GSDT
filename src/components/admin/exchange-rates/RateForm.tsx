import { useState } from 'react';
import { ExchangeRate } from '../../../services/exchangeRates';

interface RateFormProps {
  initialData?: ExchangeRate;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  isEdit?: boolean;
}

export default function RateForm({ initialData, onSubmit, onCancel, loading, isEdit }: RateFormProps) {
  const [formData, setFormData] = useState({
    currency_from: initialData?.currency_from || '',
    currency_to: initialData?.currency_to || '',
    rate: initialData?.rate.toString() || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      rate: parseFloat(formData.rate)
    });
  };

  const inputClasses = "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 h-12 px-4 text-gray-900 bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isEdit && (
        <>
          <div>
            <label htmlFor="currency_from" className="block text-sm font-medium text-gray-700 mb-2">
              From Currency
            </label>
            <input
              type="text"
              id="currency_from"
              value={formData.currency_from}
              onChange={(e) => setFormData({ ...formData, currency_from: e.target.value.toUpperCase() })}
              className={inputClasses}
              placeholder="e.g., USD"
              required
            />
          </div>

          <div>
            <label htmlFor="currency_to" className="block text-sm font-medium text-gray-700 mb-2">
              To Currency
            </label>
            <input
              type="text"
              id="currency_to"
              value={formData.currency_to}
              onChange={(e) => setFormData({ ...formData, currency_to: e.target.value.toUpperCase() })}
              className={inputClasses}
              placeholder="e.g., EUR"
              required
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-2">
          Exchange Rate
        </label>
        <input
          type="number"
          id="rate"
          step="0.000001"
          value={formData.rate}
          onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
          className={inputClasses}
          placeholder="0.000000"
          required
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-3 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Rate' : 'Add Rate'}
        </button>
      </div>
    </form>
  );
}