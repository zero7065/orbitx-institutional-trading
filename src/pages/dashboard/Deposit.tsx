import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, QrCode as QrIcon, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { useAuth } from '../../App';

export default function DepositPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [networks, setNetworks] = useState<any[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [amount, setAmount] = useState('');
  const [qr, setQr] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user && user.kycStatus !== 'APPROVED') {
      navigate('/dashboard/kyc', { replace: true });
    }
    fetch('/api/networks')
      .then(r => r.json())
      .then(data => {
        const active = data.filter((n: any) => n.depositEnabled);
        setNetworks(active);
        if (active.length > 0) setSelectedCrypto(active[0].symbol);
      })
      .catch(() => toast.error('Failed to load networks'))
      .finally(() => setFetching(false));
  }, [user, navigate]);

  const selectedNetwork = networks.find(n => n.symbol === selectedCrypto);
  const walletAddress = selectedNetwork?.depositAddress;

  const generateQR = async (addr: string) => {
    try {
      if (!addr) { setQr(''); return; }
      setQr(await QRCode.toDataURL(addr));
    } catch { setQr(''); }
  };

  useEffect(() => { generateQR(walletAddress); }, [walletAddress]);

  const handlePaid = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error('Please enter a valid amount');
    setLoading(true);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          cryptoType: selectedCrypto,
          networkId: selectedNetwork?.id
        })
      });
      if (res.ok) {
        toast.success(`Deposit submitted! Waiting for blockchain confirmation.`);
        setAmount('');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to submit deposit');
      }
    } catch { toast.error('Network error submitting deposit'); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-teal" size={32} /></div>;

  if (networks.length === 0) return (
    <div className="max-w-4xl mx-auto text-center py-20">
      <p className="text-gray-500">No deposit networks available. Contact support.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black mb-2">Deposit Funds</h1>
        <p className="text-gray-500">Add funds to your account via cryptocurrency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 space-y-6">
          <div>
            <label className="block text-sm font-black text-gray-400 mb-2">Select Cryptocurrency</label>
            <div className="grid grid-cols-3 gap-3">
              {networks.map((n) => (
                <button key={n.id} onClick={() => setSelectedCrypto(n.symbol)}
                  className={`py-3 rounded-xl border font-black transition-all ${selectedCrypto === n.symbol ? 'border-brand-teal bg-brand-teal/10 text-brand-teal' : 'border-white/10 hover:bg-white/5'}`}>
                  {n.symbol}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-gray-400 mb-2">Amount ({selectedCrypto})</label>
            <input type="number" step="any" min="0" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-brand-teal outline-none transition-all"
              placeholder={`Min ${selectedNetwork?.minDeposit || 0} ${selectedCrypto}`} />
            {selectedNetwork && (
              <div className="text-[10px] text-gray-500 mt-1 px-1">
                Min: {selectedNetwork.minDeposit} {selectedCrypto}
              </div>
            )}
          </div>

          {walletAddress && (
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Wallet Address</span>
                <button onClick={() => { navigator.clipboard.writeText(walletAddress); toast.success('Address copied'); }}
                  className="p-2 hover:bg-white/10 rounded-lg text-brand-teal transition-all"><Copy size={16} /></button>
              </div>
              <div className="text-sm font-mono break-all text-white bg-black/40 p-4 rounded-xl border border-white/5">
                {walletAddress}
              </div>
            </div>
          )}

          <button onClick={handlePaid} disabled={loading}
            className="w-full py-4 gradient-teal text-slate-900 font-bold rounded-xl shadow-lg shadow-brand-teal/20 transition-all disabled:opacity-50">
            {loading ? 'Submitting...' : 'I Have Paid'}
          </button>
        </div>

        <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
          <div className="bg-white p-4 rounded-2xl mb-6 shadow-2xl shadow-brand-teal/20">
            {qr ? <img src={qr} alt="Wallet QR" className="w-48 h-48" /> : <div className="w-48 h-48 flex items-center justify-center text-gray-600 text-sm">Generating QR...</div>}
          </div>
          <h3 className="text-xl font-black mb-2">Scan & Pay</h3>
          <p className="text-sm text-gray-500 px-10">Scan this QR code with your mobile wallet to send the payment instantly.</p>

          {selectedNetwork && (
            <div className="mt-2 text-xs text-gray-500">{selectedNetwork.name} Network</div>
          )}

          <div className="mt-10 p-4 bg-brand-gold/10 border border-brand-gold/20 rounded-xl flex items-start gap-3 text-left">
            <div className="p-2 bg-brand-gold/20 rounded-lg text-brand-gold mt-1"><QrIcon size={16} /></div>
            <div className="text-xs text-brand-gold/80 leading-relaxed">
              <p className="font-black mb-1">Important Notice:</p>
              Be sure to send only {selectedCrypto} to this address. Sending any other currency will result in permanent loss.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}