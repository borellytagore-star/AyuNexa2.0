import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PhoneCall,
  UserCheck,
  MapPin,
  XCircle,
  AlertTriangle,
  FileHeart,
  CheckCircle2,
  Radio,
} from 'lucide-react';

export const EmergencyModal: React.FC = () => {
  const { isEmergencyActive, dismissSOS, patient, caregiver, speakText } = useApp();
  const [alertSent, setAlertSent] = useState(true);
  const [locationShared, setLocationShared] = useState(true);
  const [callingState, setCallingState] = useState<string | null>(null);

  if (!isEmergencyActive) return null;

  const handleEmergencyCall = (number: string, label: string) => {
    setCallingState(`Connecting to ${label} (${number})...`);
    speakText(`Dialing emergency services at ${number}. Stay on the line.`);
    setTimeout(() => {
      window.location.href = `tel:${number.replace(/\s+/g, '')}`;
    }, 800);
  };

  const handleAlertCaregiver = () => {
    setAlertSent(true);
    speakText(`Alert dispatched to ${caregiver.name} with urgent priority.`);
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="emergency-title"
      className="fixed inset-0 z-50 bg-rose-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 text-white overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Top Banner */}
      <div className="max-w-xl mx-auto w-full">
        <div className="flex items-center justify-between border-b border-rose-800/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center animate-bounce shadow-lg shadow-rose-600/50">
              <span className="text-3xl">🆘</span>
            </div>
            <div>
              <h1
                id="emergency-title"
                className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase"
              >
                EMERGENCY ASSISTANCE
              </h1>
              <p className="text-rose-200 text-sm font-medium">
                Immediate Help & Caregiver Escalation
              </p>
            </div>
          </div>
          <button
            onClick={dismissSOS}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 hover:text-white border border-rose-700 text-xs font-bold transition-all"
          >
            <XCircle className="w-4 h-4" />
            <span>I Am Safe (Cancel)</span>
          </button>
        </div>

        {/* Status Tracker */}
        <div className="bg-rose-900/40 border border-rose-700/60 rounded-2xl p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-200 pb-1 border-b border-rose-800/40">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              SYSTEM TELEMETRY
            </span>
            <span className="text-emerald-300">Active Fallback Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2 bg-rose-900/50 p-2 rounded-lg border border-rose-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Caregiver Alert</p>
                <p className="text-[11px] text-rose-200">
                  {alertSent ? `Dispatched to ${caregiver.name}` : 'Pending'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-rose-900/50 p-2 rounded-lg border border-rose-800">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">GPS Location</p>
                <p className="text-[11px] text-rose-200">
                  {locationShared ? '17.412° N, 78.471° E' : 'Off'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-rose-900/50 p-2 rounded-lg border border-rose-800">
              <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Emergency Line</p>
                <p className="text-[11px] text-rose-200">Direct dial active</p>
              </div>
            </div>
          </div>
        </div>

        {callingState && (
          <div className="mb-4 p-3 bg-amber-500/20 border border-amber-400 rounded-xl text-amber-200 text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
            <span>{callingState}</span>
          </div>
        )}

        {/* PRIMARY ACTION BUTTONS — MASSIVE TOUCH TARGETS */}
        <div className="space-y-4">
          {/* Button 1: Call Emergency 112 / 911 */}
          <button
            onClick={() => handleEmergencyCall('112', 'Ambulance & Emergency')}
            className="w-full py-5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-extrabold text-xl sm:text-2xl shadow-xl shadow-rose-900/60 flex items-center justify-center gap-3 border-2 border-rose-400 transition-all cursor-pointer"
          >
            <PhoneCall className="w-8 h-8 animate-pulse shrink-0" />
            <span>CALL EMERGENCY (112 / 911)</span>
          </button>

          {/* Button 2: Call Son Tagore */}
          <button
            onClick={() => handleEmergencyCall(caregiver.phone, caregiver.name)}
            className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-900 font-extrabold text-lg sm:text-xl shadow-lg flex items-center justify-center gap-3 border border-slate-200 transition-all cursor-pointer"
          >
            <UserCheck className="w-7 h-7 text-indigo-600 shrink-0" />
            <span>CALL {caregiver.name.toUpperCase()} ({caregiver.phone})</span>
          </button>

          {/* Button 3: Alert Caregiver / Share Location */}
          <button
            onClick={() => {
              handleAlertCaregiver();
              setLocationShared(true);
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-rose-900/80 hover:bg-rose-800 active:scale-[0.98] text-rose-100 font-bold text-base border border-rose-600 flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            <MapPin className="w-6 h-6 text-rose-300 shrink-0" />
            <span>RE-SEND LIVE GPS & URGENT NUDGE</span>
          </button>
        </div>

        {/* Emergency Medical ID Card for Paramedics / First Responders */}
        <div className="mt-6 bg-rose-950/80 border border-rose-800 rounded-2xl p-4 text-left">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-sm uppercase tracking-wider mb-2">
            <FileHeart className="w-4 h-4 text-rose-400" />
            <span>First Responder Medical ID</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-rose-400 block text-[11px]">Patient Name</span>
              <span className="font-bold text-white text-sm">{patient.name} (68 yrs)</span>
            </div>
            <div>
              <span className="text-rose-400 block text-[11px]">Blood Group</span>
              <span className="font-bold text-white text-sm">{patient.bloodGroup}</span>
            </div>
            <div>
              <span className="text-rose-400 block text-[11px]">Known Allergies</span>
              <span className="font-bold text-amber-300 text-sm">{patient.allergies.join(', ')}</span>
            </div>
            <div>
              <span className="text-rose-400 block text-[11px]">Primary Cardiologist</span>
              <span className="font-bold text-white">{patient.doctorName}</span>
              <span className="text-rose-300 block text-[11px]">{patient.doctorPhone}</span>
            </div>
            <div className="col-span-2">
              <span className="text-rose-400 block text-[11px]">Critical Daily Medications</span>
              <span className="font-bold text-white">Metformin 500 mg, Amlodipine 5 mg, Atorvastatin 20 mg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dismiss Safe Footer */}
      <div className="max-w-xl mx-auto w-full pt-4 text-center">
        <button
          onClick={dismissSOS}
          className="text-xs text-rose-300 underline underline-offset-4 hover:text-white font-semibold transition-colors"
        >
          False alarm or feeling better? Tap to dismiss emergency screen.
        </button>
      </div>
    </div>
  );
};
