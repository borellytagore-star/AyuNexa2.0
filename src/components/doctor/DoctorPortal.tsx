import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CarePlan, CarePlanItem, CarePlanChange } from '../../types';
import {
  Stethoscope,
  FileCheck2,
  FileSignature,
  History,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Plus,
  ArrowRight,
  UserCheck,
  Heart,
  Pill,
  Activity,
  FileText,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

export const DoctorPortal: React.FC = () => {
  const {
    patient,
    doctor,
    medicines,
    carePlans,
    activeCarePlan,
    pendingCarePlan,
    createCarePlanDraft,
    authorizeCarePlan,
    auditLogs,
    timelineEvents,
    speakText,
    audioFeedback,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'careplan' | 'audit' | 'timeline' | 'summary'>('careplan');
  const [showDraftModal, setShowDraftModal] = useState<boolean>(false);
  const [signatureInput, setSignatureInput] = useState<string>('Dr. Aris Rao, MD, FACC');
  const [selectedPlanForAuth, setSelectedPlanForAuth] = useState<CarePlan | null>(null);

  // New Draft Care Plan state
  const [draftDiagnosis, setDraftDiagnosis] = useState<string>('Stage 2 Essential Hypertension & Type 2 Diabetes Mellitus');
  const [draftNotes, setDraftNotes] = useState<string>('Adjusting antihypertensive therapy. Adding evening Amlodipine 5mg to achieve target systolic BP < 130 mmHg. Patient reports mild evening ankle edema - monitor.');
  const [changeReason, setChangeReason] = useState<string>('Target systolic BP not met with morning Telmisartan monotherapy');
  const [auditFilter, setAuditFilter] = useState<string>('ALL');

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();

    const draftItems: CarePlanItem[] = [
      ...medicines.map((m) => ({
        medicineId: m.id,
        medicineName: `${m.name} ${m.strength}`,
        dosage: m.strength,
        frequency: 'DAILY',
        timesOfDay: m.schedules.map((s) => s.timeOfDay),
        instructions: m.instructions,
        foodInstruction: m.foodInstruction,
        clinicalIndication: m.category === 'HEART' ? 'Blood Pressure Management' : 'Glycemic Control',
      })),
      {
        medicineId: `med-new-${Date.now()}`,
        medicineName: 'Amlodipine Besylate 5mg',
        dosage: '5mg',
        frequency: 'DAILY',
        timesOfDay: ['20:00'],
        instructions: 'Take 1 tablet every evening with water',
        foodInstruction: 'TAKE_ANYTIME',
        clinicalIndication: 'Supplemental calcium channel blocker for nocturnal BP control',
      },
    ];

    const draftChanges: CarePlanChange[] = [
      {
        type: 'ADD_MEDICINE',
        medicineName: 'Amlodipine Besylate 5mg',
        clinicalReason: changeReason,
        previousValue: 'None',
        newValue: '5mg nightly',
      },
    ];

    const newDraft = createCarePlanDraft({
      primaryDiagnosis: draftDiagnosis,
      items: draftItems,
      clinicalNotes: draftNotes,
      changes: draftChanges,
    });

    setShowDraftModal(false);
    setSelectedPlanForAuth(newDraft);
    audioFeedback('success');
    speakText(`Care Plan draft ${newDraft.version} created. Ready for clinical authorization.`);
  };

  const handleAuthorize = (planId: string) => {
    if (!signatureInput.trim()) {
      alert('A valid clinical digital signature is required by healthcare governance.');
      return;
    }
    authorizeCarePlan(planId, signatureInput);
    setSelectedPlanForAuth(null);
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditFilter === 'ALL') return true;
    return log.actorRole === auditFilter || log.action === auditFilter;
  });

  return (
    <div className="space-y-6">
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{doctor.name}</h2>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {doctor.medicalSpecialty}
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                License: {doctor.licenseNumber} • Clinical Caregiver & Physician Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setShowDraftModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Draft New Care Plan</span>
            </button>
          </div>
        </div>

        {/* Patient Reference Strip */}
        <div className="mt-4 pt-3 border-t border-blue-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-100">
          <div className="flex items-center gap-4">
            <span>
              <strong>Active Patient:</strong> {patient.name} ({patient.age}M)
            </span>
            <span className="hidden sm:inline">•</span>
            <span>
              <strong>Caregiver:</strong> Tagore (Son)
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="text-amber-300 font-medium">
              <strong>Allergies:</strong> Penicillin (Severe)
            </span>
          </div>
          <div className="text-blue-300">
            <strong>Adherence Rate:</strong> 92.4% (Past 30 Days)
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-sm">
        <button
          onClick={() => setActiveTab('careplan')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'careplan'
              ? 'bg-blue-50 text-blue-800 shadow-sm border border-blue-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSignature className="w-4 h-4 text-blue-600" />
          <span>Care Plan Versions ({carePlans.length})</span>
          {pendingCarePlan && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-blue-50 text-blue-800 shadow-sm border border-blue-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>Immutable Audit Trail ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'timeline'
              ? 'bg-blue-50 text-blue-800 shadow-sm border border-blue-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4 text-teal-600" />
          <span>Clinical Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'summary'
              ? 'bg-blue-50 text-blue-800 shadow-sm border border-blue-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>Patient Chart</span>
        </button>
      </div>

      {/* TAB 1: CARE PLAN VERSIONS & AUTHORIZATION */}
      {activeTab === 'careplan' && (
        <div className="space-y-6">
          {/* Pending Acknowledgement Warning if any */}
          {pendingCarePlan && (
            <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl flex items-start gap-3 text-amber-900 shadow-sm">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-amber-900">
                    Care Plan {pendingCarePlan.version} Awaiting Patient Acknowledgment
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 font-bold text-amber-800 text-[10px]">
                    PENDING ACKNOWLEDGEMENT
                  </span>
                </div>
                <p className="mt-1 text-slate-700">
                  Authorized by {pendingCarePlan.authorizedByDoctorSignature}. In accordance with PRD §19,
                  medication changes do NOT activate until the patient or designated caregiver acknowledges receipt.
                </p>
                <div className="mt-2 text-slate-600">
                  <strong>Authorized Changes:</strong>{' '}
                  {pendingCarePlan.changesFromPrevious?.map((c, i) => (
                    <span key={i} className="inline-block bg-white px-2 py-0.5 rounded border border-amber-200 mr-2 text-[11px]">
                      {c.type}: {c.medicineName} ({c.newValue}) — {c.clinicalReason}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* List of All Care Plans */}
          <div className="space-y-4">
            {carePlans.map((plan) => {
              const isActive = plan.status === 'ACTIVE';
              const isPending = plan.status === 'PENDING_ACKNOWLEDGEMENT';
              const isDraft = plan.status === 'DRAFT';

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-xl border p-4 sm:p-5 transition-all shadow-sm ${
                    isActive
                      ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                      : isPending
                      ? 'border-amber-300'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPending
                            ? 'bg-amber-100 text-amber-800'
                            : isDraft
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {plan.version}
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{plan.primaryDiagnosis}</h3>
                        <p className="text-[11px] text-slate-500">
                          Created {new Date(plan.createdAt).toLocaleDateString()} by {plan.doctorName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : isDraft
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {plan.status.replace('_', ' ')}
                      </span>

                      {isDraft && (
                        <button
                          onClick={() => setSelectedPlanForAuth(plan)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <FileSignature className="w-3.5 h-3.5" />
                          <span>Review & Authorize</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Plan Items Grid */}
                  <div className="mt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Authorized Medications & Regimen ({plan.items.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {plan.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <Pill className="w-3.5 h-3.5 text-blue-600" />
                              <span>{item.medicineName}</span>
                            </div>
                            <div className="text-slate-600 text-[11px] mt-0.5">
                              {item.timesOfDay.join(', ')} • {item.instructions}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Indication: {item.clinicalIndication}
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                            {item.dosage}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clinical Differential Notes */}
                  {plan.changesFromPrevious && plan.changesFromPrevious.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs">
                      <span className="font-bold text-blue-900 block mb-1">
                        Clinical Diff from Preceding Regimen:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                        {plan.changesFromPrevious.map((c, i) => (
                          <li key={i}>
                            <strong>{c.type} {c.medicineName}:</strong> {c.newValue} (Reason: {c.clinicalReason})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sign-off & Acknowledgement Metadata */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                    <div>
                      {plan.authorizedByDoctorSignature ? (
                        <span className="text-blue-800 font-medium flex items-center gap-1">
                          <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                          Signature: <em>"{plan.authorizedByDoctorSignature}"</em>
                        </span>
                      ) : (
                        <span>Pending physician digital signature</span>
                      )}
                    </div>
                    <div>
                      {plan.acknowledgedByPatient ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Patient Acknowledged ({new Date(plan.acknowledgedAt || '').toLocaleDateString()})
                        </span>
                      ) : isPending ? (
                        <span className="text-amber-700 font-bold">Awaiting patient signature/tap</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: IMMUTABLE AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>Forensic Healthcare Audit Trail (PRD §49 & §22)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tamper-evident record of all medication events, care plan authorizations, and safety actions.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium"
              >
                <option value="ALL">All Event Roles</option>
                <option value="PATIENT">Patient Events</option>
                <option value="DOCTOR">Doctor Authorizations</option>
                <option value="CAREGIVER">Caregiver Actions</option>
                <option value="SYSTEM">System Automations</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor & Role</th>
                  <th className="py-2.5 px-3">Action Event</th>
                  <th className="py-2.5 px-3">Resource & Evidence</th>
                  <th className="py-2.5 px-3">Result & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredAuditLogs.map((log) => {
                  const isDoctor = log.actorRole === 'DOCTOR';
                  const isPatient = log.actorRole === 'PATIENT';
                  const isEmergency = log.action.includes('EMERGENCY');

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isEmergency ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-sans">
                        {log.timestamp}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                            isDoctor
                              ? 'bg-blue-100 text-blue-800'
                              : isPatient
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {log.actorName} ({log.actorRole})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            isEmergency
                              ? 'text-rose-700'
                              : log.action.includes('CARE_PLAN')
                              ? 'text-blue-700'
                              : 'text-slate-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <span className="block font-sans text-slate-800 font-medium">
                          {log.resourceType}: {log.resourceId}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Src: {log.evidenceSource} • Device: {log.deviceId}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-sans max-w-xs truncate">
                        <span className="text-emerald-700 font-bold mr-1">[{log.result}]</span>
                        {log.notes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-teal-600" />
              <span>Patient Clinical & Medication Timeline</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified chronological stream of medications, care plans, alerts, and caregiver interactions.
            </p>
          </div>

          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timelineEvents.map((evt) => (
              <div key={evt.id} className="relative group">
                <div
                  className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                    evt.category === 'EMERGENCY'
                      ? 'border-rose-600 bg-rose-50'
                      : evt.category === 'CARE_PLAN'
                      ? 'border-blue-600 bg-blue-50'
                      : evt.category === 'OBSERVATION'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-teal-600 bg-teal-50'
                  }`}
                />
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{evt.title}</span>
                      {evt.statusBadge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-700 border border-slate-200">
                          {evt.statusBadge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {evt.date} • {evt.time}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600">{evt.description}</p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-3">
                    <span>Actor: {evt.actor}</span>
                    <span>Source: {evt.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PATIENT CHART SUMMARY */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600" />
              <span>Cardiovascular & Metabolic Profile</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Blood Pressure (Recent):</span>
                <span className="font-bold text-slate-900">138 / 88 mmHg (Mild Elevation)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Fasting Blood Glucose:</span>
                <span className="font-bold text-slate-900">118 mg/dL (Well Managed)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">eGFR (Kidney Function):</span>
                <span className="font-bold text-slate-900">68 mL/min/1.73m² (Normal)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">HbA1c:</span>
                <span className="font-bold text-slate-900">6.8% (Target &lt; 7.0%)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Treatment Adherence Indicators</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">30-Day Medication Adherence:</span>
                <span className="font-bold text-emerald-700">92.4% (Tier 1 Optimal)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Active Care Plan Version:</span>
                <span className="font-bold text-blue-700">{activeCarePlan?.version || 'v2.0'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Unconfirmed Dose Alerts:</span>
                <span className="font-bold text-slate-900">0 Active Alerts</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Pharmacy Delivery Status:</span>
                <span className="font-bold text-slate-900">Apollo Pharmacy (Stock Runway 14d)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAFT CARE PLAN MODAL */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-900">
                <FileSignature className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base">Draft New Care Plan</h3>
              </div>
              <button
                onClick={() => setShowDraftModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDraft} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Primary Clinical Diagnosis
                </label>
                <input
                  type="text"
                  value={draftDiagnosis}
                  onChange={(e) => setDraftDiagnosis(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Proposed Medication Adjustment
                </label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-slate-700">
                  <div className="font-bold text-blue-900">
                    + Add Amlodipine Besylate 5mg (Nightly 20:00)
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Retains morning Telmisartan 40mg and Metformin 500mg. Adds evening calcium channel blocker to prevent morning blood pressure surges.
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Clinical Rationale for Modification
                </label>
                <input
                  type="text"
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Physician Clinical Notes
                </label>
                <textarea
                  rows={3}
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDraftModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Create Draft Plan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW & AUTHORIZE MODAL */}
      {selectedPlanForAuth && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-900">
                <FileSignature className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base">
                  Authorize Care Plan {selectedPlanForAuth.version}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlanForAuth(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                <span className="font-bold block mb-1">
                  ⚠️ Healthcare Safety Protocol Notice (PRD §19):
                </span>
                Authorizing this Care Plan makes it available to Ravi Kumar and Tagore for acknowledgment. Reminders and stock deduction logic will immediately reflect the new schedule once acknowledged.
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Doctor Digital Attestation & Signature
                </label>
                <input
                  type="text"
                  value={signatureInput}
                  onChange={(e) => setSignatureInput(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium bg-slate-50"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Attesting under Medical Council of India / NMC Lic. No. MCI-2012-98421
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForAuth(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAuthorize(selectedPlanForAuth.id)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Digitally Sign & Authorize</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
