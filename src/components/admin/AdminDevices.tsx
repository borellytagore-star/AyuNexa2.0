import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { UserSessionDevice } from '../../types/admin';
import {
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut,
  ShieldAlert,
  Clock,
} from 'lucide-react';

export const AdminDevices: React.FC = () => {
  const [devices, setDevices] = useState<UserSessionDevice[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getDevices();
      setDevices(data.devices);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRevoke = async (id: string, userName: string) => {
    if (!confirm(`Are you sure you want to force logout and revoke active session for ${userName}?`)) return;
    try {
      await adminApi.revokeDeviceSession(id);
      fetchDevices();
    } catch (e: any) {
      alert(`Error revoking session: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-700" />
            <span>Active Sessions & Device Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit hardware tokens, enforce remote logout on lost devices, and manage security session lifecycles.
          </p>
        </div>

        <button
          onClick={fetchDevices}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Security Privacy Notice */}
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-slate-700 leading-relaxed">
        <strong className="text-purple-900 block mb-0.5">Device Fingerprint Privacy Policy:</strong>
        Hardware serial numbers and IMSI strings are strictly excluded in accordance with healthcare privacy standards.
        Sessions are identified using cryptographically hashed tokens.
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {devices.map((dev) => (
          <div key={dev.id} className="ayunexa-card p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {dev.platform.includes('WEB') ? (
                    <Laptop className="w-4 h-4 text-purple-700" />
                  ) : dev.platform === 'IOS' ? (
                    <Tablet className="w-4 h-4 text-blue-700" />
                  ) : (
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                  )}
                  <span className="font-bold text-slate-900 text-xs">{dev.device}</span>
                </div>

                {dev.isCurrent && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                    Your Session
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>User:</span>
                  <span className="font-semibold text-slate-900">
                    {dev.userName} ({dev.userRole})
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Last Active:</span>
                  <span className="font-mono text-purple-900 font-bold">{dev.lastActive}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Client Build:</span>
                  <span className="font-mono text-slate-800">v{dev.appVersion}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>IP Address:</span>
                  <span className="font-mono text-slate-600">{dev.ipAddress}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">ID: {dev.id}</span>

              {!dev.isCurrent ? (
                <button
                  onClick={() => handleRevoke(dev.id, dev.userName)}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3 text-rose-600" />
                  <span>Force Logout</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 italic">Active Now</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
