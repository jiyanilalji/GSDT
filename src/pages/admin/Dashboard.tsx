import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';
import AdminLayout from './layout/AdminLayout';
import AdminStats from '../../components/admin/AdminStats';

export default function AdminDashboard() {
  const { isConnected } = useWallet();
  const { isAdmin } = useAdmin();
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/admin/kyc-requests" className="text-primary-600 hover:text-primary-800">
                  Manage KYC Requests
                </a>
              </li>
              <li>
                <a href="/admin/contact-messages" className="text-primary-600 hover:text-primary-800">
                  View Contact Messages
                </a>
              </li>
              <li>
                <a href="/admin/role-management" className="text-primary-600 hover:text-primary-800">
                  Manage Admin Roles
                </a>
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">System Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">KYC System:</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Smart Contract:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Database:</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}