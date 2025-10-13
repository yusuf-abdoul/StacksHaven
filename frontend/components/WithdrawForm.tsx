'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { withdrawFromVault } from '@/lib/contracts';
import { parseSTX, formatSTX } from '@/lib/stacks';
import { useVaultData, useUserData } from '@/hooks/useVault';
import { useWallet } from '@/hooks/useWallet';
import toast from 'react-hot-toast';

export default function WithdrawForm() {
  const { connected, stxAddress } = useWallet();
  const { vaultData } = useVaultData();
  const { userData } = useUserData(stxAddress);
  const [shares, setShares] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!shares || parseFloat(shares) <= 0) {
      toast.error('Please enter a valid amount of shares');
      return;
    }

    if (!userData || parseFloat(shares) > userData.shares) {
      toast.error('Insufficient shares');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Preparing transaction...');

    try {
      const sharesToBurn = parseSTX(shares);
      await withdrawFromVault(sharesToBurn);

      toast.success('Withdrawal submitted! Confirm the transaction in your wallet.', {
        id: toastId,
        duration: 5000,
      });

      setShares('');
    } catch (error) {
      console.error('Withdraw error:', error);
      toast.error(error instanceof Error ? error.message : 'Withdrawal failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const setMaxShares = () => {
    if (userData) {
      setShares(userData.shares.toString());
    }
  };

  const stxReceived = shares && vaultData
    ? parseFloat(shares) * vaultData.sharePrice
    : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <ArrowUpRight className="w-6 h-6 mr-2 text-red-400" />
          Withdraw Assets
        </h2>

        <div className="space-y-6">
          {/* Shares Input */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm text-purple-300">Vault Shares to Burn</label>
              <button
                onClick={setMaxShares}
                className="text-xs text-purple-400 hover:text-purple-300 underline"
                disabled={!userData}
              >
                Max
              </button>
            </div>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="0.000000"
              step="0.000001"
              min="0"
              max={userData?.shares || 0}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-purple-500 transition-all"
            />
            <div className="text-xs text-purple-300 mt-1">
              Available: {userData ? formatSTX(userData.shares) : '0'} shares
            </div>
          </div>

          {/* Current Holdings */}
          {userData && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="text-sm text-blue-300 mb-2">Your Current Holdings:</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-purple-300">Total Shares:</div>
                  <div className="font-bold">{formatSTX(userData.shares)}</div>
                </div>
                <div>
                  <div className="text-purple-300">Est. Value:</div>
                  <div className="font-bold">{formatSTX(userData.balance)} STX</div>
                </div>
                <div>
                  <div className="text-purple-300">Deposited:</div>
                  <div className="font-bold">{formatSTX(userData.deposited)} STX</div>
                </div>
                <div>
                  <div className="text-purple-300">Earnings:</div>
                  <div className="font-bold text-green-400">+{formatSTX(userData.earnings)} STX</div>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="text-sm text-purple-300 mb-2">You will receive:</div>
            <div className="text-2xl font-bold">{formatSTX(parseSTX(stxReceived.toString()))} STX</div>
            <div className="text-xs text-purple-300 mt-1">
              Plus any accrued rewards from strategies
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-300">
            ⚠️ Withdrawing will claim all pending rewards and return your principal. This action cannot be undone.
          </div>

          {/* Submit Button */}
          <button
            onClick={handleWithdraw}
            disabled={!connected || !shares || loading}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-lg font-bold text-lg transition-all"
          >
            {!connected
              ? 'Connect Wallet First'
              : loading
                ? 'Processing...'
                : 'Withdraw from Vault'}
          </button>
        </div>
      </div>
    </div>
  );
}