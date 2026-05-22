import React, { useEffect, useState } from 'react';
import { RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';

interface PlatformSettings {
  platformName: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  minDeposit: number;
  maxDeposit: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  withdrawalFeePercent: number;
  referralBonus: number;
  referralBonusPercent: number;
  spinEnabled: boolean;
  kycRequired: boolean;
  tradingEnabled: boolean;
  investmentEnabled: boolean;
  telegramLink: string;
  twitterLink: string;
  supportEmail: string;
  companyAddress: string;
}

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/platform-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else {
        toast.error('Failed to load settings');
      }
    } catch (e) {
      toast.error('Network error loading settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const updateField = (field: string, value: any) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/platform-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast.success('Platform settings saved. Reload page to see changes.');
        if (settings.platformName) document.title = settings.platformName;
      } else toast.error('Failed to save settings');
    } catch (e) { toast.error('Error saving settings'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="animate-pulse text-center py-20 text-gray-500 text-sm">Loading settings...</div>;
  if (!settings) return <div className="text-center py-20 text-red-400">Failed to load settings</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Platform Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Customize everything about your platform</p>
        </div>
        <button onClick={fetchSettings} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-[10px] font-black tracking-widest text-gray-400">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h3 className="font-black uppercase tracking-widest text-xs text-purple-400 mb-6">Branding</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Platform Name</label>
              <input type="text" value={settings.platformName} onChange={e => updateField('platformName', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
              <p className="text-[9px] text-gray-600 mt-1">Changes everywhere on the platform</p>
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Logo URL</label>
              <input type="text" value={settings.logoUrl || ''} onChange={e => updateField('logoUrl', e.target.value)} placeholder="https://example.com/logo.png" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Primary Color</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={settings.primaryColor} onChange={e => updateField('primaryColor', e.target.value)} className="h-12 w-12 rounded-xl cursor-pointer bg-transparent border border-white/10" />
                <input type="text" value={settings.primaryColor} onChange={e => updateField('primaryColor', e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500 font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Secondary Color</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={settings.secondaryColor} onChange={e => updateField('secondaryColor', e.target.value)} className="h-12 w-12 rounded-xl cursor-pointer bg-transparent border border-white/10" />
                <input type="text" value={settings.secondaryColor} onChange={e => updateField('secondaryColor', e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500 font-mono" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h3 className="font-black uppercase tracking-widest text-xs text-purple-400 mb-6">Feature Toggles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Block all user access' },
              { key: 'registrationEnabled', label: 'Registration', desc: 'Allow new users to register' },
              { key: 'spinEnabled', label: 'Spin Wheel', desc: 'Enable the lucky wheel feature' },
              { key: 'kycRequired', label: 'KYC Required', desc: 'Require identity verification' },
              { key: 'tradingEnabled', label: 'Trading', desc: 'Enable trading features' },
              { key: 'investmentEnabled', label: 'Investments', desc: 'Enable investment plans' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5">
                <div>
                  <div className="text-[10px] font-black text-white uppercase tracking-widest">{label}</div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase mt-1">{desc}</div>
                </div>
                <button
                  onClick={() => updateField(key, !(settings as any)[key])}
                  className={`w-12 h-6 rounded-full transition-all relative ${(settings as any)[key] ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${(settings as any)[key] ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h3 className="font-black uppercase tracking-widest text-xs text-purple-400 mb-6">Limits & Fees</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Min Deposit ($)</label>
              <input type="number" value={settings.minDeposit} onChange={e => updateField('minDeposit', parseFloat(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Max Deposit ($)</label>
              <input type="number" value={settings.maxDeposit} onChange={e => updateField('maxDeposit', parseFloat(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Min Withdrawal ($)</label>
              <input type="number" value={settings.minWithdrawal} onChange={e => updateField('minWithdrawal', parseFloat(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Max Withdrawal ($)</label>
              <input type="number" value={settings.maxWithdrawal} onChange={e => updateField('maxWithdrawal', parseFloat(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Withdrawal Fee (%)</label>
              <input type="number" step="0.1" value={settings.withdrawalFeePercent} onChange={e => updateField('withdrawalFeePercent', parseFloat(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Referral Bonus ($)</label>
              <input type="number" value={settings.referralBonus} onChange={e => updateField('referralBonus', parseFloat(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Referral Bonus (%)</label>
              <input type="number" step="0.1" value={settings.referralBonusPercent} onChange={e => updateField('referralBonusPercent', parseFloat(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h3 className="font-black uppercase tracking-widest text-xs text-purple-400 mb-6">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Telegram</label>
              <input type="text" value={settings.telegramLink || ''} onChange={e => updateField('telegramLink', e.target.value)} placeholder="https://t.me/..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Twitter / X</label>
              <input type="text" value={settings.twitterLink || ''} onChange={e => updateField('twitterLink', e.target.value)} placeholder="https://x.com/..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Support Email</label>
              <input type="email" value={settings.supportEmail || ''} onChange={e => updateField('supportEmail', e.target.value)} placeholder="support@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Company Address</label>
              <input type="text" value={settings.companyAddress || ''} onChange={e => updateField('companyAddress', e.target.value)} placeholder="123 Business St..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl text-sm font-black uppercase tracking-widest text-white hover:shadow-xl hover:shadow-purple-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}