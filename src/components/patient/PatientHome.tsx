import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Mic,
  ShieldAlert,
  ChevronRight,
  Pill,
  Sparkles,
  PhoneCall,
  Volume2,
  Package,
  FileSignature,
  Stethoscope,
  Check,
  Download,
  Database,
  RefreshCw,
} from 'lucide-react';
import { DoseAdherenceChart } from './DoseAdherenceChart';
import { CareJourneyTimeline } from '../common/CareJourneyTimeline';
import { BiometricPromptModal } from '../common/BiometricPromptModal';
import { SyncManagerModal } from '../common/SyncManagerModal';
import { ExportResult } from '../../utils/exportMedications';

interface PatientHomeProps {
  onOpenAssistant: () => void;
  onOpenStock: () => void;
  onOpenRefill: (medicineId: string) => void;
}

export const PatientHome: React.FC<PatientHomeProps> = ({
  onOpenAssistant,
  onOpenStock,
  onOpenRefill,
}) => {
  const {
    t,
    isAssistedMode,
    patient,
    caregiver,
    dosesToday,
    medicines,
    takeDose,
    snoozeDose,
    cantTakeDose,
    triggerSOS,
    speakText,
    pendingCarePlan,
    acknowledgeCarePlan,
    rejectCarePlan,
    exportMedicationsCSV,
    biometricSettings,
    isOnline,
    syncPendingCount,
  } = useApp();

  const [snoozeOpen, setSnoozeOpen] = useState<string | null>(null);
  const [cantTakeModal, setCantTakeModal] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  const [isBioModalOpen, setIsBioModalOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<ExportResult | null>(null);

  const handleExportCSV = () => {
    if (biometricSettings.isEnabled && biometricSettings.requireOnExportMedications) {
      setIsBioModalOpen(true);
    } else {
      doExport();
    }
  };

  const doExport = () => {
    const res = exportMedicationsCSV();
    setExportNotice(res);
  };

  // Find currently active / pending dose (e.g. 8:00 PM Metformin)
  const pendingDose = dosesToday.find(
    (d) => d.status === 'SCHEDULED' || d.status === 'REMINDER_SENT' || d.status === 'SNOOZED'
  );

  // Today's summary stats
  const totalDoses = dosesToday.length;
  const takenDoses = dosesToday.filter((d) => d.status === 'TAKEN').length;
  const unconfirmedDoses = dosesToday.filter(
    (d) => d.status === 'REMINDER_SENT' || d.status === 'SCHEDULED'
  ).length;

  const currentMedDetails = pendingDose
    ? medicines.find((m) => m.id === pendingDose.medicineId)
    : null;

  return (
    <div className={`space-y-4 sm:space-y-6 ${isAssistedMode ? 'text-lg' : 'text-base'}`}>
      {/* 1. GREETING & IMMEDIATE 3-SECOND COMPREHENSION BANNER */}
      <section className="bg-gradient-to-r from-[#4a044e] via-[#631469] to-[#701a75] rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/5 blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-purple-100 text-xs font-semibold backdrop-blur-sm">
                Patient Portal
              </span>
              <span className="text-xs text-purple-200">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <h2
              className={`font-black tracking-tight text-white ${
                isAssistedMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
              }`}
            >
              {t.greeting}
            </h2>
            <p
              className={`text-purple-100 mt-1 font-medium ${
                isAssistedMode ? 'text-base sm:text-lg' : 'text-sm'
              }`}
            >
              {pendingDose
                ? `${t.subtitleAllSet} (${pendingDose.medicineName} at ${pendingDose.scheduledTime})`
                : 'All scheduled medicines are confirmed for now. Great job!'}
            </p>
          </div>

          {/* Quick Voice Readout */}
          <button
            onClick={() => {
              if (pendingDose) {
                speakText(
                  `Ravi, it is time for ${pendingDose.medicineName}, ${pendingDose.doseQuantity} ${pendingDose.unit}. Scheduled for ${pendingDose.scheduledTime}.`
                );
              } else {
                speakText(`Ravi, you are all set for today. All scheduled medicines have been taken.`);
              }
            }}
            className="self-start md:self-center flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span>Read Status Aloud</span>
          </button>
        </div>
      </section>

      {/* CARE PLAN ACTION BANNER (PRD §19: PUBLISHED ≠ ACTIVE) */}
      {pendingCarePlan && (
        <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border-2 border-blue-400/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-300 shrink-0">
                <FileSignature className="w-6 h-6 text-blue-300 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                    Action Required
                  </span>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    New Treatment Plan from {pendingCarePlan.doctorName}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-blue-100/90 leading-snug">
                  Care Plan <strong>{pendingCarePlan.version}</strong> has been clinically authorized.
                  Review changes below and tap to activate your new schedule.
                </p>
                {pendingCarePlan.changesFromPrevious && pendingCarePlan.changesFromPrevious.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-blue-800/60 flex flex-wrap gap-2 text-xs">
                    {pendingCarePlan.changesFromPrevious.map((c, i) => (
                      <span key={i} className="inline-block bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-blue-100 text-xs">
                        <strong>{c.type}:</strong> {c.medicineName} ({c.newValue})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  acknowledgeCarePlan(pendingCarePlan.id);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Acknowledge & Activate Plan</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. MEDICINE NOW — PRIMARY FOCUS CARD (PRD §1, §9) */}
      <section className="bg-white border-2 border-teal-600/30 rounded-3xl p-5 sm:p-7 shadow-md transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-600 animate-ping" />
            <h3
              className={`font-black uppercase tracking-wider text-teal-900 ${
                isAssistedMode ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
              }`}
            >
              {t.medicineNow}
            </h3>
          </div>
          {pendingDose && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Scheduled for {pendingDose.scheduledTime}
            </span>
          )}
        </div>

        {pendingDose ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: currentMedDetails?.colorHex || '#0d9488' }}
                >
                  <Pill className="w-8 h-8 sm:w-9 sm:h-9" />
                </div>
                <div>
                  <h4
                    className={`font-extrabold text-slate-900 leading-tight ${
                      isAssistedMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                    }`}
                  >
                    {pendingDose.medicineName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Take: {pendingDose.doseQuantity} {pendingDose.unit}
                    </span>
                    <span className="text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                      {currentMedDetails?.foodInstruction === 'AFTER_MEAL'
                        ? 'Take after food'
                        : currentMedDetails?.foodInstruction === 'BEFORE_MEAL'
                        ? 'Take before food'
                        : 'With water'}
                    </span>
                  </div>
                  {currentMedDetails?.instructions && (
                    <p className="text-xs text-slate-500 mt-2 italic font-medium">
                      “{currentMedDetails.instructions}”
                    </p>
                  )}
                </div>
              </div>

              {/* Stock snapshot */}
              {currentMedDetails && (
                <div className="hidden sm:block text-right shrink-0">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Remaining Stock</p>
                  <p
                    className={`text-base font-bold ${
                      currentMedDetails.currentStock <= currentMedDetails.reorderThreshold
                        ? 'text-rose-600'
                        : 'text-slate-800'
                    }`}
                  >
                    {currentMedDetails.currentStock} {currentMedDetails.unit}
                  </p>
                  <p className="text-xs text-slate-500">
                    ~
                    {Math.round(
                      currentMedDetails.currentStock /
                        (currentMedDetails.schedules.length || 1)
                    )}{' '}
                    days left
                  </p>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS — LARGE ACCESSIBLE TOUCH TARGETS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              {/* TAKEN (PRIMARY LARGE GREEN BUTTON) */}
              <button
                onClick={() => takeDose(pendingDose.id)}
                className={`w-full ${
                  isAssistedMode ? 'py-5 text-xl' : 'py-4 text-lg'
                } px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black tracking-wide shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer`}
              >
                <CheckCircle2 className="w-7 h-7" />
                <span>{t.taken}</span>
              </button>

              {/* REMIND ME LATER / SNOOZE */}
              <button
                onClick={() =>
                  setSnoozeOpen(snoozeOpen === pendingDose.id ? null : pendingDose.id)
                }
                className={`w-full ${
                  isAssistedMode ? 'py-4 text-base' : 'py-3.5 text-sm'
                } px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer`}
              >
                <Clock className="w-5 h-5 text-slate-600" />
                <span>{t.remindLater}</span>
              </button>

              {/* CAN'T TAKE IT */}
              <button
                onClick={() => setCantTakeModal(pendingDose.id)}
                className={`w-full ${
                  isAssistedMode ? 'py-4 text-base' : 'py-3.5 text-sm'
                } px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold border border-rose-200 flex items-center justify-center gap-2 transition-all cursor-pointer`}
              >
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>{t.cantTake}</span>
              </button>
            </div>

            {/* SNOOZE OPTIONS DROPDOWN */}
            {snoozeOpen === pendingDose.id && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap gap-2 items-center justify-center animate-in fade-in">
                <span className="text-xs font-semibold text-slate-600 mr-2">Snooze duration:</span>
                {[10, 15, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      snoozeDose(pendingDose.id, mins);
                      setSnoozeOpen(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-teal-50 hover:border-teal-400 text-slate-800 text-xs font-bold transition-all"
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">
              All Current Doses Confirmed!
            </h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your next scheduled medication is{' '}
              <strong className="text-slate-800">Atorvastatin 20 mg</strong> at 9:00 PM.
            </p>
          </div>
        )}
      </section>

      {/* 3. TODAY'S STATUS COUNTER (PRD §9) */}
      <section className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base uppercase tracking-wider">
            {t.todaysStatus}
          </h3>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            {takenDoses} of {totalDoses} taken ({Math.round((takenDoses / totalDoses) * 100)}%)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {dosesToday.map((dose) => (
            <div
              key={dose.id}
              className={`p-3 rounded-2xl border transition-all ${
                dose.status === 'TAKEN'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : dose.status === 'REMINDER_SENT'
                  ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                  : dose.status === 'UNABLE_TO_TAKE'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span>{dose.scheduledTime}</span>
                {dose.status === 'TAKEN' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : dose.status === 'REMINDER_SENT' ? (
                  <Clock className="w-4 h-4 text-amber-600" />
                ) : (
                  <Pill className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              <p className="font-bold text-xs truncate">{dose.medicineName}</p>
              <p className="text-[11px] opacity-80 mt-0.5">
                {dose.status === 'TAKEN'
                  ? `Taken at ${dose.actionTime || 'time'}`
                  : dose.status === 'REMINDER_SENT'
                  ? 'Ready now'
                  : dose.status === 'UNABLE_TO_TAKE'
                  ? 'Skipped'
                  : 'Scheduled'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CARE JOURNEY PROGRESSION TIMELINE */}
      <CareJourneyTimeline />

      {/* QUICK DOCTOR CONSULTATION & SYNC TOOLBAR */}
      <section className="bg-gradient-to-r from-purple-50 via-[#fdf4ff] to-pink-50 border border-purple-200/80 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#701a75] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Download className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Preparing for a Doctor Visit?
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Export your current prescriptions & daily adherence as a clinical CSV report
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleExportCSV}
            className="btn-ayunexa-primary text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV for Doctor</span>
          </button>

          <button
            onClick={() => setIsSyncModalOpen(true)}
            title="Inspect Room Database Cloud Sync"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Database className="w-4 h-4 text-purple-700" />
            <span className="hidden sm:inline">Room Sync</span>
          </button>
        </div>
      </section>

      {/* EXPORT SUCCESS TOAST */}
      {exportNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Exported <strong>{exportNotice.filename}</strong> ({exportNotice.rowCount} medication records). Ready for clinical review with Dr. Rao.
            </span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* DOSE ADHERENCE RECHARTS DASHBOARD SECTION */}
      <DoseAdherenceChart />

      {/* 4. MEDICINE STOCK RUNWAY (PRD §9, §13, §14) */}
      <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-slate-900 text-base sm:text-lg">
              {t.medicineStock}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Estimated days remaining before you run out
            </p>
          </div>
          <button
            onClick={onOpenStock}
            className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all cursor-pointer"
          >
            <span>Full Stock</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {medicines.map((med) => {
            const daysLeft = Math.max(
              1,
              Math.round(med.currentStock / (med.schedules.length || 1))
            );
            const isLow = med.currentStock <= med.reorderThreshold;
            const progressPercent = Math.min(100, Math.round((med.currentStock / 30) * 100));

            return (
              <div
                key={med.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isLow ? 'bg-amber-50/80 border-amber-300' : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: med.colorHex }}
                    />
                    <h4 className="font-bold text-slate-900 text-sm">{med.name}</h4>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-extrabold ${
                        isLow ? 'text-amber-800' : 'text-slate-800'
                      }`}
                    >
                      {med.currentStock} {med.unit} left
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      ~{daysLeft} days remaining
                    </span>
                  </div>
                </div>

                {/* Runway Visual Bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLow ? 'bg-amber-500' : 'bg-teal-600'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {isLow && (
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="flex items-center gap-1 font-semibold text-amber-800">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Refill recommended soon
                    </span>
                    <button
                      onClick={() => onOpenRefill(med.id)}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs cursor-pointer"
                    >
                      Find Pharmacy & Refill
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. AI ASSISTANT & CAREGIVER QUICK ENTRY CHIPS (PRD §9, §17, §18) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Voice AI "Ask Medi" Banner */}
        <div
          onClick={onOpenAssistant}
          className="bg-gradient-to-br from-indigo-700 to-blue-800 hover:from-indigo-800 hover:to-blue-900 text-white p-5 rounded-3xl shadow-sm cursor-pointer border border-indigo-600 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-indigo-100 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              Wake phrase: “Hey AyuNexa”
            </span>
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse">
              <Mic className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-xl">{t.askMedi}</h3>
            <p className="text-indigo-200 text-xs font-medium mt-1">{t.askMediSub}</p>
          </div>
        </div>

        {/* Contact Caregiver Quick Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Primary Caregiver
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Caregiver Connected" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-base">{caregiver.name}</h4>
            <p className="text-xs text-slate-500 font-medium">
              Son • {caregiver.phone}
            </p>
          </div>
          <div className="flex gap-2 mt-3">
            <a
              href={`tel:${caregiver.phone}`}
              className="flex-1 py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 flex items-center justify-center gap-1.5 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Son</span>
            </a>
            <button
              onClick={() => {
                speakText(`Sending a gentle check-in note to ${caregiver.name}.`);
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Say “I am well”
            </button>
          </div>
        </div>
      </section>

      {/* 6. PERSISTENT EMERGENCY SOS ACCESS (PRD §9, §21) */}
      <section className="pt-2">
        <button
          onClick={triggerSOS}
          className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-black text-lg sm:text-xl tracking-wider shadow-lg shadow-rose-600/30 flex items-center justify-center gap-3 border-2 border-rose-400 transition-all cursor-pointer"
        >
          <ShieldAlert className="w-7 h-7 animate-pulse" />
          <span>{t.sos}</span>
        </button>
        <p className="text-center text-xs text-slate-500 mt-2 font-medium">
          Instant connection to emergency services (112) & caregiver {caregiver.name}
        </p>
      </section>

      {/* CAN'T TAKE DOSE REASON MODAL */}
      {cantTakeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900">
              Why can't you take this dose right now?
            </h3>
            <p className="text-xs text-slate-600">
              This helps your doctor and caregiver {caregiver.name} understand your medication routine.
            </p>

            <div className="space-y-2">
              {[
                'Feeling nauseous / unwell',
                'Haven’t eaten food yet',
                'Experiencing side effects',
                'Medicine out of reach',
                'Doctor advised pause',
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => {
                    cantTakeDose(cantTakeModal, reason);
                    setCantTakeModal(null);
                  }}
                  className="w-full p-3 text-left rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-sm font-semibold text-slate-800 transition-all"
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCantTakeModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BIOMETRIC AUTHENTICATION PROMPT */}
      <BiometricPromptModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        onSuccess={() => doExport()}
        actionTitle="Biometric Verification Required"
        actionDescription="Authenticate with fingerprint or Face ID to export medical records for clinical review."
      />

      {/* SQLITE ROOM SYNC MANAGER MODAL */}
      <SyncManagerModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
};
