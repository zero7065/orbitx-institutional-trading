import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { TrendingUp, TrendingDown, Star, Search, ExternalLink, ArrowRight } from 'lucide-react';

const CRYPTO_MARKETS = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 68542.20, change: 2.5, icon: '₿', url: 'https://www.coingecko.com/en/coins/bitcoin' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 3421.15, change: -1.2, icon: 'Ξ', url: 'https://www.coingecko.com/en/coins/ethereum' },
  { id: 'usdt', name: 'Tether', symbol: 'USDT', price: 1.00, change: 0.01, icon: '₮', url: 'https://www.coingecko.com/en/coins/tether' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', price: 145.20, change: 5.8, icon: 'S', url: 'https://www.coingecko.com/en/coins/solana' },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', price: 582.40, change: 0.8, icon: 'B', url: 'https://www.coingecko.com/en/coins/binancecoin' },
  { id: 'xrp', name: 'Ripple', symbol: 'XRP', price: 0.52, change: 3.2, icon: '✕', url: 'https://www.coingecko.com/en/coins/ripple' },
  { id: 'ada', name: 'Cardano', symbol: 'ADA', price: 0.45, change: -0.5, icon: '₳', url: 'https://www.coingecko.com/en/coins/cardano' },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', price: 0.12, change: 8.5, icon: 'Ð', url: 'https://www.coingecko.com/en/coins/dogecoin' },
];

const TRADING_PAIRS = [
  { base: 'BTC', quote: 'USDT', volume: '2.4B', price: '68,542.20' },
  { base: 'ETH', quote: 'USDT', volume: '1.8B', price: '3,421.15' },
  { base: 'SOL', quote: 'USDT', volume: '890M', price: '145.20' },
  { base: 'BNB', quote: 'USDT', volume: '520M', price: '582.40' },
];

export default function MarketHub() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [selectedTicker, setSelectedTicker] = useState(CRYPTO_MARKETS[0]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!chartContainerRef.current) return;

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

    const data = [];
    let price = selectedTicker.price;
    const now = new Date();
    for (let i = 0; i < 100; i++) {
        const d = new Date(now);
        d.setHours(d.getHours() - (100 - i));
        const open = price + (Math.random() - 0.5) * 50;
        const close = open + (Math.random() - 0.5) * 50;
        data.push({
            time: d.getTime() / 1000 as any,
            open,
            high: Math.max(open, close) + Math.random() * 20,
            low: Math.min(open, close) - Math.random() * 20,
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
  }, [selectedTicker]);

  const filteredMarkets = CRYPTO_MARKETS.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all">
            <span className="text-xs text-gray-400">View External</span>
            <ExternalLink size={12} className="text-gray-400" />
          </a>
        </div>
      </div>

      {/* Live Ticker */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {CRYPTO_MARKETS.map(crypto => (
          <div key={crypto.id} className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl whitespace-nowrap">
            <span className="text-lg font-bold">{crypto.icon}</span>
            <div>
              <div className="text-xs font-bold">{crypto.symbol}/USDT</div>
              <div className={`text-xs font-bold ${crypto.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {crypto.change >= 0 ? '+' : ''}{crypto.change}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="glass-card p-6">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-brand-teal/20 flex items-center justify-center text-2xl text-brand-teal font-bold">
                        {selectedTicker.icon}
                     </div>
                     <div>
                       <h2 className="text-xl font-bold">{selectedTicker.name} / USD</h2>
                       <div className="flex items-center gap-2 text-sm">
                         <span className="font-mono text-gray-400">Vol $24.2B</span>
                         <span className={selectedTicker.change > 0 ? 'text-green-400' : 'text-red-400'}>
                           {selectedTicker.change > 0 ? '+' : ''}{selectedTicker.change}%
                         </span>
                       </div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-3xl font-black">${selectedTicker.price.toLocaleString()}</div>
                     <div className="text-xs text-gray-500 uppercase tracking-widest font-mono">Live Price</div>
                     <a href={selectedTicker.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand-teal hover:underline flex items-center gap-1 mt-1">
                       View on CoinGecko <ExternalLink size={10} />
                     </a>
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

            {/* Trading Pairs */}
            <div className="glass-card overflow-hidden mt-6">
               <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-bold">Top Trading Pairs</h3>
                  <span className="text-xs text-gray-500">Real-time</span>
               </div>
               <div className="divide-y divide-white/5">
                  {TRADING_PAIRS.map((pair, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-brand-teal/20 flex items-center justify-center text-brand-teal font-bold text-xs">
                           {pair.base[0]}
                         </div>
                         <div>
                            <div className="font-bold text-sm">{pair.base}/{pair.quote}</div>
                            <div className="text-xs text-gray-500">Vol: ${pair.volume}</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="font-bold">${pair.price}</div>
                         <a href="#" className="text-[10px] text-brand-teal hover:underline flex items-center gap-1">
                           Trade <ArrowRight size={10} />
                         </a>
                      </div>
                    </div>
                  ))}
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
                  {filteredMarkets.map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => setSelectedTicker(t)}
                      className={`w-full flex items-center justify-between p-4 hover:bg-white/2 transition-all border-b border-white/5 last:border-0 ${selectedTicker.id === t.id ? 'bg-brand-teal/5 border-l-4 border-l-brand-teal' : ''}`}
                    >
                       <div className="flex items-center gap-4">
                          <div className="text-xl text-gray-400 font-bold w-6">{t.icon}</div>
                          <div className="text-left">
                             <div className="font-bold flex items-center gap-2">
                               {t.symbol} 
                               <a href={t.url} target="_blank" onClick={e => e.stopPropagation()} className="text-[8px] text-gray-500 hover:text-brand-teal">
                                 <ExternalLink size={10} />
                               </a>
                             </div>
                             <div className="text-xs text-gray-500">{t.name}</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="font-bold">${t.price.toLocaleString()}</div>
                          <div className={`text-xs flex items-center justify-end gap-1 ${t.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                             {t.change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                             {t.change}%
                          </div>
                       </div>
                    </button>
                  ))}
               </div>
            </div>

            <div className="glass-card p-6 relative overflow-hidden group">
               <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-teal/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
               <h3 className="text-xl font-bold mb-4 relative z-10">Pro Trading</h3>
               <p className="text-sm text-gray-500 mb-6 relative z-10">Get real-time signals and expert analysis from professional traders.</p>
               <button className="w-full py-3 bg-gradient-to-r from-brand-teal to-blue-600 text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 relative z-10">
                 Upgrade to Pro <ArrowRight size={16} />
               </button>
            </div>
        </div>
      </div>
    </div>
  );
}