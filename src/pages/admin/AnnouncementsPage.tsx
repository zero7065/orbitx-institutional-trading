import React, { useEffect, useState } from 'react';
import { Bell, Plus, Send, RefreshCw, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'INFO', active: true, showOnLanding: true, showOnDashboard: true });
  const [broadcast, setBroadcast] = useState({ title: '', message: '', type: 'INFO' });

  const fetchAnnouncements = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/announcements');
    const data = await res.json();
    setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleCreate = async () => {
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) { toast.success('Announcement created'); setShowCreate(false); setForm({ title: '', message: '', type: 'INFO', active: true, showOnLanding: true, showOnDashboard: true }); fetchAnnouncements(); }
  };

  const handleBroadcast = async () => {
    const res = await fetch('/api/admin/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(broadcast)
    });
    if (res.ok) { const data = await res.json(); toast.success(`Broadcast sent to ${data.count} users`); setShowBroadcast(false); setBroadcast({ title: '', message: '', type: 'INFO' }); }
  };

  if (loading) return <div className="animate-pulse text-center py-20 text-gray-500 text-sm">Loading announcements...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Announcements</h1>
          <p className="text-gray-500 text-sm mt-1">Create platform announcements & broadcast messages</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchAnnouncements} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-[10px] font-black tracking-widest text-gray-400">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowBroadcast(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-teal hover:bg-cyan-600 rounded-xl text-[10px] font-black tracking-widest text-white">
            <Send size={14} /> Broadcast
          </button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-[10px] font-black tracking-widest text-white">
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {announcements.map((a) => (
          <div key={a.id} className={`bg-white/5 border rounded-2xl p-6 ${a.active ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${a.type === 'INFO' ? 'bg-brand-teal/10' : a.type === 'WARNING' ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
                  <Bell size={20} className={a.type === 'INFO' ? 'text-brand-teal' : a.type === 'WARNING' ? 'text-yellow-400' : 'text-green-400'} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{a.title}</h3>
                  <p className="text-sm text-gray-400 mt-1 max-w-xl">{a.message}</p>
                  <div className="flex gap-3 mt-3">
                    <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${
                      a.type === 'INFO' ? 'bg-brand-teal/10 text-brand-teal' : a.type === 'WARNING' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'
                    }`}>{a.type}</span>
                    {a.showOnLanding && <span className="text-[8px] px-2 py-0.5 bg-white/10 text-gray-400 rounded font-black uppercase">Landing</span>}
                    {a.showOnDashboard && <span className="text-[8px] px-2 py-0.5 bg-white/10 text-gray-400 rounded font-black uppercase">Dashboard</span>}
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-gray-500 text-right">
                <div>{new Date(a.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-20 text-gray-500 text-sm bg-white/5 border border-white/10 rounded-2xl">No announcements yet</div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-[#1a1d23] border border-white/10 rounded-3xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Create Announcement</h3>
            <div className="space-y-4">
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Message content..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500">
                <option value="INFO">Info</option>
                <option value="SUCCESS">Success</option>
                <option value="WARNING">Warning</option>
              </select>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={form.showOnLanding} onChange={e => setForm({...form, showOnLanding: e.target.checked})} /> Show on Landing
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={form.showOnDashboard} onChange={e => setForm({...form, showOnDashboard: e.target.checked})} /> Show on Dashboard
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest">Cancel</button>
                <button onClick={handleCreate} className="flex-1 py-3 bg-purple-500 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-purple-600">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBroadcast && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowBroadcast(false)}>
          <div className="bg-[#1a1d23] border border-white/10 rounded-3xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Broadcast Notification</h3>
            <p className="text-sm text-gray-500 mb-6">Send a notification to ALL users</p>
            <div className="space-y-4">
              <input type="text" value={broadcast.title} onChange={e => setBroadcast({...broadcast, title: e.target.value})} placeholder="Notification title" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-brand-teal" />
              <textarea value={broadcast.message} onChange={e => setBroadcast({...broadcast, message: e.target.value})} placeholder="Notification message..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-brand-teal" />
              <select value={broadcast.type} onChange={e => setBroadcast({...broadcast, type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-brand-teal">
                <option value="INFO">Info</option>
                <option value="SUCCESS">Success</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowBroadcast(false)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest">Cancel</button>
                <button onClick={handleBroadcast} className="flex-1 py-3 bg-brand-teal rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-cyan-600">Send to All Users</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}