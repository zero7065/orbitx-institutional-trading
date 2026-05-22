import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { TrendingUp, Mail, Lock, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';

interface AuthPageProps { mode: 'login' | 'register'; }

export default function AuthPage({ mode }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [refCode, setRefCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setRefCode(ref);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === 'register' && password.length < 8) return;
    setLoading(true);
    if (mode === 'login') await login(email, password);
    else await register(email, password, refCode);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-teal/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-sm bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-10 relative z-10">
        <div className="mb-10 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-teal to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-teal/20">
            <TrendingUp size={28} className="text-[#0B0E11]" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-gray-500 text-sm mt-3 font-medium">
            {mode === 'login' ? 'Sign in to your terminal' : 'Deploy your capital today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:ring-1 focus:ring-brand-teal/50 outline-none transition-all text-sm font-medium"
                placeholder="email@example.com" required />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-11 focus:ring-1 focus:ring-brand-teal/50 outline-none transition-all text-sm font-medium"
                placeholder={mode === 'register' ? 'Min 8 characters' : '••••••••'} required minLength={8} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {mode === 'register' && <p className="text-[10px] text-gray-500 mt-1 px-1">At least 8 characters required</p>}
          </div>
          {mode === 'register' && (
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Referral Code</label>
              <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input type="text" value={refCode} onChange={e => setRefCode(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:ring-1 focus:ring-brand-teal/50 outline-none transition-all text-sm font-medium"
                  placeholder="Optional" />
              </div>
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-brand-teal to-blue-600 text-[#0B0E11] font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-brand-teal/10 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={16} /> Processing...</> : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-500 font-medium">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <Link to={mode === 'login' ? '/auth/register' : '/auth/login'} className="text-brand-teal hover:underline font-black uppercase tracking-widest ml-1">
            {mode === 'login' ? 'Register' : 'Sign In'}
          </Link>
        </p>
      </div>
    </div>
  );
}