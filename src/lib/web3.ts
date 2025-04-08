import { ethers } from 'ethers';
import { GSDT_ADDRESS, GSDT_ABI } from '../contracts/GSDT';
import { GSDT_NFT_ADDRESS, GSDT_NFT_ABI } from '../contracts/GSDT_NFT';
import { supabase } from './supabase';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// RPC Configuration
const RPC_CONFIG = {
  bscTestnet: {
    url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    chainId: 97,
    name: "BSC Testnet",
    retry: {
      maxAttempts: 3,
      delay: 1000,
      backoff: 1.5
    }
  }
};

// POODL RPC Configuration
const RPC_POODL_CONFIG = {
  poodlTestnet: {
    url: "https://testnet-rpc.poodl.org/",
    chainId: 15257,
    name: "POODL Testnet",
    retry: {
      maxAttempts: 3,
      delay: 1000,
      backoff: 1.5
    }
  }
};

// Create a provider with retry mechanism
const createProvider = (rpcUrl: string) => {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
    name: RPC_CONFIG.bscTestnet.name,
    chainId: RPC_CONFIG.bscTestnet.chainId
  });
  
  // Wrap provider's send method to add retry logic
  const originalSend = provider.send.bind(provider);
  provider.send = async (method: string, params: any[]) => {
    let lastError;
    let attempt = 0;
    let delay = RPC_CONFIG.bscTestnet.retry.delay;

    while (attempt < RPC_CONFIG.bscTestnet.retry.maxAttempts) {
      try {
        return await originalSend(method, params);
      } catch (error: any) {
        lastError = error;
        
        // Only retry on rate limit or timeout errors
        if (!error.message?.includes('limit exceeded') && 
            !error.message?.includes('timeout') && 
            error.code !== 'TIMEOUT') {
          throw error;
        }
        
        attempt++;
        if (attempt === RPC_CONFIG.bscTestnet.retry.maxAttempts) {
          break;
        }
        
        // Wait with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= RPC_CONFIG.bscTestnet.retry.backoff;
      }
    }
    
    throw lastError;
  };

  return provider;
};

// Create default provider for read-only operations
const defaultProvider = createProvider(RPC_CONFIG.bscTestnet.url);
const readOnlyContract = new ethers.Contract(GSDT_ADDRESS, GSDT_ABI, defaultProvider);

// Track connection state
let provider: ethers.providers.Web3Provider | null = null;
let signer: ethers.Signer | null = null;
let contract: ethers.Contract | null = null;
let connectionInProgress = false;
let connectionPromise: Promise<boolean> | null = null;

export const getReadOnlyContract = () => readOnlyContract;


let nftContract: ethers.Contract | null = null;
const readOnlyNFTContract = new ethers.Contract(GSDT_NFT_ADDRESS, GSDT_NFT_ABI, defaultProvider);


// Hardcoded DEFAULT_ADMIN_ROLE value from OpenZeppelin's AccessControl
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

export const initializeWeb3 = async (requestAccounts = false) => {
  try {
    // If we already have a provider and don't need to request accounts, just return
    if (provider && !requestAccounts) {
      return true;
    }

    // If there's already a connection in progress, return the existing promise
    if (connectionPromise) {
      return connectionPromise;
    }

    // If we're already connected and have a provider, just return
    if (window.ethereum && window.ethereum.selectedAddress && provider && !requestAccounts) {
      return true;
    }

    // Set connection in progress flag
    connectionInProgress = true;

    // Create a new connection promise
    connectionPromise = (async () => {
      try {
        if (typeof window === 'undefined' || !window.ethereum) {
          throw new Error('Please install MetaMask to connect your wallet');
        }
        
        // Create provider if it doesn't exist
        if (!provider) {
          provider = new ethers.providers.Web3Provider(window.ethereum, {
            name: RPC_CONFIG.bscTestnet.name,
            chainId: RPC_CONFIG.bscTestnet.chainId
          });
        }
        
        // Only request accounts if explicitly asked to
        if (requestAccounts) {
          try {
            // Check if we're already connected
            if (!window.ethereum.selectedAddress) {
              await provider.send("eth_requestAccounts", []);
            }
            
            // Initialize signer and contract
            signer = provider.getSigner();
            contract = new ethers.Contract(GSDT_ADDRESS, GSDT_ABI, signer);
          } catch (error: any) {
            // If MetaMask is already processing a request, wait for it
            if (error.code === -32002) {
              console.log('MetaMask is already processing a connection request. Waiting...');
              return false;
            }
            throw error;
          }
        } else if (window.ethereum.selectedAddress && !signer) {
          // If already connected but signer not initialized
          signer = provider.getSigner();
          contract = new ethers.Contract(GSDT_ADDRESS, GSDT_ABI, signer);
        }
        
        return true;
      } catch (error) {
        console.error('Error initializing web3:', error);
        throw error;
      } finally {
        // Clear the connection state
        connectionPromise = null;
        connectionInProgress = false;
      }
    })();

    return connectionPromise;
  } catch (error) {
    console.error('Error in initializeWeb3:', error);
    return false;
  }
};

export const connectWallet = async () => {
  try {
    // If a connection is already in progress, wait for it to complete
    if (connectionInProgress) {
      if (connectionPromise) {
        await connectionPromise;
      } else {
        // Wait for any existing MetaMask popup to be handled
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Check if already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
      if (!provider || !signer) {
        await initializeWeb3(false);
      }
      return window.ethereum.selectedAddress;
    }
    
    // Initialize with explicit account request
    const success = await initializeWeb3(true);
    
    // If initialization was successful and we have a selected address
    if (success && window.ethereum && window.ethereum.selectedAddress) {
      return window.ethereum.selectedAddress;
    }
    
    // If we have a signer but no selected address (unlikely)
    if (signer) {
      try {
        return await signer.getAddress();
      } catch (error) {
        throw new Error('Failed to get address. Please connect your wallet.');
      }
    }
    
    throw new Error('Wallet connection failed. Please try again.');
  } catch (error: any) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const getContract = () => {
  try {
    if (!contract) {
      // Try to initialize if we have a selected address
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          // Create provider if it doesn't exist
          if (!provider) {
            provider = new ethers.providers.Web3Provider(window.ethereum, {
              name: RPC_CONFIG.bscTestnet.name,
              chainId: RPC_CONFIG.bscTestnet.chainId
            });
          }
          
          // Initialize signer and contract
          signer = provider.getSigner();        
          contract = new ethers.Contract(GSDT_ADDRESS, GSDT_ABI, signer);
        } catch (error) {
          console.error('Error initializing contract:', error);
          return readOnlyContract;
        }
      } else {
        return readOnlyContract;
      }
    }
    return contract;
  } catch (error) {
    console.error('Error in getContract:', error);
    return readOnlyContract;
  }
};

export const getNFTContract = () => {
  try {
    if (!nftContract) {
      // Try to initialize if we have a selected address
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          // Create provider if it doesn't exist
          if (!provider) {
            provider = new ethers.providers.Web3Provider(window.ethereum, {
              name: RPC_CONFIG.bscTestnet.name,
              chainId: RPC_CONFIG.bscTestnet.chainId
            });
          }
          
          // Initialize signer and nftContract
          signer = provider.getSigner();                  
          nftContract = new ethers.Contract(GSDT_NFT_ADDRESS, GSDT_NFT_ABI, signer);
        } catch (error) {
          console.error('Error initializing nftContract:', error);
          return readOnlyNFTContract;
        }
      } else {
        return readOnlyNFTContract;
      }
    }
    return nftContract;
  } catch (error) {
    console.error('Error in getContract:', error);
    return readOnlyNFTContract;
  }
};

export const getAddress = async () => {
  try {
    // Check if we have accounts already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
      // Initialize without requesting accounts if we haven't already
      if (!provider || !signer) {
        await initializeWeb3(false);
      }
      
      return window.ethereum.selectedAddress;
    }
    
    // No accounts connected
    return null;
  } catch (error) {
    console.error('Error getting address:', error);
    return null;
  }
};

export const isConnected = async () => {
  try {
    // Check if MetaMask is connected by looking at selectedAddress
    if (window.ethereum && window.ethereum.selectedAddress) {
      return true;
    }
    
    // Fallback to getting address
    const address = await getAddress();
    return Boolean(address);
  } catch {
    return false;
  }
};

export const checkAdminRole = async (address: string): Promise<boolean> => {
  try {
    // Query the admin_roles table from Supabase
    const { data, error } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_address', address.toLowerCase())
      .maybeSingle();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return false;
      }
      console.error('Error fetching user role:', error);
      
      // Return mock role for testing
      const mockUser = [
        '0x1234567890123456789012345678901234567890',
        '0x2345678901234567890123456789012345678901',
        '0x3456789012345678901234567890123456789012'
      ].find(addr => addr.toLowerCase() === address.toLowerCase());
      
      return Boolean(mockUser);
    }
    
    return Boolean(data?.role);
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
};