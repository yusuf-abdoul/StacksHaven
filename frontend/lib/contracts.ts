import {
    uintCV,
    tupleCV,
    principalCV,
    PostConditionMode,
    AnchorMode,
    makeStandardSTXPostCondition,
    FungibleConditionCode,
    broadcastTransaction,
    TxBroadcastResult,
    callReadOnlyFunction,
    cvToJSON,
    stringAsciiCV,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { NETWORK, CONTRACTS, parseContractId } from './config';
import { readContract, getUserAddress, parseSTX } from './stacks';
import { getLedger, updateLedger } from './ledger';
import type { StrategyAllocation, VaultData, UserData } from '@/types';

// ============================================
// VAULT CONTRACT INTERACTIONS
// ============================================

export async function getVaultData(): Promise<VaultData | null> {
    try {
        const [totalSharesCV, totalAssetsCV, sharePriceCV] = await Promise.all([
            readContract<any>(CONTRACTS.vault, 'get-total-shares'),
            readContract<any>(CONTRACTS.vault, 'get-total-assets'),
            readContract<any>(CONTRACTS.vault, 'get-share-price'),
        ]);

        if (totalSharesCV === null || totalAssetsCV === null || sharePriceCV === null) return null;

        const totalShares = totalSharesCV?.value ? Number(totalSharesCV.value) : Number(totalSharesCV);
        const totalAssets = totalAssetsCV?.value ? Number(totalAssetsCV.value) : Number(totalAssetsCV);
        const sharePriceRaw = sharePriceCV?.value ? Number(sharePriceCV.value) : Number(sharePriceCV);
        const sharePrice = sharePriceRaw / 1_000_000; // convert to STX per share

        return {
            tvl: totalAssets,
            totalShares,
            sharePrice,
            totalUsers: 0,
        };
    } catch (error) {
        console.error('Error fetching vault data:', error);
        return null;
    }
}

export async function getUserVaultData(userAddress: string): Promise<UserData | null> {
    try {
        const [sharesCV, allocationsCV, depositedCV, withdrawnCV] = await Promise.all([
            readContract<any>(CONTRACTS.vault, 'get-user-shares', [principalCV(userAddress)]),
            readContract<any>(CONTRACTS.vault, 'get-user-allocation', [principalCV(userAddress)]),
            readContract<any>(CONTRACTS.vault, 'get-user-deposited', [principalCV(userAddress)]),
            readContract<any>(CONTRACTS.vault, 'get-user-withdrawn', [principalCV(userAddress)]),
        ]);

        if (sharesCV === null) return null;

        const sharesRaw = typeof sharesCV === 'number' ? sharesCV : (sharesCV?.value ? Number(sharesCV.value) : 0);
        // Share price in STX per share
        const vaultData = await getVaultData();
        const sharePrice = vaultData?.sharePrice ?? 1; // STX per share
        // Compute balance using on-chain formula: amount = shares * sharePrice_raw / 1e6
        // Since sharePrice here is STX per share, balance(STX) = (sharesRaw * sharePrice) / 1e6
        const balance = (sharesRaw * sharePrice) / 1_000_000;
        // Human-readable shares for UI (1e6 micro-shares per share)
        const shares = sharesRaw / 1_000_000;

        // On-chain user totals (microSTX -> STX)
        let depositedRaw = typeof depositedCV === 'number' ? depositedCV : (depositedCV?.value ? Number(depositedCV.value) : 0);
        let withdrawnRaw = typeof withdrawnCV === 'number' ? withdrawnCV : (withdrawnCV?.value ? Number(withdrawnCV.value) : 0);
        // Fallback to local ledger if on-chain endpoints are absent on deployed contract
        if ((depositedCV === null && withdrawnCV === null) || (depositedRaw === 0 && withdrawnRaw === 0)) {
            const ledger = getLedger(userAddress);
            depositedRaw = ledger.deposited;
            withdrawnRaw = ledger.withdrawn;
        }
        const deposited = depositedRaw / 1_000_000;
        const withdrawn = withdrawnRaw / 1_000_000;
        const earnings = Math.max(0, balance + withdrawn - deposited);

        // Extract allocations from tuple JSON (readContract returns cvToJSON(result).value)
        const allocData = allocationsCV?.value || {};
        const strategyA = allocData['strategy-a']?.value ? Number(allocData['strategy-a'].value) : 0;
        const strategyB = allocData['strategy-b']?.value ? Number(allocData['strategy-b'].value) : 0;
        const strategyC = allocData['strategy-c']?.value ? Number(allocData['strategy-c'].value) : 0;

        return {
            balance,
            shares,
            deposited,
            earnings,
            allocations: {
                strategyA,
                strategyB,
                strategyC,
            },
        };
    } catch (error) {
        console.error('Error fetching user vault data:', error);
        return null;
    }
}

export async function depositToVault(
    amount: number,
    allocations: StrategyAllocation
): Promise<void> {
    const userAddress = getUserAddress();
    if (!userAddress) throw new Error('Wallet not connected');

    const { address, name } = parseContractId(CONTRACTS.vault);

    // Post condition: user must transfer exact amount
    const postConditions = [
        makeStandardSTXPostCondition(
            userAddress,
            FungibleConditionCode.Equal,
            amount
        ),
    ];

    await new Promise<void>((resolve, reject) => {
        openContractCall({
            contractAddress: address,
            contractName: name,
            functionName: 'deposit',
            functionArgs: [
                uintCV(amount),
                tupleCV({
                    'strategy-a': uintCV(allocations.strategyA),
                    'strategy-b': uintCV(allocations.strategyB),
                    'strategy-c': uintCV(allocations.strategyC),
                }),
            ],
            postConditions,
            postConditionMode: PostConditionMode.Deny,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            onFinish: () => {
                // Update local ledger as a fallback for UIs when on-chain endpoints are unavailable
                updateLedger(userAddress, amount, 0);
                resolve();
            },
            onCancel: () => {
                reject(new Error('Transaction cancelled'));
            },
        });
    });
}

export async function withdrawFromVault(shares: number): Promise<void> {
    const userAddress = getUserAddress();
    if (!userAddress) throw new Error('Wallet not connected');

    const { address, name } = parseContractId(CONTRACTS.vault);

    // Approximate withdraw amount from current share price
    const vaultData = await getVaultData();
    const sharePrice = vaultData?.sharePrice ?? 1; // STX per share

    await new Promise<void>((resolve, reject) => {
        openContractCall({
            contractAddress: address,
            contractName: name,
            functionName: 'withdraw',
            functionArgs: [uintCV(shares)],
            postConditionMode: PostConditionMode.Allow,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            onFinish: () => {
                // Approximate withdrawn microSTX using current share price for local ledger fallback
                const withdrawnMicroSTX = Math.floor(shares * sharePrice);
                updateLedger(userAddress, 0, withdrawnMicroSTX);
                resolve();
            },
            onCancel: () => {
                reject(new Error('Transaction cancelled'));
            },
        });
    });

}

export async function reallocateStrategy(
    allocations: StrategyAllocation
): Promise<void> {
    const userAddress = getUserAddress();
    if (!userAddress) throw new Error('Wallet not connected');

    const { address, name } = parseContractId(CONTRACTS.vault);

    await new Promise<void>((resolve, reject) => {
        openContractCall({
            contractAddress: address,
            contractName: name,
            functionName: 'reallocate',
            functionArgs: [
                tupleCV({
                    'strategy-a': uintCV(allocations.strategyA),
                    'strategy-b': uintCV(allocations.strategyB),
                    'strategy-c': uintCV(allocations.strategyC),
                }),
            ],
            postConditionMode: PostConditionMode.Allow,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            onFinish: () => resolve(),
            onCancel: () => reject(new Error('Transaction cancelled')),
        });
    });

}

// ============================================
// STRATEGY CONTRACT INTERACTIONS
// ============================================

export async function getStrategyBalance(
    strategyContract: string,
    strategyId: string
): Promise<number> {
    try {
        const { address, name } = parseContractId(CONTRACTS.vault);
        const result = await callReadOnlyFunction({
            contractAddress: address,
            contractName: name,
            functionName: 'get-strategy-balance',
            functionArgs: [stringAsciiCV(strategyId)],
            network: NETWORK,
            senderAddress: getUserAddress() || address,
        });
        const json = cvToJSON(result);
        const inner = json?.value;
        const balance = typeof inner === 'number' ? inner : (inner?.value ? Number(inner.value) : 0);
        return balance || 0;
    } catch (_) {
        // Silently fall back when function is unavailable on deployed contract
        return 0;
    }
}

// ============================================
// HARVESTER CONTRACT INTERACTIONS
// ============================================

export async function getHarvestInfo() {
    try {
        const info = await readContract<any>(CONTRACTS.harvester, 'get-harvest-info');
        return info;
    } catch (error) {
        console.error('Error fetching harvest info:', error);
        return null;
    }
}

export async function canHarvest(): Promise<boolean> {
    try {
        const result = await readContract<boolean>(CONTRACTS.harvester, 'can-harvest');
        return result || false;
    } catch (error) {
        console.error('Error checking harvest status:', error);
        return false;
    }
}

// Helper: stringAsciiCV for strategy IDs (imported above)