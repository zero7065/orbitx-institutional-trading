import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { ThemeProvider } from './components/ThemeContext';

import DepositPage from './pages/dashboard/Deposit';
import WithdrawPage from './pages/dashboard/Withdraw';
import HistoryPage from './pages/dashboard/History';
import ReferralsPage from './pages/dashboard/Referrals';
import MarketHub from './pages/dashboard/Markets';
import SpinPage from './pages/dashboard/Spin';
import RewardsPage from './pages/dashboard/Rewards';
import SettingsPage from './pages/dashboard/Settings';
import SupportTicketsPage from './pages/dashboard/SupportTickets';
import KYCPage from './pages/dashboard/KYC';
import BuyCryptoPage from './pages/dashboard/BuyCrypto';
import AdminRouter from './pages/admin/AdminRouter';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardOverview from './pages/DashboardOverview';
import DashboardLayout from './components/DashboardLayout';

const AuthContext = React.createContext<any>(null);
export const useAuth = () => React.useContext(AuthContext);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#0B0E11]"><div className="animate-pulse text-gray-500 font-black uppercase tracking-widest text-sm">Authenticating...</div></div>;
  if (!user) return <Navigate to="/auth/login" />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#0B0E11]"><div className="animate-pulse text-gray-500 font-black uppercase tracking-widest text-sm">Authenticating...</div></div>;
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({ balance: 0, totalDeposited: 0 });
  const [platformSettings, setPlatformSettings] = useState<any>({ platformName: 'OrbitX' });

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (data.user) setUser(data.user);
    }).catch(console.error).finally(() => setLoading(false));

    fetch('/api/settings').then(r => r.json()).then(data => {
      if (data) setPlatformSettings(data);
      if (data?.platformName) document.title = data.platformName;
    }).catch(console.error);
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Login failed'); }
      const data = await res.json();
      if (data.user) { setUser(data.user); toast.success('Successfully logged in'); window.location.href = '/dashboard'; }
    } catch (err: any) { toast.error(err.message || 'Login failed'); }
  };

  const register = async (email: string, pass: string, ref: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, referralCode: ref })
      });
      const data = await res.json();
      if (res.ok && data.user) { setUser(data.user); toast.success('Registration successful'); window.location.href = '/dashboard'; }
      else throw new Error(data.error || 'Registration failed');
    } catch (err: any) { toast.error(err.message || 'Registration failed'); }
  };

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (e) {}
    setUser(null); window.location.href = '/';
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/user/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data || { balance: 0, totalDeposited: 0 });
    } catch (err) { console.error('Stats fetch error:', err); }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchStats, stats, platformSettings, setUser }}>
      <Toaster richColors position="top-right" theme="dark" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<AuthPage mode="login" />} />
        <Route path="/auth/register" element={<AuthPage mode="register" />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
        <Route path="/dashboard/deposit" element={<ProtectedRoute><DepositPage /></ProtectedRoute>} />
        <Route path="/dashboard/withdraw" element={<ProtectedRoute><WithdrawPage /></ProtectedRoute>} />
        <Route path="/dashboard/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/dashboard/referrals" element={<ProtectedRoute><ReferralsPage /></ProtectedRoute>} />
        <Route path="/dashboard/markets" element={<ProtectedRoute><MarketHub /></ProtectedRoute>} />
        <Route path="/dashboard/spin" element={<ProtectedRoute><SpinPage /></ProtectedRoute>} />
        <Route path="/dashboard/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/dashboard/support" element={<ProtectedRoute><SupportTicketsPage /></ProtectedRoute>} />
        <Route path="/dashboard/kyc" element={<ProtectedRoute><KYCPage /></ProtectedRoute>} />
        <Route path="/dashboard/buy-crypto" element={<ProtectedRoute><BuyCryptoPage /></ProtectedRoute>} />

        <Route path="/admin/*" element={<AdminRoute><AdminRouter onLogout={logout} platformName={platformSettings?.platformName} /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}