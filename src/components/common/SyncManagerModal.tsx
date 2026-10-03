import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  ShieldCheck,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { syncManager, SyncStatusState } from '../../services/syncManager';
import { CloudBackupInfo, SyncLogEntry } from '../../types';

interface SyncManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncManagerModal: React.FC<SyncManagerModalProps> = ({ isOpen, onClose }) => {
  const {
    isOnline,
    medicines,
    dosesToday,
    stockEvents,
    auditLogs,
    carePlans,
    syncPendingCount,
    triggerManualSync,
    audioFeedback,
    speakText,
    logAuditEvent,
    patient,
  } = useApp();

  const [syncStatus, setSyncStatus] = useState<SyncStatusState>('IDLE');
  const [backupInfo, setBackupInfo] = useState<CloudBackupInfo>(syncManager.getCloudBackupInfo(syncPendingCount));
  const [history, setHistory] = useState<SyncLogEntry[]>(syncManager.getHistory());
  const [autoSync, setAutoSync] = useState<boolean>(syncManager.isAutoSyncEnabled());
  const [isSyncingLocal, setIsSyncingLocal] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((status, info) => {
      setSyncStatus(status);
      setBackupInfo(info);
      setHistory(syncManager.getHistory());
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleManualSyncNow = async () => {
    if (!isOnline) {
      speakText('Device is offline. Cloud sync will automatically resume when network is restored.');
      return;
    }

    setIsSyncingLocal(true);
    speakText('Initiating Room database backup sync.');

    const snapshot = {
      medicinesCount: medicines.length,
      dosesCount: dosesToday.length,
      stockEventsCount: stockEvents.length,
      auditLogsCount: auditLogs.length,
      carePlansCount: carePlans.length,
    };

    const entry = await syncManager.executeSync('MANUAL_TRIGGER', snapshot);
    triggerManualSync();
    setIsSyncingLocal(false);
    audioFeedback('success');
    speakText('Room database synchronized with cloud backup.');

    logAuditEvent({
      actorId: patient.id,
      actorName: patient.name,
      actorRole: 'PATIENT',
      action: 'SYNC_COMPLETED',
      resourceType: 'SYSTEM_SYNC',
      resourceId: entry.id,
      evidenceSource: 'DEVICE_VERIFIED',
      deviceId: 'sqlite-room-sync-manager',
      result: 'SUCCESS',
      notes: `Manual sync completed. Checksum: ${entry.snapshotChecksum}. Synced ${medicines.length + dosesToday.length + auditLogs.length} total Room entities.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
            <RefreshCw className={`w-6 h-6 ${isSyncingLocal ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                SQLite Room Synchronization Manager
              </h3>
              <span
                className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-300'
                }`}
              >
                {isOnline ? 'Online (Connected)' : 'Offline (Queued)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Event-based local Room SQLite database sync with authoritative cloud backup
            </p>
          </div>
        </div>

        {/* Connectivity & Pipeline Status Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Sync Pipeline State
            </span>
            <span className="text-xs font-extrabold text-teal-800 flex items-center gap-1.5">
              {isSyncingLocal || syncStatus === 'SYNCING' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                  Uploading Encrypted Snapshot...
                </>
              ) : !isOnline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  Offline — Changes Saved to Local Room DB
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Synchronized with Cloud Backup
                </>
              )}
            </span>
          </div>

          {/* Room Database Entity Counts */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1 text-center">
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Medicines</span>
              <span className="text-sm font-black text-slate-800">{medicines.length}</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Doses Today</span>
              <span className="text-sm font-black text-slate-800">{dosesToday.length}</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Stock Events</span>
              <span className="text-sm font-black text-slate-800">{stockEvents.length}</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Care Plans</span>
              <span className="text-sm font-black text-slate-800">{carePlans.length}</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200 col-span-3 sm:col-span-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Audit Logs</span>
              <span className="text-sm font-black text-slate-800">{auditLogs.length}</span>
            </div>
          </div>
        </div>

        {/* Sync Controls & Auto-reconnect setting */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">
                Auto-sync on connectivity restoration
              </p>
              <p className="text-[11px] text-slate-500">
                Automatically detects when Wi-Fi/Cellular reconnects and transfers pending Room queue
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => {
                setAutoSync(e.target.checked);
                syncManager.setAutoSyncOnReconnect(e.target.checked);
              }}
              className="w-5 h-5 accent-teal-700 rounded cursor-pointer"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleManualSyncNow}
              disabled={isSyncingLocal || !isOnline}
              className={`flex-1 py-3 px-4 rounded-xl text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                !isOnline
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-teal-700 hover:bg-teal-800 active:scale-98'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingLocal ? 'animate-spin' : ''}`} />
              <span>
                {isSyncingLocal ? 'Syncing Room Snapshot...' : 'Force Cloud Backup Sync Now'}
              </span>
            </button>
          </div>
        </div>

        {/* Cloud Backup Specification */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-600">
            <span className="font-semibold">Cloud Target:</span>
            <span className="font-mono text-[11px] text-teal-800">{backupInfo.serverEndpoint}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="font-semibold">Encryption:</span>
            <span className="font-mono text-[11px] text-slate-700">{backupInfo.encryption}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="font-semibold">Last Cloud Sync:</span>
            <span className="font-bold text-slate-800">{backupInfo.lastBackupTime}</span>
          </div>
        </div>

        {/* Sync History Log */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Recent Synchronization History
          </span>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {item.trigger === 'CONNECTIVITY_RESTORED'
                        ? '⚡ Reconnected Sync'
                        : item.trigger === 'MANUAL_TRIGGER'
                        ? '🔄 Manual Push'
                        : '🕒 Scheduled Sync'}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {item.snapshotChecksum} • {item.durationMs}ms
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
