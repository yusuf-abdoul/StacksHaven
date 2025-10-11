// Core types for YieldHaven

export interface StrategyAllocation {
  strategyA: number;
  strategyB: number;
  strategyC: number;
}

export interface Strategy {
  id: 'A' | 'B' | 'C';
  name: string;
  apy: number;
  tvl: number;
  risk: 'Low' | 'Medium' | 'High';
  icon: string;
  description: string;
}

export interface UserData {
  balance: number;
  shares: number;
  deposited: number;
  earnings: number;
  allocations: StrategyAllocation;
}

export interface VaultData {
  tvl: number;
  totalShares: number;
  sharePrice: number;
  totalUsers: number;
}

export interface Transaction {
  txId: string;
  type: 'deposit' | 'withdraw' | 'reallocate';
  amount: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface ContractConfig {
  vault: string;
  strategyA: string;
  strategyB: string;
  strategyC: string;
  harvester: string;
}

export type NetworkType = 'mainnet' | 'testnet';

export interface WalletState {
  connected: boolean;
  address: string | null;
  stxAddress: string | null;
  network: NetworkType;
}