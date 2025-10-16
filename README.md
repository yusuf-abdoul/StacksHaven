#  YieldHaven — The Yearn Finance of the Stacks Ecosystem

> **Automated yield aggregation built on Stacks — empowering users to earn more from Bitcoin-backed DeFi.**

![YieldHaven Logo](./assets/logo.png)

---

##  Problem Statement

DeFi on Stacks is growing, with protocols like **ALEX**, **Arkadiko**, and **Stackswap** offering various yield opportunities.  
However, users face key challenges:

- **Fragmented yield sources:** Users must manually move funds between multiple protocols.  
- **Complex strategy management:** Compounding rewards and tracking APY requires technical knowledge.  
- **Inefficient capital use:** Idle liquidity results in lower returns.  

###  The Problem:
> Most Stacks DeFi users miss out on optimal yield due to fragmentation, manual management, and lack of automation.

---

##  Our Solution — YieldHaven

**YieldHaven** is a **yield aggregator** built on the **Stacks blockchain**, designed to **automatically optimize returns** across Stacks-based DeFi protocols.

Users simply:
1. Deposit STX into the **Vault**  
2. The Vault allocates funds across **multiple strategies (staking, lending, LPs)**  
3. The **Harvester** periodically compounds and updates yield  
4. Users withdraw anytime, earning maximized returns  

> Think of it as *“one-click yield optimization for the Bitcoin economy.”*

---

##  Evidence of Real User Need

### Current Pain Points:
- Manual yield tracking across different platforms (ALEX, Arkadiko, Stackswap)  
- High learning curve for new users entering DeFi  
- Missed rewards due to lack of automation  

###  What Users Want:
- Simplicity → *“I just want to earn yield easily.”*  
- Automation → *“I don’t want to move funds every week.”*  
- Transparency → *“I want to see my performance and APY clearly.”*  

**YieldHaven** addresses these directly — giving both new and experienced users a **single, transparent dashboard** for yield aggregation.

---

## Fit and Relevance to Bitcoin / Stacks Ecosystem

- Built **natively on Stacks**, secured by **Bitcoin finality**  
- Integrates with existing DeFi protocols (ALEX, Arkadiko, etc.)  
- Utilizes **Clarity smart contracts** for transparent and auditable yield logic  
- Promotes **Bitcoin utility** through stacking, lending, and liquidity participation  

> YieldHaven bridges liquidity and simplicity — helping more users earn yield on Bitcoin-backed assets through Stacks.

---

##  Technical Architecture

| Component | Description |
|------------|--------------|
| **Vault Contract** | Receives STX deposits, mints user shares, and manages withdrawals. |
| **Harvester Contract** | Collects rewards, compounds them, and updates vault share price. |
| **Strategy Contracts** | Simulate staking/lending/LP rewards; later integrate with real DeFi protocols. |
| **Frontend Dashboard** | React interface for deposits, withdrawals, and real-time yield tracking. |

###  Early Technical Feasibility
- ✅ Functional Clarity contracts for Vault, Harvester, and Mock Strategies  
- ✅ Working test deployments via **Clarinet**  
- ✅ Frontend integrated with **Stacks.js** wallet  
- ✅ Simulated APY logic every 12 hours to mimic yield compounding  

---

##  Getting Started

### Prerequisites
- [Clarinet](https://github.com/hirosystems/clarinet)
- Node.js v18+
- npm or yarn

### Setup

```bash
git clone https://github.com/YieldHaven/yieldhaven.git
cd yieldhaven
npm install
clarinet test
npm run dev
