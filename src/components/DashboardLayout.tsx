import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Wallet, History, Users, Settings, TrendingUp, RotateCcw,
  Award, Menu, LogOut, ArrowUpRight, ShieldCheck, User, ChevronLeft, ChevronRight, Bell, CreditCard,
  Coins, Gift, Cpu, Headphones, ArrowLeftRight
} from 'lucide-react';
import { useAuth } from '../App';
import FloatingContactButton from './FloatingContactButton';

const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const { user, logout, stats, fetchStats, platformSettings } = useAuth();

  useEffect(() => {
    const handleResize = () => { const m = window.innerWidth < 1024; setIsMobile(m); if (m) setSidebarOpen(false); else setSidebarOpen(true); };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchStats();
    fetch('/api/session/track', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAgent: navigator.userAgent, deviceInfo: navigator.userAgent, isIncognito: !navigator.cookieEnabled })
    }).catch(() => {});
  }, []);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Markets', icon: TrendingUp, path: '/dashboard/markets' },
    { label: 'Deposit', icon: Wallet, path: '/dashboard/deposit' },
    { label: 'Buy Crypto', icon: CreditCard, path: '/dashboard/buy-crypto' },
    { label: 'Withdraw', icon: ArrowUpRight, path: '/dashboard/withdraw' },
    { label: 'DApps', icon: Cpu, path: '/dashboard/dapps' },
    { label: 'Points', icon: Coins, path: '/dashboard/points' },
    { label: 'Swap Shop', icon: Gift, path: '/dashboard/points-shop' },
    { label: 'History', icon: History, path: '/dashboard/history' },
    { label: 'Affiliates', icon: Users, path: '/dashboard/referrals' },
    { label: 'Lucky Wheel', icon: RotateCcw, path: '/dashboard/spin' },
    { label: 'Incentives', icon: Award, path: '/dashboard/rewards' },
    { label: 'Server Swaps', icon: ArrowLeftRight, path: '/dashboard/server-swaps' },
    { label: 'Support', icon: Headphones, path: '/dashboard/support' },
    { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  if (user?.role === 'ADMIN') {
    navItems.unshift({ label: 'Admin', icon: ShieldCheck, path: '/admin' });
  }

  return (
    <div className="min-h-screen bg-[#0B0E11] text-gray-200 flex overflow-hidden">
      <motion.aside
        initial={false}
        animate={{ width: isMobile ? (sidebarOpen ? 280 : 0) : (sidebarOpen ? 260 : 80) }}
        className="fixed inset-y-0 left-0 z-50 border-r border-white/5 bg-[#0B0E11] flex flex-col shrink-0 overflow-hidden lg:relative transition-all duration-300"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-4 border-b border-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-teal to-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp size={22} className="text-[#0B0E11]" />
            </div>
            {sidebarOpen && <span className="font-black text-xl tracking-tighter text-white uppercase italic">{platformSettings?.platformName || 'OrbitX'}</span>}
          </div>

          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? 'bg-white/10 text-brand-teal font-bold border border-white/5'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} className="shrink-0" />
                {sidebarOpen && <span className="text-[13px] font-bold tracking-tight text-nowrap">{item.label}</span>}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5">
            {sidebarOpen && (
              <div className="bg-white/5 rounded-xl border border-white/5 p-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center border border-white/20 shrink-0 overflow-hidden">
                    {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-black text-white">{user?.email?.[0]?.toUpperCase()}</span>}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-white truncate w-28">{user?.email}</p>
                      {user?.tier === 'PRO' && <span className="text-[7px] px-1.5 py-0.5 bg-brand-gold/20 text-brand-gold rounded-full font-black uppercase tracking-widest ml-1">PRO</span>}
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${user?.kycStatus === 'APPROVED' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'bg-brand-gold animate-pulse'}`}></span>
                      <span className="text-[8px] text-gray-500 uppercase font-black">{user?.kycStatus === 'APPROVED' ? 'Verified' : 'Unverified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <button onClick={logout} className="flex items-center gap-4 px-3 py-3 w-full rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all font-bold group">
              <LogOut size={20} className="shrink-0" />
              {sidebarOpen && <span className="text-xs uppercase tracking-widest">Logout</span>}
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center justify-center w-full mt-2 px-3 py-2 rounded-xl text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-all text-[9px] font-black uppercase tracking-widest">
              {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0B0E11]/95 backdrop-blur-xl sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5">
              <Menu size={20} className="text-gray-400" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <span className="text-gray-600">Portal</span>
              <span className="text-gray-700">/</span>
              <span className="text-white">Active</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl">
              <div className="text-right">
                <div className="text-[9px] font-black text-gray-500 uppercase leading-none">Balance</div>
                <div className="text-sm font-black text-brand-teal mt-0.5">{formatUSD(user?.balance || 0)}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <TrendingUp size={14} className="text-brand-teal" />
              </div>
            </div>
            <Link to="/dashboard/settings" className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <User size={18} className="text-gray-400" />
              {user?.kycStatus === 'APPROVED' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0B0E11] rounded-full shadow-lg" />}
            </Link>
          </div>
        </header>

        <div className="p-6 md:p-10 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
          <FloatingContactButton />
        </div>
      </main>
    </div>
  );
}