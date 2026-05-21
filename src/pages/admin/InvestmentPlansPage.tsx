import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, TrendingUp, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  description: string;
  roi: number;
  roiType: string;
  durationHours: number;
  durationDays: number;
  minAmount: number;
  maxAmount: number;
  color: string;
  active: boolean;
  featured: boolean;
  priority: number;
  currentInvested: number;
  totalCapacity: number;
  _count?: { investments: number };
}

export default function InvestmentPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<any>({});

  const fetchPlans = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/investment-plans');
    const data = await res.json();
    setPlans(data);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleSave = async () => {
    if (editing) {
      const res = await fetch(`/api/admin/investment-plans/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) { toast.success('Plan updated'); setEditing(null); fetchPlans(); }
    } else {
      const res = await fetch('/api/admin/investment-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) { toast.success('Plan created'); setShowAdd(false); setForm({}); fetchPlans(); }
    }
  };

  const toggleActive = async (plan: Plan) => {
    const res = await fetch(`/api/admin/investment-plans/${plan.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !plan.active })
    });
    if (res.ok) { toast.success(`Plan ${plan.active ? 'deactivated' : 'activated'}`); fetchPlans(); }
  };

  const startEdit = (plan: Plan) => {
    setForm({
      name: plan.name,
      description: plan.description,
      roi: plan.roi,
      roiType: plan.roiType,
      durationHours: plan.durationHours,
      minAmount: plan.minAmount,
      maxAmount: plan.maxAmount,
      color: plan.color,
      active: plan.active,
      featured: plan.featured,
      priority: plan.priority,
      totalCapacity: plan.totalCapacity
    });
    setEditing(plan);
  };

  const FormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Plan Name</label>
          <input type="text" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" required />
        </div>
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Color</label>
          <input type="text" value={form.color || ''} onChange={e => setForm({...form, color: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
      </div>
      <div>
        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Description</label>
        <textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">ROI (%)</label>
          <input type="number" step="any" value={form.roi || 0} onChange={e => setForm({...form, roi: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">ROI Type</label>
          <select value={form.roiType || 'DAILY'} onChange={e => setForm({...form, roiType: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500">
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="ONETIME">One-time</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Duration (hours)</label>
          <input type="number" value={form.durationHours || 0} onChange={e => setForm({...form, durationHours: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Priority</label>
          <input type="number" value={form.priority || 0} onChange={e => setForm({...form, priority: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Min Amount ($)</label>
          <input type="number" value={form.minAmount || 0} onChange={e => setForm({...form, minAmount: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Max Amount ($)</label>
          <input type="number" value={form.maxAmount || 0} onChange={e => setForm({...form, maxAmount: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Capacity (0 = unlimited)</label>
          <input type="number" value={form.totalCapacity || 0} onChange={e => setForm({...form, totalCapacity: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={form.featured || false} onChange={e => setForm({...form, featured: e.target.checked})} className="rounded" />
          Featured Plan
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={form.active ?? true} onChange={e => setForm({...form, active: e.target.checked})} className="rounded" />
          Active
        </label>
      </div>
    </div>
  );

  if (loading) return <div className="animate-pulse text-center py-20 text-gray-500 text-sm">Loading plans...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Investment Plans</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage investment packages</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchPlans} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-[10px] font-black tracking-widest text-gray-400">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => { setShowAdd(true); setForm({ active: true, roiType: 'DAILY', durationHours: 24, color: '#00D1FF' }); setEditing(null); }} className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-[10px] font-black tracking-widest text-white">
            <Plus size={14} /> New Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`border rounded-2xl p-6 transition-all ${plan.active ? 'bg-white/5 border-white/10' : 'bg-white/2 border-white/5 opacity-60'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black" style={{backgroundColor: plan.color + '20', color: plan.color}}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <div className="flex gap-2 mt-1">
                    {plan.featured && <span className="text-[8px] px-1.5 py-0.5 rounded bg-brand-gold/20 text-brand-gold font-black uppercase tracking-widest">Featured</span>}
                    {plan.active && <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-black uppercase tracking-widest">Active</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => toggleActive(plan)} className={`w-12 h-6 rounded-full transition-all relative ${
                plan.active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-white/10'
              }`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${plan.active ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-4">{plan.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-white/2 rounded-xl p-3">
                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest">ROI</div>
                <div className="text-lg font-black" style={{color: plan.color}}>{plan.roi}%</div>
                <div className="text-[8px] text-gray-500 uppercase">{plan.roiType}</div>
              </div>
              <div className="bg-white/2 rounded-xl p-3">
                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Duration</div>
                <div className="text-lg font-black text-white">{plan.durationHours}h</div>
                <div className="text-[8px] text-gray-500 uppercase">{plan.durationDays} days</div>
              </div>
              <div className="bg-white/2 rounded-xl p-3">
                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Min</div>
                <div className="text-sm font-black text-white">${plan.minAmount.toLocaleString()}</div>
              </div>
              <div className="bg-white/2 rounded-xl p-3">
                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Max</div>
                <div className="text-sm font-black text-white">${plan.maxAmount.toLocaleString()}</div>
              </div>
            </div>

            <button onClick={() => startEdit(plan)} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">
              Edit Plan
            </button>
          </div>
        ))}
      </div>

      {(editing || showAdd) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setEditing(null); setShowAdd(false); }}>
          <div className="bg-[#1a1d23] border border-white/10 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black uppercase tracking-tight mb-6">{editing ? `Edit ${editing.name}` : 'Create New Plan'}</h3>
            <FormFields />
            <div className="flex gap-3 mt-8">
              <button onClick={() => { setEditing(null); setShowAdd(false); }} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-purple-500 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-purple-600 transition-all">Save Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}