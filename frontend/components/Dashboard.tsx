'use client';

import { DollarSign, Wallet, TrendingUp, Zap, ArrowUpRight, ArrowDownRight, Activity, BarChart3, PieChart, RefreshCw } from 'lucide-react';
import { useVaultData, useUserData } from '@/hooks/useVault';
import { useWallet } from '@/hooks/useWallet';
import { formatSTX } from '@/lib/stacks';
import { useEffect, useState } from 'react';
import { getStrategyBalance } from '@/lib/contracts';

export default function Dashboard() {
  const { stxAddress } = useWallet();
  const { vaultData, loading: vaultLoading } = useVaultData();
  const { userData, loading: userLoading } = useUserData(stxAddress);

  const [strategyTVL, setStrategyTVL] = useState({ A: 0, B: 0, C: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Refresh per-strategy TVL from vault when vault data changes
    const fetchTVL = async () => {
      try {
        const [a, b, c] = await Promise.all([
          getStrategyBalance('', 'strategy-a'),
          getStrategyBalance('', 'strategy-b'),
          getStrategyBalance('', 'strategy-c'),
        ]);
        // Fallback: if vault doesn't track strategy balances, derive from user's balance & allocations
        if ((a + b + c) === 0 && userData?.balance) {
          const alloc = userData.allocations;
          const balMicro = Math.floor(userData.balance * 1_000_000);
          const fa = Math.floor((balMicro * (alloc?.strategyA || 0)) / 10000);
          const fb = Math.floor((balMicro * (alloc?.strategyB || 0)) / 10000);
          const fc = Math.floor((balMicro * (alloc?.strategyC || 0)) / 10000);
          setStrategyTVL({ A: fa, B: fb, C: fc });
        } else {
          setStrategyTVL({ A: a, B: b, C: c });
        }
      } catch (e) {
        // ignore errors; keep defaults
      }
    };
    fetchTVL();
  }, [vaultData?.tvl, userData?.balance, userData?.allocations]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Add refresh logic here
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const strategies = [
    {
      id: 'A',
      name: 'sBTC Staking',
      apy: 8.0,
      tvl: strategyTVL.A,
      risk: 'Low',
      icon: '₿',
    },
    {
      id: 'B',
      name: 'STX Lending',
      apy: 6.5,
      tvl: strategyTVL.B,
      risk: 'Low',
      icon: 'Ӿ',
    },
    {
      id: 'C',
      name: 'Liquidity Pool',
      apy: 12.0,
      tvl: strategyTVL.C,
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
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-purple-300">Loading vault data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-purple-300 mt-1">Welcome back! Here's your portfolio overview.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-white text-sm">Refresh</span>
        </button>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex items-center space-x-1 text-green-400">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-medium">+12.5%</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-purple-300">Total Value Locked</p>
            <p className="text-2xl font-bold text-white">
              {vaultData ? `${formatSTX(vaultData.tvl)} STX` : '0 STX'}
            </p>
            <p className="text-xs text-purple-300">Across all strategies</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-purple-300">Your Balance</p>
            <p className="text-2xl font-bold text-white">
              {userData ? `${userData.balance.toFixed(4)} STX` : '0 STX'}
            </p>
            <p className="text-xs text-purple-300">
              {userData ? `${(userData.shares).toFixed(2)} vault shares` : '0 shares'}
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex items-center space-x-1 text-green-400">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-medium">
                {userData && userData.deposited > 0
                  ? `${((userData.earnings / userData.deposited) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-purple-300">Total Earnings</p>
            <p className="text-2xl font-bold text-green-400">
              +{userData ? userData.earnings.toFixed(4) : '0'} STX
            </p>
            <p className="text-xs text-purple-300">All-time returns</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex items-center space-x-1 text-yellow-400">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Live</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-purple-300">Weighted APY</p>
            <p className="text-2xl font-bold text-yellow-400">{getWeightedAPY()}%</p>
            <p className="text-xs text-purple-300">Based on allocations</p>
          </div>
        </div>
      </div>

      {/* Enhanced Strategy Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Strategy Performance</h2>
          <div className="flex items-center space-x-2 text-sm text-purple-300">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Real-time data</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {strategies.map((strategy) => {
            const allocationKey = `strategy${strategy.id}` as keyof NonNullable<typeof userData>["allocations"];
            const allocation = userData?.allocations?.[allocationKey] || 0;
            const userAmount = userData ? ((userData.balance * allocation) / 10000) : 0;

            return (
              <div
                key={strategy.id}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
              >
                {/* Strategy Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-3">
                    <div className="text-4xl group-hover:scale-110 transition-transform">
                      {strategy.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white">{strategy.name}</h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          strategy.risk === 'Low'
                            ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                        }`}
                      >
                        {strategy.risk} Risk
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-400">{strategy.apy}%</div>
                    <div className="text-sm text-purple-300">APY</div>
                  </div>
                </div>

                {/* Strategy Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Total TVL</span>
                    <span className="font-semibold text-white">{formatSTX(strategy.tvl)} STX</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Your Allocation</span>
                    <span className="font-semibold text-white">{(allocation / 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Your Amount</span>
                    <span className="font-semibold text-blue-400">{userAmount.toFixed(4)} STX</span>
                  </div>
                </div>

                {/* Allocation Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-300">Allocation Progress</span>
                    <span className="text-white">{(allocation / 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${allocation / 100}%` }}
                    />
                  </div>
                </div>

                {/* Performance Indicator */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-purple-300">Active</span>
                    </div>
                    <div className="text-xs text-green-400">
                      +{((userAmount * strategy.apy) / 100).toFixed(4)} STX/year
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-xl border border-blue-400/30 transition-all group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Deposit Funds</p>
                <p className="text-xs text-purple-300">Add STX to vault</p>
              </div>
            </div>
          </button>

          <button className="p-4 bg-green-600/20 hover:bg-green-600/30 rounded-xl border border-green-400/30 transition-all group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Adjust Allocation</p>
                <p className="text-xs text-purple-300">Rebalance strategies</p>
              </div>
            </div>
          </button>

          <button className="p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-xl border border-purple-400/30 transition-all group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">View Analytics</p>
                <p className="text-xs text-purple-300">Detailed insights</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}