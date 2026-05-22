import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Edit2, Trash2, Check, X, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface CryptoNetwork {
  id: string;
  name: string;
  symbol: string;
  color: string;
  depositAddress: string | null;
  withdrawalAddress: string | null;
  minDeposit: number;
  minWithdrawal: number;
  networkFee: number;
  withdrawalFee: number;
  enabled: boolean;
  depositEnabled: boolean;
  withdrawalEnabled: boolean;
  sortOrder: number;
}

export default function CryptoNetworksPage() {
  const [networks, setNetworks] = useState<CryptoNetwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CryptoNetwork | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<any>({});

  const fetchNetworks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/crypto-networks');
      if (res.ok) setNetworks(await res.json());
      else toast.error('Failed to load networks');
    } catch (e) {
      toast.error('Network error loading networks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNetworks(); }, []);

  const handleSave = async () => {
    try {
      if (editing) {
        const res = await fetch(`/api/admin/crypto-networks/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        if (res.ok) { toast.success('Network updated'); setEditing(null); fetchNetworks(); }
        else { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Update failed'); }
      } else {
        const res = await fetch('/api/admin/crypto-networks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        if (res.ok) { toast.success('Network created'); setShowAdd(false); setForm({}); fetchNetworks(); }
        else { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Create failed'); }
      }
    } catch (e) { toast.error('Network error saving'); }
  };

  const toggleEnabled = async (network: CryptoNetwork) => {
    const res = await fetch(`/api/admin/crypto-networks/${network.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !network.enabled })
    });
    if (res.ok) { toast.success(`Network ${network.enabled ? 'disabled' : 'enabled'}`); fetchNetworks(); }
  };

  const startEdit = (network: CryptoNetwork) => {
    setForm({
      name: network.name,
      symbol: network.symbol,
      color: network.color,
      depositAddress: network.depositAddress || '',
      withdrawalAddress: network.withdrawalAddress || '',
      minDeposit: network.minDeposit,
      minWithdrawal: network.minWithdrawal,
      networkFee: network.networkFee,
      withdrawalFee: network.withdrawalFee,
      enabled: network.enabled,
      depositEnabled: network.depositEnabled,
      withdrawalEnabled: network.withdrawalEnabled
    });
    setEditing(network);
  };

  const FormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Name</label>
          <input type="text" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" required />
        </div>
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Symbol</label>
          <input type="text" value={form.symbol || ''} onChange={e => setForm({...form, symbol: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" required />
        </div>
      </div>
      <div>
        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Color {form.color && <span className="inline-block w-4 h-4 rounded-full ml-2 align-middle" style={{backgroundColor: form.color}}></span>}</label>
        <input type="text" value={form.color || ''} onChange={e => setForm({...form, color: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
      </div>
      <div>
        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Deposit Wallet Address</label>
        <div className="relative">
          <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
          <input type="text" value={form.depositAddress || ''} onChange={e => setForm({...form, depositAddress: e.target.value})} placeholder="bc1q... / 0x..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm font-mono outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
      </div>
      <div>
        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Withdrawal Wallet Address</label>
        <div className="relative">
          <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
          <input type="text" value={form.withdrawalAddress || ''} onChange={e => setForm({...form, withdrawalAddress: e.target.value})} placeholder="Same or different address" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm font-mono outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Min Deposit</label>
          <input type="number" step="any" value={form.minDeposit || 0} onChange={e => setForm({...form, minDeposit: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Min Withdrawal</label>
          <input type="number" step="any" value={form.minWithdrawal || 0} onChange={e => setForm({...form, minWithdrawal: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Network Fee</label>
          <input type="number" step="any" value={form.networkFee || 0} onChange={e => setForm({...form, networkFee: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Withdrawal Fee</label>
          <input type="number" step="any" value={form.withdrawalFee || 0} onChange={e => setForm({...form, withdrawalFee: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={form.depositEnabled ?? true} onChange={e => setForm({...form, depositEnabled: e.target.checked})} className="rounded" />
          Deposit Enabled
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={form.withdrawalEnabled ?? true} onChange={e => setForm({...form, withdrawalEnabled: e.target.checked})} className="rounded" />
          Withdrawal Enabled
        </label>
      </div>
    </div>
  );

  if (loading) return <div className="animate-pulse text-center py-20 text-gray-500 text-sm">Loading networks...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Crypto Networks</h1>
          <p className="text-gray-500 text-sm mt-1">Manage wallet addresses and network settings</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchNetworks} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-[10px] font-black tracking-widest text-gray-400">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => { setShowAdd(true); setForm({ enabled: true, depositEnabled: true, withdrawalEnabled: true }); setEditing(null); }} className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-[10px] font-black tracking-widest text-white">
            <Plus size={14} /> Add Network
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {networks.map((network) => (
          <div key={network.id} className={`border rounded-2xl p-6 transition-all ${
            network.enabled ? 'bg-white/5 border-white/10' : 'bg-white/2 border-white/5 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black" style={{backgroundColor: network.color + '20', color: network.color}}>
                  {network.symbol[0]}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{network.name}</h3>
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{network.symbol}</span>
                </div>
              </div>
              <button onClick={() => toggleEnabled(network)} className={`w-12 h-6 rounded-full transition-all relative ${
                network.enabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-white/10'
              }`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${network.enabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Deposit Address</div>
                <div className="bg-black/40 rounded-xl p-3 font-mono text-[11px] text-brand-teal break-all">
                  {network.depositAddress || <span className="text-gray-600 italic">Not set</span>}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Withdrawal Address</div>
                <div className="bg-black/40 rounded-xl p-3 font-mono text-[11px] text-gray-300 break-all">
                  {network.withdrawalAddress || <span className="text-gray-600 italic">Not set</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div className="bg-white/2 rounded-xl p-3">
                <span className="text-gray-500 font-bold">Min Deposit</span>
                <div className="font-black mt-1">{network.minDeposit} {network.symbol}</div>
              </div>
              <div className="bg-white/2 rounded-xl p-3">
                <span className="text-gray-500 font-bold">Min Withdrawal</span>
                <div className="font-black mt-1">{network.minWithdrawal} {network.symbol}</div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => startEdit(network)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {(editing || showAdd) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setEditing(null); setShowAdd(false); }}>
          <div className="bg-[#1a1d23] border border-white/10 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black uppercase tracking-tight mb-6">{editing ? `Edit ${editing.name}` : 'Add New Network'}</h3>
            <FormFields />
            <div className="flex gap-3 mt-8">
              <button onClick={() => { setEditing(null); setShowAdd(false); }} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-purple-500 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-purple-600 transition-all">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}