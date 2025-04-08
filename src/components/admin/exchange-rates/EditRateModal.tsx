import { motion } from 'framer-motion';
import RateForm from './RateForm';
import { ExchangeRate } from '../../../services/exchangeRates';

interface EditRateModalProps {
  rate: ExchangeRate;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<ExchangeRate>) => Promise<void>;
  loading: boolean;
}

export default function EditRateModal({ rate, onClose, onSubmit, loading }: EditRateModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Exchange Rate</h3>
        <RateForm
          initialData={rate}
          onSubmit={(data) => onSubmit(rate.id, data)}
          onCancel={onClose}
          loading={loading}
          isEdit
        />
      </motion.div>
    </div>
  );
}