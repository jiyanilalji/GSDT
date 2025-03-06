import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

// Provider and signer state
let provider: ethers.providers.Web3Provider | null = null;
let signer: ethers.Signer | null = null;

// Initialize provider and signer
export const initWeb3 = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      signer = provider.getSigner();
      return true;
    } catch (error) {
      console.error('User denied account access', error);
      return false;
    }
  } else {
    console.log('No Ethereum browser extension detected');
    return false;
  }
};

// Get provider
export const useProvider = () => {
  const [currentProvider, setCurrentProvider] = useState<ethers.providers.Web3Provider | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setCurrentProvider(web3Provider);
    }
  }, []);
  
  return currentProvider;
};

// Get signer
export const useSigner = () => {
  const [currentSigner, setCurrentSigner] = useState<ethers.Signer | null>(null);
  
  useEffect(() => {
    const getSigner = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = web3Provider.getSigner();
          setCurrentSigner(signer);
        } catch (error) {
          console.error('Error getting signer:', error);
        }
      }
    };
    
    getSigner();
  }, []);
  
  return currentSigner;
};

// Get account
export const useAccount = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const getAccount = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          } else {
            setAddress(null);
            setIsConnected(false);
          }
        } catch (error) {
          console.error('Error getting accounts:', error);
          setAddress(null);
          setIsConnected(false);
        }
      }
    };
    
    getAccount();
    
    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setAddress(null);
          setIsConnected(false);
        }
      });
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);
  
  const connect = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          return accounts[0];
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
    return null;
  };
  
  return { address, isConnected, connect };
};