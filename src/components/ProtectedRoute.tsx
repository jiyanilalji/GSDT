import { Navigate, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useAdmin } from '../hooks/useAdmin';
import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { isConnected, loading: walletLoading } = useWallet();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait until all auth checks are complete
    if (!walletLoading && (!requireAdmin || !adminLoading)) {
      setIsChecking(false);
    }
  }, [walletLoading, adminLoading, requireAdmin]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isConnected) {
    // Redirect to home if not connected
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Redirect to admin login if admin access is required but user is not admin
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}