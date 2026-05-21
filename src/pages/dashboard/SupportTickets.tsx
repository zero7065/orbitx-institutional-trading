import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Ticket, Plus, Search, Clock, CheckCircle, AlertCircle, 
  XCircle, ChevronRight, MessageSquare, Send, Loader2
} from 'lucide-react';

interface TicketData {
  id: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  adminResponse?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SupportTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  
  const [newTicket, setNewTicket] = useState({ subject: '', message: '', priority: 'MEDIUM' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });
      if (res.ok) {
        toast.success('Ticket created successfully');
        setShowCreate(false);
        setNewTicket({ subject: '', message: '', priority: 'MEDIUM' });
        fetchTickets();
      } else {
        toast.error('Failed to create ticket');
      }
    } catch (err) {
      toast.error('Error creating ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertCircle className="text-yellow-500" size={16} />;
      case 'IN_PROGRESS': return <Clock className="text-blue-500" size={16} />;
      case 'RESOLVED': return <CheckCircle className="text-green-500" size={16} />;
      case 'CLOSED': return <XCircle className="text-gray-500" size={16} />;
      default: return <Ticket className="text-gray-400" size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/20 text-red-400';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400';
      case 'LOW': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black mb-2">Support Tickets</h1>
          <p className="text-gray-500">Manage your support requests and track responses</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-teal text-slate-900 font-bold rounded-xl hover:bg-cyan-400 transition-all"
        >
          <Plus size={20} />
          New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4">
            <h3 className="font-black text-lg mb-4">Your Tickets</h3>
            {tickets.length === 0 ? (
              <p className="text-gray-500 text-sm">No tickets found</p>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedTicket?.id === ticket.id 
                        ? 'border-brand-teal bg-brand-teal/10' 
                        : 'border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {getStatusIcon(ticket.status)}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{ticket.subject}</div>
                        <div className="text-xs text-gray-500 mt-1">{formatDate(ticket.createdAt)}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-black">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-2 py-1 rounded font-bold ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      {getStatusIcon(selectedTicket.status)}
                      {selectedTicket.status}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(selectedTicket.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-xs text-gray-500 mb-2 font-bold">YOUR MESSAGE</div>
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                {selectedTicket.adminResponse && (
                  <div className="p-4 bg-brand-teal/10 border border-brand-teal/20 rounded-xl">
                    <div className="text-xs text-brand-teal mb-2 font-bold">ADMIN RESPONSE</div>
                    <p className="text-sm whitespace-pre-wrap">{selectedTicket.adminResponse}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <MessageSquare className="text-gray-600 mx-auto mb-4" size={48} />
              <p className="text-gray-500">Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d23] border border-white/10 rounded-3xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black">Create New Ticket</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-brand-teal outline-none"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-brand-teal outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-brand-teal outline-none resize-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-brand-teal text-slate-900 font-bold rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Ticket
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}