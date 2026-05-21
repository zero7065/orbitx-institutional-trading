import React, { useEffect, useState } from 'react';
import { Users, CreditCard, ShieldCheck, Mail, Search, Check, X as Close, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, withRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/withdrawals')
      ]);
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setWithdrawals(await withRes.json());
    } finally {
      setLoading(false);
    }
  };

  const approveWithdrawal = async (id: string) => {
    const res = await fetch(`/api/admin/withdrawals/${id}/approve`, { method: 'POST' });
    if (res.ok) {
      toast.success('Withdrawal approved and funds deducted');
      fetchAdminData();
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const approveKYC = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
    toast.promise(fetch(`/api/admin/kyc/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }), {
      loading: 'Updating KYC...',
      success: 'KYC status updated',
      error: 'Failed to update KYC'
    });
    fetchAdminData();
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div>Loading Admin Hub...</div>;

  const updateBalance = async (userId: string, amount: number) => {
    const res = await fetch(`/api/admin/users/${userId}/balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    if (res.ok) {
      toast.success('Capital volume adjusted successfully');
      fetchAdminData();
    }
  };

  const [platformSettings, setPlatformSettings] = useState({ name: 'OrbitX', maintenance: false });
  const updatePlatform = async () => {
    toast.success('Core protocol parameters updated');
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter italic italic">Nexus Terminal</h1>
          <p className="text-gray-500 font-medium text-sm">Strategic platform oversight and node administration.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-gold/10 border border-brand-gold/20 rounded-xl">
           <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
           <span className="text-[10px] font-black uppercase text-brand-gold tracking-widest">Protocol Level: Admin</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Clusters', value: stats.userCount, icon: Users, color: 'text-brand-teal' },
          { label: 'Global Liquidity', value: `$${stats.depositTotal.toLocaleString()}`, icon: CreditCard, color: 'text-green-400' },
          { label: 'Pending Extraction', value: stats.pendingWithdrawals, icon: Mail, color: 'text-brand-gold' },
          { label: 'Identity Backlog', value: stats.pendingKYC, icon: ShieldCheck, color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 p-8 rounded-3xl flex items-start justify-between group hover:border-brand-teal/30 transition-all">
            <div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{stat.label}</div>
              <div className="text-4xl font-black tracking-tighter">{stat.value}</div>
            </div>
            <div className={`p-4 rounded-2xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* User Management Table */}
        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between flex-wrap gap-4 bg-white/2">
             <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Node Directory</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Manage active connections and credentials.</p>
             </div>
             <div className="relative w-full max-w-sm">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
               <input 
                 type="text" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-brand-teal outline-none transition-all font-medium text-sm"
                 placeholder="Search Node Identifier..."
               />
             </div>
          </div>
          <div className="p-0 overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/2 text-gray-600 text-[10px] uppercase tracking-[0.2em] font-black">
                    <th className="px-8 py-4">Node Profile</th>
                    <th className="px-8 py-4">Capital</th>
                    <th className="px-8 py-4">Identity</th>
                    <th className="px-8 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-teal font-black uppercase border border-white/5 text-xl tracking-tighter italic">
                              {user.email[0]}
                            </div>
                            <div>
                              <div className="font-black text-white">{user.email}</div>
                              <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1">{user.role} • ID: {user.id.split('-')[0]}</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="space-y-1">
                            <div className="font-black text-brand-teal text-lg tracking-tight">${user.balance.toLocaleString()}</div>
                            <div className="flex gap-2">
                               <button onClick={() => updateBalance(user.id, 1000)} className="text-[9px] font-black uppercase text-gray-600 hover:text-green-400">+1K</button>
                               <button onClick={() => updateBalance(user.id, -1000)} className="text-[9px] font-black uppercase text-gray-600 hover:text-red-400">-1K</button>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                           user.kycStatus === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                           'bg-red-500/10 text-red-500 border-red-500/20'
                         }`}>
                           {user.kycStatus === 'APPROVED' ? 'Secured' : 'Unauthorized'}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2">
                           <button className="p-2.5 bg-white/5 hover:bg-brand-teal/10 text-gray-500 hover:text-brand-teal rounded-xl transition-all border border-white/5" title="Deep Audit">
                             <Eye size={18} />
                           </button>
                           {user.kycStatus === 'PENDING' && (
                             <>
                               <button onClick={() => approveKYC(user.id, 'APPROVED')} className="p-2.5 bg-white/5 hover:bg-green-500/10 text-gray-500 hover:text-green-500 rounded-xl transition-all border border-white/5">
                                 <Check size={18} />
                               </button>
                               <button onClick={() => approveKYC(user.id, 'REJECTED')} className="p-2.5 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-xl transition-all border border-white/5">
                                 <Close size={18} />
                               </button>
                             </>
                           )}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* Platform Settings & Rapid Controls */}
        <div className="space-y-8">
           <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#F0B90B] mb-8">Protocol Parameters</h3>
              <div className="space-y-6">
                 <div>
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Platform Branding</label>
                    <input 
                      type="text" 
                      value={platformSettings.name}
                      onChange={e => setPlatformSettings({...platformSettings, name: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:ring-1 focus:ring-brand-gold outline-none transition-all font-black text-xs uppercase"
                    />
                 </div>
                 <div className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5 mt-4">
                    <div>
                       <div className="text-[10px] font-black text-white uppercase tracking-widest">Maintenance Mode</div>
                       <div className="text-[9px] text-gray-500 font-bold uppercase mt-1">Restrict all client nodes.</div>
                    </div>
                    <button 
                      onClick={() => setPlatformSettings({...platformSettings, maintenance: !platformSettings.maintenance})}
                      className={`w-12 h-6 rounded-full transition-all relative ${platformSettings.maintenance ? 'bg-brand-gold shadow-[0_0_8px_rgba(240,185,11,0.5)]' : 'bg-white/10'}`}
                    >
                       <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${platformSettings.maintenance ? 'left-7' : 'left-1'}`} />
                    </button>
                 </div>
                 <button 
                   onClick={updatePlatform}
                   className="w-full py-4 bg-white/2 hover:bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all"
                 >
                   Inject Changes
                 </button>
              </div>
           </div>

           <div className="bg-gradient-to-br from-red-500/20 to-orange-600/20 border border-red-500/30 rounded-3xl p-8 group">
              <div className="flex items-center gap-3 text-red-400 mb-4">
                 <ShieldCheck size={20} />
                 <h4 className="text-xs font-black uppercase tracking-widest">Danger Zone</h4>
              </div>
              <p className="text-[10px] text-red-200/60 font-bold uppercase leading-relaxed tracking-wider mb-8">
                 Critical protocol operations. Actions taken here are irreversible across the global ledger.
              </p>
              <button className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-red-400 transition-all">
                Wipe Pending Pool
              </button>
           </div>
        </div>
      </div>

      {/* Withdrawal Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="glass-card overflow-hidden">
           <div className="p-8 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tight">Withdrawal Requests</h3>
           </div>
           <div className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                   <tr className="bg-white/2 text-gray-600 text-[10px] uppercase tracking-[0.2em] font-black">
                     <th className="px-8 py-4">Node</th>
                     <th className="px-8 py-4">Volume</th>
                     <th className="px-8 py-4 text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {withdrawals.filter(w => w.status === 'PENDING').map((w) => (
                     <tr key={w.id} className="hover:bg-white/2">
                       <td className="px-8 py-6 font-bold truncate max-w-[120px]">{w.user?.email}</td>
                       <td className="px-8 py-6 font-black text-red-500">${w.amount.toLocaleString()}</td>
                       <td className="px-8 py-6 text-right">
                          <button onClick={() => approveWithdrawal(w.id)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                            Approve
                          </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
           </div>
         </div>

         <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Strategic Ad Protocol</h3>
            <form onSubmit={(e) => {
               e.preventDefault();
               const target = e.target as any;
               fetch('/api/admin/ads', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                     title: target.title.value,
                     description: target.desc.value,
                     imageUrl: target.img.value,
                     link: target.link.value
                  })
               }).then(() => toast.success('Strategic ad deployed to network'));
            }} className="space-y-4">
               <input name="title" className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 outline-none font-bold text-xs" placeholder="Ad Title" />
               <input name="desc" className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 outline-none font-bold text-xs" placeholder="Description" />
               <input name="img" className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 outline-none font-bold text-xs" placeholder="Image URL" />
               <input name="link" className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 outline-none font-bold text-xs" placeholder="Target Link" />
               <button type="submit" className="w-full py-4 bg-brand-gold text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl">Deploy Ad Channel</button>
            </form>
         </div>
      </div>
    </div>
  );
}
