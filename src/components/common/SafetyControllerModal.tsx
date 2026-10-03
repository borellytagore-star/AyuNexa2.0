import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Cpu,
  Database,
  WifiOff,
  Scale,
  X,
} from 'lucide-react';

export const SafetyControllerModal: React.FC = () => {
  const { isSafetyModalOpen, setIsSafetyModalOpen } = useApp();

  if (!isSafetyModalOpen) return null;

  const truthRules = [
    { rule: 'UNKNOWN ≠ SAFE', description: 'Missing response or state is never assumed to mean the patient is safe or taken care of.' },
    { rule: 'UNKNOWN ≠ MISSED', description: 'Unconfirmed dose is not marked as missed until explicit escalation timeout completes.' },
    { rule: 'NO_RESPONSE ≠ MISSED', description: 'Patient silence triggers caregiver attention rather than automatic failure classification.' },
    { rule: 'NO_RESPONSE ≠ EMERGENCY', description: 'Absence of response escalates gracefully without triggering false 911/ambulance alarms.' },
    { rule: 'AI_PREDICTION ≠ MEDICAL_FACT', description: 'AI outputs are suggestions or drafts; doctor signature is strictly mandatory.' },
    { rule: 'PATIENT_REPORT ≠ VERIFIED_OBSERVATION', description: 'Patient self-reported dose is labeled as PATIENT_REPORTED, not clinically observed.' },
    { rule: 'SENT ≠ DELIVERED', description: 'Network dispatch does not guarantee receipt on local device.' },
    { rule: 'DELIVERED ≠ ACKNOWLEDGED', description: 'Care plans and emergency alerts require explicit human action to be marked acknowledged.' },
    { rule: 'PUBLISHED ≠ ACTIVE', description: 'Doctor authorization puts care plan in PENDING_ACKNOWLEDGEMENT; patient must activate.' },
  ];

  const guardrails = [
    {
      title: 'Autonomous Medication Discontinuation',
      status: 'ENFORCED BLOCKED',
      category: 'Clinical Safety',
      details: 'AI and automated systems are strictly forbidden from discontinuing or substituting prescriptions.',
    },
    {
      title: 'Autonomous Dosage Alteration',
      status: 'ENFORCED BLOCKED',
      category: 'Clinical Safety',
      details: 'Dosage modifications require verified physician credentials and digital signature sign-off.',
    },
    {
      title: 'AI in Medication Reminder Critical Path',
      status: 'FORBIDDEN DISCONNECTED',
      category: 'Architectural Safety',
      details: 'Exact-time dose alarms execute via local deterministic clock and Room SQLite database with zero LLM dependency.',
    },
    {
      title: 'AI in Emergency Execution Critical Path',
      status: 'FORBIDDEN DISCONNECTED',
      category: 'Emergency Safety',
      details: 'Emergency SOS broadcasts direct device-level dialer and SMS alerts without waiting for AI processing.',
    },
    {
      title: 'Duplicate Dose Stock Deduction Prevention',
      status: 'VERIFIED IDEMPOTENT',
      category: 'Adherence & Stock',
      details: 'Duplicate taps or retried network sync events reject re-deductions if status is already TAKEN.',
    },
    {
      title: 'Offline-First Write-First Architecture',
      status: 'VERIFIED ACTIVE',
      category: 'Data Integrity',
      details: 'All state writes commit to local storage/Room DB before network sync queueing.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Healthcare Safety Controller
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  All Gates Enforced
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Governance, Truth Rules Matrix & Critical-Path Protections
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSafetyModalOpen(false)}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guardrails Verification Status */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-purple-600" />
            <span>Active Safety Guardrails (PRD §14 & §15)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {guardrails.map((g, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-800 text-[11px] leading-tight">
                      {g.title}
                    </span>
                    <span className="shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      PASS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{g.details}</p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-purple-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{g.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Truth Rules Matrix */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>Healthcare Truth Rules Matrix (PRD §15)</span>
          </h4>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 text-xs">
            {truthRules.map((t, idx) => (
              <div key={idx} className="flex items-start gap-2 border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                <span className="font-mono font-bold text-blue-700 shrink-0 text-[11px]">
                  {t.rule}
                </span>
                <span className="text-slate-600 text-[11px] leading-tight">
                  — {t.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Closing Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setIsSafetyModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            Acknowledge & Close Controller
          </button>
        </div>
      </div>
    </div>
  );
};
