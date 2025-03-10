'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMask } from '@wagmi/connectors';
import { defineChain } from 'viem';

// Sonic Blaze Testnet configuration
const sonicBlazeTestnet = defineChain({
  id: 57054,
  name: 'Sonic Blaze Testnet',
  network: 'sonic-blaze-testnet',
  nativeCurrency: {
    name: 'Sonic',
    symbol: 'S',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.blaze.soniclabs.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SonicScan',
      url: 'https://testnet.sonicscan.org',
    },
  },
  testnet: true,
});

const config = createConfig({
  chains: [sonicBlazeTestnet],
  transports: {
    [sonicBlazeTestnet.id]: http(),
  },
  connectors: [
    metaMask({
      projectId: 'recurring-payments-app',
      dappMetadata: {
        name: 'Recurring Payments App',
        url: 'https://recurring-payments.app',
      },
    }),
  ],
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}