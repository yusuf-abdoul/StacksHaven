'use client';

import { DollarSign, Wallet, TrendingUp, Zap, ArrowUpRight } from 'lucide-react';
import { useVaultData, useUserData } from '@/hooks/useVault';
import { useWallet } from '@/hooks/useWallet';
import { formatSTX } from '@/lib/stacks';

export default function Dashboard() {
  const { stxAddress } = useWallet();
  const { vaultData, loading: vaultLoading } = useVaultData();
  const { userData, loading: userLoading } = useUserData(stxAddress);

  const strategies = [
    {
      id: 'A',
      name: 'sBTC Staking',
      apy: 8.0,
      tvl: vaultData?.tvl ? vaultData.tvl * 0.36 : 450000,
      risk: 'Low',
      icon: '₿',
    },
    {
      id: 'B',
      name: 'STX Lending',
      apy: 6.5,
      tvl: vaultData?.tvl ? vaultData.tvl * 0.32 : 400000,
      risk: 'Low',
      icon: 'Ӿ',
    },
    {
      id: 'C',
      name: 'Liquidity Pool',
      apy: 12.0,
      tvl: vaultData?.tvl ? vaultData.tvl * 0.32 : 400000,
      risk: 'Medium',
      icon: '💧',
    },
  ];

  const getWeightedAPY = () => {
    if (!userData?.allocations) return '0.00';
    
    const totalBasis = 10000;
    const weightedAPY =
      (strategies[0].apy * userData.allocations.strategyA) / totalBasis +
      (strategies[1].apy * userData.allocations.strategyB) / totalBasis +
      (strategies[2].apy * userData.allocations.strategyC) / totalBasis;
    
    return weightedAPY.toFixed(2);
  };

  if (vaultLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-purple-300">Loading vault data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-300">Total Value Locked</span>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold">
            {vaultData ? `${formatSTX(vaultData.tvl)} STX` : '0 STX'}
          </div>
          <div className="text-xs text-green-400 mt-1 flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            +12.5% this month
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-300">Your Balance</span>
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold">
            {userData ? `${formatSTX(userData.balance)} STX` : '0 STX'}
          </div>
          <div className="text-xs text-purple-300 mt-1">
            {userData ? `${userData.shares.toFixed(0)} vault shares` : '0 shares'}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-300">Total Earnings</span>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">
            +{userData ? formatSTX(userData.earnings) : '0'} STX
          </div>
          <div className="text-xs text-purple-300 mt-1">
            {userData && userData.deposited > 0
              ? `${((userData.earnings / userData.deposited) * 100).toFixed(2)}% ROI`
              : '0% ROI'}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-300">Weighted APY</span>
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400">{getWeightedAPY()}%</div>
          <div className="text-xs text-purple-300 mt-1">Based on allocations</div>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => {
          const allocationKey = `strategy${strategy.id}` as keyof NonNullable<typeof userData>["allocations"];
          const allocation = userData?.allocations?.[allocationKey] || 0;

          return (
            <div
              key={strategy.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-purple-400 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-3xl mb-2">{strategy.icon}</div>
                  <h3 className="font-bold text-lg">{strategy.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      strategy.risk === 'Low'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {strategy.risk} Risk
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">{strategy.apy}%</div>
                  <div className="text-xs text-purple-300">APY</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-300">TVL:</span>
                  <span className="font-semibold">{formatSTX(strategy.tvl)} STX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Your Allocation:</span>
                  <span className="font-semibold">{(allocation / 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Your Amount:</span>
                  <span className="font-semibold">
                    {userData ? formatSTX((userData.balance * allocation) / 10000) : '0'} STX
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${allocation / 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}