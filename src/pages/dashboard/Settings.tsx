import React, { useState } from 'react';
import { useTheme } from '../../components/ThemeContext';
import { toast } from 'sonner';
import { 
  Moon, Sun, Shield, Key, Bell, CreditCard, Wallet, Bot, 
  Download, Eye, EyeOff, Lock, AlertTriangle, Mail, User, 
  ChevronRight, Check, X, Plus, Trash2
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'crypto';
  name: string;
  last4?: string;
  isDefault: boolean;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  bankName?: string;
  routingNumber?: string;
}

interface TradingBot {
  id: string;
  name: string;
  price: number;
  dailyProfit: number;
  duration: string;
  features: string[];
  active: boolean;
}

const TRADING_BOTS: TradingBot[] = [
  { id: '1', name: 'Basic Bot', price: 300, dailyProfit: 5, duration: '30 days', features: ['Auto Trading', 'Basic Signals', '24/7 Support'], active: false },
  { id: '2', name: 'Pro Bot', price: 500, dailyProfit: 10, duration: '30 days', features: ['Advanced AI', 'Premium Signals', 'Priority Support', 'Custom Strategies'], active: false },
  { id: '3', name: 'Premium Bot', price: 1000, dailyProfit: 20, duration: '30 days', features: ['AI Master', 'VIP Signals', 'Dedicated Manager', 'Unlimited Trades', 'Zero Fees'], active: false },
];

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const [showPin, setShowPin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', name: 'Visa', last4: '4242', isDefault: true, cardNumber: '4242424242424242', expiry: '12/27', cvv: '123' },
  ]);
  const [activeBots, setActiveBots] = useState<string[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);

  // Password Recovery
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const handleRecovery = () => {
    toast.success(`Password recovery link sent to ${recoveryEmail}. Check your email (simulated).`);
    setShowRecovery(false);
  };

  // Add Payment Method
  const handleAddPayment = (method: PaymentMethod) => {
    setPaymentMethods([...paymentMethods, { ...method, id: Date.now().toString() }]);
    setShowAddPayment(false);
    toast.success('Payment method added successfully');
  };

  // Rent Bot
  const handleRentBot = (bot: TradingBot) => {
    if (activeBots.includes(bot.id)) {
      setActiveBots(activeBots.filter(id => id !== bot.id));
      toast.info(`${bot.name} deactivated`);
    } else {
      setActiveBots([...activeBots, bot.id]);
      toast.success(`🎉 ${bot.name} activated! Estimated profit: $${bot.dailyProfit}/day`);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black mb-2">Settings</h1>
        <p className="text-gray-500">Manage your account, security, and preferences</p>
      </div>

      {/* Theme Toggle */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isDark ? <Moon className="text-brand-teal" size={24} /> : <Sun className="text-brand-gold" size={24} />}
            <div>
              <h3 className="font-black text-lg">Theme Mode</h3>
              <p className="text-sm text-gray-500">{isDark ? 'Dark mode enabled' : 'Light mode enabled'}</p>
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            className={`w-16 h-8 rounded-full transition-all relative ${isDark ? 'bg-brand-teal' : 'bg-brand-gold'}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${isDark ? 'left-9' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Security Warnings */}
      <div className="glass-card p-6 border-l-4 border-red-500">
        <h3 className="font-black text-lg flex items-center gap-2 mb-4">
          <AlertTriangle className="text-red-500" size={20} />
          Security Warnings
        </h3>
        <div className="space-y-3">
          {[
            '⚠️ Never share your login credentials with anyone',
            '⚠️ Keep your PIN secure - never disclose it to anyone',
            '⚠️ Beware of phishing - always verify the URL before logging in',
            '⚠️ Your data is encrypted and secure with 256-bit encryption',
            '⚠️ Enable two-factor authentication for extra security',
            '⚠️ Never transfer funds to unknown wallets',
          ].map((warning, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-400 bg-red-500/5 p-2 rounded-lg">
              <X size={14} className="text-red-500" />
              {warning.replace('⚠️ ', '')}
            </div>
          ))}
        </div>
      </div>

      {/* Password Recovery */}
      <div className="glass-card p-6">
        <h3 className="font-black text-lg flex items-center gap-2 mb-4">
          <Key className="text-brand-teal" size={20} />
          Password Recovery
        </h3>
        {!showRecovery ? (
          <button onClick={() => setShowRecovery(true)} className="text-brand-teal hover:underline text-sm">
            Forgot your password? Click here to recover
          </button>
        ) : (
          <div className="flex gap-3">
            <input 
              type="email" 
              value={recoveryEmail}
              onChange={e => setRecoveryEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-brand-teal"
            />
            <button onClick={handleRecovery} className="px-6 py-3 bg-brand-teal text-slate-900 font-bold rounded-xl">
              Send Link
            </button>
          </div>
        )}
      </div>

      {/* Premium Trading Bots */}
      <div className="glass-card p-6">
        <h3 className="font-black text-lg flex items-center gap-2 mb-4">
          <Bot className="text-brand-gold" size={20} />
          Premium Trading Bots
        </h3>
        <p className="text-sm text-gray-500 mb-4">Rent professional trading bots and earn daily profits automatically</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRADING_BOTS.map(bot => (
            <div key={bot.id} className={`border rounded-2xl p-4 ${activeBots.includes(bot.id) ? 'border-brand-teal bg-brand-teal/10' : 'border-white/10'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-black text-lg">{bot.name}</span>
                {activeBots.includes(bot.id) && <span className="text-[10px] px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-bold">ACTIVE</span>}
              </div>
              <div className="text-2xl font-black text-brand-teal mb-1">${bot.price}<span className="text-sm text-gray-500 font-normal">/mo</span></div>
              <div className="text-sm text-green-400 font-bold mb-3">~${bot.dailyProfit}/day profit</div>
              <ul className="text-xs text-gray-500 space-y-1 mb-4">
                {bot.features.map((f, i) => <li key={i}>• {f}</li>)}
              </ul>
              <button 
                onClick={() => handleRentBot(bot)}
                className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                  activeBots.includes(bot.id) 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : 'bg-brand-teal text-slate-900 hover:bg-cyan-400'
                }`}
              >
                {activeBots.includes(bot.id) ? 'Deactivate' : 'Rent Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg flex items-center gap-2">
            <CreditCard className="text-brand-teal" size={20} />
            Payment Methods
          </h3>
          <button onClick={() => setShowAddPayment(true)} className="flex items-center gap-2 text-brand-teal text-sm">
            <Plus size={16} /> Add New
          </button>
        </div>
        
        <div className="space-y-3">
          {paymentMethods.map(method => (
            <div key={method.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                  {method.type.toUpperCase()}
                </div>
                <div>
                  <div className="font-bold">{method.name}</div>
                  <div className="text-sm text-gray-500">•••• {method.last4}</div>
                </div>
              </div>
              {method.isDefault && <span className="text-xs px-2 py-1 bg-brand-teal/20 text-brand-teal rounded font-bold">DEFAULT</span>}
            </div>
          ))}
        </div>

        {/* Add Payment Modal */}
        {showAddPayment && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1d23] border border-white/10 rounded-3xl p-8 max-w-md w-full">
              <h3 className="text-xl font-black mb-6">Add Payment Method</h3>
              <div className="space-y-4">
                <input placeholder="Card Number" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="MM/YY" className="bg-white/5 border border-white/10 rounded-xl py-3 px-4" />
                  <input placeholder="CVV" className="bg-white/5 border border-white/10 rounded-xl py-3 px-4" />
                </div>
                <input placeholder="Cardholder Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" />
                <div className="flex gap-3">
                  <button onClick={() => setShowAddPayment(false)} className="flex-1 py-3 bg-white/5 rounded-xl font-bold">Cancel</button>
                  <button onClick={() => handleAddPayment({ id: '', type: 'card', name: 'New Card', last4: '0000', isDefault: false })} className="flex-1 py-3 bg-brand-teal text-slate-900 font-bold rounded-xl">Add Card</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Settings */}
      <div className="glass-card p-6">
        <h3 className="font-black text-lg flex items-center gap-2 mb-4">
          <Shield className="text-brand-teal" size={20} />
          Security
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-gray-400" />
              <div>
                <div className="font-bold">Change Password</div>
                <div className="text-sm text-gray-500">Update your account password</div>
              </div>
            </div>
            <button className="text-brand-teal text-sm hover:underline">Update</button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Key size={20} className="text-gray-400" />
              <div>
                <div className="font-bold">Change PIN</div>
                <div className="text-sm text-gray-500">Update your 4-digit security PIN</div>
              </div>
            </div>
            <button className="text-brand-teal text-sm hover:underline">Update</button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-gray-400" />
              <div>
                <div className="font-bold">Google Authentication</div>
                <div className="text-sm text-gray-500">Add extra security with 2FA</div>
              </div>
            </div>
            <button onClick={() => toast.info('Google Auth integration coming soon!')} className="text-brand-teal text-sm hover:underline">Enable</button>
          </div>
        </div>
      </div>

      {/* Install App */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Download className="text-brand-teal" size={24} />
            <div>
              <h3 className="font-black">Install as App</h3>
              <p className="text-sm text-gray-500">Add to your home screen for quick access</p>
            </div>
          </div>
          <button 
            onClick={() => {
              if (window.matchMedia('(display-mode: standalone)').matches) {
                toast.info('App is already installed!');
              } else {
                toast.success('Click "Add to Home Screen" in your browser menu to install');
              }
            }}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10"
          >
            Install App
          </button>
        </div>
      </div>

      {/* Support Link */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Bell className="text-brand-teal" size={24} />
            <div>
              <h3 className="font-black">Contact Support</h3>
              <p className="text-sm text-gray-500">Submit a ticket for any issues</p>
            </div>
          </div>
          <button onClick={() => window.location.href = '/dashboard/support'} className="px-6 py-3 bg-brand-teal text-slate-900 font-bold rounded-xl">
            Submit Ticket
          </button>
        </div>
      </div>
    </div>
  );
}