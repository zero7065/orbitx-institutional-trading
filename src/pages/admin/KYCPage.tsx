import React, { useEffect, useState } from 'react';
import { RefreshCw, Check, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function KYCPage() {
  const [pendingKycs, setPendingKycs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<any>(null);

  const fetchKYC = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/kyc');
      if (res.ok) setPendingKycs(await res.json());
      else toast.error('Failed to load KYC submissions');
    } catch (e) {
      toast.error('Network error loading KYC');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKYC(); }, []);

  const handleKyc = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/kyc/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) { toast.success(`KYC ${status.toLowerCase()}`); setViewing(null); fetchKYC(); }
      else { const d = await res.json().catch(() => ({})); toast.error(d.error || 'KYC action failed'); }
    } catch (e) { toast.error('Network error'); }
  };

  if (loading) return <div className="animate-pulse text-center py-20 text-gray-500 text-sm">Loading KYC submissions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">KYC Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">{pendingKycs.length} pending verifications</p>
        </div>
        <button onClick={fetchKYC} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-[10px] font-black tracking-widest text-gray-400">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pendingKycs.map((user) => (
          <div key={user.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold">{user.email}</h3>
                <div className="text-[10px] text-gray-500 mt-1">Submitted {new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
              <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-[9px] font-black uppercase">Pending</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setViewing(user)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all">
                View Documents
              </button>
              <button onClick={() => handleKyc(user.id, 'APPROVED')} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all">
                Approve
              </button>
              <button onClick={() => handleKyc(user.id, 'REJECTED')} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all">
                Reject
              </button>
            </div>
          </div>
        ))}
        {pendingKycs.length === 0 && (
          <div className="md:col-span-2 text-center py-20 text-gray-500 text-sm bg-white/5 border border-white/10 rounded-2xl">
            <Check size={40} className="mx-auto mb-4 text-green-400 opacity-50" />
            No pending KYC submissions
          </div>
        )}
      </div>

      {viewing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewing(null)}>
          <div className="bg-[#1a1d23] border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black">{viewing.email}</h3>
                <p className="text-sm text-gray-500">KYC Documentation</p>
              </div>
              <button onClick={() => setViewing(null)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10"><X size={18} /></button>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">ID Document</h4>
                {viewing.kycDocument ? (
                  <img src={viewing.kycDocument} alt="ID Document" className="w-full rounded-2xl border border-white/10" />
                ) : (
                  <div className="bg-white/5 rounded-2xl p-12 text-center text-gray-500">No document uploaded</div>
                )}
              </div>
              <div>
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Selfie</h4>
                {viewing.kycSelfie ? (
                  <img src={viewing.kycSelfie} alt="Selfie" className="w-full rounded-2xl border border-white/10" />
                ) : (
                  <div className="bg-white/5 rounded-2xl p-12 text-center text-gray-500">No selfie uploaded</div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleKyc(viewing.id, 'APPROVED')} className="flex-1 py-3 bg-green-500 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-green-600 transition-all">Approve</button>
                <button onClick={() => handleKyc(viewing.id, 'REJECTED')} className="flex-1 py-3 bg-red-500 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all">Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}