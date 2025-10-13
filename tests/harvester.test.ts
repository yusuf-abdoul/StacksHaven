import { uintCV, boolCV, principalCV, tupleCV } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

describe("harvester contract", () => {
  it("has deployer authorized by default", () => {
    const result = simnet.callReadOnlyFn("harvester", "is-authorized", [principalCV(deployer)], deployer);
    expect(result.result).toEqual({ type: 'true' });
  });

  it("allows adding harvester", () => {
    const result = simnet.callPublicFn("harvester", "add-harvester", [principalCV(alice)], deployer);
    expect(result.result).toEqual({ type: 'ok', value: { type: 'true' } });

    const isAuth = simnet.callReadOnlyFn("harvester", "is-authorized", [principalCV(alice)], deployer);
    expect(isAuth.result).toEqual({ type: 'true' });
  });

  it("rejects unauthorized harvest", () => {
    const result = simnet.callPublicFn("harvester", "harvest", [], alice);
    expect(result.result.type).toEqual('err');
    expect(result.result).toEqual({ type: 'err', value: { type: 'uint', value: 300n } });
  });

  it("harvests from all strategies successfully", () => {
    simnet.callPublicFn(
      "vault",
      "deposit",
      [uintCV(30_000_000), tupleCV({ "strategy-a": uintCV(3333), "strategy-b": uintCV(3333), "strategy-c": uintCV(3334) })],
      alice
    );

    simnet.mineEmptyBlocks(300);

    const result = simnet.callPublicFn("harvester", "harvest", [], deployer);
    expect(result.result.type).toEqual('ok');
  });

  it("calculates 2% performance fee", () => {
    simnet.callPublicFn(
      "vault",
      "deposit",
      [uintCV(30_000_000), tupleCV({ "strategy-a": uintCV(3333), "strategy-b": uintCV(3333), "strategy-c": uintCV(3334) })],
      alice
    );

    simnet.mineEmptyBlocks(300);

    const result = simnet.callPublicFn("harvester", "harvest", [], deployer);
    const resultData = result.result.valueOf() as any;

    const totalRewards = Number(resultData.data["total-rewards"].value);
    const fee = Number(resultData.data["fee"].value);

    expect(fee).toBe(Math.floor(totalRewards * 0.02));
  });

  it("allows claiming fees", () => {
    simnet.callPublicFn(
      "vault",
      "deposit",
      [uintCV(30_000_000), tupleCV({ "strategy-a": uintCV(3333), "strategy-b": uintCV(3333), "strategy-c": uintCV(3334) })],
      alice
    );

    simnet.mineEmptyBlocks(300);
    const harvestResult = simnet.callPublicFn("harvester", "harvest", [], deployer);
    const fee = Number((harvestResult.result.valueOf() as any).data["fee"].valueOf());

    const claimResult = simnet.callPublicFn("harvester", "claim-fees", [principalCV(bob), uintCV(fee)], deployer);
    expect(claimResult.result).toEqual({ type: 'ok', value: { type: 'true' } });
  });
});