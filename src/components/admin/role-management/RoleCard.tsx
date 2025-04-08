import { motion } from 'framer-motion';
import { AdminRole } from '../../../services/admin';
import { 
  ShieldCheckIcon, 
  BanknotesIcon, 
  KeyIcon, 
  PauseCircleIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

interface RoleCardProps {
  role: AdminRole;
}

export const getRoleIcon = (role: AdminRole) => {
  switch (role) {
    case AdminRole.SUPER_ADMIN:
      return <ShieldCheckIcon className="h-5 w-5 text-purple-600" />;
    case AdminRole.MINTER:
      return <BanknotesIcon className="h-5 w-5 text-green-600" />;
    case AdminRole.BURNER:
      return <KeyIcon className="h-5 w-5 text-red-600" />;
    case AdminRole.PAUSER:
      return <PauseCircleIcon className="h-5 w-5 text-yellow-600" />;
    case AdminRole.PRICE_UPDATER:
      return <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />;
    default:
      return <ShieldCheckIcon className="h-5 w-5 text-gray-600" />;
  }
};

export const getRoleBadgeClass = (role: AdminRole) => {
  switch (role) {
    case AdminRole.SUPER_ADMIN:
      return 'bg-purple-100 text-purple-800';
    case AdminRole.MINTER:
      return 'bg-green-100 text-green-800';
    case AdminRole.BURNER:
      return 'bg-red-100 text-red-800';
    case AdminRole.PAUSER:
      return 'bg-yellow-100 text-yellow-800';
    case AdminRole.PRICE_UPDATER:
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getRoleDescription = (role: AdminRole) => {
  switch (role) {
    case AdminRole.SUPER_ADMIN:
      return 'Full admin access to all functions';
    case AdminRole.MINTER:
      return 'Can mint new tokens';
    case AdminRole.BURNER:
      return 'Can burn tokens and process redemptions';
    case AdminRole.PAUSER:
      return 'Can pause/unpause contract operations';
    case AdminRole.PRICE_UPDATER:
      return 'Can update token price';
    default:
      return '';
  }
};

export default function RoleCard({ role }: RoleCardProps) {
  return (
    <div className="flex items-start space-x-2">
      {getRoleIcon(role)}
      <div>
        <span className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${getRoleBadgeClass(role)}`}>
          {role}
        </span>
        <p className="text-xs text-gray-600 mt-1">{getRoleDescription(role)}</p>
      </div>
    </div>
  );
}