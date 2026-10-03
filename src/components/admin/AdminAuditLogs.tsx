import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { AdminAuditLog } from '../../types/admin';
import {
  History,
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Lock,
  RefreshCw,
} from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs(search);
      setLogs(data.logs);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-purple-700" />
            <span>Immutable Security & Governance Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Append-only security records capturing administrative actions, care plan authorizations, refunds, and permission checks.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Append-Only Notice */}
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3">
        <Lock className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-purple-900">Cryptographic Append-Only Invariant:</span>
          <p className="text-slate-600">
            Audit log entries cannot be modified or deleted by standard administrators. All entries record actor user ID,
            role, target resource, before/after states, client user agent, and timestamp.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="ayunexa-card p-4 flex items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by action, actor, target or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
          />
        </div>

        <span className="text-xs text-slate-500 font-mono">{logs.length} Total Events</span>
      </div>

      {/* Audit Log Table */}
      <div className="ayunexa-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {l.timestamp}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{l.actorName}</div>
                    <div className="text-[10px] text-purple-700 font-mono">{l.actorRole}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                      {l.action}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-medium">{l.targetType}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{l.targetId}</div>
                  </td>

                  <td className="py-3 px-4">
                    {l.result === 'SUCCESS' ? (
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Success</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-700 font-semibold">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>{l.result}</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedLog(l)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Inspect Full Audit Record"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Audit Record Details</h3>
                <span className="text-xs text-slate-500 font-mono">ID: {selectedLog.id}</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Actor</span>
                  <span className="font-semibold text-slate-900">{selectedLog.actorName}</span>
                  <div className="text-[10px] text-purple-700 font-mono">{selectedLog.actorRole}</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Timestamp</span>
                  <span className="font-semibold text-slate-900 font-mono">{selectedLog.timestamp}</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Target & Action</span>
                <span className="font-bold text-slate-900 font-mono">{selectedLog.action}</span>
                <div className="text-slate-600 text-[11px] mt-0.5">
                  Type: {selectedLog.targetType} · ID: {selectedLog.targetId}
                </div>
              </div>

              {selectedLog.reason && (
                <div className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-100 text-slate-700">
                  <span className="font-bold text-purple-900 block mb-0.5">Reason / Justification:</span>
                  <p>{selectedLog.reason}</p>
                </div>
              )}

              {(selectedLog.beforeState || selectedLog.afterState) && (
                <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Before State</span>
                    <span className="text-slate-700">{selectedLog.beforeState || 'N/A'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">After State</span>
                    <span className="text-purple-900 font-bold">{selectedLog.afterState || 'N/A'}</span>
                  </div>
                </div>
              )}

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 font-mono">
                <div>Client IP: {selectedLog.ipAddress}</div>
                <div>Device / User Agent: {selectedLog.deviceSession}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedLog(null)} className="btn-ayunexa-secondary text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
