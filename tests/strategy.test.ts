import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const alice = accounts.get("wallet_1")!;

describe("strategy-a contract", () => {
  it("allows deposit and updates TVL", () => {
    const result = simnet.callPublicFn("strategy-a", "deposit", [Cl.uint(5_000_000)], alice);
    expect(result.result).toBeOk(Cl.bool(true));

    const tvl = simnet.callReadOnlyFn("strategy-a", "get-tvl", [], alice);
    expect(tvl.result).toBeOk(Cl.uint(5_000_000));
  });

  it("generates yield after harvest interval", () => {
    simnet.callPublicFn("strategy-a", "deposit", [Cl.uint(10_000_000)], alice);
    simnet.mineEmptyBlocks(150);

    const result = simnet.callPublicFn("strategy-a", "harvest", [], alice);
    expect(result.result).toBeOk(Cl.uint(800_000));
  });

  it("returns zero yield before interval", () => {
    simnet.callPublicFn("strategy-a", "deposit", [Cl.uint(10_000_000)], alice);
    
    const result = simnet.callPublicFn("strategy-a", "harvest", [], alice);
    expect(result.result).toBeOk(Cl.uint(0));
  });
});

describe("strategy-b contract", () => {
  it("generates 6.5% APY yield", () => {
    simnet.callPublicFn("strategy-b", "deposit", [Cl.uint(10_000_000)], alice);
    simnet.mineEmptyBlocks(80);

    const result = simnet.callPublicFn("strategy-b", "harvest", [], alice);
    expect(result.result).toBeOk(Cl.uint(650_000));
  });
});

describe("strategy-c contract", () => {
  it("generates 12% APY yield (highest)", () => {
    simnet.callPublicFn("strategy-c", "deposit", [Cl.uint(10_000_000)], alice);
    simnet.mineEmptyBlocks(300);

    const result = simnet.callPublicFn("strategy-c", "harvest", [], alice);
    expect(result.result).toBeOk(Cl.uint(1_200_000));
  });
});