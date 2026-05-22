import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Monitor, Smartphone, Globe, Eye, EyeOff, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/admin/sessions');
      if (res.ok) {
        setSessions(await res.json());
      } else {
        toast.error('Failed to load sessions');
      }
    } catch (e) {
      toast.error('Network error loading sessions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse text-center py-20 text-gray-500">Loading sessions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">User Sessions</h1>
          <p className="text-gray-500 text-sm mt-1">Track all user login sessions and activity</p>
        </div>
        <button onClick={fetchSessions} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-xs font-bold">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-[10px] uppercase tracking-wider">
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">IP Address</th>
                <th className="text-left p-4">Device</th>
                <th className="text-left p-4">Incognito</th>
                <th className="text-left p-4">Login Time</th>
                <th className="text-left p-4">Last Active</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s: any) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="p-4 font-bold">{s.userEmail}</td>
                  <td className="p-4 text-gray-400 font-mono text-xs">{s.ipAddress}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {s.deviceInfo?.includes('Mobile') || s.deviceInfo?.includes('Android') || s.deviceInfo?.includes('iPhone') ? <Smartphone size={14} className="text-gray-400" /> : <Monitor size={14} className="text-gray-400" />}
                      <span className="text-xs text-gray-400">{s.deviceInfo?.substring(0, 30) || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="p-4">{s.isIncognito ? <EyeOff size={16} className="text-red-400" /> : <Eye size={16} className="text-green-400" />}</td>
                  <td className="p-4 text-xs text-gray-400">{new Date(s.loginAt).toLocaleString()}</td>
                  <td className="p-4 text-xs text-gray-400">{new Date(s.lastActive).toLocaleString()}</td>
                  <td className="p-4">{s.active ? <span className="text-green-400 text-xs font-bold">ACTIVE</span> : <span className="text-gray-500 text-xs">INACTIVE</span>}</td>
                </tr>
              ))}
              {sessions.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-500">No sessions found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}