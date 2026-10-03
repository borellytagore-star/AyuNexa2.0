import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Medicine } from '../../types';
import {
  Plus,
  Pill,
  Clock,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Utensils,
  History,
  ShieldCheck,
  Search,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { AddMedicineWizard } from './AddMedicineWizard';
import { BiometricPromptModal } from '../common/BiometricPromptModal';
import { ExportResult } from '../../utils/exportMedications';

interface MedicineListProps {
  onOpenRefill: (medicineId: string) => void;
}

export const MedicineList: React.FC<MedicineListProps> = ({ onOpenRefill }) => {
  const { medicines, isAssistedMode, dosesToday, exportMedicationsCSV, biometricSettings } = useApp();
  const [expandedMedId, setExpandedMedId] = useState<string | null>(medicines[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
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

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2
            className={`font-black text-slate-900 ${
              isAssistedMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}
          >
            My Medications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Active prescriptions, schedules, instructions & doses
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Export for Doctor Visit CSV */}
          <button
            onClick={handleExportCSV}
            className="btn-ayunexa-secondary text-xs sm:text-sm"
            title="Export full medication and schedule list as CSV for clinical consultation"
          >
            <Download className="w-4 h-4 text-purple-700" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddWizard(true)}
            className="btn-ayunexa-primary text-xs sm:text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Medicine</span>
          </button>
        </div>
      </div>

      {/* Export Success Toast */}
      {exportNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Successfully exported <strong>{exportNotice.filename}</strong> ({exportNotice.rowCount} medications). Ready for clinical review.
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

      {/* Search & Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by medicine name or generic composition..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-xs"
        />
      </div>

      {/* Medicines Cards List */}
      <div className="space-y-4">
        {filteredMedicines.map((med) => {
          const isExpanded = expandedMedId === med.id;
          const daysRemaining = Math.max(
            1,
            Math.round(med.currentStock / (med.schedules.length || 1))
          );
          const isLowStock = med.currentStock <= med.reorderThreshold;

          // Relevant doses today
          const medDoses = dosesToday.filter((d) => d.medicineId === med.id);

          return (
            <div
              key={med.id}
              className={`bg-white border rounded-3xl transition-all overflow-hidden ${
                isLowStock
                  ? 'border-amber-300 shadow-amber-500/5'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              {/* Header card row */}
              <div
                onClick={() => setExpandedMedId(isExpanded ? null : med.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: med.colorHex }}
                  >
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-black text-slate-900 leading-tight ${
                          isAssistedMode ? 'text-xl' : 'text-base sm:text-lg'
                        }`}
                      >
                        {med.name}
                      </h3>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {med.strength}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-teal-600" />
                        {med.schedules.map((s) => s.timeOfDay).join(', ')}
                      </span>
                      <span>•</span>
                      <span className="font-medium">
                        {med.schedules[0]?.frequency.replace('_', ' ').toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span
                      className={`text-sm font-black ${
                        isLowStock ? 'text-amber-700' : 'text-slate-800'
                      }`}
                    >
                      {med.currentStock} {med.unit}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      ~{daysRemaining} days left
                    </span>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expandable Details Section (PRD §11) */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Food Instruction */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                        <Utensils className="w-3.5 h-3.5 text-teal-600" />
                        <span>Food Timing</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {med.foodInstruction === 'AFTER_MEAL'
                          ? 'Take after meals'
                          : med.foodInstruction === 'BEFORE_MEAL'
                          ? 'Take on empty stomach / before food'
                          : 'With glass of water'}
                      </p>
                      {med.instructions && (
                        <p className="text-xs text-slate-600 mt-1 italic">
                          {med.instructions}
                        </p>
                      )}
                    </div>

                    {/* Stock & Runway */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                        <History className="w-3.5 h-3.5 text-teal-600" />
                        <span>Inventory Runway</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {med.currentStock} {med.unit} remaining (~{daysRemaining} days)
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Threshold alert at {med.reorderThreshold} units
                      </p>
                    </div>

                    {/* Last Dose History */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Last Verified Taken</span>
                      </div>
                      <p className="text-sm font-bold text-emerald-800">
                        {med.lastTakenTime || 'Confirmed today'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Logged in local database</p>
                    </div>
                  </div>

                  {/* Scheduled Doses for this med today */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Today's Dose Schedule
                    </h4>
                    <div className="space-y-2">
                      {medDoses.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                        >
                          <span className="font-bold text-slate-800">
                            {d.scheduledTime} — {d.doseQuantity} {d.unit}
                          </span>
                          <span
                            className={`font-semibold px-2 py-0.5 rounded-md ${
                              d.status === 'TAKEN'
                                ? 'bg-emerald-100 text-emerald-800'
                                : d.status === 'REMINDER_SENT'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {d.status === 'TAKEN'
                              ? `Taken at ${d.actionTime}`
                              : d.status === 'REMINDER_SENT'
                              ? 'Awaiting confirmation'
                              : 'Scheduled'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Refill trigger if low */}
                  {isLowStock && (
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Stock below threshold ({med.currentStock} left). Order refill now?</span>
                      </div>
                      <button
                        onClick={() => onOpenRefill(med.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer shrink-0"
                      >
                        Refill Order
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ADD MEDICINE 7-STEP WIZARD MODAL */}
      {showAddWizard && <AddMedicineWizard onClose={() => setShowAddWizard(false)} />}

      {/* BIOMETRIC AUTHENTICATION MODAL */}
      <BiometricPromptModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        onSuccess={() => doExport()}
        actionTitle="Biometric Verification Required"
        actionDescription="Verify fingerprint or Face ID to export medical records for clinical review."
      />
    </div>
  );
};
