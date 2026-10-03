import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { FeatureFlag } from '../../types/admin';
import {
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Tag,
  Shield,
} from 'lucide-react';

export const AdminFeatureFlags: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [toggleFlagKey, setToggleFlagKey] = useState<string | null>(null);
  const [toggleState, setToggleState] = useState(false);
  const [reason, setReason] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getConfiguration();
      setFlags(data.flags);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const initiateToggle = (key: string, currentState: boolean) => {
    setToggleFlagKey(key);
    setToggleState(!currentState);
    setReason('');
    setShowModal(true);
  };

  const handleConfirmToggle = async () => {
    if (!toggleFlagKey || !reason.trim()) return;
    try {
      await adminApi.toggleFeatureFlag(toggleFlagKey, toggleState, reason);
      setShowModal(false);
      setReason('');
      fetchFlags();
    } catch (e: any) {
      alert(`Error toggling flag: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-700" />
            <span>Feature Flags & Runtime Application Configuration</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamically toggle assistive audio, AI boundaries, commercial refill modules, and senior accessibility modes without code releases.
          </p>
        </div>

        <button
          onClick={fetchFlags}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Safety Guardrail Callout */}
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3">
        <Shield className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-purple-900">Safety Critical Boundary:</span>
          <p className="text-slate-600">
            Emergency SOS and immutable local medication reminder chimes cannot be disabled via remote feature flags.
            Every configuration change requires an operational reason recorded into the compliance audit log.
          </p>
        </div>
      </div>

      {/* Feature Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flags.map((flag) => (
          <div key={flag.key} className="ayunexa-card p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 font-mono">
                  {flag.category}
                </span>

                <button
                  onClick={() => initiateToggle(flag.key, flag.isEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    flag.isEnabled ? 'bg-purple-900' : 'bg-slate-300'
                  }`}
                  title="Click to toggle feature state"
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs ${
                      flag.isEnabled ? 'left-5.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{flag.label}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{flag.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Modified by: {flag.lastModifiedBy}</span>
              <span className="font-mono">{flag.lastModifiedAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toggle Reason Modal */}
      {showModal && toggleFlagKey && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-purple-900">
              <Sliders className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Confirm Feature Toggle</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are switching feature <strong>{toggleFlagKey}</strong> to{' '}
              <strong className={toggleState ? 'text-emerald-700' : 'text-rose-700'}>
                {toggleState ? 'ENABLED' : 'DISABLED'}
              </strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Change (Audit Requirement) *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Activated for Hackathon showcase, disabled for scheduled partner maintenance..."
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setReason('');
                }}
                className="btn-ayunexa-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmToggle}
                disabled={!reason.trim()}
                className="btn-ayunexa-primary text-xs"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
