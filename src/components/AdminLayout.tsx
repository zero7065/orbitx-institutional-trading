import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, TrendingUp, Wallet, ArrowUpRight,
  ShieldCheck, Bell, Settings, FileText, BarChart3, Menu, X, LogOut, ChevronLeft, ChevronRight, CreditCard,
  Activity, Gift, Monitor, Headphones, ArrowLeftRight
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  platformName?: string;
}

const navSections = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
      { label: 'Users', icon: Users, path: '/admin/users' },
      { label: 'Crypto Networks', icon: Wallet, path: '/admin/crypto-networks' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { label: 'Depos/Withdraws', icon: ArrowLeftRight, path: '/admin/depots-withdraws' },
      { label: 'Investment Plans', icon: TrendingUp, path: '/admin/investment-plans' },
      { label: 'Payment Methods', icon: CreditCard, path: '/admin/payment-methods' },
    ]
  },
  {
    label: 'Management',
    items: [
      { label: 'KYC Reviews', icon: ShieldCheck, path: '/admin/kyc' },
      { label: 'Support Tickets', icon: FileText, path: '/admin/support-tickets' },
      { label: 'Announcements', icon: Bell, path: '/admin/announcements' },
      { label: 'Platform Settings', icon: Settings, path: '/admin/settings' },
    ]
  },
  {
    label: 'Monitoring',
    items: [
      { label: 'User Sessions', icon: Monitor, path: '/admin/sessions' },
      { label: 'Swap Items', icon: Gift, path: '/admin/swap-items' },
    ]
  }
];

export default function AdminLayout({ children, onLogout, platformName }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0B0E11] text-gray-200 flex">
      <aside className={`${collapsed ? 'w-20' : 'w-72'} border-r border-white/5 bg-[#0B0E11] flex flex-col shrink-0 transition-all duration-300 min-h-screen sticky top-0 h-screen`}>
        <div className="p-6 flex items-center gap-4 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-black text-sm tracking-tight text-white uppercase">{platformName || 'OrbitX'}</span>
              <div className="text-[8px] text-purple-400 font-black uppercase tracking-widest">Admin Terminal</div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <div className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] px-3 mb-2">{section.label}</div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[13px] ${
                        isActive
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white font-medium'
                      }`}
                      title={collapsed ? item.label : ''}
                    >
                      <item.icon size={20} className="shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all font-medium text-[13px]">
            <ChevronLeft size={20} className="shrink-0" />
            {!collapsed && <span>Back to Dashboard</span>}
          </Link>
          <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium text-[13px] w-full">
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="flex items-center justify-center px-3 py-2 rounded-xl text-gray-500 hover:bg-white/5 transition-all w-full text-[10px] font-black uppercase tracking-widest">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}