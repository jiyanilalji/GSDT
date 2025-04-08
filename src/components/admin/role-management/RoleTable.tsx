import { motion } from 'framer-motion';
import { AdminRole, AdminUser } from '../../../services/admin';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getRoleIcon, getRoleBadgeClass } from './RoleCard';

interface RoleTableProps {
  adminUsers: AdminUser[];
  currentUserAddress?: string;
  onEdit: (user: AdminUser) => void;
  onRemove: (user: AdminUser) => void;
}

export default function RoleTable({ adminUsers, currentUserAddress, onEdit, onRemove }: RoleTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {adminUsers.map((user) => (
            <motion.tr
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.user_address.slice(0, 6)}...{user.user_address.slice(-4)}
                {user.user_address.toLowerCase() === currentUserAddress?.toLowerCase() && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    You
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getRoleIcon(user.role)}
                  <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex justify-center space-x-3">
                  {user.user_address.toLowerCase() !== currentUserAddress?.toLowerCase() && (
                    <>
                      <button
                        onClick={() => onEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        title="Edit Role"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onRemove(user)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                        title="Remove Role"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </>
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