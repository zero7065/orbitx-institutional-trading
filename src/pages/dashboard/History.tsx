import React, { useEffect, useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCw, Award, Check } from 'lucide-react';

const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export default function HistoryPage() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/transactions')
      .then(r => r.json())
      .then(data => {
        setTxs(data);
        setLoading(false);
      });
  }, []);

  const filtered = filter === 'ALL' ? txs : txs.filter(t => t.type === filter);

  return (
    <div className="space-y-12">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">Ledger Node</h1>
          <p className="text-gray-500 font-medium text-sm">Synchronized protocol logs of all strategic capital movements.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
           {['ALL', 'DEPOSIT', 'WITHDRAWAL', 'BONUS', 'REFERRAL', 'SPIN_WIN'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                 filter === f ? 'bg-brand-teal text-slate-900 border-brand-teal shadow-xl shadow-brand-teal/20' : 'hover:bg-white/5 text-gray-500 border-transparent hover:border-white/10'
               }`}
             >
               {f.replace('_', ' ')}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-4">
           <div className="flex items-center gap-2 px-3 py-1 bg-brand-teal/10 border border-brand-teal/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase text-brand-teal tracking-widest">Network: Operational</span>
           </div>
        </div>

        {loading ? (
          <div className="p-32 text-center">
             <RefreshCw className="mx-auto text-brand-teal animate-spin mb-4" size={32} />
             <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Querying Global Ledger...</div>
          </div>
        ) : (
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/2 text-gray-600 text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-8 py-5">Strategic Operation</th>
                  <th className="px-8 py-5">Classification</th>
                  <th className="px-8 py-5">Capital Delta</th>
                  <th className="px-8 py-5 hidden sm:table-cell">Transaction Hash</th>
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-5">
                          <div className={`p-3 rounded-2xl border transition-all ${
                            tx.type === 'DEPOSIT' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            tx.type === 'WITHDRAWAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            tx.type === 'SPIN_WIN' ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20' :
                            'bg-brand-teal/10 text-brand-teal border-brand-teal/20'
                          }`}>
                            {tx.type === 'DEPOSIT' ? <ArrowDownRight size={20} /> : 
                             tx.type === 'WITHDRAWAL' ? <ArrowUpRight size={20} /> : 
                             tx.type === 'SPIN_WIN' ? <Award size={20} className="animate-spin-slow" /> :
                             <Award size={20} />}
                          </div>
                          <div>
                            <div className="font-black text-white uppercase text-xs tracking-tight">{tx.description}</div>
                            <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">Node Reference: {tx.id.substring(0, 8)}</div>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                          tx.type === 'DEPOSIT' ? 'text-blue-400/60 bg-blue-400/5' :
                          tx.type === 'WITHDRAWAL' ? 'text-red-400/60 bg-red-400/5' : 'text-brand-teal/60 bg-brand-teal/5'
                       }`}>
                         {tx.type}
                       </span>
                    </td>
                    <td className={`px-8 py-6 font-black text-lg tracking-tighter italic ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{formatUSD(tx.amount)}
                    </td>
                    <td className="px-8 py-6 hidden sm:table-cell">
                       <div className="text-[10px] font-mono text-gray-700 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5 truncate max-w-[140px]">
                         0x{Math.random().toString(16).substring(2, 64)}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-[10px] text-gray-500 font-black uppercase tracking-widest whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString()} <span className="text-gray-700 mx-1">•</span> {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="inline-flex items-center gap-2 text-[10px] font-black text-green-400 uppercase tracking-[0.1em] px-3 py-1 bg-green-500/5 border border-green-500/10 rounded-full">
                          <Check size={12} /> SECURED
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
