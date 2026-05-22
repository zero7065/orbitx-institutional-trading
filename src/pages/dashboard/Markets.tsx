import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { TrendingUp, TrendingDown, Star, Search, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';

export default function MarketHub() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [markets, setMarkets] = useState<any[]>([]);
  const [rates, setRates] = useState<any>({});
  const [networks, setNetworks] = useState<any[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/live-rates').then(r => r.json()).then(setRates).catch(() => {}),
      fetch('/api/networks').then(r => r.json()).then(data => {
        setNetworks(data);
        setMarkets(data.map((n: any) => ({
          id: n.symbol.toLowerCase(),
          name: n.name,
          symbol: n.symbol,
          color: n.color,
        })));
      }).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/live-rates').then(r => r.json()).then(setRates).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const candleSeries = (chart as any).addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    const basePrice = rates[selectedSymbol]?.price || 50000;
    const data = [];
    const now = new Date();
    let price = basePrice;
    for (let i = 0; i < 100; i++) {
      const d = new Date(now);
      d.setHours(d.getHours() - (100 - i));
      const volatility = basePrice * 0.02;
      const open = price + (Math.random() - 0.5) * volatility;
      const close = open + (Math.random() - 0.5) * volatility;
      data.push({
        time: Math.floor(d.getTime() / 1000) as any,
        open,
        high: Math.max(open, close) + Math.random() * volatility * 0.5,
        low: Math.min(open, close) - Math.random() * volatility * 0.5,
        close,
      });
      price = close;
    }
    candleSeries.setData(data);
    chartRef.current = chart;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [selectedSymbol, rates]);

  const selectedMarket = markets.find(m => m.symbol === selectedSymbol);
  const selectedRate = rates[selectedSymbol];
  const filteredMarkets = markets.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-teal" size={32} /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Market Hub</h1>
          <p className="text-gray-500">Real-time crypto prices and trading analytics</p>
        </div>
        <div className="relative flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-green-400 font-bold">Live Prices</span>
          </div>
        </div>
      </div>

      {markets.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {markets.map(m => {
            const r = rates[m.symbol];
            return (
              <div key={m.symbol} className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl whitespace-nowrap">
                <span className="text-lg font-bold" style={{ color: m.color }}>{m.symbol[0]}</span>
                <div>
                  <div className="text-xs font-bold">{m.symbol}/USDT</div>
                  <div className={`text-xs font-bold ${(r?.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {r?.change >= 0 ? '+' : ''}{r?.change?.toFixed(2) || '0.00'}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-teal/20 flex items-center justify-center text-2xl text-brand-teal font-bold">
                      {selectedSymbol[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedMarket?.name || selectedSymbol} / USD</h2>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-mono text-gray-400">Vol ${(selectedRate?.volume || 0).toLocaleString()}</span>
                        <span className={(selectedRate?.change || 0) > 0 ? 'text-green-400' : 'text-red-400'}>
                          {selectedRate?.change > 0 ? '+' : ''}{selectedRate?.change?.toFixed(2) || '0.00'}%
                        </span>
                      </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-3xl font-black">${(selectedRate?.price || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest font-mono">Live Price</div>
                 </div>
              </div>

              <div ref={chartContainerRef} className="rounded-xl overflow-hidden" />

              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-brand-teal/20 text-brand-teal rounded-lg text-xs font-bold hover:bg-brand-teal/30">1H</button>
                <button className="px-4 py-2 bg-white/10 text-gray-400 rounded-lg text-xs font-bold hover:bg-white/20">1D</button>
                <button className="px-4 py-2 bg-white/10 text-gray-400 rounded-lg text-xs font-bold hover:bg-white/20">1W</button>
                <button className="px-4 py-2 bg-white/10 text-gray-400 rounded-lg text-xs font-bold hover:bg-white/20">1M</button>
                <button className="px-4 py-2 bg-white/10 text-gray-400 rounded-lg text-xs font-bold hover:bg-white/20">1Y</button>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
             <input
               type="text"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               placeholder="Search Currencies"
               className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-1 focus:ring-brand-teal outline-none text-sm"
             />
           </div>

           <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                 <h3 className="font-bold">All Markets</h3>
                 <Star size={18} className="text-brand-gold fill-brand-gold" />
              </div>
              <div className="p-0">
                 {filteredMarkets.map((m) => {
                   const r = rates[m.symbol];
                   return (
                     <button
                       key={m.symbol}
                       onClick={() => setSelectedSymbol(m.symbol)}
                       className={`w-full flex items-center justify-between p-4 hover:bg-white/2 transition-all border-b border-white/5 last:border-0 ${selectedSymbol === m.symbol ? 'bg-brand-teal/5 border-l-4 border-l-brand-teal' : ''}`}
                     >
                        <div className="flex items-center gap-4">
                           <div className="text-xl text-gray-400 font-bold w-6" style={{ color: m.color }}>{m.symbol[0]}</div>
                           <div className="text-left">
                              <div className="font-bold flex items-center gap-2">{m.symbol}</div>
                              <div className="text-xs text-gray-500">{m.name}</div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="font-bold">${(r?.price || 0).toLocaleString()}</div>
                           <div className={`text-xs flex items-center justify-end gap-1 ${(r?.change || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {(r?.change || 0) > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {r?.change?.toFixed(2) || '0.00'}%
                           </div>
                        </div>
                     </button>
                   );
                 })}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}