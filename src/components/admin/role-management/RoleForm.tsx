import { AdminRole } from '../../../services/admin';

interface RoleFormProps {
  formData: {
    userAddress: string;
    role: string;
  };
  formErrors: {
    userAddress: string;
    role: string;
  };
  onFormChange: (field: string, value: string) => void;
  isEdit?: boolean;
}

export default function RoleForm({ formData, formErrors, onFormChange, isEdit }: RoleFormProps) {
  return (
    <div className="space-y-4">
      {!isEdit && (
        <div>
          <label htmlFor="userAddress" className="block text-sm font-semibold leading-6 text-gray-900">
            Ethereum Address <span className="text-red-500">*</span>
          </label>
          <div className="mt-2.5">
            <input
              type="text"
              id="userAddress"
              value={formData.userAddress}
              onChange={(e) => onFormChange('userAddress', e.target.value)}
              className={`block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ${
                formErrors.userAddress ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-primary-500'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
              placeholder="0x..."
            />
            {formErrors.userAddress && (
              <p className="mt-1 text-sm text-red-600">{formErrors.userAddress}</p>
            )}
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="role" className="block text-sm font-semibold leading-6 text-gray-900">
          Role <span className="text-red-500">*</span>
        </label>
        <div className="mt-2.5 relative">
          <select
            id="role"
            value={formData.role}
            onChange={(e) => onFormChange('role', e.target.value)}
            className={`block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ${
              formErrors.role ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-primary-500'
            } focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
          >
            <option value="">Select Role</option>
            {Object.values(AdminRole).map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          {formErrors.role && (
            <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
          )}
        </div>
      </div>
    </div>
  );
}