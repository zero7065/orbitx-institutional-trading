import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { RotateCcw, Award, Gift, Star, Zap, Coins } from 'lucide-react';

const DEFAULT_PRIZES = [
  { id: '1', label: '10 USDT', reward: 10, icon: Coins, color: '#26A17B' },
  { id: '2', label: '50 USDT', reward: 50, icon: Coins, color: '#F0B90B' },
  { id: '3', label: '100 USDT', reward: 100, icon: Coins, color: '#00D1FF' },
  { id: '4', label: '0.01 BTC', reward: 0.01, icon: Zap, color: '#F7931A' },
  { id: '5', label: '250 USDT', reward: 250, icon: Gift, color: '#8B5CF6' },
  { id: '6', label: '500 USDT', reward: 500, icon: Star, color: '#FFD700' },
  { id: '7', label: '25 USDT', reward: 25, icon: Coins, color: '#10B981' },
  { id: '8', label: '1 ETH', reward: 1, icon: Zap, color: '#627EEA' },
];

export default function SpinPage() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [rotation, setRotation] = useState(0);
  const [stats, setStats] = useState({ wins: 0, maxWin: 0, lastSpin: null as Date | null });

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    // Random prize
    const prizeIndex = Math.floor(Math.random() * DEFAULT_PRIZES.length);
    const prize = DEFAULT_PRIZES[prizeIndex];
    
    // Calculate rotation (5-8 full spins + prize position)
    const spins = 5 + Math.random() * 3;
    const prizeAngle = (360 / DEFAULT_PRIZES.length) * prizeIndex;
    const newRotation = rotation + (spins * 360) + (360 - prizeAngle);
    
    setRotation(newRotation);

    // Simulate spin duration
    setTimeout(() => {
      setSpinning(false);
      setResult(prize);
      setStats(prev => ({
        wins: prev.wins + 1,
        maxWin: Math.max(prev.maxWin, prize.reward),
        lastSpin: new Date()
      }));
      
      // Confetti effect
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00D1FF', '#FFD700', '#8B5CF6', '#10B981']
      });
      
      // Add balance
      fetch('/api/user/stats').then(r => r.json()).then(user => {
        if (user && user.balance !== undefined) {
          fetch('/api/deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: prize.reward, cryptoType: 'USDT' })
          }).then(() => {
            toast.success(`🎉 Amazing! You won ${prize.label}! Added to your balance.`);
          });
        }
      });
    }, 5000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4 flex items-center justify-center gap-3">
          <RotateCcw className="text-brand-teal" size={32} />
          LUCKY WHEEL
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Spin the wheel daily for a chance to win massive crypto bonuses credited instantly to your balance.
        </p>
      </div>

      {/* Wheel Container */}
      <div className="relative mb-20">
        {/* Indicator */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
          <div className="w-10 h-12 bg-brand-teal clip-path-triangle" 
               style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)', filter: 'drop-shadow(0 0 15px rgba(0,245,255,0.8))' }} />
        </div>

        {/* Wheel */}
        <motion.div 
          animate={{ rotate: -rotation }}
          transition={{ duration: 5, ease: "easeOut" }}
          className="w-80 h-80 sm:w-[450px] sm:h-[450px] rounded-full border-8 border-white/10 shadow-[0_0_80px_rgba(0,245,255,0.2)] relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0A0F1D 0%, #1a1d2e 100%)' }}
        >
          {DEFAULT_PRIZES.map((prize, i) => {
            const angle = (360 / DEFAULT_PRIZES.length) * i;
            return (
              <div
                key={prize.id}
                className="absolute top-1/2 left-1/2 w-full h-full origin-center"
                style={{ 
                  transform: `rotate(${angle}deg)`,
                }}
              >
                {/* Wheel segment */}
                <div 
                  className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom"
                  style={{
                    background: `linear-gradient(${angle % 90}deg, ${prize.color}40, ${prize.color}20)`,
                    transform: 'skewY(-67.5deg)',
                    borderRight: `2px solid ${prize.color}40`
                  }}
                />
                {/* Prize label */}
                <div 
                  className="absolute top-8 left-1/2 -translate-x-1/2 text-center"
                  style={{
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <span 
                    className="text-[10px] font-black uppercase tracking-wider"
                    style={{ color: prize.color, textShadow: `0 0 10px ${prize.color}` }}
                  >
                    {prize.label}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Inner circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-brand-teal/20 flex items-center justify-center">
                <Award className="text-brand-teal" size={32} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Spin Button */}
        <button 
          onClick={handleSpin}
          disabled={spinning}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-20 h-20 rounded-full bg-gradient-to-r from-brand-teal to-blue-500 text-slate-900 font-black text-xl shadow-[0_0_30px_rgba(0,245,255,0.5)] hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          {spinning ? '...' : 'SPIN'}
        </button>
      </div>

      {/* Result Animation */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setResult(null)}
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-brand-teal/20 to-purple-500/20 border border-brand-teal/30 rounded-3xl p-12 text-center"
            >
              <result.icon size={64} className="mx-auto mb-4 text-brand-gold" />
              <h2 className="text-3xl font-black text-white mb-2">🎉 YOU WON!</h2>
              <p className="text-5xl font-black text-brand-teal mb-4">{result.label}</p>
              <p className="text-gray-400 text-sm">Added to your balance!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
        <div className="glass-card p-6 text-center border-b-4 border-brand-teal">
          <div className="text-sm font-bold text-gray-500 uppercase mb-2">Total Wins</div>
          <div className="text-2xl font-black text-brand-teal">{stats.wins}</div>
        </div>
        <div className="glass-card p-6 text-center border-b-4 border-brand-gold">
          <div className="text-sm font-bold text-gray-500 uppercase mb-2">Biggest Win</div>
          <div className="text-2xl font-black text-brand-gold">${stats.maxWin}</div>
        </div>
        <div className="glass-card p-6 text-center border-b-4 border-purple-500">
          <div className="text-sm font-bold text-gray-500 uppercase mb-2">Last Spin</div>
          <div className="text-2xl font-black">{stats.lastSpin ? 'Just now!' : 'Never'}</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-brand-teal/10 border border-brand-teal/20 rounded-2xl max-w-xl">
        <h3 className="font-bold text-brand-teal mb-2">How to Play</h3>
        <ul className="text-sm text-gray-400 space-y-2">
          <li>• Click the SPIN button to rotate the wheel</li>
          <li>• Wait for the wheel to stop - prizes are randomly selected</li>
          <li>• Win instantly credited to your account balance</li>
          <li>• Come back daily for more chances to win!</li>
        </ul>
      </div>
    </div>
  );
}