"use client";

import Link from 'next/link';

export default function HomeHero() {
  return (
    <div className="max-w-4xl mx-auto text-center space-y-6">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
        YieldHaven — Automated Yield Aggregator on Stacks
      </h1>
      <p className="text-lg text-purple-200">
        Deposit STX, allocate across multiple strategies, and earn yield as your
        vault shares grow. Transparent on-chain accounting for deposits, withdrawals,
        allocations, and earnings.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/app"
          className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
        >
          Launch App
        </Link>
        <a
          href="https://docs.hiro.so/stacks"
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20"
        >
          Learn More
        </a>
      </div>
    </div>
  );
}