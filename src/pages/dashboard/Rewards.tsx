import React, { useEffect, useState } from 'react';
import { Award, Zap, CheckCircle2, CircleDashed } from 'lucide-react';
import { toast } from 'sonner';

export default function RewardsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/user/stats').then(r => r.json()).then(setStats);
  }, []);

  const claimDaily = () => {
    toast.success('Daily reward claimed! +$5 added to balance');
  };

  const streak = stats?.loginStreak || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Award className="text-brand-gold" size={32} />
              <h1 className="text-3xl font-bold">Rewards Hub</h1>
           </div>
           <p className="text-gray-500">Collect daily bonuses and climb the loyalty tiers.</p>
        </div>
        <div className="glass-card px-8 py-5 flex items-center gap-6 border-b-2 border-brand-gold">
           <div className="text-center">
             <div className="text-xs font-bold text-gray-500 uppercase mb-1">Current Streak</div>
             <div className="text-2xl font-bold flex items-center gap-2">
               <Zap className="text-brand-gold fill-brand-gold" size={20} />
               {streak} Days
             </div>
           </div>
        </div>
      </div>

      <div className="glass-card p-10">
        <h3 className="text-xl font-bold mb-8">7-Day Login Streak</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {[1,2,3,4,5,6,7].map((day) => (
             <div 
               key={day}
               className={`relative p-4 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                 day <= streak 
                   ? 'bg-brand-gold/10 border-brand-gold text-brand-gold' 
                   : 'bg-white/5 border-white/5 text-gray-600'
               }`}
             >
                <div className="text-[10px] font-black uppercase mb-3">Day {day}</div>
                {day <= streak ? <CheckCircle2 size={24} /> : <CircleDashed size={24} />}
                <div className="mt-3 font-bold text-xs">${day * 5}</div>
                
                {day === streak + 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-brand-gold text-slate-900 text-[8px] font-black rounded-full whitespace-nowrap">
                    NEXT UP
                  </div>
                )}
             </div>
          ))}
        </div>
        
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-brand-teal/20 to-blue-600/10 border border-brand-teal/20 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex-1">
             <h4 className="text-2xl font-bold mb-2">Claim Today's Reward</h4>
             <p className="text-gray-400 text-sm">Don't break your streak! Every continuous login increases your daily bonus multiplier.</p>
           </div>
           <button 
             onClick={claimDaily}
             className="px-10 py-4 gradient-teal text-slate-900 font-bold rounded-xl shadow-[0_0_30px_rgba(0,245,255,0.3)] hover:scale-105 active:scale-95 transition-all"
           >
             Claim $5.00
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8">
           <h4 className="font-bold mb-4">Referral Milestones</h4>
           <div className="space-y-6">
              {[
                { label: 'Starter', limit: 5, progress: 12, reward: '$100' },
                { label: 'Pro', limit: 50, progress: 12, reward: '$1,000' },
                { label: 'Whale', limit: 100, progress: 12, reward: '$5,000' },
              ].map((m) => (
                <div key={m.label} className="space-y-2">
                   <div className="flex justify-between text-xs font-bold">
                     <span className="text-gray-400">{m.label} (Invited {m.limit} Users)</span>
                     <span className="text-brand-gold">{m.reward}</span>
                   </div>
                   <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full gradient-teal" style={{ width: `${Math.min((m.progress/m.limit)*100, 100)}%` }} />
                   </div>
                </div>
              ))}
           </div>
        </div>
        
        <div className="glass-card p-8 group relative overflow-hidden">
           <Award className="absolute -bottom-8 -right-8 w-40 h-40 text-brand-gold/5 group-hover:scale-110 transition-all duration-700" size={160} />
           <h4 className="font-bold mb-4">Loyalty Tiers</h4>
           <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border-l-4 border-l-gray-400">
                 <div className="text-sm font-bold">Standard Investor</div>
                 <p className="text-[10px] text-gray-500">2% Fee on Withdrawals</p>
              </div>
              <div className="p-4 rounded-xl bg-brand-gold/5 border-l-4 border-l-brand-gold">
                 <div className="text-sm font-bold text-brand-gold">VIP Legend (Coming Soon)</div>
                 <p className="text-[10px] text-brand-gold/60">0% Fee + Early Access to IDOs</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
