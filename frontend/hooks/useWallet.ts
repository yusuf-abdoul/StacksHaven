import { useState, useEffect } from 'react';
import {
  connectWallet,
  disconnectWallet,
  isWalletConnected,
  getUserAddress,
  getUserData as getStacksUserData,
} from '@/lib/stacks';
import type { WalletState } from '@/types';
import { NETWORK_TYPE } from '@/lib/config';

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    address: null,
    stxAddress: null,
    network: NETWORK_TYPE,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = () => {
    setLoading(true);
    const connected = isWalletConnected();
    
    if (connected) {
      const userData = getStacksUserData();
      const address = getUserAddress();
      
      setWalletState({
        connected: true,
        address: userData?.profile?.stxAddress?.mainnet || null,
        stxAddress: address,
        network: NETWORK_TYPE,
      });
    } else {
      setWalletState({
        connected: false,
        address: null,
        stxAddress: null,
        network: NETWORK_TYPE,
      });
    }
    
    setLoading(false);
  };

  const connect = () => {
    connectWallet();
  };

  const disconnect = () => {
    disconnectWallet();
  };

  return {
    ...walletState,
    loading,
    connect,
    disconnect,
    refresh: checkConnection,
  };
}