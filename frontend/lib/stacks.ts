import { AppConfig, showConnect, UserSession } from '@stacks/connect';
import { 
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
  principalCV,
  ClarityValue,
  ClarityType,
} from '@stacks/transactions';
import { NETWORK, API_URL, APP_CONFIG, parseContractId } from './config';

// User session for wallet state
const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

// Connect wallet
export function connectWallet() {
  showConnect({
    appDetails: {
      name: APP_CONFIG.name,
      icon: `${APP_CONFIG.url}/logo.png`,
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

// Disconnect wallet
export function disconnectWallet() {
  userSession.signUserOut();
  window.location.reload();
}

// Get user data
export function getUserData() {
  if (!userSession.isUserSignedIn()) return null;
  return userSession.loadUserData();
}

// Check if wallet is connected
export function isWalletConnected(): boolean {
  return userSession.isUserSignedIn();
}

// Get user address
export function getUserAddress(): string | null {
  const userData = getUserData();
  if (!userData) return null;
  
  return userData.profile.stxAddress[NETWORK.isMainnet() ? 'mainnet' : 'testnet'];
}

// Read-only contract call helper
export async function readContract<T = any>(
  contractId: string,
  functionName: string,
  functionArgs: ClarityValue[] = []
): Promise<T | null> {
  try {
    const { address, name } = parseContractId(contractId);
    
    const result = await callReadOnlyFunction({
      contractAddress: address,
      contractName: name,
      functionName,
      functionArgs,
      network: NETWORK,
      senderAddress: getUserAddress() || address,
    });

    return cvToJSON(result).value as T;
  } catch (error) {
    const msg = String(error);
    // Suppress noisy missing-function errors to avoid console spam on periodic polling
    if (
      msg.includes('UndefinedFunction') ||
      msg.includes('NoSuchContractFunction') ||
      msg.includes('Unchecked(UndefinedFunction')
    ) {
      return null;
    }
    console.error(`Error reading contract ${contractId}.${functionName}:`, error);
    return null;
  }
}

// Format STX amount (microSTX to STX)
export function formatSTX(microSTX: number): string {
  return (microSTX / 1_000_000).toFixed(6);
}

// Parse STX amount (STX to microSTX)
export function parseSTX(stx: string | number): number {
  return Math.floor(Number(stx) * 1_000_000);
}

// Format basis points to percentage
export function bpsToPercent(bps: number): string {
  return (bps / 100).toFixed(2);
}

// Parse percentage to basis points
export function percentToBps(percent: string | number): number {
  return Math.round(Number(percent) * 100);
}

// Fetch transaction status
export async function getTransactionStatus(txId: string) {
  try {
    const response = await fetch(`${API_URL}/extended/v1/tx/${txId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}

// Helper to check if value is uint CV
export function isUintCV(value: any): boolean {
  return value && value.type === ClarityType.UInt;
}

// Helper to extract uint value
export function extractUint(value: any): number {
  if (isUintCV(value)) {
    return Number(value.value);
  }
  return 0;
}