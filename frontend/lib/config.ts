import { StacksMainnet, StacksTestnet } from '@stacks/network';
import type { ContractConfig, NetworkType } from '@/types';

export const NETWORK_TYPE = (process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet') as NetworkType;

export const NETWORK = NETWORK_TYPE === 'mainnet' 
  ? new StacksMainnet() 
  : new StacksTestnet();

export const CONTRACTS: ContractConfig = {
  vault: process.env.NEXT_PUBLIC_VAULT_CONTRACT || '',
  strategyA: process.env.NEXT_PUBLIC_STRATEGY_A_CONTRACT || '',
  strategyB: process.env.NEXT_PUBLIC_STRATEGY_B_CONTRACT || '',
  strategyC: process.env.NEXT_PUBLIC_STRATEGY_C_CONTRACT || '',
  harvester: process.env.NEXT_PUBLIC_HARVESTER_CONTRACT || '',
};

export const API_URL = process.env.NEXT_PUBLIC_STACKS_API_URL || 
  (NETWORK_TYPE === 'mainnet' 
    ? 'https://api.mainnet.hiro.so' 
    : 'https://api.testnet.hiro.so');

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'YieldHaven',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  description: 'Automated Yield Aggregator on Stacks',
  icon: '/logo.png',
};

// Helper to parse contract address
export function parseContractId(contractId: string): { address: string; name: string } {
  const [address, name] = contractId.split('.');
  return { address, name };
}