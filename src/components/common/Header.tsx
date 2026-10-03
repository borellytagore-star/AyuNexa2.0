import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Eye,
  Smartphone,
  Maximize2,
  HeartHandshake,
  UserCheck,
  Stethoscope,
  ShieldAlert,
  ShieldCheck,
  BatteryCharging,
  Volume2,
  Database,
  LogIn,
} from 'lucide-react';
import { SupportedLanguage } from '../../data/initialData';
import { AyuNexaLogo } from './AyuNexaLogo';
import { LoginModal } from './LoginModal';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    isAssistedMode,
    setIsAssistedMode,
    isOnline,
    toggleOnline,
    syncPendingCount,
    triggerManualSync,
    isMobileFrame,
    setIsMobileFrame,
    language,
    setLanguage,
    t,
    triggerSOS,
    batteryLevel,
    speakText,
    setIsSafetyModalOpen,
    setIsSyncModalOpen,
  } = useApp();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-3 py-2 sm:px-6 sm:py-3 transition-colors shadow-xs">
      <div className="max-w-6xl mx-auto flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* Official Brand Logo */}
        <div className="flex items-center justify-between">
          <div
            onClick={() => setIsLoginModalOpen(true)}
            className="cursor-pointer group transition-opacity hover:opacity-95"
            title="Click to switch profile or view official AyuNexa branding"
          >
            {/* Desktop / Tablet view */}
            <div className="hidden sm:block">
              <AyuNexaLogo variant="horizontal" showTagline={true} />
            </div>
            {/* Mobile compact view */}
            <div className="sm:hidden">
              <AyuNexaLogo variant="horizontal" showTagline={false} />
            </div>
          </div>

          {/* Quick SOS in header for mobile */}
          <button
            onClick={triggerSOS}
            aria-label="Emergency SOS button"
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs tracking-wider shadow-sm active:scale-95 transition-all"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>SOS</span>
          </button>
        </div>

        {/* Global Controls & Persona Switchers */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Persona Switcher: Patient / Caregiver / Doctor */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button
              onClick={() => {
                setRole('PATIENT');
                speakText('Switched to Patient view for Ravi Kumar');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                role === 'PATIENT'
                  ? 'bg-gradient-to-r from-[#4a044e] to-[#701a75] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className={`w-3.5 h-3.5 ${role === 'PATIENT' ? 'text-pink-300' : 'text-purple-700'}`} />
              <span>Ravi (Patient)</span>
            </button>
            <button
              onClick={() => {
                setRole('CAREGIVER');
                speakText('Switched to Caregiver view for Tagore');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                role === 'CAREGIVER'
                  ? 'bg-gradient-to-r from-[#831843] to-[#be185d] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className={`w-3.5 h-3.5 ${role === 'CAREGIVER' ? 'text-pink-200' : 'text-pink-600'}`} />
              <span>Tagore (Caregiver)</span>
            </button>
            <button
              onClick={() => {
                setRole('DOCTOR');
                speakText('Switched to Clinical Doctor view for Dr. Rao');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                role === 'DOCTOR'
                  ? 'bg-gradient-to-r from-indigo-700 to-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className={`w-3.5 h-3.5 ${role === 'DOCTOR' ? 'text-blue-200' : 'text-indigo-600'}`} />
              <span>Dr. Rao (Clinical)</span>
            </button>
            <button
              onClick={() => {
                setRole('SUPER_ADMIN');
                speakText('Switched to AyuNexa Operations and Admin Console');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                role === 'ADMIN' || role === 'SUPER_ADMIN'
                  ? 'bg-gradient-to-r from-[#4a044e] to-[#701a75] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${role === 'ADMIN' || role === 'SUPER_ADMIN' ? 'text-amber-300' : 'text-purple-700'}`} />
              <span>Admin Console</span>
            </button>
          </div>

          {/* Quick Login / Switch Modal Button */}
          <button
            onClick={() => setIsLoginModalOpen(true)}
            title="Open AyuNexa Portal Authentication & Profile Picker"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-pink-600" />
            <span className="hidden lg:inline">Switch Portal</span>
          </button>

          {/* Safety Governance Rules Viewer Button */}
          <button
            onClick={() => setIsSafetyModalOpen(true)}
            title="Open Healthcare Safety Governance & Verification Matrix"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 font-semibold transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Safety Controller</span>
          </button>

          {/* Network / Offline Mode Simulation Switch */}
          <button
            onClick={toggleOnline}
            title={isOnline ? 'Simulate Loss of Internet' : 'Restore Internet Connection'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">{t.online}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-semibold">{t.offline}</span>
              </>
            )}
          </button>

          {/* SQLite Room Cloud Sync Trigger */}
          <button
            onClick={() => setIsSyncModalOpen(true)}
            title="Inspect SQLite Room Database Cloud Sync"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 font-semibold transition-all cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Room Sync</span>
          </button>

          {/* Pending Sync Queue Pill */}
          {syncPendingCount > 0 && (
            <button
              onClick={triggerManualSync}
              disabled={!isOnline}
              title={isOnline ? 'Click to sync now' : 'Sync will resume when online'}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold animate-pulse"
            >
              <RefreshCw className="w-3 h-3 text-amber-700" />
              <span>
                {syncPendingCount} {t.syncPending}
              </span>
            </button>
          )}

          {/* Assisted Mode Toggle (Senior / Accessibility mode) */}
          <button
            onClick={() => setIsAssistedMode((prev) => !prev)}
            title="Toggle Assisted Mode (Larger fonts, simplified cards, higher contrast for seniors)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
              isAssistedMode
                ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="font-semibold">
              {isAssistedMode ? t.assistedMode : t.standardMode}
            </span>
          </button>

          {/* Multilingual Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            aria-label="Select Language"
            className="bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="en">English</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="hi">हिंदी (Hindi)</option>
          </select>

          {/* Device Frame View Toggle */}
          <button
            onClick={() => setIsMobileFrame((prev) => !prev)}
            title="Toggle Mobile Screen Frame vs Full Screen"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
          >
            {isMobileFrame ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Preview</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone Shell</span>
              </>
            )}
          </button>

          {/* Battery Status Indicator */}
          <div
            className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200"
            title="Patient device telemetry"
          >
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
            <span>{batteryLevel}%</span>
          </div>

          {/* Voice Prompt trigger */}
          <button
            onClick={() => speakText('Welcome to AyuNexa. Ravi has 1 dose scheduled now.')}
            title="Read summary aloud"
            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-teal-700 hover:bg-teal-50"
            aria-label="Read status aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
