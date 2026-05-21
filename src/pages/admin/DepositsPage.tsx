import React, { useEffect, useState } from 'react';
import { RefreshCw, Check, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({ userId: '', amount: 0, cryptoType: 'USDT', txHash: '' });

  const fetchDeposits = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/deposits');
    const data = await res.json();
    setDeposits(data);
    setLoading(false);
  };

  useEffect(() => { fetchDeposits(); }, []);

  const handleManualDeposit = async () => {
    const res = await fetch('/api/admin/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...manualForm, status: 'CONFIRMED' })
    });
    if (res.ok) { toast.success('Manual deposit created'); setShowManual(false); setManualForm({ userId: '', amount: 0, cryptoType: 'USDT', txHash: '' }); fetchDeposits(); }
    else toast.error('Failed to create deposit');
  };

  if (loading) return <div className="animate-pulse text-center py-20 text-gray-500 text-sm">Loading deposits...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Deposit Management</h1>
          <p className="text-gray-500 text-sm mt-1">{deposits.length} total deposits</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchDeposits} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-[10px] font-black tracking-widest text-gray-400">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowManual(true)} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl text-[10px] font-black tracking-widest text-white">
            <Plus size={14} /> Manual Deposit
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Crypto</th>
                <th className="px-6 py-4">TX Hash</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {deposits.map((d) => (
                <tr key={d.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm">{d.user?.email || 'Unknown'}</td>
                  <td className="px-6 py-4 font-black text-brand-teal">${d.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono text-xs">{d.cryptoType}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-mono text-gray-500 truncate max-w-[100px] block">{d.txHash?.slice(0, 16)}...</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                      d.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                      d.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                    }`}>{d.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-[11px] text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {deposits.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500 text-sm">No deposits found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showManual && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowManual(false)}>
          <div className="bg-[#1a1d23] border border-white/10 rounded-3xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Manual Deposit Credit</h3>
            <div className="space-y-4">
              <input type="text" value={manualForm.userId} onChange={e => setManualForm({...manualForm, userId: e.target.value})} placeholder="User ID or Email" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-green-500" />
              <input type="number" value={manualForm.amount || ''} onChange={e => setManualForm({...manualForm, amount: parseFloat(e.target.value)})} placeholder="Amount ($)" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-green-500" />
              <input type="text" value={manualForm.cryptoType} onChange={e => setManualForm({...manualForm, cryptoType: e.target.value})} placeholder="Crypto Type (BTC, ETH, USDT)" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-green-500" />
              <input type="text" value={manualForm.txHash} onChange={e => setManualForm({...manualForm, txHash: e.target.value})} placeholder="Transaction Hash (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-green-500" />
              <div className="flex gap-3">
                <button onClick={() => setShowManual(false)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={handleManualDeposit} className="flex-1 py-3 bg-green-500 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-green-600 transition-all">Credit Deposit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}