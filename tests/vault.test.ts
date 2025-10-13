import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

describe("vault contract", () => {
  it("returns initial state correctly", () => {
    const totalAssets = simnet.callReadOnlyFn("vault", "get-total-assets", [], deployer);
    expect(totalAssets.result).toBeOk(Cl.uint(0));

    const sharePrice = simnet.callReadOnlyFn("vault", "get-share-price", [], deployer);
    expect(sharePrice.result).toBeOk(Cl.uint(1000000));
  });

  it("allows deposit with valid allocations", () => {
    const result = simnet.callPublicFn(
      "vault",
      "deposit",
      [
        Cl.uint(10_000_000),
        Cl.tuple({
          "strategy-a": Cl.uint(3333),
          "strategy-b": Cl.uint(3333),
          "strategy-c": Cl.uint(3334),
        }),
      ],
      alice
    );

    expect(result.result).toBeOk(Cl.bool(true));

    const shares = simnet.callReadOnlyFn("vault", "get-user-shares", [Cl.principal(alice)], alice);
    expect(shares.result).toBeOk(Cl.uint(10_000_000));
  });

  it("rejects invalid allocations", () => {
    const result = simnet.callPublicFn(
      "vault",
      "deposit",
      [
        Cl.uint(10_000_000),
        Cl.tuple({
          "strategy-a": Cl.uint(3000),
          "strategy-b": Cl.uint(3000),
          "strategy-c": Cl.uint(3000),
        }),
      ],
      alice
    );

    expect(result.result).toBeErr(Cl.uint(102));
  });

  it("allows withdrawal of shares", () => {
    simnet.callPublicFn(
      "vault",
      "deposit",
      [
        Cl.uint(20_000_000),
        Cl.tuple({
          "strategy-a": Cl.uint(3333),
          "strategy-b": Cl.uint(3333),
          "strategy-c": Cl.uint(3334),
        }),
      ],
      alice
    );

    const result = simnet.callPublicFn("vault", "withdraw", [Cl.uint(10_000_000)], alice);
    expect(result.result).toBeOk(Cl.uint(10_000_000));
  });

  it("rejects excessive withdrawal", () => {
    simnet.callPublicFn(
      "vault",
      "deposit",
      [
        Cl.uint(5_000_000),
        Cl.tuple({
          "strategy-a": Cl.uint(3333),
          "strategy-b": Cl.uint(3333),
          "strategy-c": Cl.uint(3334),
        }),
      ],
      alice
    );

    const result = simnet.callPublicFn("vault", "withdraw", [Cl.uint(10_000_000)], alice);
    expect(result.result).toBeErr(Cl.uint(105));
  });

  it("allows reallocation", () => {
    simnet.callPublicFn(
      "vault",
      "deposit",
      [
        Cl.uint(10_000_000),
        Cl.tuple({
          "strategy-a": Cl.uint(3333),
          "strategy-b": Cl.uint(3333),
          "strategy-c": Cl.uint(3334),
        }),
      ],
      alice
    );

    const result = simnet.callPublicFn(
      "vault",
      "reallocate",
      [
        Cl.tuple({
          "strategy-a": Cl.uint(5000),
          "strategy-b": Cl.uint(3000),
          "strategy-c": Cl.uint(2000),
        }),
      ],
      alice
    );

    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("isolates multiple users", () => {
    simnet.callPublicFn(
      "vault",
      "deposit",
      [Cl.uint(10_000_000), Cl.tuple({ "strategy-a": Cl.uint(3333), "strategy-b": Cl.uint(3333), "strategy-c": Cl.uint(3334) })],
      alice
    );

    simnet.callPublicFn(
      "vault",
      "deposit",
      [Cl.uint(20_000_000), Cl.tuple({ "strategy-a": Cl.uint(5000), "strategy-b": Cl.uint(3000), "strategy-c": Cl.uint(2000) })],
      bob
    );

    const aliceShares = simnet.callReadOnlyFn("vault", "get-user-shares", [Cl.principal(alice)], alice);
    expect(aliceShares.result).toBeOk(Cl.uint(10_000_000));

    const bobShares = simnet.callReadOnlyFn("vault", "get-user-shares", [Cl.principal(bob)], bob);
    expect(bobShares.result).toBeOk(Cl.uint(20_000_000));
  });

  it("calculates share price after yield", () => {
    simnet.callPublicFn(
      "vault",
      "deposit",
      [Cl.uint(10_000_000), Cl.tuple({ "strategy-a": Cl.uint(3333), "strategy-b": Cl.uint(3333), "strategy-c": Cl.uint(3334) })],
      alice
    );

    simnet.callPublicFn("vault", "report-yield", [Cl.stringAscii("strategy-a"), Cl.uint(500_000)], deployer);

    const sharePrice = simnet.callReadOnlyFn("vault", "get-share-price", [], alice);
    expect(sharePrice.result).toBeOk(Cl.uint(1050000));
  });
});

