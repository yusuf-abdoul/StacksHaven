'use client';

import { Wallet, TrendingUp } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

export default function Header() {
  const { connected, stxAddress, connect, disconnect, loading } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="border-b border-white/10 backdrop-blur-sm bg-black/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">YieldHaven</h1>
            <p className="text-xs text-purple-300">Maximize your DeFi returns</p>
          </div>
        </div>

        {!connected ? (
          <button
            onClick={connect}
            disabled={loading}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 px-6 py-2.5 rounded-lg font-semibold transition-all"
          >
            <Wallet className="w-4 h-4" />
            <span>{loading ? 'Loading...' : 'Connect Wallet'}</span>
          </button>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs text-purple-300">Connected</div>
              <div className="text-sm font-mono">
                {stxAddress ? formatAddress(stxAddress) : 'Unknown'}
              </div>
            </div>
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-all"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </header>
  );
}