import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { AyuNexaLogo } from './AyuNexaLogo';
import {
  UserCheck,
  HeartHandshake,
  Stethoscope,
  X,
  Fingerprint,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Official AyuNexa Login & Authentication Screen.
 * Renders the official AyuNexa logo above authentication,
 * displays "Connected Care. Smarter Health.",
 * and provides role selection: Patient, Caregiver, Clinical / Doctor.
 */
export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { role, setRole, speakText, audioFeedback, patient, caregiver, doctor } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>(role);
  const [useBiometrics, setUseBiometrics] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSelectRole = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setRole(newRole);
    audioFeedback('success');

    if (newRole === 'PATIENT') {
      speakText('Welcome back Ravi. Signed into Patient portal.');
    } else if (newRole === 'CAREGIVER') {
      speakText(`Welcome back ${caregiver.name}. Signed into Caregiver portal.`);
    } else {
      speakText('Welcome Dr. Rao. Signed into Clinical Doctor portal.');
    }

    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close login dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. OFFICIAL AYUNEXA LOGO & BRANDING */}
        <div className="pt-2">
          <AyuNexaLogo variant="full" showTagline={true} />
        </div>

        {/* 2. AUTHENTICATION & ROLE SELECTION FORM */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
            Select Your Portal Experience
          </p>

          {/* Role: PATIENT */}
          <button
            onClick={() => handleSelectRole('PATIENT')}
            className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
              selectedRole === 'PATIENT'
                ? 'border-[#701a75] bg-purple-50/70 shadow-sm'
                : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3.5 text-left">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedRole === 'PATIENT'
                    ? 'bg-[#701a75] text-white'
                    : 'bg-purple-100 text-purple-900'
                }`}
              >
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Patient Portal
                  </h4>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                    Primary
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {patient.name} • Daily medication schedule & reminders
                </p>
              </div>
            </div>
            {selectedRole === 'PATIENT' ? (
              <CheckCircle2 className="w-5 h-5 text-[#701a75] shrink-0" />
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {/* Role: CAREGIVER */}
          <button
            onClick={() => handleSelectRole('CAREGIVER')}
            className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
              selectedRole === 'CAREGIVER'
                ? 'border-[#be185d] bg-pink-50/70 shadow-sm'
                : 'border-slate-200 hover:border-pink-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3.5 text-left">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedRole === 'CAREGIVER'
                    ? 'bg-[#be185d] text-white'
                    : 'bg-pink-100 text-pink-900'
                }`}
              >
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Caregiver Portal
                  </h4>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-pink-100 text-pink-900">
                    Family
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {caregiver.name} (Son) • Adherence & refill coordination
                </p>
              </div>
            </div>
            {selectedRole === 'CAREGIVER' ? (
              <CheckCircle2 className="w-5 h-5 text-[#be185d] shrink-0" />
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {/* Role: CLINICAL / DOCTOR */}
          <button
            onClick={() => handleSelectRole('DOCTOR')}
            className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
              selectedRole === 'DOCTOR'
                ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3.5 text-left">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedRole === 'DOCTOR'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-indigo-100 text-indigo-900'
                }`}
              >
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Clinical / Doctor
                  </h4>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
                    Physician
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {doctor.name} • Treatment plans & prescription authorization
                </p>
              </div>
            </div>
            {selectedRole === 'DOCTOR' ? (
              <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {/* Role: ADMIN & OPERATIONS CONSOLE */}
          <button
            onClick={() => handleSelectRole('SUPER_ADMIN')}
            className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
              selectedRole === 'SUPER_ADMIN' || selectedRole === 'ADMIN'
                ? 'border-purple-800 bg-purple-50/70 shadow-sm'
                : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3.5 text-left">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedRole === 'SUPER_ADMIN' || selectedRole === 'ADMIN'
                    ? 'bg-gradient-to-br from-[#4a044e] to-[#701a75] text-white'
                    : 'bg-purple-100 text-purple-900'
                }`}
              >
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Operations & Admin
                  </h4>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                    Governance
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Kavita Menon • 16 operational capabilities & audit console
                </p>
              </div>
            </div>
            {selectedRole === 'SUPER_ADMIN' || selectedRole === 'ADMIN' ? (
              <CheckCircle2 className="w-5 h-5 text-purple-700 shrink-0" />
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>
        </div>

        {/* Biometric Quick Login & Security Footer */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-semibold text-purple-900">
              <Fingerprint className="w-4 h-4 text-pink-600" />
              Biometric Quick Unlock
            </span>
            <input
              type="checkbox"
              checked={useBiometrics}
              onChange={(e) => setUseBiometrics(e.target.checked)}
              className="w-4 h-4 accent-purple-800 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1 font-semibold text-slate-600">
              <Lock className="w-3 h-3 text-purple-700" />
              End-to-End Encrypted Session
            </span>
            <span>AyuNexa v2.4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
