import React, { useEffect, useState } from 'react';
import { RefreshCw, Check, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const res = await fetch(`/api/admin/withdrawals${params}`);
      if (res.ok) setWithdrawals(await res.json());
      else toast.error('Failed to load withdrawals');
    } catch (e) { toast.error('Network error loading withdrawals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWithdrawals(); }, [filter]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/approve`, { method: 'POST' });
      if (res.ok) { toast.success('Withdrawal approved. Funds deducted from user.'); fetchWithdrawals(); }
      else { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Approval failed'); }
    } catch (e) { toast.error('Network error approving withdrawal'); }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:') || 'Rejected by admin';
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) { toast.success('Withdrawal rejected. Funds returned.'); fetchWithdrawals(); }
    } catch { toast.error('Network error'); }
  };

  if (loading) return <div className="animate-pulse text-center py-20 text-gray-500 text-sm">Loading withdrawals...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Withdrawal Management</h1>
          <p className="text-gray-500 text-sm mt-1">{withdrawals.length} requests</p>
        </div>
        <button onClick={fetchWithdrawals} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-[10px] font-black tracking-widest text-gray-400">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="flex gap-2">
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
          <button key={s || 'all'} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            filter === s ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Fee</th>
                <th className="px-6 py-4">Net Amount</th>
                <th className="px-6 py-4">Crypto</th>
                <th className="px-6 py-4">Wallet</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm">{w.user?.email || 'Unknown'}</td>
                  <td className="px-6 py-4 font-black text-red-400">${w.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-400">${(w.fee || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold">${(w.netAmount || w.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs font-mono">{w.cryptoType}</td>
                  <td className="px-6 py-4 max-w-[120px]">
                    <span className="text-[10px] font-mono text-gray-500 truncate block">{w.walletAddress?.slice(0, 14)}...</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                      w.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                      w.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{w.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {w.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleApprove(w.id)} className="p-2 bg-green-500/10 hover:bg-green-500/20 rounded-xl text-green-400 transition-all" title="Approve">
                          <Check size={16} />
                        </button>
                        <button onClick={() => handleReject(w.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-all" title="Reject">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-600">{new Date(w.processedAt || w.createdAt).toLocaleString()}</span>
                    )}
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-500 text-sm">No withdrawals found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}