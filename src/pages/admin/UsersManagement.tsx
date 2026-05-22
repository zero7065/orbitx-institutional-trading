import React, { useEffect, useState } from 'react';
import { Search, Eye, DollarSign, Lock, ShieldAlert, Ban, Check, X, RefreshCw, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  balance: number;
  totalDeposited: number;
  role: string;
  status: string;
  kycStatus: string;
  pin: string;
  adminNote: string;
  createdAt: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [balanceModal, setBalanceModal] = useState<{user: User; type: 'add' | 'remove' | 'set'} | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceNote, setBalanceNote] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        setUsers(await res.json());
      } else {
        toast.error('Failed to load users');
      }
    } catch (e) { toast.error('Network error loading users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateBalance = async () => {
    if (!balanceModal || !balanceAmount) return;
    const amount = parseFloat(balanceAmount);
    try {
      let body: any = { amount, note: balanceNote, type: balanceModal.type };
      if (balanceModal.type === 'set') {
        const res = await fetch(`/api/admin/users/${balanceModal.user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ balance: amount })
        });
        if (res.ok) { toast.success('Balance set successfully'); setBalanceModal(null); setBalanceAmount(''); setBalanceNote(''); fetchUsers(); }
        return;
      }
      const res = await fetch(`/api/admin/users/${balanceModal.user.id}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) { toast.success('Balance updated'); setBalanceModal(null); setBalanceAmount(''); setBalanceNote(''); fetchUsers(); }
    } catch (e) { toast.error('Failed to update balance'); }
  };

  const updateStatus = async (user: User, status: string) => {
    const reason = status === 'SUSPENDED' || status === 'BANNED' ? prompt('Enter reason:') : '';
    try {
      const res = await fetch(`/api/admin/users/${user.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason })
      });
      if (res.ok) { toast.success(`User ${status.toLowerCase()}`); fetchUsers(); }
      else { const d = await res.json().catch(() => ({})); toast.error(d.error || `Failed to ${status.toLowerCase()} user`); }
    } catch (e) { toast.error('Network error updating status'); }
  };

  const resetPin = async (user: User) => {
    const newPin = prompt('Enter new PIN (4 digits, default 1234):') || '1234';
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin })
      });
      if (res.ok) toast.success('PIN reset successfully');
      else { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to reset PIN'); }
    } catch (e) { toast.error('Network error resetting PIN'); }
  };

  const resetPassword = async (user: User) => {
    const newPass = prompt('Enter new password (default password123):') || 'password123';
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPass })
      });
      if (res.ok) toast.success('Password reset successfully');
      else { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to reset password'); }
    } catch (e) { toast.error('Network error resetting password'); }
  };

  const viewUserDetail = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`);
      const data = await res.json();
      setSelectedUser(data);
      setShowDetail(true);
    } catch (e) { toast.error('Failed to load user details'); }
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="animate-pulse text-center py-20 text-gray-500 text-sm">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} total users</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-gray-400">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-1 focus:ring-purple-500 text-sm" />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">KYC</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-black uppercase">
                        {user.email[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{user.email}</div>
                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">ID: {user.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-brand-teal">${user.balance.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                      user.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                      user.status === 'SUSPENDED' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                      user.kycStatus === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                      user.kycStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                      user.kycStatus === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                      'bg-white/5 text-gray-500'
                    }`}>
                      {user.kycStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => viewUserDetail(user)} className="p-2 bg-white/5 hover:bg-brand-teal/10 rounded-xl text-gray-400 hover:text-brand-teal transition-all" title="View Details">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => setBalanceModal({ user, type: 'add' })} className="p-2 bg-white/5 hover:bg-green-500/10 rounded-xl text-gray-400 hover:text-green-400 transition-all" title="Add Funds">
                        <DollarSign size={16} />
                      </button>
                      <button onClick={() => setBalanceModal({ user, type: 'remove' })} className="p-2 bg-white/5 hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-400 transition-all" title="Remove Funds">
                        <Ban size={16} />
                      </button>
                      <button onClick={() => resetPin(user)} className="p-2 bg-white/5 hover:bg-yellow-500/10 rounded-xl text-gray-400 hover:text-yellow-400 transition-all" title="Reset PIN">
                        <Lock size={16} />
                      </button>
                      <div className="relative group">
                        <button className="p-2 bg-white/5 hover:bg-purple-500/10 rounded-xl text-gray-400 hover:text-purple-400 transition-all">
                          <ChevronDown size={16} />
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-[#1a1d23] border border-white/10 rounded-xl py-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[180px]">
                          <button onClick={() => resetPassword(user)} className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 text-gray-300 hover:text-white">Reset Password</button>
                          {user.status === 'ACTIVE' ? (
                            <button onClick={() => updateStatus(user, 'SUSPENDED')} className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 text-yellow-400">Suspend User</button>
                          ) : (
                            <button onClick={() => updateStatus(user, 'ACTIVE')} className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 text-green-400">Activate User</button>
                          )}
                          <button onClick={() => updateStatus(user, 'BANNED')} className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 text-red-400">Ban User</button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {balanceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setBalanceModal(null)}>
          <div className="bg-[#1a1d23] border border-white/10 rounded-3xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">
              {balanceModal.type === 'add' ? 'Add Funds' : balanceModal.type === 'remove' ? 'Remove Funds' : 'Set Balance'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              User: <span className="text-white font-bold">{balanceModal.user.email}</span><br />
              Current Balance: <span className="text-brand-teal font-black">${balanceModal.user.balance.toLocaleString()}</span>
            </p>
            <div className="space-y-4">
              <input type="number" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} placeholder="Amount" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
              <input type="text" value={balanceNote} onChange={e => setBalanceNote(e.target.value)} placeholder="Note (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
              <div className="flex gap-3">
                <button onClick={() => setBalanceModal(null)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={updateBalance} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all ${
                  balanceModal.type === 'add' ? 'bg-green-500 hover:bg-green-600' : balanceModal.type === 'remove' ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'
                }`}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-10 overflow-y-auto" onClick={() => setShowDetail(false)}>
          <div className="bg-[#1a1d23] border border-white/10 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black">{selectedUser.email}</h3>
                <div className="flex gap-2 mt-2">
                  <span className="text-[9px] px-2 py-1 rounded bg-purple-500/20 text-purple-400 font-black uppercase">{selectedUser.role}</span>
                  <span className={`text-[9px] px-2 py-1 rounded font-black uppercase ${selectedUser.kycStatus === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    KYC: {selectedUser.kycStatus}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowDetail(false)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Balance', value: `$${selectedUser.balance.toLocaleString()}`, color: 'text-brand-teal' },
                { label: 'Deposited', value: `$${selectedUser.totalDeposited.toLocaleString()}`, color: 'text-green-400' },
                { label: 'Status', value: selectedUser.status, color: selectedUser.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400' },
                { label: 'Joined', value: new Date(selectedUser.createdAt).toLocaleDateString(), color: 'text-gray-300' },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{s.label}</div>
                  <div className={`text-sm font-black mt-1 ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h4 className="font-black uppercase tracking-widest text-xs text-gray-500 mb-4">Recent Transactions</h4>
              <div className="space-y-2">
                {selectedUser.transactions?.slice(0, 10).map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-white/2 rounded-xl border border-white/5">
                    <div>
                      <span className="text-xs font-bold">{tx.type}</span>
                      <p className="text-[10px] text-gray-500">{tx.description}</p>
                    </div>
                    <span className={`text-xs font-black ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                ))}
                {(!selectedUser.transactions || selectedUser.transactions.length === 0) && (
                  <p className="text-gray-500 text-sm text-center py-4">No transactions</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-widest text-xs text-gray-500 mb-4">Quick Actions</h4>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => { setShowDetail(false); setBalanceModal({ user: selectedUser, type: 'add' }); }} className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-black uppercase tracking-widest hover:bg-green-500/20">
                  Add Funds
                </button>
                <button onClick={() => { setShowDetail(false); setBalanceModal({ user: selectedUser, type: 'remove' }); }} className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-500/20">
                  Remove Funds
                </button>
                <button onClick={() => { resetPin(selectedUser); setShowDetail(false); }} className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-xs font-black uppercase tracking-widest hover:bg-yellow-500/20">
                  Reset PIN
                </button>
                <button onClick={() => { resetPassword(selectedUser); setShowDetail(false); }} className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 text-xs font-black uppercase tracking-widest hover:bg-purple-500/20">
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}