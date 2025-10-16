#  YieldHaven — Maximize Your DeFi Returns on Stacks

> _The Yearn Finance of the Stacks ecosystem — a yield aggregator that automates DeFi strategies for optimal yield._

![YieldHaven Logo](./assets/logo.png)

---

## 🚀 Overview

**YieldHaven** is a **decentralized yield aggregator** built on the **Stacks blockchain**, designed to help users maximize returns from DeFi protocols such as **ALEX**, **Arkadiko**, and **Stackswap**.  
It simplifies yield farming by pooling users’ STX deposits into a **Vault**, which automatically allocates capital across multiple **strategies** to generate optimized returns.

By abstracting away the complexity of manual DeFi management, YieldHaven allows users to:
- Deposit STX once.
- Automatically compound and rebalance yield daily.
- Track performance, earnings, and strategy allocations in real time.

---

## 🧩 Core Architecture

| Component | Description |
|------------|--------------|
| **Vault Contract** | Manages user deposits, minting shares that represent ownership in the vault. Handles withdrawals and share accounting. |
| **Harvester Contract** | Collects and compounds rewards from active strategies. Updates the vault’s share price based on realized yield. |
| **Strategy Contracts (A, B, C)** | Simulate or connect to real DeFi opportunities — staking, lending, or liquidity provision — and report APY data to the Vault. |
| **Frontend (React + Clarity SDK)** | User dashboard to deposit/withdraw, view APY, allocations, and earnings in STX. |
| **API Layer / Oracle (future update) | Fetches real-time strategy data (APY, TVL, protocol health) for accurate yield distribution. |

---

## ⚙️ How It Works

1. **Deposit:**  
   Users deposit STX into the **Vault** and receive vault shares.

2. **Allocation:**  
   The **Vault** automatically distributes capital across multiple **strategies** based on predefined weights or dynamic optimization.

3. **Harvesting:**  
   The **Harvester** periodically collects rewards, compounds them, and updates the **share price**.

4. **Withdrawal:**  
   Users can redeem shares at any time, receiving their principal plus accrued yield.

---

## 🧮 APY Simulation

For the hackathon MVP:
- Each strategy (A, B, C) simulates yield growth by incrementing share price every **12 hours**.
- Future versions will integrate with live Stacks protocols (ALEX, Arkadiko, Stackswap) for real on-chain yields.

---

## 🛠 Tech Stack

- **Smart Contracts:** Clarity (Stacks)  
- **Frontend:** React + TypeScript + TailwindCSS  
- **Blockchain Interaction:** Ledger Wallet, Stacks.js, Clarinet  
- **Testing:** Clarinet 
- **Deployment:** Stacks Testnet  

---

## 🧪 Local Development

### Prerequisites
- [Clarinet](https://github.com/hirosystems/clarinet)
- Node.js v18+
- npm or yarn

### Steps 

```bash
# Clone the repository
git clone https://github.com/YieldHaven/yieldhaven.git
cd yieldhaven

# Install dependencies
npm install

# Run Clarinet tests
clarinet test

# Deploy contracts to localnet or testnet
clarinet integrate
