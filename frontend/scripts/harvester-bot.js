#!/usr/bin/env node

/**
 * YieldHaven Harvester Bot
 * 
 * Automatically harvests rewards from strategies and reinvests them.
 * Run with: node scripts/harvester-bot.js
 * 
 * Environment variables required:
 * - HARVESTER_PRIVATE_KEY: Private key for bot wallet
 * - HARVESTER_CONTRACT: Full contract ID (address.name)
 * - NETWORK: 'mainnet' or 'testnet'
 */

const {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
} = require('@stacks/transactions');
const { StacksTestnet, StacksMainnet } = require('@stacks/network');

// Configuration
const NETWORK_TYPE = process.env.NETWORK || 'testnet';
const NETWORK = NETWORK_TYPE === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
const HARVESTER_CONTRACT = process.env.HARVESTER_CONTRACT || '';
const PRIVATE_KEY = process.env.HARVESTER_PRIVATE_KEY || '';
const CHECK_INTERVAL = 3600000; // 1 hour in ms

if (!HARVESTER_CONTRACT || !PRIVATE_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('   HARVESTER_CONTRACT and HARVESTER_PRIVATE_KEY must be set');
  process.exit(1);
}

const [contractAddress, contractName] = HARVESTER_CONTRACT.split('.');

async function canHarvest() {
  try {
    const response = await fetch(
      `${NETWORK.coreApiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/can-harvest`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: contractAddress,
          arguments: [],
        }),
      }
    );

    const data = await response.json();
    return data.result === 'true' || data.okay === true;
  } catch (error) {
    console.error('Error checking harvest status:', error.message);
    return false;
  }
}

async function executeHarvest() {
  console.log('🌾 Executing harvest...');

  try {
    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'harvest-all',
      functionArgs: [],
      senderKey: PRIVATE_KEY,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 50000, // 0.05 STX
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, NETWORK);

    console.log('✅ Harvest transaction broadcast!');
    console.log(`   TX ID: ${result.txid}`);
    console.log(`   Explorer: ${NETWORK.coreApiUrl.replace('/v2', '')}/txid/${result.txid}`);

    return result;
  } catch (error) {
    console.error('❌ Harvest failed:', error.message);
    return null;
  }
}

async function runHarvestCycle() {
  console.log('\n' + '='.repeat(60));
  console.log(`🤖 Harvest Bot Check - ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  const canHarvestNow = await canHarvest();

  if (!canHarvestNow) {
    console.log('⏳ Cannot harvest yet - minimum interval not reached');
    return;
  }

  console.log('✓ Harvest available - executing...');
  await executeHarvest();
}

async function main() {
  console.log('🚀 Starting YieldHaven Harvester Bot');
  console.log(`   Network: ${NETWORK_TYPE}`);
  console.log(`   Contract: ${HARVESTER_CONTRACT}`);
  console.log(`   Check interval: ${CHECK_INTERVAL / 1000 / 60} minutes\n`);

  // Run initial check
  await runHarvestCycle();

  // Schedule periodic checks
  setInterval(runHarvestCycle, CHECK_INTERVAL);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down harvester bot...');
  process.exit(0);
});

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Create .env file:
 *    HARVESTER_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.harvester
 *    HARVESTER_PRIVATE_KEY=your_private_key_here
 *    NETWORK=testnet
 * 
 * 2. Install dependencies:
 *    npm install @stacks/transactions @stacks/network
 * 
 * 3. Run the bot:
 *    node scripts/harvester-bot.js
 * 
 * 4. For production (run as service):
 *    # Using PM2
 *    pm2 start scripts/harvester-bot.js --name yieldhaven-harvester
 *    pm2 save
 *    pm2 startup
 * 
 *    # Or using systemd (Linux)
 *    Create /etc/systemd/system/yieldhaven-harvester.service
 * 
 * 5. For GitHub Actions (automated):
 *    - Add HARVESTER_PRIVATE_KEY to GitHub Secrets
 *    - Create .github/workflows/harvest.yml with schedule trigger
 *    - Run bot on cron (e.g., every hour)
 */