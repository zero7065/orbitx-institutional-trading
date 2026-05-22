import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Gift, Coins, X, Image as ImageIcon } from 'lucide-react';

export default function AdminSwapItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', type: 'TOKEN', imageUrl: '', pointsCost: 100, valueUsd: 0, stock: 100, active: true });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/swap-items');
      if (res.ok) {
        setItems(await res.json());
      } else {
        toast.error('Failed to load items');
      }
    } catch (e) {
      toast.error('Network error loading items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/admin/swap-items/${editing.id}` : '/api/admin/swap-items';
    const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      toast.success(editing ? 'Item updated' : 'Item created');
      setShowModal(false); setEditing(null); fetchItems();
      setForm({ name: '', description: '', type: 'TOKEN', imageUrl: '', pointsCost: 100, valueUsd: 0, stock: 100, active: true });
    } else toast.error('Failed');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      const res = await fetch(`/api/admin/swap-items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Item removed');
        fetchItems();
      } else {
        toast.error('Failed to delete item');
      }
    } catch (e) {
      toast.error('Network error deleting item');
    }
  };

  if (loading) return <div className="animate-pulse text-center py-20 text-gray-500">Loading swap items...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Swap Items</h1>
          <p className="text-gray-500 text-sm mt-1">Manage points reward shop</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', description: '', type: 'TOKEN', imageUrl: '', pointsCost: 100, valueUsd: 0, stock: 100, active: true }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-slate-900 font-bold rounded-xl">
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className={`glass-card p-5 border ${item.active ? 'border-white/10' : 'border-red-500/20 opacity-60'}`}>
            <div className="w-full h-28 bg-gradient-to-br from-white/5 to-white/10 rounded-xl flex items-center justify-center mb-4">
              {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover rounded-xl" /> : <Gift className="text-gray-600" size={36} />}
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black">{item.name}</h3>
              <span className={`text-[10px] px-2 py-1 rounded font-bold ${item.type === 'TOKEN' ? 'bg-green-500/20 text-green-400' : item.type === 'NFT' ? 'bg-purple-500/20 text-purple-400' : 'bg-brand-teal/20 text-brand-teal'}`}>{item.type}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">{item.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
              <span className="flex items-center gap-1"><Coins size={12} />{item.pointsCost} pts</span>
              <span>Stock: {item.stock}</span>
              {item.valueUsd > 0 && <span>${item.valueUsd}</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(item); setForm(item); setShowModal(true); }} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold">Edit</button>
              <button onClick={() => handleDelete(item.id)} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && <div className="text-center py-12 text-gray-500">No swap items yet.</div>}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d23] border border-white/10 rounded-3xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black">{editing ? 'Edit' : 'Add'} Swap Item</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Item Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm" required />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm resize-none" />
              <div className="grid grid-cols-2 gap-4">
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm">
                  <option value="TOKEN">Token</option>
                  <option value="NFT">NFT</option>
                  <option value="CRYPTO">Crypto</option>
                  <option value="BONUS">Bonus</option>
                </select>
                <input type="number" value={form.pointsCost} onChange={e => setForm({...form, pointsCost: parseInt(e.target.value)})} placeholder="Points Cost" className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input type="number" value={form.valueUsd} onChange={e => setForm({...form, valueUsd: parseFloat(e.target.value)})} placeholder="USD Value" className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm" />
                <input type="number" value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value)})} placeholder="Stock" className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm" />
                <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="Image URL" className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm" />
              </div>
              <button type="submit" className="w-full py-3 bg-brand-teal text-slate-900 font-bold rounded-xl">{editing ? 'Update' : 'Create'} Item</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}