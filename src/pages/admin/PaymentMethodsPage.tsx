import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, CreditCard, Building, Wallet, ToggleLeft, ToggleRight, X } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  provider?: string | null;
  details?: string | null;
  minAmount: number;
  maxAmount: number;
  feePercent: number;
  enabled: boolean;
  sortOrder: number;
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [form, setForm] = useState({ name: '', type: 'BANK', provider: '', bankName: '', accountNumber: '', routingNumber: '', minAmount: 0, maxAmount: 100000, feePercent: 0, enabled: true, sortOrder: 0 });

  useEffect(() => { fetchMethods(); }, []);

  const fetchMethods = async () => {
    try {
      const res = await fetch('/api/admin/payment-methods');
      if (res.ok) setMethods(await res.json());
      else toast.error('Failed to load payment methods');
    } catch (e) { toast.error('Network error loading methods'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const details = { bankName: form.bankName, accountNumber: form.accountNumber, routingNumber: form.routingNumber };
    const payload = { name: form.name, type: form.type, provider: form.provider || null, details, minAmount: form.minAmount, maxAmount: form.maxAmount, feePercent: form.feePercent, enabled: form.enabled, sortOrder: form.sortOrder };
    
    try {
      const url = editing ? `/api/admin/payment-methods/${editing.id}` : '/api/admin/payment-methods';
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    
      if (res.ok) {
        toast.success(editing ? 'Payment method updated' : 'Payment method created');
        setShowModal(false);
        setEditing(null);
        setForm({ name: '', type: 'BANK', provider: '', bankName: '', accountNumber: '', routingNumber: '', minAmount: 0, maxAmount: 100000, feePercent: 0, enabled: true, sortOrder: 0 });
        fetchMethods();
      } else {
        toast.error('Failed to save payment method');
      }
    } catch { toast.error('Network error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this payment method?')) return;
    const res = await fetch(`/api/admin/payment-methods/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Payment method deleted'); fetchMethods(); }
    else toast.error('Failed to delete');
  };

  const handleToggle = async (method: PaymentMethod) => {
    await fetch(`/api/admin/payment-methods/${method.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...method, enabled: !method.enabled }) });
    fetchMethods();
  };

  const openEdit = (method: PaymentMethod) => {
    let details: any = {};
    try { details = method.details ? JSON.parse(method.details) : {}; } catch {}
    setEditing(method);
    setForm({ name: method.name, type: method.type, provider: method.provider || '', bankName: details.bankName || '', accountNumber: details.accountNumber || '', routingNumber: details.routingNumber || '', minAmount: method.minAmount, maxAmount: method.maxAmount, feePercent: method.feePercent, enabled: method.enabled, sortOrder: method.sortOrder });
    setShowModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CARD': return <CreditCard size={20} className="text-blue-400" />;
      case 'BANK': return <Building size={20} className="text-green-400" />;
      case 'WALLET': return <Wallet size={20} className="text-purple-400" />;
      default: return <CreditCard size={20} className="text-gray-400" />;
    }
  };

  if (loading) return <div className="animate-pulse text-center py-20 text-gray-500 text-sm">Loading payment methods...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Payment Methods</h1>
          <p className="text-gray-500 text-sm mt-1">Manage available payment options for users</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', type: 'BANK', provider: '', bankName: '', accountNumber: '', routingNumber: '', minAmount: 0, maxAmount: 100000, feePercent: 0, enabled: true, sortOrder: 0 }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-slate-900 font-bold rounded-xl hover:bg-cyan-400">
          <Plus size={18} /> Add Method
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map((method) => (
          <div key={method.id} className="glass-card p-5 border border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">{getTypeIcon(method.type)}</div>
                <div>
                  <h3 className="font-black">{method.name}</h3>
                  <p className="text-xs text-gray-500">{method.type} {method.provider && `• ${method.provider}`}</p>
                </div>
              </div>
              <button onClick={() => handleToggle(method)} className="text-brand-teal">{method.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} className="text-gray-500" />}</button>
            </div>
            
            <div className="text-xs text-gray-400 space-y-1 mb-4">
              <div className="flex justify-between"><span>Min:</span><span>${method.minAmount}</span></div>
              <div className="flex justify-between"><span>Max:</span><span>${method.maxAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Fee:</span><span>{method.feePercent}%</span></div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => openEdit(method)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold">Edit</button>
              <button onClick={() => handleDelete(method.id)} className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {methods.length === 0 && (
        <div className="text-center py-12 text-gray-500">No payment methods yet. Add one to get started.</div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d23] border border-white/10 rounded-3xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black">{editing ? 'Edit' : 'Add'} Payment Method</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm" placeholder="Bank Transfer" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm">
                    <option value="BANK">Bank Transfer</option>
                    <option value="CARD">Credit/Debit Card</option>
                    <option value="WALLET">Digital Wallet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">Provider</label>
                  <input value={form.provider} onChange={e => setForm({...form, provider: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm" placeholder="e.g., Visa, Chase" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm" />
                </div>
              </div>

              {form.type === 'BANK' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2">Bank Name</label>
                    <input value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm" placeholder="Bank name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2">Account Number</label>
                      <input value={form.accountNumber} onChange={e => setForm({...form, accountNumber: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm" placeholder="Account number" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2">Routing Number</label>
                      <input value={form.routingNumber} onChange={e => setForm({...form, routingNumber: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm" placeholder="Routing number" />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">Min ($)</label>
                  <input type="number" value={form.minAmount} onChange={e => setForm({...form, minAmount: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">Max ($)</label>
                  <input type="number" value={form.maxAmount} onChange={e => setForm({...form, maxAmount: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">Fee (%)</label>
                  <input type="number" step="0.1" value={form.feePercent} onChange={e => setForm({...form, feePercent: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm" />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-brand-teal text-slate-900 font-bold rounded-xl hover:bg-cyan-400">
                {editing ? 'Update Method' : 'Create Method'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}