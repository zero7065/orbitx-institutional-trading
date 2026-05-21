import React, { useState, useEffect } from 'react';
import { X, CreditCard, Wallet, Banknote, Zap, ArrowRight, Check, Loader2, AlertCircle, Clock, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  type: 'DEPOSIT' | 'WITHDRAW' | 'BUY_CRYPTO' | 'SELL_CRYPTO';
  onSuccess?: (data: any) => void;
}

export default function EnhancedPaymentModal({ open, onClose, type, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [liveRates, setLiveRates] = useState<any>({});
  const [gasFees, setGasFees] = useState<any>({});
  const [countdown, setCountdown] = useState(300);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) { setStep(1); setAmount(''); setProgress(0); return; }
    fetch('/api/live-rates').then(r => r.json()).then(setLiveRates);
    fetch('/api/gas-fees').then(r => r.json()).then(setGasFees);
    const timer = setInterval(() => {
      fetch('/api/live-rates').then(r => r.json()).then(setLiveRates);
      fetch('/api/gas-fees').then(r => r.json()).then(setGasFees);
    }, 5000);
    return () => clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (step === 4) {
      const interval = setInterval(() => {
        setCountdown(prev => { if (prev <= 1) { clearInterval(interval); return 0; } return prev - 1; });
        setProgress(prev => { if (prev >= 100) { clearInterval(interval); return 100; } return prev + (100 / 300); });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const currentRate = liveRates[selectedCrypto]?.price || (selectedCrypto === 'BTC' ? 65432 : selectedCrypto === 'ETH' ? 3456 : selectedCrypto === 'USDT' ? 1 : 143);
  const fee = gasFees[selectedCrypto]?.fast || 0;
  const totalAmount = parseFloat(amount) + fee;
  const cryptoAmount = amount ? parseFloat(amount) / currentRate : 0;

  const formatCard = (val: string) => val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
  const formatExpiry = (val: string) => val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);

  const handleSubmit = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setStep(4);
    setProcessing(false);

    setTimeout(async () => {
      try {
        const endpoint = type === 'DEPOSIT' ? '/api/deposit/fiat' : type === 'BUY_CRYPTO' ? '/api/deposit/fiat' : '/api/withdraw';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: parseFloat(amount), cryptoType: selectedCrypto, cardNumber, cardHolder, expiry, cvv })
        });
        if (res.ok) {
          toast.success(`${type === 'WITHDRAW' ? 'Withdrawal' : 'Payment'} processed successfully!`);
          await fetch('/api/points/earn', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Math.floor(parseFloat(amount) / 10), source: type === 'WITHDRAW' ? 'TRADE' : 'TRADE' }) });
          onSuccess?.(await res.json());
          setTimeout(() => onClose(), 2000);
        }
      } catch {}
      setProgress(100);
    }, 3000);
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'DEPOSIT': return 'Deposit Funds'; case 'WITHDRAW': return 'Withdraw Funds';
      case 'BUY_CRYPTO': return 'Buy Crypto'; case 'SELL_CRYPTO': return 'Sell Crypto';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-[#13161A] border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-teal via-purple-500 to-brand-gold">
          <div className="h-full bg-white/20" style={{ width: `${(step / 4) * 100}%`, transition: 'width 0.5s ease' }} />
        </div>

        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-teal/20 to-purple-500/20 flex items-center justify-center">
              {type === 'WITHDRAW' ? <Wallet className="text-brand-teal" size={20} /> : <CreditCard className="text-brand-teal" size={20} />}
            </div>
            <div>
              <h2 className="text-xl font-black">{getTypeLabel()}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Activity size={12} className="text-green-400" />
                <span>Live Rate: ${currentRate.toFixed(2)}</span>
                <span className={`${liveRates[selectedCrypto]?.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {liveRates[selectedCrypto]?.change?.toFixed(2) || '0.00'}%
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all"><X size={20} className="text-gray-400" /></button>
        </div>

        {step === 1 && (
          <div className="p-6 space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-400 mb-3 block">Select Cryptocurrency</label>
              <div className="grid grid-cols-5 gap-3">
                {['BTC', 'ETH', 'USDT', 'SOL', 'BNB'].map(c => (
                  <button key={c} onClick={() => { setSelectedCrypto(c); setStep(2); }} className={`p-4 rounded-2xl border text-center transition-all ${selectedCrypto === c ? 'border-brand-teal bg-brand-teal/10 shadow-lg shadow-brand-teal/10' : 'border-white/10 hover:bg-white/5'}`}>
                    <div className="text-2xl mb-1 font-black">{c === 'BTC' ? '₿' : c === 'ETH' ? 'Ξ' : c === 'USDT' ? '$' : c === 'SOL' ? 'S' : 'B'}</div>
                    <div className="text-[10px] font-bold text-gray-400">{c}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-4">
                <Clock className="text-gray-400" size={20} />
                <div className="flex-1">
                  <div className="text-sm"><span className="text-gray-400">Gas Fee ({selectedCrypto}): </span><span className="font-bold text-brand-teal">{fee} {selectedCrypto === 'USDT' ? 'USD' : selectedCrypto === 'SOL' ? 'SOL' : 'Gwei'}</span></div>
                  <div className="text-xs text-gray-500 mt-1">Estimated network confirmation: 2-5 minutes</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-400 mb-3 block">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, sub: 'Visa, Mastercard' },
                  { id: 'bank', label: 'Bank Transfer', icon: Banknote, sub: 'ACH/Wire' },
                  { id: 'wallet', label: 'Crypto Wallet', icon: Wallet, sub: 'BTC, ETH, USDT' },
                ].map(m => (
                  <button key={m.id} onClick={() => { setPaymentMethod(m.id); setStep(3); }} className={`p-5 rounded-2xl border text-center transition-all ${paymentMethod === m.id ? 'border-brand-teal bg-brand-teal/10' : 'border-white/10 hover:bg-white/5'}`}>
                    <m.icon className="mx-auto mb-2" size={24} style={{ color: paymentMethod === m.id ? '#00D1FF' : '#888' }} />
                    <div className="font-bold text-sm">{m.label}</div>
                    <div className="text-[10px] text-gray-500">{m.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-gray-400">Payment Details</h3>
                <input type="text" value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} placeholder="Card Number" maxLength={19} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-lg tracking-wider focus:ring-1 focus:ring-brand-teal outline-none placeholder:text-gray-600" />
                <input type="text" value={cardHolder} onChange={e => setCardHolder(e.target.value)} placeholder="Cardholder Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-brand-teal outline-none placeholder:text-gray-600" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" maxLength={5} className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-brand-teal outline-none placeholder:text-gray-600" />
                  <input type="password" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))} placeholder="CVV" maxLength={4} className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-brand-teal outline-none placeholder:text-gray-600" />
                </div>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Amount in USD (min $20)`} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-lg font-bold focus:ring-1 focus:ring-brand-teal outline-none placeholder:text-gray-600" />
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-sm text-gray-400">Order Summary</h3>
                <div className="p-4 bg-white/5 rounded-xl space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Rate</span><span>1 {selectedCrypto} = ${currentRate.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">You Pay</span><span className="font-bold">${amount || '0.00'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Gas Fee</span><span className="text-brand-teal">${typeof fee === 'number' ? fee.toFixed(2) : fee}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">You Receive</span><span className="font-bold text-brand-teal">{cryptoAmount.toFixed(6)} {selectedCrypto}</span></div>
                  <div className="border-t border-white/10 pt-3 flex justify-between text-sm"><span className="font-bold">Total</span><span className="font-black text-lg text-white">${(parseFloat(amount || '0') + (typeof fee === 'number' ? fee : 0)).toFixed(2)}</span></div>
                </div>
                <div className="p-3 bg-brand-teal/5 border border-brand-teal/10 rounded-xl flex items-start gap-2 text-xs text-gray-400">
                  <AlertCircle size={14} className="text-brand-teal mt-0.5 shrink-0" />
                  Your transaction is secured with 256-bit encryption
                </div>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={processing || !amount || parseFloat(amount) < 20 || !cardNumber} className="w-full mt-6 py-4 bg-gradient-to-r from-brand-teal to-purple-600 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-brand-teal/20 transition-all disabled:opacity-50">
              {processing ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : <><Zap size={20} /> Pay ${amount || '0.00'}</>}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="p-12 text-center space-y-6">
            {progress < 100 ? (
              <>
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-brand-teal/20 to-purple-500/20 flex items-center justify-center animate-pulse">
                  <Loader2 className="animate-spin text-brand-teal" size={40} />
                </div>
                <h3 className="text-xl font-black">Processing Transaction</h3>
                <div className="max-w-xs mx-auto bg-white/5 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-teal to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-sm text-gray-400">Confirming on blockchain... {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</p>
                <div className="flex justify-center gap-2">
                  {[0, 1, 2].map(i => <div key={i} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono text-gray-400">{i + 1}</div>)}
                  <span className="text-gray-600 self-center mx-1">of 12</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="text-green-400" size={40} />
                </div>
                <h3 className="text-xl font-black text-green-400">Transaction Complete!</h3>
                <p className="text-gray-400">Your {cryptoAmount.toFixed(6)} {selectedCrypto} has been credited to your wallet</p>
                <div className="p-4 bg-white/5 rounded-xl inline-block text-left text-sm">
                  <div className="text-gray-400">TX: <span className="font-mono text-brand-teal">0x{Math.random().toString(16).substring(2, 42)}</span></div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}