import { useState, useEffect, useCallback } from 'react';
import { initializeWeb3, connectWallet, getAddress, isConnected, checkAdminRole } from '../lib/web3';
import { getUserRole } from '../services/admin';

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('walletAddress');
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [connectionAttemptInProgress, setConnectionAttemptInProgress] = useState(false);
  // Track connection status separately from address
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('walletAddress') !== null;
    }
    return false;
  });

  const checkConnection = useCallback(async () => {
    try {
      // Check if we have a wallet address in localStorage
      const storedAddress = localStorage.getItem('walletAddress');
      
      // Check if MetaMask is available and connected
      if (window.ethereum && window.ethereum.selectedAddress) {
        const addr = window.ethereum.selectedAddress;
        setAddress(addr);
        setIsConnected(true);
        localStorage.setItem('walletAddress', addr);

        // Check if user is admin
        try {
          const hasAdminRole = await checkAdminRole(addr);
          setIsAdmin(hasAdminRole);
          
          // Get specific admin role if user is admin
          if (hasAdminRole) {
            try {
              const role = await getUserRole(addr);
              setAdminRole(role);
            } catch (error) {
              console.error('Error fetching admin role:', error);
            }
          }
        } catch (error) {
          console.error('Error checking admin role:', error);
        }
      } 
      // If MetaMask is not connected but we have a stored address
      else if (storedAddress) {
        setAddress(storedAddress);
        setIsConnected(true);
        
        // Try to initialize web3 without requesting accounts
        try {
          await initializeWeb3(false);
        } catch (error) {
          console.error('Error initializing web3:', error);
        }
      } 
      // No connection at all
      else {
        setAddress(null);
        setIsConnected(false);
        setIsAdmin(false);
        setAdminRole(null);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error checking wallet connection:', err);
      setError(err.message || 'Error checking wallet connection');
      setAddress(null);
      setIsConnected(false);
      setIsAdmin(false);
      setAdminRole(null);
      localStorage.removeItem('walletAddress');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check connection on component mount
    checkConnection();

    // Set up event listeners for wallet changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          localStorage.setItem('walletAddress', accounts[0]);
          setAddress(accounts[0]);
          setIsConnected(true);
          
          // Check if user is admin when account changes
          checkAdminRole(accounts[0]).then(hasRole => {
            setIsAdmin(hasRole);
            
            // Get specific admin role if user is admin
            if (hasRole) {
              getUserRole(accounts[0]).then(role => {
                setAdminRole(role);
              }).catch(error => {
                console.error('Error fetching admin role:', error);
              });
            } else {
              setAdminRole(null);
            }
          });
        } else {
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('adminAuth');
          localStorage.removeItem('adminAddress');
          setAddress(null);
          setIsConnected(false);
          setIsAdmin(false);
          setAdminRole(null);
        }
      };

      const handleChainChanged = () => window.location.reload();

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [checkConnection]);

  const connect = async () => {
    // Prevent multiple simultaneous connection attempts
    if (connectionAttemptInProgress) {
      return null;
    }

    try {
      setConnectionAttemptInProgress(true);
      setLoading(true);
      setError(null);

      // Check if already connected
      if (window.ethereum && window.ethereum.selectedAddress) {
        const addr = window.ethereum.selectedAddress;
        localStorage.setItem('walletAddress', addr);
        setAddress(addr);
        setIsConnected(true);
        
        // Check if user is admin
        const hasAdminRole = await checkAdminRole(addr);
        setIsAdmin(hasAdminRole);
        
        // Get specific admin role if user is admin
        if (hasAdminRole) {
          try {
            const role = await getUserRole(addr);
            setAdminRole(role);
          } catch (error) {
            console.error('Error fetching admin role:', error);
          }
        }
        
        return addr;
      }

      // Connect wallet - this will handle the MetaMask popup
      const addr = await connectWallet();
      
      if (addr) {
        localStorage.setItem('walletAddress', addr);
        setAddress(addr);
        setIsConnected(true);
        
        // Check if user is admin
        const hasAdminRole = await checkAdminRole(addr);
        setIsAdmin(hasAdminRole);
        
        // Get specific admin role if user is admin
        if (hasAdminRole) {
          try {
            const role = await getUserRole(addr);
            setAdminRole(role);
          } catch (error) {
            console.error('Error fetching admin role:', error);
          }
        }
        
        return addr;
      }
      
      throw new Error('Failed to connect wallet');
    } catch (err: any) {
      // Don't show error for user rejection
      if (err.message && (
        err.message.includes('User rejected') || 
        err.message.includes('user rejected') ||
        err.message.includes('User denied')
      )) {
        console.log('User rejected wallet connection');
      } else {
        console.error('Error connecting wallet:', err);
        setError(err.message || 'Error connecting wallet');
      }
      return null;
    } finally {
      setLoading(false);
      setConnectionAttemptInProgress(false);
    }
  };

  const disconnect = async () => {
    try {
      setLoading(true);
      
      // Clear all authentication data
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminAddress');
      
      // Reset state
      setAddress(null);
      setIsConnected(false);
      setIsAdmin(false);
      setAdminRole(null);
      setError(null);
    } catch (err: any) {
      console.error('Error disconnecting wallet:', err);
      setError(err.message || 'Error disconnecting wallet');
    } finally {
      setLoading(false);
    }
  };

  return {
    address,
    isConnected,
    loading,
    error,
    connect,
    disconnect,
    checkConnection,
    isAdmin,
    adminRole,
    connectionAttemptInProgress
  };
};