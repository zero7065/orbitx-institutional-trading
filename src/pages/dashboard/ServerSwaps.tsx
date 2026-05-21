import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ArrowLeftRight, TrendingUp, Clock, CheckCircle, XCircle, Loader2, Plus, ArrowUp, ArrowDown, Bitcoin, DollarSign } from 'lucide-react';

const CRYPTO_OPTIONS = [
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { symbol: 'USDT', name: 'Tether', color: '#26A17B' },
  { symbol: 'BNB', name: 'BNB', color: '#F3BA2F' },
  { symbol: 'SOL', name: 'Solana', color: '#00FFA3' },
];

export default function ServerSwaps() {
  const [orders, setOrders] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<'orderbook' | 'mine'>('orderbook');
  const [filterCrypto, setFilterCrypto] = useState('');
  const [form, setForm] = useState({ type: 'SELL', crypto: 'BTC', quantity: '', price: '', paymentMethod: '' });

  useEffect(() => { fetchOrders(); fetchMyOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (filterCrypto) params.set('crypto', filterCrypto);
      params.set('status', 'PENDING');
      const res = await fetch(`/api/swaps/orders?${params}`);
      const data = await res.json();
      setOrders(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await fetch('/api/swaps/orders?status=PENDING,FILLED,CANCELLED');
      const data = await res.json();
      setMyOrders(data?.filter((o: any) => o.userEmail !== 'admin@cryptovault.io') || []);
    } catch (e) { console.error(e); }
  };

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.quantity || !form.price) { toast.error('Fill in all fields'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/swaps/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: parseFloat(form.quantity), price: parseFloat(form.price) })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to create order'); }
      toast.success('Order created successfully');
      setShowCreate(false);
      setForm({ type: 'SELL', crypto: 'BTC', quantity: '', price: '', paymentMethod: '' });
      fetchOrders(); fetchMyOrders();
    } catch (err: any) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const res = await fetch('/api/swaps/cancel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to cancel'); }
      toast.success('Order cancelled');
      fetchOrders(); fetchMyOrders();
    } catch (err: any) { toast.error(err.message); }
  };

  const statusColor: any = { PENDING: 'text-yellow-400', FILLED: 'text-green-400', CANCELLED: 'text-red-400' };
  const statusIcon: any = { PENDING: Clock, FILLED: CheckCircle, CANCELLED: XCircle };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ArrowLeftRight className="text-brand-teal" size={28} /> Server Swaps
          </h1>
          <p className="text-gray-500 text-sm mt-1">Peer-to-peer crypto swap marketplace</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-teal to-blue-600 text-[#0B0E11] font-black text-sm hover:opacity-90 transition-all">
          <Plus size={18} /> Create Order
        </button>
      </div>

      <div className="flex gap-2 border-b border-white/5 pb-4">
        {(['orderbook', 'mine'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${tab === t ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            {t === 'orderbook' ? 'Order Book' : 'My Orders'}
          </button>
        ))}
      </div>

      {tab === 'orderbook' && (
        <>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { setFilterCrypto(''); fetchOrders(); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${!filterCrypto ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}>ALL</button>
            {CRYPTO_OPTIONS.map(c => (
              <button key={c.symbol} onClick={() => { setFilterCrypto(c.symbol); fetchOrders(); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${filterCrypto === c.symbol ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}
                style={{ borderColor: filterCrypto === c.symbol ? c.color : undefined }}>{c.symbol}</button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-teal" size={32} /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <ArrowLeftRight size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-black text-lg">No open orders</p>
              <p className="text-sm mt-1">Create a sell order to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-1 overflow-hidden">
                <div className="px-5 py-3 text-xs font-black text-green-400 uppercase tracking-widest border-b border-white/5 flex items-center gap-2"><ArrowUp size={14} /> Buy Orders</div>
                {orders.filter(o => o.type === 'BUY').slice(0, 10).map(o => (
                  <div key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-all border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-white">{o.crypto}</span>
                      <span className="text-xs text-gray-500">{o.quantity} units</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-green-400">${o.price.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-600">Total: ${o.total.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
                {orders.filter(o => o.type === 'BUY').length === 0 && <div className="py-8 text-center text-gray-600 text-sm">No buy orders</div>}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-1 overflow-hidden">
                <div className="px-5 py-3 text-xs font-black text-red-400 uppercase tracking-widest border-b border-white/5 flex items-center gap-2"><ArrowDown size={14} /> Sell Orders</div>
                {orders.filter(o => o.type === 'SELL').slice(0, 10).map(o => (
                  <div key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-all border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-white">{o.crypto}</span>
                      <span className="text-xs text-gray-500">{o.quantity} units</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-red-400">${o.price.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-600">Total: ${o.total.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
                {orders.filter(o => o.type === 'SELL').length === 0 && <div className="py-8 text-center text-gray-600 text-sm">No sell orders</div>}
              </div>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2"><TrendingUp size={16} /> Market Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {CRYPTO_OPTIONS.map(c => {
                const buyMin = Math.min(...orders.filter(o => o.crypto === c.symbol && o.type === 'BUY').map(o => o.price), 0);
                const sellMax = Math.max(...orders.filter(o => o.crypto === c.symbol && o.type === 'SELL').map(o => o.price), 0);
                return (
                  <div key={c.symbol} className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="text-xs font-black mb-1" style={{ color: c.color }}>{c.symbol}</div>
                    <div className="text-[10px] text-gray-500">Buy: ${buyMin > 0 ? buyMin.toFixed(2) : '—'}</div>
                    <div className="text-[10px] text-gray-500">Sell: ${sellMax > 0 ? sellMax.toFixed(2) : '—'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {tab === 'mine' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Clock size={16} /> Your Orders</h3>
          </div>
          {myOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <ArrowLeftRight size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-black text-lg">No orders yet</p>
              <p className="text-sm mt-1">Create your first swap order</p>
            </div>
          ) : (
            <div>
              {myOrders.map(o => {
                const StatusIcon = statusIcon[o.status] || Clock;
                const crypto = CRYPTO_OPTIONS.find(c => c.symbol === o.crypto);
                return (
                  <div key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-all border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black`} style={{ backgroundColor: crypto?.color + '20', color: crypto?.color }}>{o.crypto}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black px-2 py-0.5 rounded ${o.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{o.type}</span>
                          <span className="text-sm font-black text-white">{o.quantity} {o.crypto}</span>
                        </div>
                        <div className="text-[10px] text-gray-600 mt-0.5">${o.price.toFixed(2)}/unit · Total ${o.total.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <StatusIcon size={14} className={statusColor[o.status] || 'text-gray-400'} />
                        <span className={`text-xs font-black ${statusColor[o.status] || 'text-gray-400'}`}>{o.status}</span>
                      </div>
                      {o.status === 'PENDING' && (
                        <button onClick={() => cancelOrder(o.id)} className="text-[10px] font-black text-red-400 hover:text-red-300 px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all">Cancel</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-[#1a1d24] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black text-white mb-6">Create Swap Order</h2>
            <form onSubmit={createOrder} className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Type</label>
                <div className="flex gap-2">
                  {(['SELL', 'BUY'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${form.type === t ? (t === 'BUY' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30') : 'bg-white/5 text-gray-500 border border-white/10'}`}>
                      {t === 'BUY' ? 'Buy' : 'Sell'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Crypto</label>
                <div className="flex gap-1.5 flex-wrap">
                  {CRYPTO_OPTIONS.map(c => (
                    <button key={c.symbol} type="button" onClick={() => setForm({ ...form, crypto: c.symbol })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${form.crypto === c.symbol ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}>{c.symbol}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Quantity</label>
                <input type="number" step="any" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-teal/50 transition-all" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Price (USD)</label>
                <input type="number" step="any" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-teal/50 transition-all" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Payment Method (optional)</label>
                <input type="text" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-teal/50 transition-all" placeholder="e.g. Bank Transfer, USDT" />
              </div>
              {form.quantity && form.price && (
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className="flex justify-between text-xs text-gray-400"><span>Total Value</span><span className="font-black text-white">${(parseFloat(form.quantity) * parseFloat(form.price)).toFixed(2)}</span></div>
                </div>
              )}
              <button type="submit" disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-teal to-blue-600 text-[#0B0E11] font-black text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                {submitting ? 'Creating...' : `Place ${form.type} Order`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
