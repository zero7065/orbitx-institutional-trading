import React, { useEffect, useState } from 'react';
import { Users, CreditCard, ArrowUpRight, ShieldCheck, TrendingUp, Wallet, Bell, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminStats {
  userCount: number;
  depositTotal: number;
  withdrawalTotal: number;
  pendingWithdrawals: number;
  pendingKYC: number;
  pendingDeposits: number;
  activeInvestments: number;
  investmentValue: number;
  platformName: string;
}

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('Failed to fetch admin stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <div className="animate-pulse text-center py-20 text-gray-500 font-bold uppercase tracking-widest text-sm">Loading Admin Terminal...</div>;

  const cards = [
    { label: 'Total Users', value: stats?.userCount || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Deposits', value: `$${(stats?.depositTotal || 0).toLocaleString()}`, icon: Wallet, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
    { label: 'Investments Active', value: `$${(stats?.investmentValue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Pending KYC', value: stats?.pendingKYC || 0, icon: ShieldCheck, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Pending Withdrawals', value: stats?.pendingWithdrawals || 0, icon: ArrowUpRight, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Pending Deposits', value: stats?.pendingDeposits || 0, icon: CreditCard, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">{stats?.platformName || 'OrbitX'} Terminal</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Complete platform oversight</p>
        </div>
        <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-gray-400">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map((card) => (
          <div key={card.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{card.label}</span>
              <div className={`p-2.5 rounded-xl ${card.bg} group-hover:scale-110 transition-transform`}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
            <div className={`text-3xl font-black tracking-tight ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-black uppercase tracking-widest text-xs text-gray-500 mb-6">Platform Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { month: 'Jan', users: 5, deposits: 1200 }, { month: 'Feb', users: 12, deposits: 3400 },
                { month: 'Mar', users: 18, deposits: 5600 }, { month: 'Apr', users: 25, deposits: 8200 },
                { month: 'May', users: 35, deposits: 12400 }, { month: 'Jun', users: 42, deposits: 18500 },
              ]}>
                <defs>
                  <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0E11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#usersGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-black uppercase tracking-widest text-xs text-gray-500 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Add User Funds', path: '/admin/users', icon: Wallet, color: 'text-green-400' },
                { label: 'Approve Withdrawals', path: '/admin/withdrawals', icon: ArrowUpRight, color: 'text-red-400' },
                { label: 'Review KYC', path: '/admin/kyc', icon: ShieldCheck, color: 'text-yellow-400' },
                { label: 'New Announcement', path: '/admin/announcements', icon: Bell, color: 'text-brand-teal' },
              ].map((action) => (
                <Link key={action.path} to={action.path} className="flex items-center gap-3 p-3 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 transition-all">
                  <action.icon size={16} className={action.color} />
                  <span className="text-xs font-bold">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-purple-400 mb-3">
              <ShieldCheck size={20} />
              <h4 className="text-xs font-black uppercase tracking-widest">Admin Access</h4>
            </div>
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
              You have full autonomy over all platform operations. All actions are logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}