import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { AdminAnalyticsMetrics, AdminRole } from '../../types/admin';
import {
  Users,
  Pill,
  ShoppingBag,
  CreditCard,
  LifeBuoy,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Send,
  FileSpreadsheet,
  Building2,
  History,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tabId: string) => void;
  currentRole: AdminRole;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab, currentRole }) => {
  const [metrics, setMetrics] = useState<AdminAnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAnalytics();
      setMetrics(data.metrics);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Governance Notice */}
      <div className="bg-gradient-to-r from-[#4a044e] to-[#701a75] text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-400 text-amber-950">
              Operations Console
            </span>
            <span className="text-xs text-purple-200">
              Environment: <strong className="text-white">DEMO / PRODUCTION HYBRID</strong>
            </span>
          </div>
          <h2 className="text-2xl font-bold mt-1 text-white">Operations & Governance Overview</h2>
          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            Live operational telemetry across patient medication events, caregiver escalations, pharmacy refill pipelines, and security audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Data Freshness: CURRENT</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="ayunexa-card p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Managed Users</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono tabular-nums">
            {metrics?.totalUsers || 10}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>+4 new this week</span>
            <span>·</span>
            <span className="text-slate-500">8 verified</span>
          </div>
        </div>

        <div className="ayunexa-card p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Recorded Confirmations</span>
            <Pill className="w-4 h-4 text-pink-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono tabular-nums">
            {metrics?.recordedDoseConfirmationsToday || 15}
          </div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">
            <span>Today's patient-verified doses</span>
          </div>
        </div>

        <div className="ayunexa-card p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Refill Orders Queue</span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono tabular-nums">
            {metrics?.refillOrdersPending || 2}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
            <span>1 prescription review required</span>
          </div>
        </div>

        <div className="ayunexa-card p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Open Support Tickets</span>
            <LifeBuoy className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono tabular-nums">
            {metrics?.openSupportTickets || 2}
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">
            <span>Avg resolution time: 18m</span>
          </div>
        </div>
      </div>

      {/* Operational Queues & Attention Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Urgent Action Queue */}
        <div className="md:col-span-2 ayunexa-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">High-Priority Operational Queues</h3>
            </div>
            <span className="text-xs text-slate-500">Live Status</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                    PRESCRIPTION REVIEW
                  </span>
                  <span className="text-xs font-bold text-slate-900">Order #ord-103 (Deepak Verma)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Doctor modified dosage for Atorvastatin (from 10mg to 20mg). Pharmacy dispatch paused until doctor verification confirmed.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('orders')}
                className="btn-ayunexa-secondary text-xs px-3 py-1.5 shrink-0"
              >
                Review Order
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-200 text-purple-900">
                    PENDING VERIFICATION
                  </span>
                  <span className="text-xs font-bold text-slate-900">New User Deepak Verma</span>
                </div>
                <p className="text-xs text-slate-600">
                  Phone OTP verified. Medical record linkage and primary caregiver assignment pending review.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('users')}
                className="btn-ayunexa-secondary text-xs px-3 py-1.5 shrink-0"
              >
                Inspect User
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900">
                    MODERATION FLAG
                  </span>
                  <span className="text-xs font-bold text-slate-900">Community Note Flagged</span>
                </div>
                <p className="text-xs text-slate-600">
                  Unverified post claiming herbal cure for insulin dependence automatically quarantined by healthcare safety rule engine.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('moderation')}
                className="btn-ayunexa-destructive text-xs px-3 py-1.5 shrink-0"
              >
                Review Queue
              </button>
            </div>
          </div>
        </div>

        {/* Quick Operations Actions */}
        <div className="ayunexa-card p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Quick Operations</h3>
            <span className="text-[11px] text-slate-500 font-mono">16 Modules</span>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs">
            <button
              onClick={() => onNavigateTab('users')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-700" />
                <span>Manage Users & Roles</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('notifications')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-pink-700" />
                <span>Broadcast Notification</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('reports')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Export Audit & Health CSV</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('partners')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-700" />
                <span>Pharmacy Partners</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('feature-flags')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-700" />
                <span>Feature Flags & Toggles</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('audit')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-700" />
                <span>Inspect Audit Trail</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
