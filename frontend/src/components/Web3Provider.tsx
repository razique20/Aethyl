'use client';

import React from 'react';
import {
  RainbowKitProvider,
  getDefaultConfig,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
  appName: 'FrethiX',
  projectId: 'YOUR_PROJECT_ID',
  chains: [sepolia, hardhat, mainnet],
  transports: {
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [mainnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: '#7c3aed', // deeper violet for light mode
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
          initialChain={sepolia}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
