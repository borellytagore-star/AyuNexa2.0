import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Eye,
  FileHeart,
  BatteryCharging,
  Wifi,
  Database,
  CheckCircle2,
  Lock,
  Info,
  Fingerprint,
  Scan,
  Download,
  RefreshCw,
  Sparkles,
  KeyRound,
  FileText,
} from 'lucide-react';
import { BiometricPromptModal } from '../common/BiometricPromptModal';
import { SyncManagerModal } from '../common/SyncManagerModal';
import { ExportResult } from '../../utils/exportMedications';

export const PatientSettings: React.FC = () => {
  const {
    isAssistedMode,
    setIsAssistedMode,
    isOnline,
    batteryLevel,
    patient,
    caregiver,
    syncPendingCount,
    lastSyncTime,
    biometricSettings,
    setBiometricSettings,
    exportMedicationsCSV,
    updateCaregiverPhone,
  } = useApp();

  // Privacy Center Toggles (PRD §30)
  const [shareMedicineStatus, setShareMedicineStatus] = useState(true);
  const [shareReports, setShareReports] = useState(true);
  const [emergencyLocationOnly, setEmergencyLocationOnly] = useState(true);
  const [allowVideoCheck, setAllowVideoCheck] = useState(true);
  const [shareAiTranscripts, setShareAiTranscripts] = useState(false);

  // Caregiver Phone Demo Configuration
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(caregiver.phone || '+91 72888 73797');
  const [phoneSavedNotice, setPhoneSavedNotice] = useState(false);

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.trim()) {
      updateCaregiverPhone(phoneInput.trim());
      setIsEditingPhone(false);
      setPhoneSavedNotice(true);
      setTimeout(() => setPhoneSavedNotice(false), 3000);
    }
  };

  // Modals state
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [exportSuccessInfo, setExportSuccessInfo] = useState<ExportResult | null>(null);
  const [bioPromptPurpose, setBioPromptPurpose] = useState<'TEST' | 'EXPORT'>('TEST');

  const handleTriggerExport = () => {
    if (biometricSettings.isEnabled && biometricSettings.requireOnExportMedications) {
      setBioPromptPurpose('EXPORT');
      setIsBioModalOpen(true);
    } else {
      executeExportDownload();
    }
  };

  const executeExportDownload = () => {
    const res = exportMedicationsCSV();
    setExportSuccessInfo(res);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2
          className={`font-black text-slate-900 ${
            isAssistedMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
          }`}
        >
          Settings & Security Center
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Biometric security, offline sync management, accessibility, and emergency medical profile
        </p>
      </div>

      {/* 1. BIOMETRIC AUTHENTICATION & HARDWARE SECURITY (PRD §44, §45) */}
      <div className="bg-white border-2 border-teal-600/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Biometric Authentication (Fingerprint / Face ID)
                </h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Hardware Ready
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Protect sensitive prescriptions, medical records, and doctor exports
              </p>
            </div>
          </div>

          {/* Master Biometric Toggle */}
          <button
            onClick={() =>
              setBiometricSettings((prev) => ({
                ...prev,
                isEnabled: !prev.isEnabled,
              }))
            }
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
              biometricSettings.isEnabled ? 'bg-teal-700' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
                biometricSettings.isEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {biometricSettings.isEnabled ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-teal-50/70 rounded-2xl border border-teal-200 text-xs text-teal-900 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-bold">Biometric Security Enabled: </span>
                Uses Android BiometricPrompt / FIDO2 WebAuthn. Fingerprint and 3D facial recognition templates are isolated strictly inside the device hardware Trusted Execution Environment (TEE).
              </div>
            </div>

            {/* Granular Authentication Enforcements */}
            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    Require Biometric Auth for Doctor CSV Export
                  </p>
                  <p className="text-slate-500">
                    Verify identity before downloading or printing medication lists
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={biometricSettings.requireOnExportMedications}
                  onChange={(e) =>
                    setBiometricSettings((prev) => ({
                      ...prev,
                      requireOnExportMedications: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 accent-teal-700 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    Protect Emergency Medical Card & Paramedic Profile
                  </p>
                  <p className="text-slate-500">
                    Requires biometric verification to edit blood group, allergies, or contact details
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={biometricSettings.requireOnEmergencyProfile}
                  onChange={(e) =>
                    setBiometricSettings((prev) => ({
                      ...prev,
                      requireOnEmergencyProfile: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 accent-teal-700 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    Protect Caregiver Permissions
                  </p>
                  <p className="text-slate-500">
                    Verify biometric before granting or revoking caregiver visibility
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={biometricSettings.requireOnCaregiverPermissions}
                  onChange={(e) =>
                    setBiometricSettings((prev) => ({
                      ...prev,
                      requireOnCaregiverPermissions: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 accent-teal-700 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Test Biometric Trigger Button */}
            <div className="pt-2 flex flex-wrap gap-2 items-center">
              <button
                onClick={() => {
                  setBioPromptPurpose('TEST');
                  setIsBioModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Test Biometric Prompt (Fingerprint / Face ID)</span>
              </button>

              <span className="text-[11px] text-slate-500 font-medium">
                Simulates native Android BiometricPrompt with PIN fallback
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
            Biometric lock is currently turned off. Anyone with access to this unlocked device can view medical data.
          </div>
        )}
      </div>

      {/* 2. ASSISTED ACCESSIBILITY MODE (PRD §31, §32) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Assisted Mode (Senior Friendly)</h3>
              <p className="text-xs text-slate-500">
                +25% larger typography, high contrast borders, and extra-large touch targets
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAssistedMode((prev) => !prev)}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              isAssistedMode ? 'bg-teal-700' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
                isAssistedMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
          {isAssistedMode
            ? '✓ Currently ON: All buttons and medicine names are rendered in extra-large accessible sizes.'
            : 'Standard mode active: Compact layout with high information density.'}
        </div>
      </div>

      {/* 3. PRIVACY CENTER (PRD §30, §45) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Privacy & Caregiver Permissions</h3>
            <p className="text-xs text-slate-500">
              You decide exactly what son {caregiver.name} can view
            </p>
          </div>
        </div>

        <div className="space-y-3 divide-y divide-slate-100">
          {/* Medicine status sharing */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-bold text-slate-800">Share Medicine Confirmation Status</p>
              <p className="text-xs text-slate-500">
                {caregiver.name} sees when doses are marked taken or snoozed
              </p>
            </div>
            <input
              type="checkbox"
              checked={shareMedicineStatus}
              onChange={(e) => setShareMedicineStatus(e.target.checked)}
              className="w-5 h-5 accent-teal-700 rounded cursor-pointer"
            />
          </div>

          {/* Daily reports sharing */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-sm font-bold text-slate-800">Share Daily & Weekly Reports</p>
              <p className="text-xs text-slate-500">
                Sends automated adherence summaries to caregiver app
              </p>
            </div>
            <input
              type="checkbox"
              checked={shareReports}
              onChange={(e) => setShareReports(e.target.checked)}
              className="w-5 h-5 accent-teal-700 rounded cursor-pointer"
            />
          </div>

          {/* Emergency GPS location only */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-sm font-bold text-slate-800">GPS Location Sharing</p>
              <p className="text-xs text-slate-500">
                <strong>Emergency only:</strong> Shared strictly when SOS is activated
              </p>
            </div>
            <input
              type="checkbox"
              checked={emergencyLocationOnly}
              onChange={(e) => setEmergencyLocationOnly(e.target.checked)}
              className="w-5 h-5 accent-teal-700 rounded cursor-pointer"
            />
          </div>

          {/* Video check storage */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-sm font-bold text-slate-800">Camera Observation Feature</p>
              <p className="text-xs text-slate-500">
                Raw video is <strong>never stored</strong>. Only symptom observations are retained.
              </p>
            </div>
            <input
              type="checkbox"
              checked={allowVideoCheck}
              onChange={(e) => setAllowVideoCheck(e.target.checked)}
              className="w-5 h-5 accent-teal-700 rounded cursor-pointer"
            />
          </div>

          {/* AI Transcripts */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-sm font-bold text-slate-800">Share Full AI Conversations</p>
              <p className="text-xs text-slate-500">
                Keep private (only safety warnings are shared with {caregiver.name})
              </p>
            </div>
            <input
              type="checkbox"
              checked={shareAiTranscripts}
              onChange={(e) => setShareAiTranscripts(e.target.checked)}
              className="w-5 h-5 accent-teal-700 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. EMERGENCY MEDICAL CARD & DOCTOR CSV EXPORT (PRD §34) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <FileHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Emergency Medical Profile</h3>
              <p className="text-xs text-slate-500">
                Paramedic quick-scan information & physician consultation summary
              </p>
            </div>
          </div>

          {/* Export CSV Button for Doctor Visits */}
          <button
            onClick={handleTriggerExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export for Doctor Visit (CSV)</span>
          </button>
        </div>

        {/* Download Success Notice */}
        {exportSuccessInfo && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Exported <strong>{exportSuccessInfo.filename}</strong> ({exportSuccessInfo.rowCount} prescription records)
              </span>
            </div>
            <button
              onClick={() => setExportSuccessInfo(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-400 block font-semibold">Full Name & Age</span>
            <span className="text-slate-900 font-bold text-sm">
              {patient.name} ({patient.age} years)
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-400 block font-semibold">Blood Group</span>
            <span className="text-slate-900 font-bold text-sm">{patient.bloodGroup}</span>
          </div>

          <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 sm:col-span-2">
            <span className="text-rose-800 block font-bold">Documented Allergies</span>
            <span className="text-rose-950 font-bold text-sm">
              {patient.allergies.join(', ')}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-semibold">Primary Caregiver</span>
                <span className="text-slate-900 font-bold">{caregiver.name} (Son)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPhoneInput(caregiver.phone);
                  setIsEditingPhone(!isEditingPhone);
                }}
                className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200 transition-colors cursor-pointer"
              >
                {isEditingPhone ? 'Cancel' : 'Edit Phone'}
              </button>
            </div>

            {isEditingPhone ? (
              <form onSubmit={handleSavePhone} className="mt-2 pt-2 border-t border-slate-200 flex flex-col gap-1.5">
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+91 72888 73797"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-xs bg-white text-slate-900"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs cursor-pointer"
                >
                  Save Number
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-teal-700 font-mono font-bold">{caregiver.phone}</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
                  SOS Sync
                </span>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-400 block font-semibold">Cardiologist</span>
            <span className="text-slate-900 font-bold">{patient.doctorName}</span>
            <span className="text-teal-700 block mt-0.5">{patient.doctorPhone}</span>
          </div>
        </div>
      </div>

      {/* 5. SYSTEM HEALTH & SQLITE ROOM SYNC MANAGER (PRD §47, §40, §41) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-slate-500">
            System Diagnostics & SQLite Room Sync
          </h3>
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Open Sync Manager</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <span className="font-bold text-slate-800 block">Reminders</span>
            <span className="text-emerald-700 font-semibold">● Active Locally</span>
          </div>

          <div
            onClick={() => setIsSyncModalOpen(true)}
            className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center cursor-pointer hover:bg-teal-50/50 hover:border-teal-300 transition-all"
            title="Click to open Room Synchronization Manager"
          >
            <Database className="w-5 h-5 text-teal-600 mx-auto mb-1" />
            <span className="font-bold text-slate-800 block">SQLite Room DB</span>
            <span className="text-teal-800 font-semibold">
              {syncPendingCount > 0 ? `${syncPendingCount} Queued` : 'Cloud Synced'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <Wifi className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
            <span className="font-bold text-slate-800 block">Network</span>
            <span className={isOnline ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <BatteryCharging className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <span className="font-bold text-slate-800 block">Battery</span>
            <span className="text-slate-800 font-semibold">{batteryLevel}%</span>
          </div>
        </div>
      </div>

      {/* 6. ABOUT AYUNEXA (BRAND & SYSTEM IDENTITY) */}
      <div className="bg-gradient-to-br from-teal-50 via-white to-cyan-50 border border-teal-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black shadow-md shadow-teal-600/20">
            <span className="text-sm font-extrabold tracking-wider">AN</span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg">AyuNexa</h3>
            <p className="text-xs font-bold text-teal-800">
              Connected Care. Smarter Health.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          AyuNexa represents a connected healthcare companion that brings patients, medicines, caregivers, pharmacies, and healthcare professionals together.
        </p>

        <div className="pt-2 border-t border-teal-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
          <span>Version 2.4.0 (2026 Edition)</span>
          <span className="flex items-center gap-1 text-teal-700 font-semibold">
            <Info className="w-3.5 h-3.5" />
            Clinical-grade Safety Governance Enforced
          </span>
        </div>
      </div>

      {/* BIOMETRIC PROMPT MODAL */}
      <BiometricPromptModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        onSuccess={() => {
          if (bioPromptPurpose === 'EXPORT') {
            executeExportDownload();
          }
        }}
        actionTitle={
          bioPromptPurpose === 'EXPORT'
            ? 'Authenticate to Export Medication List'
            : 'Biometric Hardware Verification'
        }
        actionDescription={
          bioPromptPurpose === 'EXPORT'
            ? 'Verify fingerprint or Face ID to download clinical prescription records for Dr. Rao.'
            : 'Touch the device fingerprint scanner or glance at the camera to verify biometric credentials.'
        }
      />

      {/* SQLITE ROOM SYNC MANAGER MODAL */}
      <SyncManagerModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
};
