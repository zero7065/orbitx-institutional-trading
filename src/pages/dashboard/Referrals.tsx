import React, { useEffect, useState } from 'react';
import { Share2, Link as LinkIcon, UserPlus, Trophy, ChevronRight, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralsPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()).then(data => setUser(data.user)).catch(() => {}),
      fetch('/api/referrals/stats').then(r => r.json()).then(setStats).catch(() => {}),
      fetch('/api/referrals/list').then(r => r.json()).then(setReferrals).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  const referralLink = `${window.location.origin}/auth/register?ref=${user?.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
          <p className="text-gray-500">Invite your friends and earn a percentage of their initial deposits.</p>
        </div>
        <div className="flex gap-4">
           <div className="glass-card px-8 py-4 text-center min-w-[140px]">
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">Invited</div>
              <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin inline" size={18} /> : `${stats?.invitedCount || 0} Users`}</div>
           </div>
           <div className="glass-card px-8 py-4 text-center min-w-[140px] border-b-2 border-brand-teal">
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">Total Earned</div>
              <div className="text-2xl font-bold text-brand-teal">{loading ? <Loader2 className="animate-spin inline" size={18} /> : `$${(stats?.totalEarned || 0).toFixed(2)}`}</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 text-brand-teal/10">
             <Share2 size={120} />
           </div>
           <h3 className="text-2xl font-bold mb-6">Your Invitation Link</h3>
           <p className="text-gray-400 mb-8 max-w-sm">Share this unique link with your network. When they sign up and fund their account, you both get a bonus.</p>
           
           <div className="flex gap-2">
              <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-4 font-mono text-sm text-brand-teal overflow-hidden text-ellipsis whitespace-nowrap">
                {referralLink}
              </div>
              <button 
                onClick={copyLink}
                className="px-6 rounded-xl gradient-teal text-slate-900 font-bold flex items-center gap-2 hover:scale-[1.02] transition-all"
              >
                <Copy size={18} /> Copy
              </button>
           </div>

           <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="text-center">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-brand-teal border border-brand-teal/20">
                   <UserPlus size={24} />
                 </div>
                 <div className="text-xs font-bold">Invite</div>
              </div>
              <div className="flex items-center justify-center text-gray-700">
                <ChevronRight />
              </div>
              <div className="text-center">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-brand-gold border border-brand-gold/20">
                   <Trophy size={24} />
                 </div>
                 <div className="text-xs font-bold">Earn Rewards</div>
              </div>
           </div>
        </div>

        <div className="glass-card p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Recent Referrals</h3>
              <span className="text-xs font-bold text-brand-teal bg-brand-teal/10 px-3 py-1 rounded-full">+ ${stats?.bonusRate || 5}/User</span>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-brand-teal" size={24} /></div>
              ) : referrals.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No referrals yet. Share your link to start earning!</p>
              ) : (
                referrals.map((ref: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/2 rounded-xl border border-white/5">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 font-bold uppercase">{ref.email?.[0] || '?'}</div>
                        <div>
                           <div className="font-bold text-sm">{ref.email}</div>
                           <div className="text-[10px] text-gray-500">{ref.date}</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className={`text-xs font-bold ${ref.status === 'Active' ? 'text-green-400' : 'text-gray-500'}`}>{ref.status}</div>
                        <div className="text-sm font-bold text-brand-teal">+ ${ref.bonus.toFixed(2)}</div>
                     </div>
                  </div>
                ))
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
