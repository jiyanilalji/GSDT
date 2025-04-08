import { ReactNode, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '../../../hooks/useWallet';
import { useAdmin } from '../../../hooks/useAdmin';
import { AdminRole } from '../../../services/admin';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: 'kyc' | 'contacts' | 'roles' | 'fiat' | 'reserves' | 'rates';
}

export default function AdminLayout({ children, activeTab }: AdminLayoutProps) {
  const { isConnected } = useWallet();
  const { isAdmin, adminRole, isSuperAdmin } = useAdmin();
  const navigate = useNavigate();

  // Check if we're admin from localStorage as a fallback
  const isAdminAuth = localStorage.getItem('adminAuth') === 'true';
  const storedRole = localStorage.getItem('adminRole');
  
  // Redirect if not admin
  useEffect(() => {
    if (!isConnected) {
      navigate('/', { replace: true });
      return;
    }
    
    if (!isAdmin && !isAdminAuth) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAdmin, isAdminAuth, isConnected, navigate]);

  // If we're not admin and not in localStorage, show loading until redirect happens
  if (!isAdmin && !isAdminAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Use stored role if adminRole is not available yet
  const displayRole = adminRole || (storedRole as AdminRole | null);
  const isSuperAdminUser = isSuperAdmin || displayRole === AdminRole.SUPER_ADMIN;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            {displayRole === AdminRole.SUPER_ADMIN && "Super Admin Dashboard - Full Access"}
            {displayRole === AdminRole.ADMIN && "Admin Dashboard - Manage Content and Users"}
            {displayRole === AdminRole.MODERATOR && "Moderator Dashboard - Content Management"}
            {displayRole === AdminRole.MINTER && "Minter Dashboard - Token Minting Access"}
            {displayRole === AdminRole.BURNER && "Burner Dashboard - Token Burning Access"}
            {displayRole === AdminRole.PAUSER && "Pauser Dashboard - Contract Pause Access"}
            {displayRole === AdminRole.PRICE_UPDATER && "Price Updater Dashboard - Token Price Management"}
          </p>
        </div>

        {/* Admin Navigation */}
        <div className="mb-8 bg-white shadow rounded-lg p-4">
          <nav className="flex flex-wrap gap-4">
            <Link 
              to="/admin/kyc-requests"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'kyc' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              KYC Requests
            </Link>
            <Link 
              to="/admin/contact-messages"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'contacts' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Contact Messages
            </Link>
            {isSuperAdminUser && (
              <>
                <Link 
                  to="/admin/role-management"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'roles' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Role Management
                </Link>
                <Link 
                  to="/admin/fiat-requests"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'fiat' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Fiat Mint Requests
                </Link>
                <Link 
                  to="/admin/reserves"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'reserves' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Proof of Reserves
                </Link>
                <Link 
                  to="/admin/exchange-rates"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'rates' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Exchange Rates
                </Link>

                <Link
                  to="/admin/cms"
                  className={`block px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'cms'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  CMS Pages
                </Link>
              </>
            )}
          </nav>
        </div>

        {children}
      </div>
    </div>
  );
}