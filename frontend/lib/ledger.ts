// Simple local ledger to track deposits and withdrawals per user (microSTX)
// This avoids requiring new contract endpoints and supports earnings calculation in the UI.

type Ledger = {
  deposited: number; // microSTX
  withdrawn: number; // microSTX
};

function key(address: string) {
  return `haven:ledger:${address}`;
}

export function getLedger(address: string | null): Ledger {
  if (!address) return { deposited: 0, withdrawn: 0 };
  try {
    const raw = localStorage.getItem(key(address));
    if (!raw) return { deposited: 0, withdrawn: 0 };
    const parsed = JSON.parse(raw);
    return {
      deposited: Number(parsed?.deposited || 0),
      withdrawn: Number(parsed?.withdrawn || 0),
    };
  } catch {
    return { deposited: 0, withdrawn: 0 };
  }
}

export function updateLedger(address: string | null, deltaDeposit: number, deltaWithdraw: number) {
  if (!address) return;
  const curr = getLedger(address);
  const next: Ledger = {
    deposited: Math.max(0, curr.deposited + (deltaDeposit || 0)),
    withdrawn: Math.max(0, curr.withdrawn + (deltaWithdraw || 0)),
  };
  localStorage.setItem(key(address), JSON.stringify(next));
}

export function resetLedger(address: string | null) {
  if (!address) return;
  localStorage.removeItem(key(address));
}