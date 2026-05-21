import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ArrowUpRight, ArrowDownLeft, CheckCircle, XCircle, Clock, Search, RefreshCw, Loader2 } from 'lucide-react';

export default function AdminDepotsWithdrawsPage() {
  const [tab, setTab] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [statusFilter, setStatusFilter] = useState('');
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, [tab, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: tab });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/depots-withdraws?${params}`);
      const data = await res.json();
      if (tab === 'DEPOSIT') setDeposits(data.deposits || []);
      else setWithdrawals(data.withdrawals || []);
    } catch (e) { toast.error('Failed to fetch data'); }
    finally { setLoading(false); }
  };

  const handleAction = async (id: string, action: string) => {
    setActioning(id);
    try {
      const res = await fetch(`/api/admin/depots-withdraws/${id}/action`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, table: tab === 'DEPOSIT' ? 'deposit' : 'withdrawal' })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Action failed'); }
      toast.success(`${action === 'CONFIRM' || action === 'APPROVE' ? 'Confirmed' : 'Rejected'} successfully`);
      fetchData();
    } catch (err: any) { toast.error(err.message); }
    finally { setActioning(null); }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'text-yellow-400 bg-yellow-500/10',
    CONFIRMED: 'text-green-400 bg-green-500/10',
    COMPLETED: 'text-green-400 bg-green-500/10',
    APPROVED: 'text-blue-400 bg-blue-500/10',
    REJECTED: 'text-red-400 bg-red-500/10',
    CANCELLED: 'text-gray-500 bg-gray-500/10',
    FAILED: 'text-red-400 bg-red-500/10',
  };

  const items = tab === 'DEPOSIT' ? deposits : withdrawals;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Deposits & Withdrawals</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all platform transactions</p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
          <RefreshCw size={18} className="text-gray-400" />
        </button>
      </div>

      <div className="flex gap-2 border-b border-white/5 pb-4 flex-wrap">
        {(['DEPOSIT', 'WITHDRAWAL'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setStatusFilter(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${tab === t ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            {t === 'DEPOSIT' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
            {t === 'DEPOSIT' ? 'Deposits' : 'Withdrawals'}
          </button>
        ))}
        {['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'APPROVED', 'REJECTED', 'CANCELLED', 'FAILED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${statusFilter === s ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30' : 'bg-white/5 text-gray-500 border border-white/10 hover:text-white'}`}>
            {s || 'ALL'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-teal" size={32} /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Clock size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-black text-lg">No {tab.toLowerCase()}s found</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <th className="text-left px-5 py-3">User</th>
                  <th className="text-left px-5 py-3">Amount</th>
                  {tab === 'DEPOSIT' && <th className="text-left px-5 py-3">Crypto</th>}
                  {tab === 'WITHDRAWAL' && <th className="text-left px-5 py-3">Wallet</th>}
                  <th className="text-left px-5 py-3">Status</th>
                  {tab === 'WITHDRAWAL' && <th className="text-left px-5 py-3">Fee</th>}
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="px-5 py-3">
                      <div className="text-sm font-black text-white">{item.user?.email || item.userEmail || 'N/A'}</div>
                      {item.network && <div className="text-[10px] text-gray-600">{item.network.name} ({item.network.symbol})</div>}
                    </td>
                    <td className="px-5 py-3">
                      <div className={`text-sm font-black ${tab === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'}`}>
                        {tab === 'DEPOSIT' ? '+' : '-'}${item.amount.toFixed(2)}
                      </div>
                      {item.cryptoAmount && <div className="text-[10px] text-gray-600">{item.cryptoAmount} {item.cryptoType}</div>}
                    </td>
                    {tab === 'DEPOSIT' && <td className="px-5 py-3"><span className="text-xs font-black text-white">{item.cryptoType || '—'}</span></td>}
                    {tab === 'WITHDRAWAL' && (
                      <td className="px-5 py-3">
                        <div className="text-xs text-gray-400 max-w-[150px] truncate" title={item.walletAddress}>{item.walletAddress || '—'}</div>
                      </td>
                    )}
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${statusColors[item.status] || 'text-gray-400 bg-gray-500/10'}`}>{item.status}</span>
                    </td>
                    {tab === 'WITHDRAWAL' && <td className="px-5 py-3"><span className="text-xs text-gray-400">${item.fee?.toFixed(2) || '0.00'}</span></td>}
                    <td className="px-5 py-3"><span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</span></td>
                    <td className="px-5 py-3 text-right">
                      {item.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => handleAction(item.id, tab === 'DEPOSIT' ? 'CONFIRM' : 'APPROVE')} disabled={actioning === item.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-[10px] font-black transition-all disabled:opacity-50">
                            {actioning === item.id ? <Loader2 className="animate-spin" size={12} /> : <CheckCircle size={12} />}
                            {tab === 'DEPOSIT' ? 'Confirm' : 'Approve'}
                          </button>
                          <button onClick={() => handleAction(item.id, 'REJECT')} disabled={actioning === item.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-[10px] font-black transition-all disabled:opacity-50">
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      )}
                      {(item.status === 'CONFIRMED' || item.status === 'COMPLETED') && <span className="text-[10px] text-green-500 font-black">Completed</span>}
                      {(item.status === 'REJECTED' || item.status === 'CANCELLED' || item.status === 'FAILED') && <span className="text-[10px] text-red-500 font-black">{item.status}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
