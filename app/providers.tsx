'use client';

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { WagmiConfig } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';

// Replace with your WalletConnect project ID
const projectId = '8154bc86f0b2de148663bbf387e75b05';

const metadata = {
  name: 'GSDT Stablecoin',
  description: 'GSDT Stablecoin Web3 Application',
  url: 'https://gsdt.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [bscTestnet];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({ wagmiConfig, projectId, chains });

export function Providers({ children }: { children: React.ReactNode }) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
}