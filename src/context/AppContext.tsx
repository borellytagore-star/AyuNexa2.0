import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserRole,
  Medicine,
  DoseEvent,
  StockEvent,
  AlertItem,
  RefillOrder,
  Pharmacy,
  User,
  CarePlan,
  CarePlanItem,
  CarePlanChange,
  AuditRecord,
  TimelineEvent,
  BiometricSecuritySettings,
  SyncLogEntry,
  CloudBackupInfo,
} from '../types';
import {
  initialPatient,
  initialCaregiver,
  initialDoctor,
  initialMedicines,
  initialDosesToday,
  initialStockEvents,
  initialAlerts,
  initialRefillOrders,
  initialCarePlans,
  initialAuditLogs,
  initialTimeline,
  SupportedLanguage,
  translations,
} from '../data/initialData';
import { syncManager } from '../services/syncManager';
import { exportMedicationsToCSV, ExportResult } from '../utils/exportMedications';

interface AppContextType {
  // Roles & View Modes
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAssistedMode: boolean;
  setIsAssistedMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean | ((prev: boolean) => boolean)) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: typeof translations['en'];

  // Network & Sync State
  isOnline: boolean;
  toggleOnline: () => void;
  syncPendingCount: number;
  triggerManualSync: () => void;
  lastSyncTime: string;
  isSyncModalOpen: boolean;
  setIsSyncModalOpen: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Biometric Security & Hardware Keystore (PRD §44 & §45)
  biometricSettings: BiometricSecuritySettings;
  setBiometricSettings: React.Dispatch<React.SetStateAction<BiometricSecuritySettings>>;
  isBiometricModalOpen: boolean;
  setIsBiometricModalOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  exportMedicationsCSV: () => ExportResult;

  // Emergency SOS
  isEmergencyActive: boolean;
  triggerSOS: () => void;
  dismissSOS: () => void;

  // Patient, Caregiver & Doctor Data
  patient: User;
  caregiver: User;
  doctor: User;
  medicines: Medicine[];
  dosesToday: DoseEvent[];
  stockEvents: StockEvent[];
  alerts: AlertItem[];
  refillOrders: RefillOrder[];

  // Care Plan Management (PRD §19 & §22)
  carePlans: CarePlan[];
  activeCarePlan: CarePlan | null;
  pendingCarePlan: CarePlan | null;
  createCarePlanDraft: (draft: {
    primaryDiagnosis: string;
    items: CarePlanItem[];
    clinicalNotes: string;
    changes: CarePlanChange[];
  }) => CarePlan;
  authorizeCarePlan: (planId: string, doctorSignature: string) => void;
  acknowledgeCarePlan: (planId: string) => void;
  rejectCarePlan: (planId: string, reason: string) => void;

  // Audit Logs & Timeline (PRD §49 & §22)
  auditLogs: AuditRecord[];
  timelineEvents: TimelineEvent[];
  logAuditEvent: (record: Omit<AuditRecord, 'id' | 'timestamp'>) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'date' | 'time'>) => void;

  // Safety Controller Modal (PRD §14 & §15)
  isSafetyModalOpen: boolean;
  setIsSafetyModalOpen: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Actions
  takeDose: (doseId: string) => void;
  snoozeDose: (doseId: string, minutes?: number) => void;
  cantTakeDose: (doseId: string, reason?: string) => void;
  addMedicine: (newMed: Omit<Medicine, 'id' | 'patientId' | 'isActive'>) => void;
  orderRefill: (medicineId: string, pharmacy: Pharmacy, quantity: number) => void;
  deliverRefill: (orderId: string) => void;
  dismissAlert: (alertId: string) => void;
  speakText: (text: string) => void;
  audioFeedback: (type: 'success' | 'alert' | 'emergency') => void;
  updateCaregiverPhone: (newPhone: string) => void;
  adjustMedicineStock: (
    medicineId: string,
    quantityChange: number,
    reason: StockEvent['reason'],
    notes?: string
  ) => void;

  // Telemetry
  batteryLevel: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('PATIENT');
  const [isAssistedMode, setIsAssistedMode] = useState<boolean>(true); // Default to Assisted Mode for high accessibility
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  // Network state
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [syncPendingCount, setSyncPendingCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Biometric Security & Hardware Authentication (PRD §44)
  const [biometricSettings, setBiometricSettings] = useState<BiometricSecuritySettings>(() => {
    const saved = localStorage.getItem('ayunexa_biometric_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      isEnabled: true,
      allowFingerprint: true,
      allowFaceId: true,
      requireOnExportMedications: true,
      requireOnEmergencyProfile: true,
      requireOnCaregiverPermissions: true,
      requireOnAppResume: false,
    };
  });
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState<boolean>(false);

  // Emergency SOS state
  const [isEmergencyActive, setIsEmergencyActive] = useState<boolean>(false);

  // Safety Governance Modal
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);

  // Users & Data
  const [patient, setPatient] = useState<User>(() => {
    const saved = localStorage.getItem('medicare_patient');
    if (saved && !saved.includes('Priya Kumar')) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return initialPatient;
  });
  const [caregiver, setCaregiver] = useState<User>(() => {
    const saved = localStorage.getItem('medicare_caregiver');
    if (saved && !saved.includes('Priya Kumar')) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return initialCaregiver;
  });
  const [doctor] = useState<User>(initialDoctor);

  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem('medicare_medicines');
    return saved ? JSON.parse(saved) : initialMedicines;
  });
  const [dosesToday, setDosesToday] = useState<DoseEvent[]>(() => {
    const saved = localStorage.getItem('medicare_doses');
    return saved ? JSON.parse(saved) : initialDosesToday;
  });
  const [stockEvents, setStockEvents] = useState<StockEvent[]>(() => {
    const saved = localStorage.getItem('medicare_stock_events');
    return saved ? JSON.parse(saved) : initialStockEvents;
  });
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const saved = localStorage.getItem('medicare_alerts');
    return saved ? JSON.parse(saved) : initialAlerts;
  });
  const [refillOrders, setRefillOrders] = useState<RefillOrder[]>(() => {
    const saved = localStorage.getItem('medicare_refills');
    return saved ? JSON.parse(saved) : initialRefillOrders;
  });
  const [carePlans, setCarePlans] = useState<CarePlan[]>(() => {
    const saved = localStorage.getItem('medicare_care_plans');
    return saved ? JSON.parse(saved) : initialCarePlans;
  });
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() => {
    const saved = localStorage.getItem('medicare_audit_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(() => {
    const saved = localStorage.getItem('medicare_timeline');
    return saved ? JSON.parse(saved) : initialTimeline;
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const batteryLevel = 72;

  // Active & Pending Care Plans
  const activeCarePlan = useMemo(() => {
    return carePlans.find((cp) => cp.status === 'ACTIVE') || null;
  }, [carePlans]);

  const pendingCarePlan = useMemo(() => {
    return carePlans.find((cp) => cp.status === 'PENDING_ACKNOWLEDGEMENT') || null;
  }, [carePlans]);

  // Persist local store
  useEffect(() => {
    localStorage.setItem('medicare_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('medicare_doses', JSON.stringify(dosesToday));
  }, [dosesToday]);

  useEffect(() => {
    localStorage.setItem('medicare_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('medicare_refills', JSON.stringify(refillOrders));
  }, [refillOrders]);

  useEffect(() => {
    localStorage.setItem('medicare_care_plans', JSON.stringify(carePlans));
  }, [carePlans]);

  useEffect(() => {
    localStorage.setItem('medicare_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('medicare_timeline', JSON.stringify(timelineEvents));
  }, [timelineEvents]);

  useEffect(() => {
    localStorage.setItem('medicare_patient', JSON.stringify(patient));
  }, [patient]);

  useEffect(() => {
    localStorage.setItem('medicare_caregiver', JSON.stringify(caregiver));
  }, [caregiver]);

  useEffect(() => {
    localStorage.setItem('medicare_stock_events', JSON.stringify(stockEvents));
  }, [stockEvents]);

  useEffect(() => {
    localStorage.setItem('ayunexa_biometric_settings', JSON.stringify(biometricSettings));
  }, [biometricSettings]);

  // Logging helpers
  const logAuditEvent = (record: Omit<AuditRecord, 'id' | 'timestamp'>) => {
    const newRecord: AuditRecord = {
      ...record,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
    };
    setAuditLogs((prev) => [newRecord, ...prev]);
  };

  const addTimelineEvent = (event: Omit<TimelineEvent, 'id' | 'date' | 'time'>) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `tl-${Date.now()}`,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTimelineEvents((prev) => [newEvent, ...prev]);
  };

  // Audio synthesizer chime for accessibility feedback
  const audioFeedback = (type: 'success' | 'alert' | 'emergency') => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (type === 'success') {
        // Pleasant rising chime: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
        });
      } else if (type === 'alert') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'emergency') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Network connectivity change detection with automatic SQLite Room Cloud Backup Sync
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      speakText('Internet connection restored. Synchronizing local Room database with cloud backup.');
      const entry = await syncManager.handleConnectivityRestored(undefined, {
        medicinesCount: medicines.length,
        dosesCount: dosesToday.length,
        stockEventsCount: stockEvents.length,
        auditLogsCount: auditLogs.length,
        carePlansCount: carePlans.length,
      });
      if (entry) {
        setSyncPendingCount(0);
        setLastSyncTime('Just now');
        audioFeedback('success');
        setDosesToday((prev) => prev.map((d) => (d.syncState === 'QUEUED' ? { ...d, syncState: 'SYNCED' } : d)));
        setStockEvents((prev) => prev.map((s) => (s.syncState === 'QUEUED' ? { ...s, syncState: 'SYNCED' } : s)));
        logAuditEvent({
          actorId: patient.id,
          actorName: patient.name,
          actorRole: 'PATIENT',
          action: 'SYNC_COMPLETED',
          resourceType: 'SYSTEM_SYNC',
          resourceId: entry.id,
          evidenceSource: 'DEVICE_VERIFIED',
          deviceId: 'sqlite-room-sync-manager',
          result: 'SUCCESS',
          notes: `Automatic cloud backup sync on reconnect. Checksum: ${entry.snapshotChecksum}.`,
        });
        addTimelineEvent({
          title: 'Cloud Backup Synchronized',
          description: `Automatic cloud backup completed. Local SQLite Room records synchronized (${entry.durationMs}ms).`,
          category: 'MEDICATION',
          source: 'DEVICE_VERIFIED',
          actor: 'System Sync Manager',
          statusBadge: 'Synced',
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      speakText('Network connection lost. AyuNexa is operating in offline-first mode with local Room database.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [medicines.length, dosesToday.length, stockEvents.length, auditLogs.length, carePlans.length, patient.id, patient.name]);

  const toggleOnline = async () => {
    if (!isOnline) {
      // Transitioning to ONLINE
      setIsOnline(true);
      speakText('Simulated network connection restored.');
      const entry = await syncManager.handleConnectivityRestored(undefined, {
        medicinesCount: medicines.length,
        dosesCount: dosesToday.length,
        stockEventsCount: stockEvents.length,
        auditLogsCount: auditLogs.length,
        carePlansCount: carePlans.length,
      });
      if (entry) {
        setSyncPendingCount(0);
        setLastSyncTime('Just now');
        audioFeedback('success');
        setDosesToday((prev) => prev.map((d) => (d.syncState === 'QUEUED' ? { ...d, syncState: 'SYNCED' } : d)));
        setStockEvents((prev) => prev.map((s) => (s.syncState === 'QUEUED' ? { ...s, syncState: 'SYNCED' } : s)));
        logAuditEvent({
          actorId: patient.id,
          actorName: patient.name,
          actorRole: 'PATIENT',
          action: 'SYNC_COMPLETED',
          resourceType: 'SYSTEM_SYNC',
          resourceId: entry.id,
          evidenceSource: 'DEVICE_VERIFIED',
          deviceId: 'sqlite-room-sync-manager',
          result: 'SUCCESS',
          notes: `Connectivity restored sync. Checksum: ${entry.snapshotChecksum}.`,
        });
        addTimelineEvent({
          title: 'Cloud Backup Synchronized',
          description: `Local SQLite Room database synced with cloud backup (${entry.durationMs}ms).`,
          category: 'MEDICATION',
          source: 'DEVICE_VERIFIED',
          actor: 'System Sync Manager',
          statusBadge: 'Synced',
        });
      }
    } else {
      // Transitioning to OFFLINE
      setIsOnline(false);
      speakText('Offline simulation enabled. All actions will be safely queued in local Room database.');
    }
  };

  const triggerManualSync = async () => {
    if (!isOnline) {
      speakText('Device is currently offline. Actions will sync automatically upon reconnection.');
      return;
    }
    const entry = await syncManager.executeSync('MANUAL_TRIGGER', {
      medicinesCount: medicines.length,
      dosesCount: dosesToday.length,
      stockEventsCount: stockEvents.length,
      auditLogsCount: auditLogs.length,
      carePlansCount: carePlans.length,
    });
    setSyncPendingCount(0);
    setLastSyncTime('Just now');
    audioFeedback('success');
    setDosesToday((prev) => prev.map((d) => (d.syncState === 'QUEUED' ? { ...d, syncState: 'SYNCED' } : d)));
    setStockEvents((prev) => prev.map((s) => (s.syncState === 'QUEUED' ? { ...s, syncState: 'SYNCED' } : s)));
    logAuditEvent({
      actorId: patient.id,
      actorName: patient.name,
      actorRole: 'PATIENT',
      action: 'SYNC_COMPLETED',
      resourceType: 'SYSTEM_SYNC',
      resourceId: entry.id,
      evidenceSource: 'DEVICE_VERIFIED',
      deviceId: 'sqlite-room-sync-manager',
      result: 'SUCCESS',
      notes: `Manual sync completed. Checksum: ${entry.snapshotChecksum}.`,
    });
  };

  const exportMedicationsCSV = (): ExportResult => {
    const result = exportMedicationsToCSV(medicines, patient, doctor, dosesToday);
    audioFeedback('success');
    speakText('Medication list exported as CSV for your doctor visit.');

    logAuditEvent({
      actorId: patient.id,
      actorName: patient.name,
      actorRole: 'PATIENT',
      action: 'MEDICATION_LIST_EXPORTED',
      resourceType: 'MEDICINE',
      resourceId: `export-${Date.now()}`,
      evidenceSource: 'PATIENT_REPORTED',
      deviceId: 'local-room-db',
      result: 'SUCCESS',
      notes: `Exported ${result.rowCount} medication records to ${result.filename} (${result.fileSizeBytes} bytes).`,
    });

    addTimelineEvent({
      title: 'Medication CSV Exported',
      description: `Exported ${result.rowCount} prescription records for clinical consultation with Dr. Rao.`,
      category: 'MEDICATION',
      source: 'PATIENT_REPORTED',
      actor: `${patient.name} (Patient)`,
      statusBadge: 'Exported',
    });

    return result;
  };

  const triggerSOS = () => {
    setIsEmergencyActive(true);
    audioFeedback('emergency');
    speakText('Emergency activated. Alerting Tagore, Dr. Rao, and emergency contacts.');

    // Add high-priority alert for caregiver & doctor
    const newEmergencyAlert: AlertItem = {
      id: `alt-sos-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      severity: 'CRITICAL',
      title: '🚨 SOS Emergency Activated!',
      description: 'Ravi activated emergency assistance. Shared live coordinates & medical ID.',
      timestamp: 'Just now',
      isRead: false,
      actionRequired: 'CALL_PATIENT',
    };
    setAlerts((prev) => [newEmergencyAlert, ...prev]);

    logAuditEvent({
      actorId: patient.id,
      actorName: patient.name,
      actorRole: 'PATIENT',
      action: 'EMERGENCY_SOS_TRIGGERED',
      resourceType: 'EMERGENCY',
      resourceId: `sos-${Date.now()}`,
      previousState: 'INACTIVE',
      newState: 'ACTIVE',
      evidenceSource: 'PATIENT_REPORTED',
      deviceId: 'patient-mobile-local',
      result: 'SUCCESS',
      notes: 'Patient activated global emergency SOS trigger.',
    });

    addTimelineEvent({
      title: '🚨 Emergency SOS Triggered',
      description: 'Emergency broadcast dispatched to Dr. Rao and Tagore.',
      category: 'EMERGENCY',
      source: 'PATIENT_REPORTED',
      actor: 'Ravi Kumar (Patient)',
      statusBadge: 'Critical',
    });
  };

  const dismissSOS = () => {
    setIsEmergencyActive(false);
    logAuditEvent({
      actorId: role === 'PATIENT' ? patient.id : role === 'CAREGIVER' ? caregiver.id : doctor.id,
      actorName: role === 'PATIENT' ? patient.name : role === 'CAREGIVER' ? caregiver.name : doctor.name,
      actorRole: role,
      action: 'EMERGENCY_SOS_DISMISSED',
      resourceType: 'EMERGENCY',
      resourceId: `sos-${Date.now()}`,
      previousState: 'ACTIVE',
      newState: 'DISMISSED',
      evidenceSource: 'PATIENT_REPORTED',
      deviceId: 'client-app',
      result: 'SUCCESS',
      notes: 'Emergency resolved and acknowledged.',
    });
  };

  // Action: Take dose
  // Master PRD §17 & §64:
  // "Duplicate dose events must not cause duplicate stock deductions."
  // "TAKEN: stock decreases once. SKIPPED: stock does not decrease. NO_RESPONSE: stock does not decrease."
  const takeDose = (doseId: string) => {
    const targetDose = dosesToday.find((d) => d.id === doseId);
    if (!targetDose) return;

    // CRITICAL SAFETY CHECK: If already TAKEN, reject duplicate deduction!
    if (targetDose.status === 'TAKEN') {
      speakText('This dose has already been confirmed as taken.');
      return;
    }

    audioFeedback('success');
    speakText(`${targetDose.medicineName} confirmed as taken.`);
    const actionTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Update Dose Status
    setDosesToday((prev) =>
      prev.map((d) =>
        d.id === doseId
          ? {
              ...d,
              status: 'TAKEN',
              actionTime: actionTimeStr,
              verificationType: 'MANUAL_TAP',
              syncState: isOnline ? 'SYNCED' : 'QUEUED',
            }
          : d
      )
    );

    // 2. Decrement Stock (exact once!)
    setMedicines((prev) =>
      prev.map((med) => {
        if (med.id === targetDose.medicineId) {
          const newQty = Math.max(0, med.currentStock - targetDose.doseQuantity);
          return {
            ...med,
            currentStock: newQty,
            lastTakenTime: 'Just now',
          };
        }
        return med;
      })
    );

    // 3. Record Stock Event
    const stockEvent: StockEvent = {
      id: `se-${Date.now()}`,
      medicineId: targetDose.medicineId,
      medicineName: targetDose.medicineName,
      quantityChange: -targetDose.doseQuantity,
      resultingStock: Math.max(
        0,
        (medicines.find((m) => m.id === targetDose.medicineId)?.currentStock || 1) - targetDose.doseQuantity
      ),
      reason: 'DOSE_CONSUMED',
      timestamp: Date.now(),
      syncState: isOnline ? 'SYNCED' : 'QUEUED',
    };
    setStockEvents((prev) => [stockEvent, ...prev]);

    // 4. If offline, track queue
    if (!isOnline) {
      setSyncPendingCount((prev) => prev + 1);
    }

    // 5. Remove any unconfirmed alert for this dose
    setAlerts((prev) =>
      prev.filter(
        (a) =>
          !(a.severity === 'ATTENTION' && a.medicineId === targetDose.medicineId && a.title.includes('Not Confirmed'))
      )
    );

    // 6. Immutable Audit Log
    logAuditEvent({
      actorId: patient.id,
      actorName: patient.name,
      actorRole: 'PATIENT',
      action: 'DOSE_TAKEN',
      resourceType: 'DOSE_EVENT',
      resourceId: doseId,
      previousState: targetDose.status,
      newState: 'TAKEN',
      evidenceSource: 'PATIENT_REPORTED',
      deviceId: 'local-room-db',
      result: 'SUCCESS',
      notes: `${targetDose.medicineName} confirmed taken. Stock deducted: ${targetDose.doseQuantity}.`,
    });

    // 7. Timeline Event
    addTimelineEvent({
      title: `${targetDose.medicineName} Taken`,
      description: `Scheduled for ${targetDose.scheduledTime}, confirmed at ${actionTimeStr}.`,
      category: 'MEDICATION',
      source: 'PATIENT_REPORTED',
      actor: 'Ravi Kumar (Patient)',
      statusBadge: 'Confirmed',
    });
  };

  const snoozeDose = (doseId: string, minutes: number = 15) => {
    const targetDose = dosesToday.find((d) => d.id === doseId);
    if (!targetDose) return;

    audioFeedback('alert');
    speakText(`Reminder snoozed for ${minutes} minutes.`);
    setDosesToday((prev) =>
      prev.map((d) =>
        d.id === doseId
          ? {
              ...d,
              status: 'SNOOZED',
              snoozeUntil: `${minutes}m`,
            }
          : d
      )
    );

    logAuditEvent({
      actorId: patient.id,
      actorName: patient.name,
      actorRole: 'PATIENT',
      action: 'DOSE_SNOOZED',
      resourceType: 'DOSE_EVENT',
      resourceId: doseId,
      previousState: targetDose.status,
      newState: 'SNOOZED',
      evidenceSource: 'PATIENT_REPORTED',
      deviceId: 'local-room-db',
      result: 'SUCCESS',
      notes: `Snoozed for ${minutes} minutes. Stock unchanged.`,
    });
  };

  const cantTakeDose = (doseId: string, reason?: string) => {
    const targetDose = dosesToday.find((d) => d.id === doseId);
    if (!targetDose) return;

    setDosesToday((prev) =>
      prev.map((d) =>
        d.id === doseId
          ? {
              ...d,
              status: 'UNABLE_TO_TAKE',
            }
          : d
      )
    );

    // Alert Caregiver
    const cantTakeAlert: AlertItem = {
      id: `alt-cant-take-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      severity: 'ATTENTION',
      title: `Unable to take ${targetDose.medicineName}`,
      description: `Ravi marked this dose as unable to take${reason ? ` (${reason})` : ''}. Please check in.`,
      timestamp: 'Just now',
      isRead: false,
      actionRequired: 'CALL_PATIENT',
      medicineId: targetDose.medicineId,
    };
    setAlerts((prev) => [cantTakeAlert, ...prev]);

    logAuditEvent({
      actorId: patient.id,
      actorName: patient.name,
      actorRole: 'PATIENT',
      action: 'DOSE_SKIPPED',
      resourceType: 'DOSE_EVENT',
      resourceId: doseId,
      previousState: targetDose.status,
      newState: 'UNABLE_TO_TAKE',
      evidenceSource: 'PATIENT_REPORTED',
      deviceId: 'local-room-db',
      result: 'SUCCESS',
      notes: `Patient unable to take dose${reason ? `: ${reason}` : ''}. Stock unchanged.`,
    });

    addTimelineEvent({
      title: `Dose Skipped: ${targetDose.medicineName}`,
      description: `Marked unable to take (${reason || 'Patient reported symptom'}). Caregiver alerted.`,
      category: 'MEDICATION',
      source: 'PATIENT_REPORTED',
      actor: 'Ravi Kumar (Patient)',
      statusBadge: 'Unable To Take',
    });
  };

  // Care Plan Lifecycle Methods (PRD §19 & §22)
  const createCarePlanDraft = (draftData: {
    primaryDiagnosis: string;
    items: CarePlanItem[];
    clinicalNotes: string;
    changes: CarePlanChange[];
  }): CarePlan => {
    const nextVer = `v2.${carePlans.length}`;
    const newPlan: CarePlan = {
      id: `cp-${nextVer}-${Date.now()}`,
      version: nextVer,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      status: 'DRAFT',
      primaryDiagnosis: draftData.primaryDiagnosis,
      items: draftData.items,
      changesFromPrevious: draftData.changes,
      clinicalNotes: draftData.clinicalNotes,
      createdAt: new Date().toISOString(),
      effectiveDate: new Date().toISOString().split('T')[0],
    };

    setCarePlans((prev) => [newPlan, ...prev]);

    logAuditEvent({
      actorId: doctor.id,
      actorName: doctor.name,
      actorRole: 'DOCTOR',
      action: 'CARE_PLAN_CREATED',
      resourceType: 'CARE_PLAN',
      resourceId: newPlan.id,
      newState: 'DRAFT',
      evidenceSource: 'DOCTOR_RECORDED',
      deviceId: 'doctor-portal-web',
      result: 'SUCCESS',
      notes: `Care Plan ${newPlan.version} drafted by ${doctor.name}.`,
    });

    return newPlan;
  };

  const authorizeCarePlan = (planId: string, doctorSignature: string) => {
    setCarePlans((prev) =>
      prev.map((cp) =>
        cp.id === planId
          ? {
              ...cp,
              status: 'PENDING_ACKNOWLEDGEMENT',
              authorizedAt: new Date().toISOString(),
              authorizedByDoctorSignature: doctorSignature,
            }
          : cp
      )
    );

    const targetPlan = carePlans.find((cp) => cp.id === planId);
    const planVer = targetPlan?.version || 'new';

    const carePlanAlert: AlertItem = {
      id: `alt-careplan-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      severity: 'ATTENTION',
      title: `Care Plan ${planVer} Authorized by Dr. Rao`,
      description: `Dr. Rao has updated your treatment regimen. Review and acknowledge to activate new reminders.`,
      timestamp: 'Just now',
      isRead: false,
      actionRequired: 'CONFIRM_STATUS',
    };
    setAlerts((prev) => [carePlanAlert, ...prev]);

    logAuditEvent({
      actorId: doctor.id,
      actorName: doctor.name,
      actorRole: 'DOCTOR',
      action: 'CARE_PLAN_AUTHORIZED',
      resourceType: 'CARE_PLAN',
      resourceId: planId,
      previousState: 'DRAFT',
      newState: 'PENDING_ACKNOWLEDGEMENT',
      evidenceSource: 'DOCTOR_RECORDED',
      deviceId: 'doctor-portal-secure-auth',
      result: 'SUCCESS',
      notes: `Authorized with signature: "${doctorSignature}". Awaiting patient acknowledgement.`,
    });

    addTimelineEvent({
      title: `Care Plan ${planVer} Authorized`,
      description: `Dr. Rao authorized treatment updates. Sent to Ravi & Tagore for acknowledgement.`,
      category: 'CARE_PLAN',
      source: 'DOCTOR_RECORDED',
      actor: doctor.name,
      statusBadge: 'Awaiting Acknowledgement',
    });

    audioFeedback('success');
    speakText(`Care Plan ${planVer} has been authorized. Sent to patient for acknowledgement.`);
  };

  const acknowledgeCarePlan = (planId: string) => {
    const targetPlan = carePlans.find((cp) => cp.id === planId);
    if (!targetPlan) return;

    // 1. Supercede old active plans, activate target plan
    setCarePlans((prev) =>
      prev.map((cp) => {
        if (cp.id === planId) {
          return {
            ...cp,
            status: 'ACTIVE',
            acknowledgedAt: new Date().toISOString(),
            acknowledgedByPatient: true,
          };
        }
        if (cp.status === 'ACTIVE') {
          return {
            ...cp,
            status: 'SUPERSEDED',
          };
        }
        return cp;
      })
    );

    // 2. Synchronize medications from the activated Care Plan
    setMedicines((prevMeds) => {
      const updatedMeds = [...prevMeds];
      targetPlan.items.forEach((item) => {
        const existingIndex = updatedMeds.findIndex(
          (m) =>
            m.id === item.medicineId ||
            m.name.toLowerCase().includes(item.medicineName.toLowerCase().split(' ')[0])
        );
        if (existingIndex >= 0) {
          const existing = updatedMeds[existingIndex];
          updatedMeds[existingIndex] = {
            ...existing,
            strength: item.dosage,
            foodInstruction: item.foodInstruction,
            instructions: item.instructions,
            schedules: item.timesOfDay.map((time, idx) => ({
              id: `sch-${existing.id}-${idx}`,
              medicineId: existing.id,
              timeOfDay: time,
              doseQuantity: 1,
              frequency: item.frequency as any,
              startDate: new Date().toISOString().split('T')[0],
              isActive: true,
            })),
          };
        }
      });
      return updatedMeds;
    });

    audioFeedback('success');
    speakText(`Care Plan ${targetPlan.version} is now active. Your reminders have been updated.`);

    // 3. Clear alert
    setAlerts((prev) => prev.filter((a) => !a.title.includes('Care Plan')));

    logAuditEvent({
      actorId: patient.id,
      actorName: patient.name,
      actorRole: 'PATIENT',
      action: 'CARE_PLAN_ACKNOWLEDGED',
      resourceType: 'CARE_PLAN',
      resourceId: planId,
      previousState: 'PENDING_ACKNOWLEDGEMENT',
      newState: 'ACTIVE',
      evidenceSource: 'PATIENT_REPORTED',
      deviceId: 'patient-mobile-local',
      result: 'SUCCESS',
      notes: `Patient acknowledged and activated Care Plan ${targetPlan.version}.`,
    });

    addTimelineEvent({
      title: `Care Plan ${targetPlan.version} Activated`,
      description: `Patient acknowledged new care plan. Local medication schedules updated immediately.`,
      category: 'CARE_PLAN',
      source: 'PATIENT_REPORTED',
      actor: 'Ravi Kumar (Patient)',
      statusBadge: 'Active Plan',
    });
  };

  const rejectCarePlan = (planId: string, reason: string) => {
    setCarePlans((prev) =>
      prev.map((cp) => (cp.id === planId ? { ...cp, status: 'REJECTED' } : cp))
    );

    logAuditEvent({
      actorId: patient.id,
      actorName: patient.name,
      actorRole: 'PATIENT',
      action: 'CARE_PLAN_CREATED',
      resourceType: 'CARE_PLAN',
      resourceId: planId,
      previousState: 'PENDING_ACKNOWLEDGEMENT',
      newState: 'REJECTED',
      evidenceSource: 'PATIENT_REPORTED',
      deviceId: 'patient-mobile-local',
      result: 'SUCCESS',
      notes: `Patient declined care plan changes: ${reason}`,
    });
  };

  const addMedicine = (newMedData: Omit<Medicine, 'id' | 'patientId' | 'isActive'>) => {
    const id = `med-${Date.now()}`;
    const newMedicine: Medicine = {
      ...newMedData,
      id,
      patientId: patient.id,
      isActive: true,
    };
    setMedicines((prev) => [...prev, newMedicine]);
    audioFeedback('success');
    speakText(`${newMedicine.name} added to schedule.`);

    // Add first scheduled dose for today if applicable
    if (newMedicine.schedules.length > 0) {
      const sch = newMedicine.schedules[0];
      const newDose: DoseEvent = {
        id: `dose-${Date.now()}`,
        medicineId: id,
        scheduleId: sch.id,
        medicineName: `${newMedicine.name} ${newMedicine.strength}`,
        doseQuantity: sch.doseQuantity,
        unit: newMedicine.unit === 'capsules' ? 'capsule' : 'tablet',
        scheduledTime: sch.timeOfDay,
        status: 'SCHEDULED',
        verificationType: 'NONE',
        syncState: isOnline ? 'SYNCED' : 'QUEUED',
        timestamp: Date.now(),
      };
      setDosesToday((prev) => [...prev, newDose]);
    }
  };

  const orderRefill = (medicineId: string, pharmacy: Pharmacy, quantity: number) => {
    const med = medicines.find((m) => m.id === medicineId);
    if (!med) return;

    const newOrder: RefillOrder = {
      id: `refill-${Date.now()}`,
      medicineId,
      medicineName: `${med.name} ${med.strength} (${quantity} ${med.unit})`,
      pharmacyName: pharmacy.name,
      quantity,
      price: pharmacy.priceFormatted,
      status: 'CONFIRMED',
      orderDate: 'Just now',
      estimatedDelivery: pharmacy.deliveryTime,
    };
    setRefillOrders((prev) => [newOrder, ...prev]);
    audioFeedback('success');
    speakText(`Refill order placed with ${pharmacy.name}.`);
  };

  const deliverRefill = (orderId: string) => {
    const order = refillOrders.find((o) => o.id === orderId);
    if (!order) return;

    // Update order status
    setRefillOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'DELIVERED', estimatedDelivery: 'Delivered' } : o))
    );

    // Restock medicine
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === order.medicineId) {
          return {
            ...m,
            currentStock: m.currentStock + order.quantity,
          };
        }
        return m;
      })
    );

    // Record Stock event
    const stockEvent: StockEvent = {
      id: `se-${Date.now()}`,
      medicineId: order.medicineId,
      medicineName: order.medicineName,
      quantityChange: order.quantity,
      resultingStock: (medicines.find((m) => m.id === order.medicineId)?.currentStock || 0) + order.quantity,
      reason: 'REFILL_RECEIVED',
      timestamp: Date.now(),
      syncState: isOnline ? 'SYNCED' : 'QUEUED',
      notes: `Delivered from ${order.pharmacyName}`,
    };
    setStockEvents((prev) => [stockEvent, ...prev]);

    // Clear low stock alert if any
    setAlerts((prev) =>
      prev.filter((a) => !(a.severity === 'ATTENTION' && a.medicineId === order.medicineId && a.title.includes('Refill')))
    );

    audioFeedback('success');
    speakText(`Medicine restocked with ${order.quantity} units.`);
  };

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)));
  };

  const updateCaregiverPhone = (newPhone: string) => {
    const trimmed = newPhone.trim();
    if (!trimmed) return;
    setCaregiver((prev) => ({ ...prev, phone: trimmed }));
    setPatient((prev) => ({ ...prev, emergencyContact: trimmed }));
    audioFeedback('success');
    speakText(`Caregiver Tagore's phone number updated to ${trimmed}.`);
  };

  const adjustMedicineStock = (
    medicineId: string,
    quantityChange: number,
    reason: StockEvent['reason'],
    notes?: string
  ) => {
    const med = medicines.find((m) => m.id === medicineId);
    if (!med) return;
    const newStock = Math.max(0, med.currentStock + quantityChange);
    setMedicines((prev) =>
      prev.map((m) => (m.id === medicineId ? { ...m, currentStock: newStock } : m))
    );
    const stockEvent: StockEvent = {
      id: `se-${Date.now()}`,
      medicineId,
      medicineName: med.name,
      quantityChange,
      resultingStock: newStock,
      reason,
      timestamp: Date.now(),
      syncState: isOnline ? 'SYNCED' : 'QUEUED',
      notes: notes || 'Manual inventory adjustment / stock count',
    };
    setStockEvents((prev) => [stockEvent, ...prev]);

    logAuditEvent({
      actorId: role === 'PATIENT' ? patient.id : caregiver.id,
      actorName: role === 'PATIENT' ? patient.name : caregiver.name,
      actorRole: role,
      action: 'PERMISSION_MODIFIED',
      resourceType: 'MEDICINE',
      resourceId: medicineId,
      previousState: `${med.currentStock} ${med.unit}`,
      newState: `${newStock} ${med.unit}`,
      evidenceSource: 'CAREGIVER_REPORTED',
      deviceId: 'local-tablet-inventory',
      result: 'SUCCESS',
      notes: `Stock count reconciled (${quantityChange > 0 ? '+' : ''}${quantityChange} ${med.unit}). ${notes || ''}`,
    });

    audioFeedback('success');
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        isAssistedMode,
        setIsAssistedMode,
        isDarkMode,
        setIsDarkMode,
        isMobileFrame,
        setIsMobileFrame,
        language,
        setLanguage,
        t,

        isOnline,
        toggleOnline,
        syncPendingCount,
        triggerManualSync,
        lastSyncTime,
        isSyncModalOpen,
        setIsSyncModalOpen,

        biometricSettings,
        setBiometricSettings,
        isBiometricModalOpen,
        setIsBiometricModalOpen,
        exportMedicationsCSV,

        isEmergencyActive,
        triggerSOS,
        dismissSOS,

        patient,
        caregiver,
        doctor,
        medicines,
        dosesToday,
        stockEvents,
        alerts,
        refillOrders,

        carePlans,
        activeCarePlan,
        pendingCarePlan,
        createCarePlanDraft,
        authorizeCarePlan,
        acknowledgeCarePlan,
        rejectCarePlan,

        auditLogs,
        timelineEvents,
        logAuditEvent,
        addTimelineEvent,

        isSafetyModalOpen,
        setIsSafetyModalOpen,

        activeTab,
        setActiveTab,

        takeDose,
        snoozeDose,
        cantTakeDose,
        addMedicine,
        orderRefill,
        deliverRefill,
        dismissAlert,
        speakText,
        audioFeedback,
        updateCaregiverPhone,
        adjustMedicineStock,

        batteryLevel,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
