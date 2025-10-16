"use client";

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Settings, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronRight,
  Wallet,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Zap,
  Shield,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';
import Dashboard from '@/components/Dashboard';
import DepositForm from '@/components/DepositForm';
import WithdrawForm from '@/components/WithdrawForm';
import AllocationSliders from '@/components/AllocationSliders';
import { useWallet } from '@/hooks/useWallet';
import { useVaultData, useUserData } from '@/hooks/useVault';
import { formatSTX } from '@/lib/stacks';

type Tab = 'dashboard' | 'deposit' | 'withdraw' | 'allocate' | 'analytics' | 'settings';

export default function AppPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { stxAddress, connected } = useWallet();
  const { vaultData } = useVaultData();
  const { userData } = useUserData(stxAddress);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, current: true },
    { id: 'deposit', name: 'Deposit', icon: DollarSign, current: false },
    { id: 'withdraw', name: 'Withdraw', icon: TrendingUp, current: false },
    { id: 'allocate', name: 'Allocate', icon: Target, current: false },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, current: false },
    { id: 'settings', name: 'Settings', icon: Settings, current: false },
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'deposit':
        return <DepositForm />;
      case 'withdraw':
        return <WithdrawForm />;
      case 'allocate':
        return <AllocationSliders />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-indigo-950">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'} 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        z-50 w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 
        transition-transform duration-300 ease-in-out
        flex flex-col h-full
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">StacksHaven</h1>
                <p className="text-xs text-purple-300">Yield Dashboard</p>
              </div>
            </div>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {connected ? stxAddress?.slice(2, 4).toUpperCase() : '??'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {connected ? formatAddress(stxAddress || '') : 'Not Connected'}
              </p>
              <p className="text-xs text-purple-300">
                {userData ? `${userData.balance.toFixed(4)} STX` : '0 STX'}
              </p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                if (isMobile) setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200
                ${activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-purple-300 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
              {activeTab === item.id && (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Auto-Harvest</p>
                <p className="text-xs text-purple-300">Active</p>
              </div>
            </div>
            <div className="text-xs text-purple-300">
              Next harvest: ~2h 34m
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-white capitalize">
                  {navigation.find(item => item.id === activeTab)?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-purple-300">
                  {activeTab === 'dashboard' && 'Overview of your yield farming portfolio'}
                  {activeTab === 'deposit' && 'Add funds to your vault'}
                  {activeTab === 'withdraw' && 'Withdraw your funds'}
                  {activeTab === 'allocate' && 'Manage your strategy allocations'}
                  {activeTab === 'analytics' && 'Detailed analytics and insights'}
                  {activeTab === 'settings' && 'Account and app settings'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-purple-300" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-white placeholder-purple-300 outline-none text-sm w-32"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors relative">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white">Live</span>
                </div>
                <div className="text-purple-300">
                  TVL: {vaultData ? formatSTX(vaultData.tvl) : '0'} STX
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-950">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

// Analytics View Component
function AnalyticsView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Performance Overview</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-purple-300">Live Data</span>
            </div>
          </div>
          <div className="h-64 bg-white/5 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-2" />
              <p className="text-purple-300">Performance Chart</p>
              <p className="text-xs text-purple-400">Coming Soon</p>
            </div>
          </div>
        </div>

        {/* Strategy Breakdown */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Strategy Breakdown</h3>
          <div className="space-y-4">
            {[
              { name: 'sBTC Staking', value: 45, color: 'bg-blue-500' },
              { name: 'STX Lending', value: 30, color: 'bg-green-500' },
              { name: 'Liquidity Pool', value: 25, color: 'bg-purple-500' }
            ].map((strategy, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">{strategy.name}</span>
                  <span className="text-white">{strategy.value}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className={`${strategy.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${strategy.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'Yield Harvested', amount: '+0.025 STX', time: '2h ago', type: 'positive' },
            { action: 'Strategy A Rebalanced', amount: '+2.3%', time: '4h ago', type: 'neutral' },
            { action: 'Deposit', amount: '+10 STX', time: '1d ago', type: 'positive' },
            { action: 'Auto-compound', amount: '+0.018 STX', time: '2d ago', type: 'positive' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activity.type === 'positive' ? 'bg-green-500/20' : 
                  activity.type === 'negative' ? 'bg-red-500/20' : 'bg-blue-500/20'
                }`}>
                  {activity.type === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                  ) : activity.type === 'negative' ? (
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  ) : (
                    <Activity className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{activity.action}</p>
                  <p className="text-xs text-purple-300">{activity.time}</p>
                </div>
              </div>
              <div className={`font-semibold ${
                activity.type === 'positive' ? 'text-green-400' : 
                activity.type === 'negative' ? 'text-red-400' : 'text-blue-400'
              }`}>
                {activity.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Settings View Component
function SettingsView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Auto-Harvest</p>
                <p className="text-xs text-purple-300">Automatically compound yields</p>
              </div>
              <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Notifications</p>
                <p className="text-xs text-purple-300">Get notified of important events</p>
              </div>
              <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Risk Management</p>
                <p className="text-xs text-purple-300">Auto-rebalance on risk threshold</p>
              </div>
              <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
          </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Security</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl">
              <Shield className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-white font-medium">Wallet Connected</p>
                <p className="text-xs text-purple-300">Stacks Wallet</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl">
              <Globe className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-white font-medium">Network</p>
                <p className="text-xs text-purple-300">Stacks Mainnet</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl">
              <Users className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-white font-medium">Multi-sig</p>
                <p className="text-xs text-purple-300">Not configured</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Advanced Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left">
            <h4 className="text-white font-medium mb-1">Gas Optimization</h4>
            <p className="text-xs text-purple-300">Configure transaction fees</p>
          </button>
          <button className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left">
            <h4 className="text-white font-medium mb-1">API Keys</h4>
            <p className="text-xs text-purple-300">Manage external integrations</p>
          </button>
          <button className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left">
            <h4 className="text-white font-medium mb-1">Export Data</h4>
            <p className="text-xs text-purple-300">Download transaction history</p>
          </button>
        </div>
      </div>
    </div>
  );
}