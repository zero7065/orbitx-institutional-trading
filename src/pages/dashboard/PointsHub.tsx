import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Coins, Zap, Gift, TrendingUp, Clock, CheckCircle, Loader2, Award, Star, Flame, Diamond, Sparkles, Activity, LogIn, HandCoins, ArrowRight, RotateCcw } from 'lucide-react';

const DAILY_ACTIVITIES = [
  { id: 'LOGIN', label: 'Daily Login', icon: LogIn, points: 50, desc: 'Log in to claim daily reward' },
  { id: 'TRADE', label: 'Complete Trade', icon: HandCoins, points: 100, desc: 'Make a trade on the platform' },
  { id: 'INVEST', label: 'Make Investment', icon: TrendingUp, points: 200, desc: 'Start an investment plan' },
  { id: 'SPIN', label: 'Spin the Wheel', icon: RotateCcw, points: 75, desc: 'Try your luck on the spin wheel' },
  { id: 'REFERRAL', label: 'Refer a Friend', icon: Activity, points: 150, desc: 'Share your referral link' },
];

export default function PointsHub() {
  const [points, setPoints] = useState<any>(null);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimedToday, setClaimedToday] = useState<string[]>([]);

  useEffect(() => { fetchPoints(); }, []);

  const fetchPoints = async () => {
    try {
      const res = await fetch('/api/points');
      if (res.ok) setPoints(await res.json());
    } catch {}
  };

  const handleClaim = async (activityId: string) => {
    setClaiming(activityId);
    try {
      const res = await fetch('/api/points/daily-claim', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity: activityId })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`+${data.earned} points earned!`);
        setClaimedToday([...claimedToday, activityId]);
        fetchPoints();
      }
    } catch { toast.error('Failed to claim'); }
    setClaiming(null);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'DIAMOND': return 'text-cyan-300 bg-cyan-500/20 border-cyan-500/30';
      case 'PLATINUM': return 'text-gray-300 bg-gray-500/20 border-gray-500/30';
      case 'GOLD': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'SILVER': return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
      default: return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'DIAMOND': return Diamond; case 'PLATINUM': return Award;
      case 'GOLD': return Star; case 'SILVER': return Sparkles;
      default: return Flame;
    }
  };

  if (!points) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-teal" size={32} /></div>;

  const TierIcon = getTierIcon(points.tier);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black mb-2">Points Rewards</h1>
        <p className="text-gray-500">Earn points through daily activities and swap them for rewards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2"><Zap className="text-brand-teal" size={20} /> Daily Activities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DAILY_ACTIVITIES.map((act) => {
                const isClaimed = claimedToday.includes(act.id);
                return (
                  <div key={act.id} className={`p-4 rounded-2xl border transition-all ${isClaimed ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/10 hover:border-brand-teal'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isClaimed ? 'bg-green-500/20' : 'bg-brand-teal/10'}`}>
                          {isClaimed ? <CheckCircle className="text-green-400" size={20} /> : <act.icon className="text-brand-teal" size={20} />}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{act.label}</div>
                          <div className="text-xs text-gray-500">{act.desc}</div>
                        </div>
                      </div>
                      <div className="text-brand-teal font-black">+{act.points}</div>
                    </div>
                    <button onClick={() => handleClaim(act.id)} disabled={isClaimed || claiming === act.id} className={`w-full py-2 rounded-xl text-sm font-bold transition-all ${isClaimed ? 'bg-green-500/20 text-green-400' : 'bg-brand-teal text-slate-900 hover:bg-cyan-400'} disabled:opacity-50`}>
                      {claiming === act.id ? <Loader2 className="animate-spin mx-auto" size={16} /> : isClaimed ? 'Claimed ✓' : 'Claim'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2"><Clock className="text-brand-teal" size={20} /> Points History</h3>
            {points.transactions?.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {points.transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${tx.type === 'EARNED' || tx.type === 'DAILY' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {tx.type === 'EARNED' || tx.type === 'DAILY' ? '+' : '-'}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{tx.source || tx.type}</div>
                        <div className="text-[10px] text-gray-500">{new Date(tx.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className={`font-bold ${tx.type === 'EARNED' || tx.type === 'DAILY' ? 'text-green-400' : 'text-purple-400'}`}>
                      {tx.type === 'EARNED' || tx.type === 'DAILY' ? '+' : '-'}{tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 text-sm">No points activity yet. Complete daily tasks to earn!</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 text-center">
            <TierIcon className="mx-auto mb-3" size={48} style={{ color: points.tier === 'DIAMOND' ? '#22d3ee' : points.tier === 'GOLD' ? '#fbbf24' : points.tier === 'SILVER' ? '#9ca3af' : '#fb923c' }} />
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-black ${getTierColor(points.tier)}`}>
              {points.tier} TIER
            </div>
            <div className="mt-6">
              <div className="text-4xl font-black text-brand-teal mb-2">{points.balance.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Points</div>
            </div>
            <div className="mt-4 flex justify-between text-xs text-gray-500">
              <span>Earned: {points.totalEarned.toLocaleString()}</span>
              <span>Spent: {points.totalSpent.toLocaleString()}</span>
            </div>
            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <div className="text-xs text-gray-500 mb-2">Next Tier</div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-teal to-purple-500 rounded-full" style={{ width: `${Math.min(100, (points.balance / (points.tier === 'BRONZE' ? 2500 : points.tier === 'SILVER' ? 10000 : points.tier === 'GOLD' ? 25000 : points.tier === 'PLATINUM' ? 50000 : 50000)) * 100)}%` }} />
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                {points.tier === 'BRONZE' && '2,500 for SILVER'}
                {points.tier === 'SILVER' && '10,000 for GOLD'}
                {points.tier === 'GOLD' && '25,000 for PLATINUM'}
                {points.tier === 'PLATINUM' && '50,000 for DIAMOND'}
                {points.tier === 'DIAMOND' && 'MAX TIER'}
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-black text-sm mb-3 flex items-center gap-2"><Gift className="text-brand-teal" size={16} /> Quick Swap</h3>
            <p className="text-xs text-gray-500 mb-4">Visit the Swap Shop to exchange points for tokens, NFTs, and more</p>
            <button onClick={() => window.location.href = '/dashboard/points-shop'} className="w-full py-3 bg-gradient-to-r from-brand-teal to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
              <ArrowRight size={16} /> Go to Swap Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}