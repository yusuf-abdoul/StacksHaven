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
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { NETWORK, CONTRACTS, parseContractId } from './config';
import { readContract, getUserAddress, parseSTX } from './stacks';
import type { StrategyAllocation, VaultData, UserData } from '@/types';

// ============================================
// VAULT CONTRACT INTERACTIONS
// ============================================

export async function getVaultData(): Promise<VaultData | null> {
    try {
        const [totalShares, totalAssets] = await Promise.all([
            readContract<number>(CONTRACTS.vault, 'get-total-shares'),
            readContract<number>(CONTRACTS.vault, 'get-total-assets'),
        ]);

        if (totalShares === null || totalAssets === null) return null;

        const sharePrice = totalShares > 0 ? totalAssets / totalShares : 1;

        return {
            tvl: totalAssets,
            totalShares,
            sharePrice,
            totalUsers: 0, // Could be tracked separately
        };
    } catch (error) {
        console.error('Error fetching vault data:', error);
        return null;
    }
}

export async function getUserVaultData(userAddress: string): Promise<UserData | null> {
    try {
        // const [shares, allocations] = await Promise.all([
        //     readContract<number>(CONTRACTS.vault, 'get-user-shares', [
        //         principalCV(userAddress),
        //     ]),
        //     readContract<any>(CONTRACTS.vault, 'get-user-allocation', [
        //         principalCV(userAddress),
        //     ]),
        // ]);
        const [sharesResult, allocationsResult] = await Promise.all([
            readContract<any>(CONTRACTS.vault, 'get-user-shares', [
                principalCV(userAddress),
            ]),
            readContract<any>(CONTRACTS.vault, 'get-user-allocation', [
                principalCV(userAddress),
            ]),
        ]);
        const shares = sharesResult?.value ? Number(sharesResult.value) : 0;
        if (shares === null) return null;

        const vaultData = await getVaultData();
        const balance = vaultData ? (shares * vaultData.sharePrice) / 1_000_000 : shares / 1_000_000;

        // Extract allocations from tuple
        const allocs = allocationsResult?.value?.data || {};
        const strategyA = allocs['strategy-a']?.value ? Number(allocs['strategy-a'].value) : 0;
        const strategyB = allocs['strategy-b']?.value ? Number(allocs['strategy-b'].value) : 0;
        const strategyC = allocs['strategy-c']?.value ? Number(allocs['strategy-c'].value) : 0;

        return {
            //     balance,
            //     shares,
            //     deposited: 0, // Track separately or calculate from history
            //     earnings: 0, // Calculate from share price appreciation
            //     allocations: allocations || {
            //         strategyA: 0,
            //         strategyB: 0,
            //         strategyC: 0,
            //     },
            // };
            balance: balance,
            shares: shares / 1_000_000, // Convert to STX
            deposited: balance, // Approximate for now
            earnings: balance - (shares / 1_000_000), // Share price appreciation
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
) {
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

    await openContractCall({
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
    });

}

export async function withdrawFromVault(shares: number) {
    const userAddress = getUserAddress();
    if (!userAddress) throw new Error('Wallet not connected');

    const { address, name } = parseContractId(CONTRACTS.vault);

    await openContractCall({
        contractAddress: address,
        contractName: name,
        functionName: 'withdraw',
        functionArgs: [uintCV(shares)],
        postConditionMode: PostConditionMode.Allow,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
    });


}

export async function reallocateStrategy(
    allocations: StrategyAllocation
) {
    const userAddress = getUserAddress();
    if (!userAddress) throw new Error('Wallet not connected');

    const { address, name } = parseContractId(CONTRACTS.vault);

    await openContractCall({
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
        const balance = await readContract<number>(
            CONTRACTS.vault,
            'get-strategy-balance',
            [stringAsciiCV(strategyId)]
        );
        return balance || 0;
    } catch (error) {
        console.error(`Error fetching strategy ${strategyId} balance:`, error);
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

// Helper: stringAsciiCV for strategy IDs
import { stringAsciiCV } from '@stacks/transactions';