import React, { useState, useEffect } from 'react';
import { Copy, QrCode as QrIcon } from 'lucide-react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { useAuth } from '../../App';

const CRYPTO_ADDRS: Record<string, string> = {
  BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  ETH: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
  USDT: 'TPY7t3S8Z6qWc9m55XmZ4A9Y1W2Q3R4S5T',
};

export default function DepositPage() {
  const { user } = useAuth();
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [qr, setQr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.kycStatus !== 'APPROVED') {
      window.location.href = '/dashboard/kyc';
    }
  }, [user]);

  const generateQR = async (crypto: string) => {
    const url = await QRCode.toDataURL(CRYPTO_ADDRS[crypto]);
    setQr(url);
  };

  React.useEffect(() => {
    generateQR(selectedCrypto);
  }, [selectedCrypto]);

  const handlePaid = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error('Please enter a valid amount');
    setLoading(true);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), cryptoType: selectedCrypto })
      });
      if (res.ok) {
        toast.success(`Deposit of ${amount} ${selectedCrypto} confirmed!`);
        setAmount('');
      } else {
        toast.error('Failed to confirm deposit');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Deposit Funds</h1>
        <p className="text-gray-500">Add funds to your account via cryptocurrency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 space-y-6">
           <div>
             <label className="block text-sm font-medium text-gray-400 mb-2">Select Cryptocurrency</label>
             <div className="grid grid-cols-3 gap-3">
               {['BTC', 'ETH', 'USDT'].map((c) => (
                 <button
                   key={c}
                   onClick={() => setSelectedCrypto(c)}
                   className={`py-3 rounded-xl border font-bold transition-all ${
                     selectedCrypto === c 
                       ? 'border-brand-teal bg-brand-teal/10 text-brand-teal' 
                       : 'border-white/10 hover:bg-white/5'
                   }`}
                 >
                   {c}
                 </button>
               ))}
             </div>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-400 mb-2">Investment Amount (USD)</label>
             <input 
               type="number" 
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-brand-teal outline-none transition-all"
               placeholder="Min $200"
             />
           </div>

           <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Wallet Address</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(CRYPTO_ADDRS[selectedCrypto]);
                    toast.success('Address copied');
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg text-brand-teal transition-all"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="text-sm font-mono break-all text-white bg-black/40 p-4 rounded-xl border border-white/5">
                {CRYPTO_ADDRS[selectedCrypto]}
              </div>
           </div>

           <button 
             onClick={handlePaid}
             disabled={loading}
             className="w-full py-4 gradient-teal text-slate-900 font-bold rounded-xl shadow-lg shadow-brand-teal/20 transition-all disabled:opacity-50"
           >
             {loading ? 'Confirming Blockchain...' : 'I Have Paid'}
           </button>
        </div>

        <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
           <div className="bg-white p-4 rounded-2xl mb-6 shadow-2xl shadow-brand-teal/20">
             {qr && <img src={qr} alt="Wallet QR" className="w-48 h-48" />}
           </div>
           <h3 className="text-xl font-bold mb-2">Scan & Pay</h3>
           <p className="text-sm text-gray-500 px-10">Scan this QR code with your mobile wallet to send the payment instantly.</p>
           
           <div className="mt-10 p-4 bg-brand-gold/10 border border-brand-gold/20 rounded-xl flex items-start gap-3 text-left">
              <div className="p-2 bg-brand-gold/20 rounded-lg text-brand-gold mt-1">
                <QrIcon size={16} />
              </div>
              <div className="text-xs text-brand-gold/80 leading-relaxed">
                <p className="font-bold mb-1">Important Notice:</p>
                Be sure to send only {selectedCrypto} to this address. Sending any other currency will result in permanent loss.
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
