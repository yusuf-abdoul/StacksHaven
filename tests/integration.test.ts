import { uintCV, principalCV, tupleCV } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

describe("integration tests", () => {
  it("completes full deposit -> harvest -> withdraw flow", () => {
    // Deposit
    const depositResult = simnet.callPublicFn(
      "vault",
      "deposit",
      [uintCV(50_000_000), tupleCV({ "strategy-a": uintCV(3333), "strategy-b": uintCV(3333), "strategy-c": uintCV(3334) })],
      alice
    );
    expect(depositResult.result.type).toEqual('ok');
    expect(depositResult.result.valueOf()).toEqual(true);

    // Mine blocks for yield
    simnet.mineEmptyBlocks(300);

    // Harvest
    const harvestResult = simnet.callPublicFn("harvester", "harvest", [], deployer);
    expect(harvestResult.result.type).toEqual('ok');

    // Verify vault assets increased
    const totalAssets = simnet.callReadOnlyFn("vault", "get-total-assets", [], alice);
    expect(totalAssets.result.type).toEqual('ok');
    expect(totalAssets.result.valueOf()).toBeGreaterThan(50_000_000);

    // Withdraw
    const withdrawResult = simnet.callPublicFn("vault", "withdraw", [uintCV(50_000_000)], alice);
    expect(withdrawResult.result.type).toEqual('ok');
    expect(withdrawResult.result.valueOf()).toBeGreaterThan(50_000_000);
  });

  it("handles multiple users with different strategies", () => {
    simnet.callPublicFn(
      "vault",
      "deposit",
      [uintCV(20_000_000), tupleCV({ "strategy-a": uintCV(5000), "strategy-b": uintCV(4000), "strategy-c": uintCV(1000) })],
      alice
    );

    simnet.callPublicFn(
      "vault",
      "deposit",
      [uintCV(50_000_000), tupleCV({ "strategy-a": uintCV(2000), "strategy-b": uintCV(2000), "strategy-c": uintCV(6000) })],
      bob
    );

    const totalAssets = simnet.callReadOnlyFn("vault", "get-total-assets", [], deployer);
    expect(totalAssets.result.type).toEqual('ok');
    expect(totalAssets.result.valueOf()).toEqual(70000000);

    simnet.mineEmptyBlocks(300);
    const harvestResult = simnet.callPublicFn("harvester", "harvest", [], deployer);
    expect(harvestResult.result.type).toEqual('ok');
  });

  it("verifies share price increases with compounding", () => {
    simnet.callPublicFn(
      "vault",
      "deposit",
      [uintCV(100_000_000), tupleCV({ "strategy-a": uintCV(3333), "strategy-b": uintCV(3333), "strategy-c": uintCV(3334) })],
      alice
    );

    const initialPrice = simnet.callReadOnlyFn("vault", "get-share-price", [], alice);
    expect(initialPrice.result.type).toEqual('ok');
    const price0 = initialPrice.result.valueOf();

    simnet.mineEmptyBlocks(300);
    simnet.callPublicFn("harvester", "harvest", [], deployer);

    const newPrice = simnet.callReadOnlyFn("vault", "get-share-price", [], alice);
    expect(newPrice.result.type).toEqual('ok');
    const price1 = newPrice.result.valueOf();

    expect(Number(price1)).toBeGreaterThan(Number(price0));
  });

  it("syncs all frontend data correctly", () => {
    simnet.callPublicFn(
      "vault",
      "deposit",
      [uintCV(50_000_000), tupleCV({ "strategy-a": uintCV(4000), "strategy-b": uintCV(3000), "strategy-c": uintCV(3000) })],
      alice
    );

    simnet.mineEmptyBlocks(300);
    simnet.callPublicFn("harvester", "harvest", [], deployer);

    // Verify all read functions work
    const vaultAssets = simnet.callReadOnlyFn("vault", "get-total-assets", [], alice);
    const sharePrice = simnet.callReadOnlyFn("vault", "get-share-price", [], alice);
    const userShares = simnet.callReadOnlyFn("vault", "get-user-shares", [principalCV(alice)], alice);
    const stratATVL = simnet.callReadOnlyFn("strategy-a", "get-tvl", [], alice);

    expect(vaultAssets.result.type).toEqual('ok');
    expect(sharePrice.result.type).toEqual('ok');
    expect(userShares.result.type).toEqual('ok');
    expect(stratATVL.result.type).toEqual('ok');
  });
});