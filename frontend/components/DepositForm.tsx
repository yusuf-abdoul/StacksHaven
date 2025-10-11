'use client';

import { useState } from 'react';
import { ArrowDownRight } from 'lucide-react';
import { depositToVault } from '@/lib/contracts';
import { parseSTX, formatSTX } from '@/lib/stacks';
import { useVaultData } from '@/hooks/useVault';
import { useWallet } from '@/hooks/useWallet';
import toast from 'react-hot-toast';
import type { StrategyAllocation } from '@/types';

export default function DepositForm() {
  const { connected } = useWallet();
  const { vaultData } = useVaultData();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const [allocations, setAllocations] = useState<StrategyAllocation>({
    strategyA: 3333,
    strategyB: 3333,
    strategyC: 3334,
  });

  const totalAllocation = allocations.strategyA + allocations.strategyB + allocations.strategyC;

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (totalAllocation !== 10000) {
      toast.error('Allocations must total 100%');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Preparing transaction...');

    try {
      const microSTX = parseSTX(amount);
      // const result = await depositToVault(microSTX, allocations);
      await depositToVault(microSTX, allocations);

      // toast.success(
      //   <div>
      //     <div className="font-bold">Deposit successful!</div>
      //     <a
      //       href={`https://explorer.hiro.so/txid/${result.txid}?chain=testnet`}
      //       target="_blank"
      //       rel="noopener noreferrer"
      //       className="text-xs underline"
      //     >
      //       View transaction
      //     </a>
      //   </div>,
      //   { id: toastId, duration: 5000 }
      // );
      toast.success('Deposit submitted! Confirm the transaction in your wallet.', {
        id: toastId,
        duration: 5000,
      });

      setAmount('');
    } catch (error) {
      console.error('Deposit error:', error);
      toast.error(error instanceof Error ? error.message : 'Deposit failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

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

  const sharesReceived = amount && vaultData
    ? parseFloat(amount) / vaultData.sharePrice
    : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <ArrowDownRight className="w-6 h-6 mr-2 text-green-400" />
          Deposit Assets
        </h2>

        <div className="space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm text-purple-300 mb-2">Amount (STX)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.000001"
              min="0"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-purple-500 transition-all"
            />
            <div className="text-xs text-purple-300 mt-1">
              Share price: {vaultData ? vaultData.sharePrice.toFixed(6) : '1.000000'} STX
            </div>
          </div>

          {/* Allocation Sliders */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm text-purple-300">Strategy Allocation</label>
              <span className={`text-sm ${totalAllocation === 10000 ? 'text-green-400' : 'text-red-400'}`}>
                {(totalAllocation / 100).toFixed(0)}%
              </span>
            </div>

            {[
              { key: 'strategyA' as const, name: 'sBTC Staking', icon: '₿' },
              { key: 'strategyB' as const, name: 'STX Lending', icon: 'Ӿ' },
              { key: 'strategyC' as const, name: 'Liquidity Pool', icon: '💧' },
            ].map((strategy) => (
              <div key={strategy.key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center">
                    <span className="mr-2">{strategy.icon}</span>
                    {strategy.name}
                  </span>
                  <span className="text-purple-300">
                    {(allocations[strategy.key] / 100).toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={allocations[strategy.key]}
                  onChange={(e) => handleAllocationChange(strategy.key, parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            ))}

            {totalAllocation !== 10000 && (
              <button
                onClick={normalizeAllocations}
                className="text-sm text-purple-400 hover:text-purple-300 underline"
              >
                Auto-normalize to 100%
              </button>
            )}
          </div>

          {/* Preview */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="text-sm text-purple-300 mb-2">You will receive:</div>
            <div className="text-2xl font-bold">{sharesReceived.toFixed(6)} vault shares</div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleDeposit}
            disabled={!connected || !amount || loading || totalAllocation !== 10000}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-lg font-bold text-lg transition-all"
          >
            {!connected
              ? 'Connect Wallet First'
              : loading
                ? 'Processing...'
                : 'Deposit to Vault'}
          </button>
        </div>
      </div>
    </div>
  );
}