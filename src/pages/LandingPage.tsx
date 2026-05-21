import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Users, Wallet, ShieldCheck, ArrowRight, Star, Globe, Zap, Lock, ChevronRight, Activity } from 'lucide-react';

const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const MOCK_LIVE_TRANSACTIONS = [
  { type: 'DEPOSIT', icon: '↓', user: 'xq**23', amount: '+$15,420', crypto: 'BTC', time: 'just now', color: 'text-green-400' },
  { type: 'WITHDRAWAL', icon: '↑', user: 'tr**88', amount: '-$8,200', crypto: 'ETH', time: '2s ago', color: 'text-red-400' },
  { type: 'INVESTMENT', icon: '◆', user: 'mk**45', amount: '+$25,000', plan: 'Omega Elite', time: '5s ago', color: 'text-purple-400' },
  { type: 'KYC', icon: '✓', user: 'alex**@email.com', amount: 'Verified', time: '8s ago', color: 'text-green-400' },
  { type: 'REFERRAL', icon: '★', user: 'jo**99', amount: '+$500', time: '12s ago', color: 'text-brand-gold' },
  { type: 'DEPOSIT', icon: '↓', user: 'sa**12', amount: '+$42,000', crypto: 'USDT', time: '15s ago', color: 'text-green-400' },
  { type: 'PROFIT', icon: '◆', user: 'da**33', amount: '+$3,240', time: '20s ago', color: 'text-purple-400' },
  { type: 'DEPOSIT', icon: '↓', user: 'el**77', amount: '+$8,500', crypto: 'SOL', time: '27s ago', color: 'text-green-400' },
  { type: 'WITHDRAWAL', icon: '↑', user: 'ri**41', amount: '-$1,200', crypto: 'BNB', time: '33s ago', color: 'text-red-400' },
  { type: 'INVESTMENT', icon: '◆', user: 'ni**92', amount: '+$50,000', plan: 'Sigma Prime', time: '40s ago', color: 'text-purple-400' },
  { type: 'REFERRAL', icon: '★', user: 'lu**56', amount: '+$250', time: '45s ago', color: 'text-brand-gold' },
  { type: 'DEPOSIT', icon: '↓', user: 'ja**34', amount: '+$3,200', crypto: 'BTC', time: '52s ago', color: 'text-green-400' },
];

const investmentPlans = [
  {
    name: 'Alpha Reserve', roi: '2.5%', duration: '24h', min: 100, max: 1000,
    desc: 'Conservative strategy for capital preservation with low volatility exposure.',
    highlights: ['Daily Returns', 'Principal Protected', 'Instant Liquidity'],
    color: '#00D1FF'
  },
  {
    name: 'Sigma Prime', roi: '5%', duration: '48h', min: 1001, max: 5000,
    desc: 'Balanced approach targeting steady growth through diversified yield strategies.',
    highlights: ['Compound Interest', 'Priority Support', 'Extended Leverage'],
    color: '#F0B90B'
  },
  {
    name: 'Omega Elite', roi: '10%', duration: '72h', min: 5001, max: 50000,
    desc: 'Institutional-grade high yield for serious investors seeking maximum returns.',
    highlights: ['Maximum Returns', 'Dedicated Manager', 'Zero Fee Exit'],
    color: '#10B981'
  },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [liveTxs, setLiveTxs] = useState(MOCK_LIVE_TRANSACTIONS.slice(0, 5));
  const [platformName, setPlatformName] = useState('OrbitX');
  const [platformSettings, setPlatformSettings] = useState<any>({});
  const [stats, setStats] = useState({ users: 84200, volume: 14800000, active: 31250, countries: 189 });

  useEffect(() => {
    setMounted(true);
    fetch('/api/settings').then(r => r.json()).then(data => {
      if (data?.platformName) { setPlatformName(data.platformName); document.title = data.platformName; }
      setPlatformSettings(data);
    }).catch(() => {});

    const interval = setInterval(() => {
      setLiveTxs(prev => {
        const next = [...MOCK_LIVE_TRANSACTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
        return next;
      });
      setStats(prev => ({
        users: prev.users + Math.floor(Math.random() * 3),
        volume: prev.volume + Math.floor(Math.random() * 10000),
        active: prev.active + Math.floor(Math.random() * 5) - 2,
        countries: prev.countries
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0B0E11] font-inter">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-brand-teal/5 rounded-full blur-[150px] animate-pulse" style={{animationDuration: '8s'}} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/5 rounded-full blur-[150px] animate-pulse" style={{animationDuration: '12s'}} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[40%] bg-blue-600/3 rounded-full blur-[100px]" />
        {/* Floating Orbs */}
        <motion.div className="absolute top-[20%] right-[15%] w-32 h-32 rounded-full bg-brand-teal/10 blur-3xl" animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 6, repeat: Infinity }} />
        <motion.div className="absolute bottom-[30%] left-[10%] w-48 h-48 rounded-full bg-purple-500/10 blur-3xl" animate={{ y: [0, 40, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 8, repeat: Infinity }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 p-6 max-w-7xl mx-auto flex items-center justify-between" style={{opacity: mounted ? 1 : 0, transition: 'opacity 0.8s'}}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-teal to-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-brand-teal/20">
            <TrendingUp className="w-6 h-6 text-[#0B0E11]" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white italic uppercase">{platformName}</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {['Markets', 'Trading', 'Security', 'Affiliates'].map(item => (
            <a key={item} href="#features" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-brand-teal transition-colors">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-6">
          <Link to="/auth/login" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all px-4 py-2">Sign In</Link>
          <Link to="/auth/register" className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] bg-gradient-to-r from-brand-teal to-blue-600 text-[#0B0E11] shadow-2xl shadow-brand-teal/20 hover:translate-y-[-2px] transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-400">
              <span className="text-gray-500 mr-2">System:</span> Live Trading Active
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-[80px] font-black tracking-tight mb-8 leading-[0.9] text-white">
            Institutional<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-teal via-blue-400 to-purple-500">Liquidity</span>
            <br />Engine
          </h1>
          <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-xl font-medium">
            Deploy capital into automated high-yield portfolios with sub-millisecond execution. 
            Institutional-grade security with real-time market analytics.
          </p>

          <div className="flex items-center gap-4 mb-12">
            <Link to="/auth/register" className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] bg-gradient-to-r from-brand-teal to-blue-600 text-[#0B0E11] hover:shadow-xl hover:shadow-brand-teal/20 transition-all flex items-center gap-3">
              Start Trading <ArrowRight size={16} />
            </Link>
            <a href="#features" className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all">
              Learn More
            </a>
          </div>

          <div className="grid grid-cols-3 gap-8 py-8 border-t border-white/5">
            {[
              { value: (stats.users).toLocaleString(), label: 'Active Traders' },
              { value: '$' + (stats.volume / 1e6).toFixed(1) + 'M', label: 'Total Volume' },
              { value: stats.active.toLocaleString(), label: 'Live Positions' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tighter">{s.value}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/20 via-purple-500/10 to-blue-600/20 rounded-[40px] blur-[80px]" />
          <div className="relative bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Activity size={18} className="text-green-400" />
                <h4 className="text-sm font-black uppercase tracking-widest text-white">Live Terminal Feed</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Live</span>
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {liveTxs.map((tx, i) => (
                  <motion.div
                    key={tx.user + tx.time}
                    initial={{ opacity: 0, x: 30, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: -30, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${tx.color} bg-white/5`}>
                        {tx.user[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-wider ${tx.color}`}>{tx.type}</span>
                          <span className="text-[9px] text-gray-600 font-bold">{tx.user}</span>
                        </div>
                        <div className="text-[9px] text-gray-500 font-bold">
                          {tx.type === 'INVESTMENT' ? tx.plan : tx.crypto ? `${tx.crypto} • ${tx.amount}` : tx.amount}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-black ${tx.amount.startsWith('+') ? 'text-green-400' : tx.amount.startsWith('-') ? 'text-red-400' : 'text-brand-gold'}`}>
                        {tx.amount}
                      </div>
                      <div className="text-[8px] text-gray-600 font-bold">{tx.time}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-500 font-black uppercase tracking-widest">
              <span>24h Volume: $124.8M</span>
              <Link to="/auth/register" className="text-brand-teal hover:underline">Track Live →</Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.users.toLocaleString() + '+', icon: Users, color: 'text-brand-teal' },
            { label: 'Assets Secured', value: '$' + (stats.volume / 1e6).toFixed(1) + 'M', icon: Wallet, color: 'text-green-400' },
            { label: 'Countries', value: stats.countries + '+', icon: Globe, color: 'text-purple-400' },
            { label: 'Uptime', value: '99.99%', icon: Zap, color: 'text-brand-gold' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 group hover:bg-white/10 transition-all">
              <div className={`p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform ${s.color}`}>
                <s.icon size={22} />
              </div>
              <div>
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Investment Plans */}
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-[9px] font-black uppercase tracking-[0.2em] mb-6">Investment Protocols</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">Choose Your Strategy</h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-medium">Select from our curated investment plans, each optimized for different risk profiles and capital requirements.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {investmentPlans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white/5 border border-white/10 p-8 md:p-10 rounded-[32px] flex flex-col group hover:bg-white/[0.07] transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                <TrendingUp size={80} style={{ color: plan.color }} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: plan.color }} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: plan.color }}>{plan.name}</h3>
                {i === 2 && <span className="px-2 py-0.5 rounded bg-brand-gold/20 text-brand-gold text-[7px] font-black uppercase tracking-widest ml-2">Popular</span>}
              </div>
              <div className="text-5xl font-black text-white mb-1 mt-2 tracking-tighter">{plan.roi} <span className="text-sm text-gray-600 block mt-1 tracking-widest uppercase font-black">Daily Return</span></div>
              <p className="text-sm text-gray-400 my-6 leading-relaxed font-medium">{plan.desc}</p>
              <div className="space-y-3 mb-8">
                {plan.highlights.map(h => (
                  <div key={h} className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Star size={10} style={{ color: plan.color }} />
                    {h}
                  </div>
                ))}
              </div>
              <div className="mt-auto border-t border-white/5 pt-6 space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">Range</span>
                  <span className="text-white">${plan.min.toLocaleString()} - ${plan.max.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">Duration</span>
                  <span className="text-white">{plan.duration}</span>
                </div>
                <Link to="/auth/register" className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-black text-xs uppercase tracking-[0.2em] text-white hover:bg-gradient-to-r hover:from-brand-teal hover:to-blue-600 hover:text-[#0B0E11] hover:border-transparent transition-all text-center block">
                  Deploy Capital
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">Built for Institutions</h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-medium">Enterprise-grade infrastructure with military-level security protocols.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: 'Military-Grade Security', desc: '256-bit encryption with multi-factor authentication and real-time threat monitoring.', color: 'text-brand-teal' },
            { icon: Zap, title: 'Instant Execution', desc: 'Sub-millisecond order execution with high-frequency trading infrastructure.', color: 'text-brand-gold' },
            { icon: Globe, title: 'Global Liquidity', desc: 'Access liquidity pools across 15+ exchanges and 50+ trading pairs.', color: 'text-green-400' },
            { icon: Lock, title: 'Cold Storage', desc: '98% of assets stored in geographically distributed cold wallets.', color: 'text-purple-400' },
            { icon: Users, title: '24/7 Support', desc: 'Dedicated account managers with white-glove service for all clients.', color: 'text-blue-400' },
            { icon: TrendingUp, title: 'Advanced Analytics', desc: 'Real-time portfolio tracking with AI-powered market insights.', color: 'text-pink-400' },
          ].map((feat, i) => (
            <motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-all group">
              <div className={`p-4 rounded-2xl bg-white/5 inline-block mb-6 group-hover:scale-110 transition-transform ${feat.color}`}>
                <feat.icon size={28} />
              </div>
              <h3 className="text-lg font-black text-white mb-3">{feat.title}</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-brand-teal/20 via-blue-600/20 to-purple-600/20 border border-white/10 p-12 md:p-20 text-center">
          <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-gradient-to-br from-brand-teal/10 to-transparent rounded-full blur-[100px]" />
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">Ready to Deploy?</h2>
            <p className="text-gray-300 max-w-xl mx-auto mb-10 text-lg font-medium">
              Join thousands of institutional investors already using {platformName} to grow their capital.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/auth/register" className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] bg-white text-[#0B0E11] hover:bg-gray-200 transition-all shadow-xl">
                Create Account
              </Link>
              <Link to="/auth/login" className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-brand-teal to-blue-600 rounded flex items-center justify-center">
              <TrendingUp size={12} className="text-[#0B0E11]" />
            </div>
            <span className="text-lg font-black text-white italic tracking-tighter uppercase">{platformName}</span>
          </div>
          <div className="flex gap-8 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Audit</a>
            <Link to="/auth/login" className="hover:text-white transition-colors">Support</Link>
          </div>
          <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">© 2026 {platformName} Institutional. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}