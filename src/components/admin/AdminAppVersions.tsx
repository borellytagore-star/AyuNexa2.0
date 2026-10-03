import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { AppVersionConfig } from '../../types/admin';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Power,
  ShieldAlert,
} from 'lucide-react';

export const AdminAppVersions: React.FC = () => {
  const [versions, setVersions] = useState<AppVersionConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVer, setSelectedVer] = useState<AppVersionConfig | null>(null);
  const [minVerInput, setMinVerInput] = useState('');
  const [recVerInput, setRecVerInput] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAppVersions();
      setVersions(data.versions);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const openEdit = (ver: AppVersionConfig) => {
    setSelectedVer(ver);
    setMinVerInput(ver.minimumSupportedVersion);
    setRecVerInput(ver.recommendedVersion);
    setMaintenanceMode(ver.maintenanceMode);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!selectedVer) return;
    try {
      await adminApi.updateAppVersion(selectedVer.platform, {
        minimumSupportedVersion: minVerInput,
        recommendedVersion: recVerInput,
        maintenanceMode,
      });
      setShowEditModal(false);
      fetchVersions();
    } catch (e: any) {
      alert(`Error updating version: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-700" />
            <span>Force-Update & App Version Control</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage minimum supported client versions, trigger forced upgrades for critical security patches, and configure maintenance mode.
          </p>
        </div>

        <button
          onClick={fetchVersions}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Version Gate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {versions.map((ver) => (
          <div key={ver.id} className="ayunexa-card p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900">
                  {ver.platform}
                </span>

                {ver.maintenanceMode ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    <Power className="w-3 h-3 text-rose-600" />
                    <span>Maintenance Active</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Operational</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Min Supported</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">v{ver.minimumSupportedVersion}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Recommended</span>
                  <span className="font-bold text-purple-900 font-mono text-sm">v{ver.recommendedVersion}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{ver.releaseNotes}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">{ver.updatedAt}</span>
              <button onClick={() => openEdit(ver)} className="btn-ayunexa-secondary text-xs">
                Edit Version Policy
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedVer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Update {selectedVer.platform} Version Policy
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Minimum Supported Build (Clients below this will be forced to update)
                </label>
                <input
                  type="text"
                  value={minVerInput}
                  onChange={(e) => setMinVerInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recommended Version</label>
                <input
                  type="text"
                  value={recVerInput}
                  onChange={(e) => setRecVerInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="maintCheck"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="rounded text-purple-700 focus:ring-purple-600"
                />
                <label htmlFor="maintCheck" className="text-slate-700 font-semibold cursor-pointer">
                  Activate Platform Maintenance Mode
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowEditModal(false)} className="btn-ayunexa-secondary text-xs">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-ayunexa-primary text-xs">
                Save Version Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
