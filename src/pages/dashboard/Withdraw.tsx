import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, ShieldCheck, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../App';

export default function WithdrawPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [pin, setPin] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user && user.kycStatus !== 'APPROVED') {
      navigate('/dashboard/kyc', { replace: true });
      return;
    }
    fetch('/api/user/stats').then(r => r.json()).then(data => setBalance(data.balance || 0)).catch(() => toast.error('Failed to load balance'));
  }, [user, navigate]);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render((decodedText) => {
        setAddress(decodedText);
        scanner.clear().catch(() => {});
        setScanning(false);
        toast.success("Address scanned successfully");
      }, () => {});
    }, 100);
  };

  const [step, setStep] = useState<'details' | 'confirmation'>('details');
  const [confirmationCode, setConfirmationCode] = useState('');

  const handleWithdrawInitiate = async () => {
    if (!amount || !address || !pin) return toast.error('Please fill all fields');
    if (parseFloat(amount) > balance) return toast.error('Insufficient balance');
    if (parseFloat(amount) <= 0) return toast.error('Invalid amount');

    setLoading(true);
    try {
      const res = await fetch('/api/withdraw/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), walletAddress: address })
      });
      if (res.ok) {
        setStep('confirmation');
        toast.success('Confirmation code sent to your registered email.');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to send verification code');
      }
    } catch { toast.error('Network error sending verification code'); }
    finally { setLoading(false); }
  };

  const handleWithdrawConfirm = async () => {
    if (!confirmationCode) return toast.error('Please enter confirmation code');

    setLoading(true);
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), walletAddress: address, pin, code: confirmationCode })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Withdrawal request verified and submitted! Status: PENDING.');
        setAmount(''); setAddress(''); setPin(''); setConfirmationCode('');
        setStep('details');
        fetch('/api/user/stats').then(r => r.json()).then(d => setBalance(d.balance || 0)).catch(() => {});
      } else {
        toast.error(data.error || 'Withdrawal failed');
      }
    } catch { toast.error('Network error submitting withdrawal'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black mb-2 tracking-tight uppercase">Capital Extraction</h1>
        <p className="text-gray-500 text-sm font-black">Verify node credentials to authorize external liquidity transfer.</p>
      </div>

      <div className="glass-card p-10 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          {step === 'confirmation' ? (
            <div className="px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-[10px] font-black uppercase text-brand-gold animate-pulse">Awaiting Verification</div>
          ) : (
            <div className="px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-[10px] font-black uppercase text-brand-teal">Secure Terminal</div>
          )}
        </div>

        {step === 'details' ? (
          <div className="space-y-8">
            <div className="p-6 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Available Liquidity</div>
                <div className="text-3xl font-black text-white tracking-tighter">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balance)}
                </div>
              </div>
              <CreditCard size={32} className="text-brand-teal opacity-20" />
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Withdrawal Volume (USD)</label>
                <div className="relative">
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-4 px-4 focus:ring-1 focus:ring-brand-teal outline-none transition-all font-black text-lg" placeholder="0.00" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    {[25, 50, 100].map(p => (
                      <button key={p} onClick={() => setAmount(((balance * p) / 100).toString())}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-brand-teal hover:text-slate-900 text-[10px] font-black transition-all uppercase">{p}%</button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Target Hash / Address</label>
                  <button onClick={handleScan}
                    className="text-[10px] font-black text-brand-teal flex items-center gap-2 hover:brightness-110 uppercase tracking-widest">
                    <Camera size={14} /> Scan Node</button>
                </div>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-4 px-4 focus:ring-1 focus:ring-brand-teal outline-none transition-all font-mono text-xs text-gray-300"
                  placeholder="Enter external wallet identifier" />
              </div>

              {scanning && <div id="reader" className="w-full rounded-xl overflow-hidden border border-brand-teal/50" />}

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Security Signature (PIN)</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                  <input type="password" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-brand-teal outline-none transition-all tracking-[1.5em] font-black" placeholder="****" />
                </div>
              </div>

              <button onClick={handleWithdrawInitiate} disabled={loading}
                className="w-full py-5 gradient-teal text-slate-900 font-black text-xs uppercase tracking-[0.3em] rounded-xl shadow-2xl shadow-brand-teal/10 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {loading ? 'Initializing...' : 'Authorize Transaction'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 py-4">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mx-auto">
                <ShieldCheck size={32} className="text-brand-gold" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Confirmation Required</h3>
                <p className="text-xs text-gray-500 font-black max-w-xs mx-auto mt-2 leading-relaxed">
                  A 6-digit verification code was dispatched to your registered node. Enter it below to confirm the extraction.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center mb-4">Verification Code</label>
                <input type="text" maxLength={6} value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-6 px-4 focus:ring-1 focus:ring-brand-gold outline-none transition-all text-center font-black text-4xl tracking-[0.5em] text-brand-gold" placeholder="000000" />
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep('details')}
                  className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-white transition-all">Abort</button>
                <button onClick={handleWithdrawConfirm} disabled={loading}
                  className="flex-[2] py-4 bg-brand-gold text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-brand-gold/10 hover:brightness-110 transition-all flex items-center justify-center">
                  {loading ? 'Verifying...' : 'Validate & Submit'}
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-600 uppercase font-black tracking-widest">
                Didn't receive code? <button onClick={handleWithdrawInitiate} className="text-brand-teal hover:underline">Resend</button>
              </p>
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-white/5">
          <div className="flex items-start gap-4 p-5 bg-white/2 rounded-2xl border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-2 shrink-0 animate-pulse" />
            <p className="text-[10px] text-gray-500 font-black uppercase leading-relaxed tracking-wider">
              Withdrawals require manual validation by OrbitX compliance protocols. Average processing window: <span className="text-white">0-24 Hours</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
