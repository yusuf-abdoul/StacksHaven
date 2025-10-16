"use client";

import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import DepositForm from '@/components/DepositForm';
import WithdrawForm from '@/components/WithdrawForm';
import AllocationSliders from '@/components/AllocationSliders';

type Tab = 'dashboard' | 'deposit' | 'withdraw' | 'allocate';

export default function AppPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-2 bg-white/5 p-1 rounded-lg w-fit">
        {(['dashboard', 'deposit', 'withdraw', 'allocate'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-medium transition-all capitalize ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'deposit' && <DepositForm />}
        {activeTab === 'withdraw' && <WithdrawForm />}
        {activeTab === 'allocate' && <AllocationSliders />}
      </div>
    </div>
  );
}