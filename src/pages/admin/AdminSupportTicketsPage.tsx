import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Search, MessageSquare, Send, CheckCircle, Clock, AlertCircle, XCircle, Filter } from 'lucide-react';

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchTickets(); }, [statusFilter]);

  const fetchTickets = async () => {
    const url = statusFilter ? `/api/admin/support-tickets?status=${statusFilter}` : '/api/admin/support-tickets';
    const res = await fetch(url);
    setTickets(await res.json());
    setLoading(false);
  };

  const handleRespond = async () => {
    if (!response.trim() || !selected) return;
    const res = await fetch(`/api/admin/support-tickets/${selected.id}/respond`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response })
    });
    if (res.ok) {
      toast.success('Response sent');
      setResponse('');
      setSelected(null);
      fetchTickets();
    } else toast.error('Failed');
  };

  const getStatusBadge = (s: string) => {
    const colors: any = { OPEN: 'bg-yellow-500/20 text-yellow-400', IN_PROGRESS: 'bg-blue-500/20 text-blue-400', RESOLVED: 'bg-green-500/20 text-green-400', CLOSED: 'bg-gray-500/20 text-gray-400' };
    return <span className={`text-[10px] px-2 py-1 rounded font-bold ${colors[s] || colors.OPEN}`}>{s}</span>;
  };

  const getPriorityBadge = (p: string) => {
    const colors: any = { URGENT: 'bg-red-500/20 text-red-400', HIGH: 'bg-orange-500/20 text-orange-400', MEDIUM: 'bg-yellow-500/20 text-yellow-400', LOW: 'bg-gray-500/20 text-gray-400' };
    return <span className={`text-[10px] px-2 py-1 rounded font-bold ${colors[p] || colors.MEDIUM}`}>{p}</span>;
  };

  if (loading) return <div className="animate-pulse text-center py-20 text-gray-500">Loading tickets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Support Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">{tickets.length} total tickets</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs">
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <button onClick={fetchTickets} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold"><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass-card p-4 max-h-[600px] overflow-y-auto">
          {tickets.map((t: any) => (
            <button key={t.id} onClick={() => setSelected(t)} className={`w-full text-left p-4 rounded-xl border mb-2 transition-all ${selected?.id === t.id ? 'border-brand-teal bg-brand-teal/10' : 'border-white/10 hover:bg-white/5'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{t.userEmail}</span>
                {getPriorityBadge(t.priority)}
              </div>
              <div className="font-bold text-sm mb-1 truncate">{t.subject}</div>
              <div className="flex items-center justify-between">
                {getStatusBadge(t.status)}
                <span className="text-[10px] text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
          {tickets.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No tickets found</p>}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-black text-lg">{selected.subject}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{selected.userEmail}</span>
                    {getPriorityBadge(selected.priority)}
                    {getStatusBadge(selected.status)}
                  </div>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-gray-500 mb-2 font-bold">USER MESSAGE</p>
                  <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                </div>
                {selected.adminResponse && (
                  <div className="p-4 bg-brand-teal/10 border border-brand-teal/20 rounded-xl">
                    <p className="text-xs text-brand-teal mb-2 font-bold">ADMIN RESPONSE</p>
                    <p className="text-sm whitespace-pre-wrap">{selected.adminResponse}</p>
                  </div>
                )}
              </div>
              {selected.status !== 'CLOSED' && (
                <div className="space-y-3">
                  <textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Type your response..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm resize-none focus:ring-1 focus:ring-brand-teal outline-none" />
                  <button onClick={handleRespond} disabled={!response.trim()} className="flex items-center gap-2 px-6 py-3 bg-brand-teal text-slate-900 font-bold rounded-xl disabled:opacity-50">
                    <Send size={16} /> Send Response
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <MessageSquare className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-gray-500">Select a ticket to respond</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}