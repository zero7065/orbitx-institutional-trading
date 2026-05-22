import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CreditCard, Building, Wallet, ArrowRight, Loader2 } from 'lucide-react';

interface PaymentMethod {
  id: string; name: string; type: string; provider?: string; details?: string; minAmount: number; maxAmount: number; feePercent: number;
}

export default function BuyCryptoPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [networks, setNetworks] = useState<any[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [rates, setRates] = useState<any>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/payment-methods').then(r => r.json()).then(data => {
        if (Array.isArray(data)) {
          setPaymentMethods(data);
          if (data.length > 0) setSelectedPayment(data[0].id);
        }
      }).catch(() => {}),
      fetch('/api/networks').then(r => r.json()).then(data => {
        if (Array.isArray(data)) {
          setNetworks(data.filter((n: any) => n.enabled));
          if (data.length > 0 && !selectedCrypto) setSelectedCrypto(data[0].symbol);
        }
      }).catch(() => {}),
      fetch('/api/live-rates').then(r => r.json()).then(setRates).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  const selectedPaymentMethod = paymentMethods.find(p => p.id === selectedPayment);
  const fee = selectedPaymentMethod && amount ? parseFloat(amount) * (selectedPaymentMethod.feePercent / 100) : 0;
  const total = (parseFloat(amount) || 0) + fee;
  const cryptoPrice = rates[selectedCrypto]?.price || 50000;
  const receivedCrypto = amount && cryptoPrice > 0 ? (parseFloat(amount) / cryptoPrice) : 0;

  const getNetworkColor = (symbol: string) => networks.find(n => n.symbol === symbol)?.color || '#888';

  const getPaymentIcon = (type: string) => {
    switch (type) { case 'CARD': return <CreditCard size={20} />; case 'BANK': return <Building size={20} />; case 'WALLET': return <Wallet size={20} />; default: return <CreditCard size={20} />; }
  };

  const handlePurchase = async () => {
    if (!amount || !selectedPayment) return;
    if (selectedPaymentMethod && (parseFloat(amount) < selectedPaymentMethod.minAmount || parseFloat(amount) > selectedPaymentMethod.maxAmount)) {
      toast.error(`Amount must be between $${selectedPaymentMethod.minAmount} and $${selectedPaymentMethod.maxAmount.toLocaleString()}`);
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch('/api/deposit/fiat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), paymentMethodId: selectedPayment, cryptoType: selectedCrypto })
      });
      if (res.ok) {
        toast.success('Purchase initiated! Crypto will be credited after payment confirmation.');
        setStep(3);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Purchase failed');
      }
    } catch (err) {
      toast.error('Error processing purchase');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 text-center">
          <CreditCard className="text-gray-600 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-black mb-2">No Payment Methods Available</h2>
          <p className="text-gray-500">Admin hasn't configured any payment methods yet. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black mb-2">Buy Crypto</h1>
        <p className="text-gray-500">Purchase cryptocurrency using your preferred payment method</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-3">Select Cryptocurrency</label>
            <div className="grid grid-cols-3 gap-3">
              {networks.map((crypto) => (
                <button key={crypto.symbol} onClick={() => setSelectedCrypto(crypto.symbol)}
                  className={`p-4 rounded-xl border text-center transition-all ${selectedCrypto === crypto.symbol ? 'border-brand-teal bg-brand-teal/10' : 'border-white/10 hover:bg-white/5'}`}>
                  <div className="text-2xl mb-1 font-black" style={{ color: getNetworkColor(crypto.symbol) }}>{crypto.symbol[0]}</div>
                  <div className="font-black text-sm">{crypto.symbol}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-3">Select Payment Method</label>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <button key={method.id} onClick={() => setSelectedPayment(method.id)}
                  className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${selectedPayment === method.id ? 'border-brand-teal bg-brand-teal/10' : 'border-white/10 hover:bg-white/5'}`}>
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">{getPaymentIcon(method.type)}</div>
                  <div className="flex-1 text-left">
                    <div className="font-bold">{method.name}</div>
                    <div className="text-xs text-gray-500">{method.provider || method.type} &bull; {method.feePercent}% fee</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-3">Amount (USD)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-2xl font-bold outline-none focus:ring-2 focus:ring-brand-teal" placeholder="0.00" />
            {selectedPaymentMethod && (
              <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                <span>Min: ${selectedPaymentMethod.minAmount}</span>
                <span>Max: ${selectedPaymentMethod.maxAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-black text-lg mb-6">Order Summary</h3>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-gray-400">You Pay</span>
              <span className="font-bold text-xl">${amount || '0.00'}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-gray-400">Live Rate</span>
              <span className="font-bold text-brand-teal">1 {selectedCrypto} = ${cryptoPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-gray-400">Processing Fee</span>
              <span className="font-bold">${fee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-brand-teal/10 border border-brand-teal/20 rounded-xl">
              <span className="text-gray-400">Total</span>
              <span className="font-black text-brand-teal text-xl">${total.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-gray-400">You Receive</span>
              <div className="text-right">
                <span className="font-black text-xl" style={{ color: getNetworkColor(selectedCrypto) }}>
                  {receivedCrypto > 0 ? receivedCrypto.toFixed(6) : '0.000000'}
                </span>
                <span className="text-gray-500 text-sm ml-2">{selectedCrypto}</span>
              </div>
            </div>
          </div>

          <button onClick={handlePurchase} disabled={processing || !amount || parseFloat(amount) <= 0}
            className="w-full py-4 gradient-teal text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            {processing ? (<><Loader2 className="animate-spin" size={20} /> Processing...</>) : (<> Buy {selectedCrypto} <ArrowRight size={20} /></>)}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By clicking "Buy {selectedCrypto}", you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
}