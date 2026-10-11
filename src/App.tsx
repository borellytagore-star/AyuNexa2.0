import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { AuthProvider, SupabaseAuthGate } from './auth/SupabaseAuth';
import { Header } from './components/common/Header';
import { EmergencyModal } from './components/common/EmergencyModal';
import { OnboardingModal } from './components/common/OnboardingModal';
import { PatientHome } from './components/patient/PatientHome';
import { MedicineList } from './components/patient/MedicineList';
import { StockRunway } from './components/patient/StockRunway';
import { MediAssistant } from './components/patient/MediAssistant';
import { PatientReports } from './components/patient/PatientReports';
import { PatientSettings } from './components/patient/PatientSettings';
import { HealthCheckModal } from './components/patient/HealthCheckModal';
import { PharmacyRefillModal } from './components/patient/PharmacyRefillModal';
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';
import { DoctorPortal } from './components/doctor/DoctorPortal';
import { AdminLayout } from './components/admin/AdminLayout';
import { SafetyControllerModal } from './components/common/SafetyControllerModal';
import { SyncManagerModal } from './components/common/SyncManagerModal';
import {
  Home,
  Pill,
  Package,
  Sparkles,
  BarChart3,
  Settings,
  ShieldAlert,
  Activity,
  HeartHandshake,
  HelpCircle,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    role,
    setRole,
    isAssistedMode,
    isMobileFrame,
    isEmergencyActive,
    triggerSOS,
    activeTab,
    setActiveTab,
    t,
    isSyncModalOpen,
    setIsSyncModalOpen,
  } = useApp();

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('medicare_onboarding_completed');
  });

  const [activeRefillMedId, setActiveRefillMedId] = useState<string | null>(null);
  const [showHealthCheck, setShowHealthCheck] = useState<boolean>(false);

  // Check URL path on mount
  React.useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) {
      setRole('SUPER_ADMIN');
    }
  }, [setRole]);

  // Sync route
  React.useEffect(() => {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      if (!window.location.pathname.startsWith('/admin')) {
        window.history.pushState({}, '', '/admin');
      }
    } else {
      if (window.location.pathname.startsWith('/admin')) {
        window.history.pushState({}, '', '/');
      }
    }
  }, [role]);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('medicare_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  // If in Admin Console mode
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return <AdminLayout onBackToApp={() => setRole('PATIENT')} />;
  }

  return (
    <div className="min-h-screen bg-[#faf8fa] text-slate-900 flex flex-col font-sans transition-colors selection:bg-purple-900 selection:text-white">
      {/* Universal Top Header */}
      <Header />

      {/* Main Content Area — supports Phone Shell Preview or Full Layout */}
      <main className="flex-1 flex justify-center p-2 sm:p-4 md:p-6 overflow-x-hidden">
        <div
          className={`w-full transition-all duration-300 ${
            isMobileFrame
              ? 'max-w-md bg-white rounded-[40px] shadow-2xl border-8 border-slate-900 overflow-hidden flex flex-col my-auto min-h-[844px]'
              : 'max-w-4xl'
          }`}
        >
          {/* Status Bar simulation when in phone shell */}
          {isMobileFrame && (
            <div className="bg-slate-900 text-white px-6 py-2 flex items-center justify-between text-xs font-semibold select-none">
              <span>9:41</span>
              <div className="w-20 h-4 bg-black rounded-full mx-auto" />
              <span>5G 🔋 72%</span>
            </div>
          )}

          {/* Body Container */}
          <div className="flex-1 p-3 sm:p-6 pb-24 space-y-6">
            {role === 'PATIENT' ? (
              <>
                {activeTab === 'home' && (
                  <PatientHome
                    onOpenAssistant={() => setActiveTab('medi')}
                    onOpenStock={() => setActiveTab('stock')}
                    onOpenRefill={(medId) => setActiveRefillMedId(medId)}
                  />
                )}

                {activeTab === 'medicines' && (
                  <MedicineList onOpenRefill={(medId) => setActiveRefillMedId(medId)} />
                )}

                {activeTab === 'stock' && (
                  <StockRunway onOpenRefill={(medId) => setActiveRefillMedId(medId)} />
                )}

                {activeTab === 'medi' && <MediAssistant />}

                {activeTab === 'reports' && <PatientReports />}

                {activeTab === 'settings' && <PatientSettings />}
              </>
            ) : role === 'CAREGIVER' ? (
              /* Caregiver View */
              <CaregiverDashboard onOpenRefill={(medId) => setActiveRefillMedId(medId)} />
            ) : (
              /* Doctor Clinical View */
              <DoctorPortal />
            )}
          </div>

          {/* PATIENT BOTTOM NAVIGATION BAR (PRD §36) */}
          {role === 'PATIENT' && (
            <nav
              aria-label="Patient navigation"
              className={`fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 flex items-center justify-around shadow-lg transition-all ${
                isMobileFrame ? 'max-w-md mx-auto rounded-b-[32px]' : 'max-w-4xl mx-auto'
              }`}
            >
              {[
                { id: 'home', label: t.navHome, icon: Home },
                { id: 'medicines', label: t.navMedicines, icon: Pill },
                { id: 'stock', label: t.navStock, icon: Package },
                { id: 'medi', label: t.navAssistant, icon: Sparkles },
                { id: 'reports', label: t.navReports, icon: BarChart3 },
                { id: 'settings', label: t.navMore, icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
                      isActive
                        ? 'text-purple-950 font-extrabold bg-purple-50 scale-105'
                        : 'text-slate-500 hover:text-purple-900 font-medium'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    <span
                      className={`text-[11px] mt-0.5 whitespace-nowrap ${
                        isAssistedMode ? 'text-xs font-bold' : ''
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* CAREGIVER BOTTOM NAVIGATION BAR */}
          {role === 'CAREGIVER' && (
            <nav
              aria-label="Caregiver navigation"
              className={`fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-4 flex items-center justify-around shadow-lg ${
                isMobileFrame ? 'max-w-md mx-auto rounded-b-[32px]' : 'max-w-4xl mx-auto'
              }`}
            >
              <div className="flex items-center justify-between w-full max-w-sm mx-auto text-xs font-bold">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-indigo-600" />
                  <span>Caregiver Console</span>
                </span>
                <button
                  onClick={() => setShowHealthCheck(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Launch Camera Check</span>
                </button>
              </div>
            </nav>
          )}

          {/* DOCTOR BOTTOM NAVIGATION BAR */}
          {role === 'DOCTOR' && (
            <nav
              aria-label="Doctor navigation"
              className={`fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-4 flex items-center justify-around shadow-lg ${
                isMobileFrame ? 'max-w-md mx-auto rounded-b-[32px]' : 'max-w-4xl mx-auto'
              }`}
            >
              <div className="flex items-center justify-between w-full max-w-sm mx-auto text-xs font-bold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Dr. Rao • Clinical Care Management</span>
                </span>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  Authoritative MD Mode
                </span>
              </div>
            </nav>
          )}
        </div>
      </main>

      {/* FLOATING ACTION PILL: HEALTH CHECK & TUTORIAL */}
      {role === 'PATIENT' && (
        <div className="fixed bottom-20 right-4 z-20 flex flex-col gap-2 items-end">
          {/* Quick Camera Health Check trigger */}
          <button
            onClick={() => setShowHealthCheck(true)}
            title="Start short camera observation check"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-teal-900 border border-teal-200 shadow-md hover:bg-teal-50 text-xs font-bold transition-all cursor-pointer"
          >
            <Activity className="w-4 h-4 text-teal-600 animate-pulse" />
            <span className="hidden sm:inline">Health Check</span>
          </button>
        </div>
      )}

      {/* FULLSCREEN EMERGENCY SOS TAKEOVER (PRD §21, §53) */}
      <EmergencyModal />

      {/* HEALTHCARE SAFETY CONTROLLER MODAL (PRD §14, §15) */}
      <SafetyControllerModal />

      {/* SQLITE ROOM SYNCHRONIZATION MANAGER MODAL */}
      <SyncManagerModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

      {/* PHARMACY REFILL MODAL */}
      {activeRefillMedId && (
        <PharmacyRefillModal
          medicineId={activeRefillMedId}
          onClose={() => setActiveRefillMedId(null)}
        />
      )}

      {/* VIDEO HEALTH CHECK MODAL */}
      {showHealthCheck && (
        <HealthCheckModal onClose={() => setShowHealthCheck(false)} />
      )}

      {/* FIRST-TIME WELCOME ONBOARDING (PRD §56) */}
      {showOnboarding && (
        <OnboardingModal onComplete={handleCompleteOnboarding} />
      )}

      {/* RE-OPEN ONBOARDING BUTTON IN FOOTER */}
      <footer className="text-center py-4 text-xs text-slate-400">
        <button
          onClick={() => setShowOnboarding(true)}
          className="hover:text-slate-600 underline underline-offset-2 inline-flex items-center gap-1 font-semibold"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Product Tour & Tagline</span>
        </button>
        <span className="mx-2">•</span>
        <span>AyuNexa © 2026 — “Connected Care. Smarter Health.”</span>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SupabaseAuthGate>
        <MainAppContent />
      </SupabaseAuthGate>
    </AuthProvider>
  );
}
