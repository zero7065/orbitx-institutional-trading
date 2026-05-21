import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Gift, Coins, Image as ImageIcon, Loader2, ShoppingCart, Check, ArrowLeft, Sparkles, Zap, Tag } from 'lucide-react';

export default function PointsShop() {
  const [items, setItems] = useState<any[]>([]);
  const [points, setPoints] = useState<any>(null);
  const [swapping, setSwapping] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { Promise.all([fetchItems(), fetchPoints()]).then(() => setLoading(false)).catch(() => setLoading(false)); }, []);

  const fetchItems = async () => { try { const r = await fetch('/api/points/rewards'); setItems(await r.json()); } catch { setItems([]); } };
  const fetchPoints = async () => { try { const r = await fetch('/api/points'); setPoints(await r.json()); } catch { setPoints(null); } };

  const handleSwap = async (itemId: string) => {
    setSwapping(itemId);
    try {
      const res = await fetch('/api/points/swap', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });
      if (res.ok) {
        toast.success('Item swapped successfully!');
        Promise.all([fetchItems(), fetchPoints()]);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Swap failed');
      }
    } catch { toast.error('Swap failed'); }
    setSwapping(null);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-teal" size={32} /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black mb-2">Points Swap Shop</h1>
          <p className="text-gray-500">Exchange your points for tokens, NFTs, and exclusive rewards</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-brand-teal">{points?.balance?.toLocaleString() || 0}</div>
          <div className="text-xs text-gray-500">Points Available</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => {
          const canAfford = (points?.balance || 0) >= item.pointsCost;
          return (
            <div key={item.id} className={`glass-card p-5 border transition-all ${canAfford ? 'hover:border-brand-teal' : 'opacity-60'}`}>
              <div className="w-full h-32 bg-gradient-to-br from-white/5 to-white/10 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
                {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <Gift className="text-gray-600" size={48} />}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] font-black ${item.type === 'TOKEN' ? 'bg-green-500/20 text-green-400' : item.type === 'NFT' ? 'bg-purple-500/20 text-purple-400' : 'bg-brand-teal/20 text-brand-teal'}`}>
                  {item.type}
                </div>
                {item.stock < 10 && item.stock > 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-[10px] font-black">
                    Only {item.stock} left!
                  </div>
                )}
              </div>
              <h3 className="font-black text-sm mb-1">{item.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{item.description}</p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-brand-teal font-black"><Coins size={14} />{item.pointsCost.toLocaleString()}</div>
                {item.valueUsd && <div className="text-xs text-gray-500">${item.valueUsd}</div>}
              </div>
              <button onClick={() => handleSwap(item.id)} disabled={!canAfford || swapping === item.id || item.stock <= 0} className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50" style={{ backgroundColor: canAfford ? 'rgba(0,209,255,0.15)' : 'rgba(255,255,255,0.05)', color: canAfford ? '#00D1FF' : '#666' }}>
                {swapping === item.id ? <><Loader2 className="animate-spin" size={16} /> Swapping...</> : item.stock <= 0 ? 'Out of Stock' : <><ShoppingCart size={16} /> Swap Now</>}
              </button>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-500">No rewards available yet. Check back later!</div>
      )}
    </div>
  );
}