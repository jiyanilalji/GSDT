import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { AdminRole, getUserRole } from '../services/admin';
import { checkSupabaseConnection } from '../lib/supabase';

export const useAdmin = () => {
  const { address, isConnected } = useWallet();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add role-specific states
  const [isMinter, setIsMinter] = useState(false);
  const [isBurner, setIsBurner] = useState(false);
  const [isPauser, setIsPauser] = useState(false);
  const [isPriceUpdater, setIsPriceUpdater] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isRegularAdmin, setIsRegularAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    const checkRoles = async () => {
      if (!isConnected || !address) {
        setIsAdmin(false);
        setAdminRole(null);
        setIsMinter(false);
        setIsBurner(false);
        setIsPauser(false);
        setIsPriceUpdater(false);
        setIsSuperAdmin(false);
        setIsRegularAdmin(false);
        setIsModerator(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check if admin auth is in localStorage
        const isAdminAuth = localStorage.getItem('adminAuth') === 'true';
        const storedRole = localStorage.getItem('adminRole') as AdminRole | null;
        const storedAddress = localStorage.getItem('adminAddress');
        
        // If we have admin auth in localStorage and the address matches
        if (isAdminAuth && storedRole && storedAddress && storedAddress.toLowerCase() === address.toLowerCase()) {
          setIsAdmin(true);
          setAdminRole(storedRole);
          
          // Set role-specific flags
          setIsSuperAdmin(storedRole === AdminRole.SUPER_ADMIN);
          setIsRegularAdmin(storedRole === AdminRole.ADMIN);
          setIsModerator(storedRole === AdminRole.MODERATOR);
          setIsMinter(storedRole === AdminRole.MINTER || storedRole === AdminRole.SUPER_ADMIN);
          setIsBurner(storedRole === AdminRole.BURNER || storedRole === AdminRole.SUPER_ADMIN);
          setIsPauser(storedRole === AdminRole.PAUSER || storedRole === AdminRole.SUPER_ADMIN);
          setIsPriceUpdater(storedRole === AdminRole.PRICE_UPDATER || storedRole === AdminRole.SUPER_ADMIN);
          
          setLoading(false);
          return;
        }

        // Check if Supabase is available
        const isSupabaseAvailable = await checkSupabaseConnection();

        if (isSupabaseAvailable) {
          // Get the user's primary role from the database
          const role = await getUserRole(address);
          setAdminRole(role);
          setIsAdmin(!!role);
          
          // Set role-specific flags
          setIsSuperAdmin(role === AdminRole.SUPER_ADMIN);
          setIsRegularAdmin(role === AdminRole.ADMIN);
          setIsModerator(role === AdminRole.MODERATOR);
          setIsMinter(role === AdminRole.MINTER || role === AdminRole.SUPER_ADMIN);
          setIsBurner(role === AdminRole.BURNER || role === AdminRole.SUPER_ADMIN);
          setIsPauser(role === AdminRole.PAUSER || role === AdminRole.SUPER_ADMIN);
          setIsPriceUpdater(role === AdminRole.PRICE_UPDATER || role === AdminRole.SUPER_ADMIN);

          // If we have a role, store it in localStorage
          if (role) {
            localStorage.setItem('adminAuth', 'true');
            localStorage.setItem('adminRole', role);
            localStorage.setItem('adminAddress', address);
          }
        } else {
          // Fallback to hardcoded admin addresses for testing
          if (
            address.toLowerCase() === '0x1234567890123456789012345678901234567890'.toLowerCase()
          ) {
            setIsAdmin(true);
            setAdminRole(AdminRole.SUPER_ADMIN);
            setIsSuperAdmin(true);
            localStorage.setItem('adminAuth', 'true');
            localStorage.setItem('adminRole', AdminRole.SUPER_ADMIN);
            localStorage.setItem('adminAddress', address);
          }
        }
      } catch (err: any) {
        console.error('Error checking roles:', err);
        setError(err.message || 'Error checking roles');
        
        // Fallback to hardcoded admin addresses for testing
        if (
          address.toLowerCase() === '0x1234567890123456789012345678901234567890'.toLowerCase()
        ) {
          setIsAdmin(true);
          setAdminRole(AdminRole.SUPER_ADMIN);
          setIsSuperAdmin(true);
          localStorage.setItem('adminAuth', 'true');
          localStorage.setItem('adminRole', AdminRole.SUPER_ADMIN);
          localStorage.setItem('adminAddress', address);
        }
      } finally {
        setLoading(false);
      }
    };

    checkRoles();
  }, [address, isConnected]);

  return {
    isAdmin,
    adminRole,
    loading,
    error,
    isSuperAdmin,
    isMinter,
    isBurner,
    isPauser,
    isPriceUpdater,
    isRegularAdmin,
    isModerator
  };
};