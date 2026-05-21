import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Wallet, ArrowDownRight, TrendingUp, Users, ArrowUpRight, Award, Bell } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export default function DashboardOverview() {
  const { fetchStats, stats, user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetch('/api/investment-plans').then(r => r.json()).then(setPlans).catch(() => {});
    fetch('/api/notifications').then(r => r.json()).then(data => setNotifs(data.filter((n: any) => !n.read).slice(0, 3))).catch(() => {});
  }, []);

  if (!stats) return <div className="animate-pulse text-center py-20 text-gray-500 font-black uppercase tracking-widest text-sm">Loading dashboard...</div>;

  const isHidden = user?.dashboardLayout ? JSON.parse(user.dashboardLayout).hideBalance : false;
  const mask = (val: number) => isHidden ? '••••••••' : formatUSD(val);

  return (
    <div className="space-y-8">
      {/* Notifications */}
      {notifs.length > 0 && (
        <div className="space-y-2">
          {notifs.map((n: any) => (
            <div key={n.id} className="flex items-center gap-4 p-4 bg-brand-teal/5 border border-brand-teal/20 rounded-2xl">
              <Bell size={18} className="text-brand-teal shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-white">{n.title}</div>
                <p className="text-xs text-gray-400 truncate">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Total Balance', value: mask(stats.balance), icon: Wallet, color: 'text-white', change: '+12.5%' },
          { label: 'Total Deposited', value: mask(stats.totalDeposited), icon: ArrowDownRight, color: 'text-brand-teal', change: '+8.3%' },
          { label: 'Total Earned', value: mask(Math.max(0, (stats.totalEarned || stats.balance) - (stats.totalDeposited || 0))), icon: Award, color: 'text-brand-gold', change: '+22.1%' },
          { label: 'Login Streak', value: `${stats.loginStreak || 0} days`, icon: TrendingUp, color: 'text-green-400', change: '🔥' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon size={48} />
            </div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{stat.label}</p>
            <h3 className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</h3>
            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-medium">
              <span className="text-green-400 font-bold">{stat.change}</span> growth
            </p>
          </div>
        ))}
      </div>

      {/* Charts & Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-black text-white">Portfolio Performance</h4>
              <p className="text-xs text-gray-500">30-day growth analysis</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded bg-white/10 text-[10px] text-white">1H</button>
              <button className="px-3 py-1 rounded bg-white/20 text-[10px] text-white font-bold">1M</button>
              <button className="px-3 py-1 rounded bg-white/10 text-[10px] text-white">ALL</button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { day: '01', val: stats.balance * 0.7 }, { day: '05', val: stats.balance * 0.75 },
                { day: '10', val: stats.balance * 0.72 }, { day: '15', val: stats.balance * 0.82 },
                { day: '20', val: stats.balance * 0.88 }, { day: '25', val: stats.balance * 0.85 },
                { day: '30', val: stats.balance },
              ]}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D1FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00D1FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: '#0B0E11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="val" stroke="#00D1FF" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          {plans.slice(0, 2).map((plan: any) => (
            <div key={plan.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/[0.07] transition-all">
              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-10" style={{ backgroundColor: plan.color }} />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: plan.color }}>{plan.name}</span>
                {plan.featured && <span className="text-[7px] px-1.5 py-0.5 rounded bg-brand-gold/20 text-brand-gold font-black uppercase tracking-widest">Popular</span>}
              </div>
              <div className="text-2xl font-black text-white mb-1">{plan.roi}% <span className="text-[9px] text-gray-500 uppercase font-bold">{plan.roiType.toLowerCase()}</span></div>
              <div className="text-[10px] text-gray-500 mt-1">${plan.minAmount.toLocaleString()} - ${plan.maxAmount.toLocaleString()}</div>
              <Link to="/dashboard/deposit" className="mt-4 inline-block w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-center hover:bg-white/10 transition-all">
                Invest Now
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h4 className="text-lg font-black text-white">Recent Activity</h4>
          <Link to="/dashboard/history" className="text-xs text-brand-teal font-bold hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase text-gray-500 tracking-widest border-b border-white/5">
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Description</th>
                <th className="px-6 py-3 font-semibold">Amount</th>
                <th className="px-6 py-3 font-semibold text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(stats.transactions || []).slice(0, 5).map((tx: any) => (
                <tr key={tx.id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        tx.type === 'DEPOSIT' ? 'bg-blue-400' :
                        tx.type === 'WITHDRAWAL' ? 'bg-red-400' :
                        tx.type === 'INVESTMENT' ? 'bg-purple-400' :
                        'bg-yellow-400'
                      }`} />
                      <span className="text-xs font-bold text-white">{tx.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 font-medium">{tx.description}</td>
                  <td className={`px-6 py-4 text-xs font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatUSD(tx.amount)}
                  </td>
                  <td className="px-6 py-4 text-[10px] text-gray-500 text-right">{new Date(tx.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!stats.transactions || stats.transactions.length === 0) && (
                <tr><td colSpan={4} className="text-center py-12 text-gray-500 text-sm">No transactions yet. <Link to="/dashboard/deposit" className="text-brand-teal font-bold">Make your first deposit</Link></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}