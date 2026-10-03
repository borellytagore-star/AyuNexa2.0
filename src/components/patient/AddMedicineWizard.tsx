import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MedicineForm, FoodInstruction, ScheduleFrequency } from '../../types';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Pill,
  Clock,
  Package,
  Bell,
  Sparkles,
} from 'lucide-react';

interface AddMedicineWizardProps {
  onClose: () => void;
}

export const AddMedicineWizard: React.FC<AddMedicineWizardProps> = ({ onClose }) => {
  const { addMedicine, isAssistedMode, speakText } = useApp();

  const [step, setStep] = useState(1);

  // Form State across 7 steps
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('500 mg');
  const [form, setForm] = useState<MedicineForm>('TABLET');
  const [foodInstruction, setFoodInstruction] = useState<FoodInstruction>('AFTER_MEAL');
  const [frequency, setFrequency] = useState<ScheduleFrequency>('ONCE_DAILY');
  const [times, setTimes] = useState<string[]>(['08:00 AM']);
  const [stock, setStock] = useState<number>(30);
  const [reorderThreshold, setReorderThreshold] = useState<number>(7);
  const [instructions, setInstructions] = useState('');

  const handleNext = () => {
    if (step === 1 && !name.trim()) return;
    if (step < 7) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConfirm = () => {
    const schedules = times.map((t, idx) => ({
      id: `sch-${Date.now()}-${idx}`,
      medicineId: '',
      timeOfDay: t,
      doseQuantity: 1,
      frequency,
      startDate: new Date().toISOString().split('T')[0],
      isActive: true,
    }));

    addMedicine({
      name,
      strength,
      form,
      colorHex: '#0d9488',
      iconType: 'pill',
      currentStock: Number(stock) || 30,
      unit: form === 'CAPSULE' ? 'capsules' : 'tablets',
      reorderThreshold: Number(reorderThreshold) || 7,
      foodInstruction,
      instructions: instructions || 'Take with water as directed.',
      schedules,
    });

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header with step progress indicator */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                Step {step} of 7
              </span>
              <span className="text-xs text-slate-400">Add Medicine Wizard</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              {step === 1 && 'What is the medicine name?'}
              {step === 2 && 'Strength & Dosage Form'}
              {step === 3 && 'How often do you take it?'}
              {step === 4 && 'Set Daily Times'}
              {step === 5 && 'Current Stock'}
              {step === 6 && 'Reorder Alert Threshold'}
              {step === 7 && 'Review & Activate'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-teal-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>

        {/* Step Contents */}
        <div className="py-2 min-h-[200px]">
          {/* STEP 1: MEDICINE NAME */}
          {step === 1 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Medicine Brand or Generic Name
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Paracetamol, Lisinopril, Pantoprazole..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-slate-500">
                Tip: Enter the name exactly as printed on your prescription label or pill box.
              </p>

              {/* Quick suggestions */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">
                  Common medicines:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Paracetamol', 'Pantoprazole', 'Thyroxine', 'Telmisartan', 'EcoSprin'].map(
                    (quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => setName(quick)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 font-medium transition-colors"
                      >
                        {quick}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STRENGTH & FORM */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Strength / Concentration
                </label>
                <div className="flex gap-2">
                  {['500 mg', '5 mg', '10 mg', '20 mg', '50 mg'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStrength(s)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        strength === s
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or enter custom strength (e.g. 25 mcg)"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  className="w-full mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Medicine Form
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'TABLET', label: 'Tablet 💊' },
                      { id: 'CAPSULE', label: 'Capsule 💊' },
                      { id: 'LIQUID_ML', label: 'Syrup / Liquid 🧴' },
                      { id: 'INHALER', label: 'Inhaler 💨' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setForm(item.id)}
                      className={`p-3 rounded-xl border text-sm font-bold text-left transition-all ${
                        form === item.id
                          ? 'border-teal-600 bg-teal-50 text-teal-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: HOW OFTEN (FREQUENCY) */}
          {step === 3 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Frequency
              </label>
              {(
                [
                  { id: 'ONCE_DAILY', label: 'Once daily', sub: '1 dose per day', defaultTimes: ['08:00 AM'] },
                  { id: 'TWICE_DAILY', label: 'Twice daily', sub: 'Morning and Evening', defaultTimes: ['08:00 AM', '08:00 PM'] },
                  { id: 'THRICE_DAILY', label: 'Three times daily', sub: 'Morning, Afternoon, Evening', defaultTimes: ['08:00 AM', '01:00 PM', '08:00 PM'] },
                  { id: 'WEEKLY', label: 'Once a week', sub: 'e.g. Every Sunday', defaultTimes: ['09:00 AM'] },
                  { id: 'AS_NEEDED', label: 'As needed (SOS / PRN)', sub: 'When symptoms arise', defaultTimes: ['As needed'] },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setFrequency(opt.id);
                    setTimes([...opt.defaultTimes]);
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    frequency === opt.id
                      ? 'border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-bold text-sm">{opt.label}</p>
                    <p className="text-xs text-slate-500">{opt.sub}</p>
                  </div>
                  {frequency === opt.id && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
                </button>
              ))}
            </div>
          )}

          {/* STEP 4: SCHEDULE & FOOD INSTRUCTION */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Scheduled Dose Times
                </label>
                <div className="space-y-2">
                  {times.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <input
                        type="text"
                        value={t}
                        onChange={(e) => {
                          const updated = [...times];
                          updated[idx] = e.target.value;
                          setTimes(updated);
                        }}
                        className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Meal Relation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'AFTER_MEAL', label: 'After meal 🍽️' },
                    { id: 'BEFORE_MEAL', label: 'Before meal 🥣' },
                    { id: 'WITH_MEAL', label: 'With meal 🥗' },
                    { id: 'NO_RESTRICTION', label: 'Any time 💧' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFoodInstruction(f.id as FoodInstruction)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        foodInstruction === f.id
                          ? 'border-teal-600 bg-teal-50 text-teal-900'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: CURRENT STOCK */}
          {step === 5 && (
            <div className="space-y-3 text-center">
              <Package className="w-12 h-12 text-teal-600 mx-auto" />
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                How many tablets/capsules do you currently have?
              </label>
              <div className="flex items-center justify-center gap-4 py-2">
                <button
                  type="button"
                  onClick={() => setStock(Math.max(1, stock - 5))}
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-lg"
                >
                  -5
                </button>
                <span className="text-4xl font-black text-slate-900 w-24 text-center">
                  {stock}
                </span>
                <button
                  type="button"
                  onClick={() => setStock(stock + 5)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-lg"
                >
                  +5
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Approximately {Math.round(stock / (times.length || 1))} days of supply remaining.
              </p>
            </div>
          )}

          {/* STEP 6: REORDER THRESHOLD */}
          {step === 6 && (
            <div className="space-y-3 text-center">
              <Bell className="w-12 h-12 text-amber-500 mx-auto" />
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Alert me to refill when stock falls to:
              </label>
              <div className="flex items-center justify-center gap-4 py-2">
                <button
                  type="button"
                  onClick={() => setReorderThreshold(Math.max(1, reorderThreshold - 1))}
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-lg"
                >
                  -1
                </button>
                <span className="text-4xl font-black text-amber-600 w-24 text-center">
                  {reorderThreshold}
                </span>
                <button
                  type="button"
                  onClick={() => setReorderThreshold(reorderThreshold + 1)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-lg"
                >
                  +1
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Gives you a calm ~{reorderThreshold} day warning to reorder from your local pharmacy.
              </p>
            </div>
          )}

          {/* STEP 7: REVIEW & CONFIRM */}
          {step === 7 && (
            <div className="space-y-3 bg-teal-50/60 p-4 rounded-2xl border border-teal-200">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Confirm Prescription Schedule</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <p>
                  <strong>Medicine:</strong> {name || 'New Medicine'} ({strength})
                </p>
                <p>
                  <strong>Form:</strong> {form}
                </p>
                <p>
                  <strong>Schedule:</strong> {times.join(', ')} ({foodInstruction.replace('_', ' ')})
                </p>
                <p>
                  <strong>Initial Stock:</strong> {stock} units (Alert threshold: {reorderThreshold})
                </p>
              </div>

              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Doctor's notes or specific advice (optional)..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-teal-200 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 7 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 && !name.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>CONFIRM & ACTIVATE</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
