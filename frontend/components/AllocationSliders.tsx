'use client';

import { useState, useEffect } from 'react';
import { PieChart } from 'lucide-react';
import { reallocateStrategy } from '@/lib/contracts';
import { useUserData } from '@/hooks/useVault';
import { useWallet } from '@/hooks/useWallet';
import toast from 'react-hot-toast';
import type { StrategyAllocation } from '@/types';

const strategies = [
  { id: 'A', key: 'strategyA' as const, name: 'sBTC Staking', icon: '₿', apy: 8.0 },
  { id: 'B', key: 'strategyB' as const, name: 'STX Lending', icon: 'Ӿ', apy: 6.5 },
  { id: 'C', key: 'strategyC' as const, name: 'Liquidity Pool', icon: '💧', apy: 12.0 },
];

export default function AllocationSliders() {
  const { connected, stxAddress } = useWallet();
  const { userData } = useUserData(stxAddress);
  const [loading, setLoading] = useState(false);

  const [allocations, setAllocations] = useState<StrategyAllocation>({
    strategyA: 3333,
    strategyB: 3333,
    strategyC: 3334,
  });

  // Load user's current allocations
  useEffect(() => {
    if (userData?.allocations) {
      setAllocations(userData.allocations);
    }
  }, [userData]);

  const totalAllocation = allocations.strategyA + allocations.strategyB + allocations.strategyC;

  const handleAllocationChange = (strategy: keyof StrategyAllocation, value: number) => {
    setAllocations((prev) => ({
      ...prev,
      [strategy]: value,
    }));
  };

  const normalizeAllocations = () => {
    if (totalAllocation !== 10000) {
      const factor = 10000 / totalAllocation;
      setAllocations({
        strategyA: Math.round(allocations.strategyA * factor),
        strategyB: Math.round(allocations.strategyB * factor),
        strategyC: Math.round(allocations.strategyC * factor),
      });
    }
  };

  const handleReallocate = async () => {
    if (totalAllocation !== 10000) {
      toast.error('Allocations must total 100%');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Preparing transaction...');

    try {
      await reallocateStrategy(allocations);

      await reallocateStrategy(allocations);

      toast.success(
        <div className="font-bold">
          Transaction submitted in your wallet!
        </div>,
        { id: toastId, duration: 5000 }
      );

    } catch (error) {
      console.error('Reallocation error:', error);
      toast.error(error instanceof Error ? error.message : 'Reallocation failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const getWeightedAPY = () => {
    const totalBasis = 10000;
    const weightedAPY =
      (strategies[0].apy * allocations.strategyA) / totalBasis +
      (strategies[1].apy * allocations.strategyB) / totalBasis +
      (strategies[2].apy * allocations.strategyC) / totalBasis;

    return weightedAPY.toFixed(2);
  };

  const setEqualAllocations = () => {
    setAllocations({
      strategyA: 3333,
      strategyB: 3333,
      strategyC: 3334,
    });
  };

  const setConservative = () => {
    setAllocations({
      strategyA: 5000,
      strategyB: 4000,
      strategyC: 1000,
    });
  };

  const setAggressive = () => {
    setAllocations({
      strategyA: 2000,
      strategyB: 2000,
      strategyC: 6000,
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <PieChart className="w-6 h-6 mr-2 text-purple-400" />
          Manage Allocations
        </h2>

        <div className="space-y-6">
          {/* Quick Preset Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={setEqualAllocations}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all"
            >
              Equal (33/33/34)
            </button>
            <button
              onClick={setConservative}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all"
            >
              Conservative (50/40/10)
            </button>
            <button
              onClick={setAggressive}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all"
            >
              Aggressive (20/20/60)
            </button>
          </div>

          {/* Allocation Sliders */}
          <div className="space-y-6">
            {strategies.map((strategy) => {
              const allocation = allocations[strategy.key];

              return (
                <div key={strategy.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{strategy.icon}</span>
                      <div>
                        <div className="font-medium">{strategy.name}</div>
                        <div className="text-xs text-purple-300">{strategy.apy}% APY</div>
                      </div>
                    </div>
                    <span className="text-purple-300 font-bold">
                      {(allocation / 100).toFixed(1)}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={allocation}
                    onChange={(e) => handleAllocationChange(strategy.key, parseInt(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />

                  <div className="flex justify-between text-xs text-purple-300">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Allocation Display */}
          <div className={`rounded-lg p-4 ${totalAllocation === 10000
              ? 'bg-green-500/10 border border-green-500/30'
              : 'bg-yellow-500/10 border border-yellow-500/30'
            }`}>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-purple-300">Total Allocation:</div>
                <div className="text-2xl font-bold">
                  {(totalAllocation / 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-300">Expected APY:</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {getWeightedAPY()}%
                </div>
              </div>
            </div>

            {totalAllocation !== 10000 && (
              <div className="mt-3 pt-3 border-t border-yellow-500/30">
                <button
                  onClick={normalizeAllocations}
                  className="text-sm text-yellow-300 hover:text-yellow-200 underline"
                >
                  Auto-normalize to 100%
                </button>
              </div>
            )}
          </div>

          {/* Visual Allocation Bar */}
          <div className="space-y-2">
            <div className="text-sm text-purple-300">Visual Breakdown:</div>
            <div className="flex h-8 rounded-lg overflow-hidden">
              <div
                className="bg-purple-500 flex items-center justify-center text-xs font-bold transition-all"
                style={{ width: `${(allocations.strategyA / 100)}%` }}
              >
                {allocations.strategyA > 500 && `${(allocations.strategyA / 100).toFixed(0)}%`}
              </div>
              <div
                className="bg-blue-500 flex items-center justify-center text-xs font-bold transition-all"
                style={{ width: `${(allocations.strategyB / 100)}%` }}
              >
                {allocations.strategyB > 500 && `${(allocations.strategyB / 100).toFixed(0)}%`}
              </div>
              <div
                className="bg-pink-500 flex items-center justify-center text-xs font-bold transition-all"
                style={{ width: `${(allocations.strategyC / 100)}%` }}
              >
                {allocations.strategyC > 500 && `${(allocations.strategyC / 100).toFixed(0)}%`}
              </div>
            </div>
            <div className="flex justify-between text-xs text-purple-300">
              <span>₿ sBTC Staking</span>
              <span>Ӿ STX Lending</span>
              <span>💧 Liquidity Pool</span>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-300">
            ℹ️ Changing allocations will affect future deposits. Existing deposits will be rebalanced on your next deposit or withdrawal.
          </div>

          {/* Submit Button */}
          <button
            onClick={handleReallocate}
            disabled={!connected || loading || totalAllocation !== 10000}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-lg font-bold text-lg transition-all"
          >
            {!connected
              ? 'Connect Wallet First'
              : loading
                ? 'Processing...'
                : 'Update Allocations'}
          </button>
        </div>
      </div>
    </div>
  );
}