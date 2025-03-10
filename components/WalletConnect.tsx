'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from './ui/button';
import { registerWalletAddress } from '../services/walletService';

export default function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'registering' | 'error'>('idle');
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Register wallet address with backend directly
  const handleRegisterWallet = async (walletAddress: string) => {
    try {
      setConnectionStatus('registering');
      await registerWalletAddress(walletAddress);
      setConnectionStatus('idle');
      console.log('Wallet registered successfully');
    } catch (error) {
      console.error('Failed to register wallet:', error);
      setConnectionStatus('error');
      // Don't disconnect - user is still connected to their wallet even if our registration failed
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      await connect({ connector: connectors[0] });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setConnectionStatus('idle');
  };

  // When address changes (user connects) and we have an address, register it
  useEffect(() => {
    if (address && isConnected) {
      handleRegisterWallet(address);
    }
  }, [address, isConnected]);

  return (
    <div className="absolute top-4 right-4 flex items-center space-x-4">
      {isConnected ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-green-500">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          {connectionStatus === 'registering' && (
            <span className="text-xs text-yellow-500">Registering...</span>
          )}
          {connectionStatus === 'error' && (
            <span className="text-xs text-red-500">Registration failed</span>
          )}
          <Button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2
            ${isConnecting ? 'cursor-not-allowed opacity-75' : ''}`}
        >
          <span>Connect MetaMask</span>
          {isConnecting && (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
          )}
        </Button>
      )}
    </div>
  );
}