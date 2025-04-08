import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';
import AdminLayout from './layout/AdminLayout';
import AdminStats from '../../components/admin/AdminStats';
import { 
  UserGroupIcon, 
  ChatBubbleLeftIcon, 
  ShieldCheckIcon, 
  BanknotesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { isConnected } = useWallet();
  const { isAdmin, isSuperAdmin } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin auth is in localStorage
    const isAdminAuth = localStorage.getItem('adminAuth') === 'true';
    
    // If we're not admin and not in localStorage, redirect to login
    if (!isAdminAuth && !isAdmin) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAdmin, isConnected, navigate]);

  return (
    <AdminLayout activeTab="kyc">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Dashboard Overview</h2>
          <p className="text-gray-600">
            Welcome to the GSDT Admin Dashboard. Here you can manage KYC requests, contact messages, and admin roles.
          </p>
        </div>
        
        <AdminStats />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/kyc-requests" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">KYC Requests</h3>
                <p className="text-sm text-gray-500">Manage user verification requests</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/contact-messages" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Contact Messages</h3>
                <p className="text-sm text-gray-500">View and respond to user inquiries</p>
              </div>
            </div>
          </Link>

          {isSuperAdmin && (
            <>
              <Link to="/admin/role-management" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Role Management</h3>
                    <p className="text-sm text-gray-500">Manage admin roles and permissions</p>
                  </div>
                </div>
              </Link>

              <Link to="/admin/fiat-requests" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BanknotesIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Fiat Mint Requests</h3>
                    <p className="text-sm text-gray-500">Process fiat payment requests</p>
                  </div>
                </div>
              </Link>

              <Link to="/admin/reserves" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Proof of Reserves</h3>
                    <p className="text-sm text-gray-500">Manage and update reserve assets</p>
                  </div>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}