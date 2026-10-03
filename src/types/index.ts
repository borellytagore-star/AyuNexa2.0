export type UserRole = 'PATIENT' | 'CAREGIVER' | 'DOCTOR' | 'ADMIN' | 'SUPER_ADMIN';

export type SyncState = 'LOCAL' | 'QUEUED' | 'UPLOADING' | 'SYNCED' | 'FAILED';

export type MedicineForm = 'TABLET' | 'CAPSULE' | 'LIQUID_ML' | 'INJECTION' | 'INHALER' | 'DROPS' | 'OTHER';

export type FoodInstruction = 'BEFORE_MEAL' | 'AFTER_MEAL' | 'WITH_MEAL' | 'EMPTY_STOMACH' | 'NO_RESTRICTION';

export type ScheduleFrequency = 'ONCE_DAILY' | 'TWICE_DAILY' | 'THRICE_DAILY' | 'EVERY_N_HOURS' | 'SPECIFIC_DAYS' | 'WEEKLY' | 'AS_NEEDED';

export type DoseStatus = 'SCHEDULED' | 'REMINDER_SENT' | 'TAKEN' | 'SNOOZED' | 'SKIPPED' | 'UNABLE_TO_TAKE' | 'NO_RESPONSE';

export type AlertSeverity = 'CRITICAL' | 'ATTENTION' | 'INFO';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  age: number;
  emergencyContact: string;
  emergencyContactName: string;
  primaryCaregiverId?: string;
  allergies: string[];
  bloodGroup: string;
  doctorName: string;
  doctorPhone: string;
}

export interface MedicineSchedule {
  id: string;
  medicineId: string;
  timeOfDay: string; // "08:00", "20:00"
  doseQuantity: number;
  frequency: ScheduleFrequency;
  daysOfWeek?: string[]; // ['MON', 'WED', 'FRI'] or undefined for all
  intervalHours?: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface Medicine {
  id: string;
  patientId: string;
  name: string;
  genericName?: string;
  strength: string; // e.g. "500 mg", "5 mg"
  form: MedicineForm;
  colorHex: string;
  iconType: 'pill' | 'capsule' | 'drop' | 'liquid';
  currentStock: number;
  unit: string; // "tablets", "capsules", "ml"
  reorderThreshold: number; // e.g. 7 days or 7 units
  foodInstruction: FoodInstruction;
  instructions?: string;
  schedules: MedicineSchedule[];
  lastTakenTime?: string;
  isActive: boolean;
}

export interface DoseEvent {
  id: string;
  medicineId: string;
  scheduleId: string;
  medicineName: string;
  doseQuantity: number;
  unit: string;
  scheduledTime: string; // ISO or "08:00 AM"
  actionTime?: string;
  status: DoseStatus;
  snoozeUntil?: string;
  verificationType: 'MANUAL_TAP' | 'VOICE_CONFIRMATION' | 'CAREGIVER_CONFIRMATION' | 'NONE';
  syncState: SyncState;
  timestamp: number;
}

export interface StockEvent {
  id: string;
  medicineId: string;
  medicineName: string;
  quantityChange: number; // e.g. -1 for dose, +30 for refill
  resultingStock: number;
  reason: 'INITIAL_STOCK' | 'DOSE_CONSUMED' | 'REFILL_RECEIVED' | 'MANUAL_CORRECTION';
  timestamp: number;
  syncState: SyncState;
  notes?: string;
}

export interface AlertItem {
  id: string;
  patientId: string;
  patientName: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionRequired?: 'CALL_PATIENT' | 'REFILL_ORDER' | 'CONFIRM_STATUS' | 'NONE';
  medicineId?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  distanceKm: number;
  deliveryTime: string;
  rating: number;
  isOpen: boolean;
  priceFormatted: string;
  availableStock: boolean;
  phone: string;
  address: string;
}

export interface RefillOrder {
  id: string;
  medicineId: string;
  medicineName: string;
  pharmacyName: string;
  quantity: number;
  price: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  orderDate: string;
  estimatedDelivery: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'safety_controller';
  text: string;
  timestamp: string;
  safetyLevel?: 'LOW' | 'ATTENTION' | 'EMERGENCY';
  actionSuggestions?: {
    label: string;
    actionType: 'CONTACT_CAREGIVER' | 'CALL_SOS' | 'SCHEDULE_REFILL' | 'LOG_SYMPTOM' | 'QUICK_REPLY';
    payload?: string;
  }[];
}

export interface HealthObservation {
  id: string;
  timestamp: string;
  durationSeconds: number;
  observations: string[];
  confidence: number;
  recommendation: string;
  status: 'NORMAL' | 'ATTENTION_SUGGESTED';
  source?: EvidenceSource;
}

// Master PRD §16: Explicit Evidence Sources
export type EvidenceSource =
  | 'PATIENT_REPORTED'
  | 'CAREGIVER_REPORTED'
  | 'DOCTOR_RECORDED'
  | 'DEVICE_VERIFIED'
  | 'VIDEO_OBSERVED'
  | 'SYSTEM_GENERATED'
  | 'AI_GENERATED';

// Master PRD §19: Care Plan Versioning & Lifecycle
export type CarePlanStatus =
  | 'DRAFT'
  | 'PENDING_AUTHORIZATION'
  | 'AUTHORIZED'
  | 'PENDING_ACKNOWLEDGEMENT'
  | 'ACTIVE'
  | 'SUPERSEDED'
  | 'REJECTED';

export interface CarePlanItem {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  timesOfDay: string[];
  foodInstruction: FoodInstruction;
  instructions: string;
  clinicalIndication: string;
}

export interface CarePlanChange {
  type: 'MODIFY_DOSAGE' | 'ADD_MEDICINE' | 'DISCONTINUE_MEDICINE' | 'SCHEDULE_CHANGE';
  medicineName: string;
  previousValue: string;
  newValue: string;
  clinicalReason: string;
}

export interface CarePlan {
  id: string;
  version: string; // e.g. "v1.0", "v2.0", "v2.1"
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  status: CarePlanStatus;
  primaryDiagnosis: string;
  items: CarePlanItem[];
  changesFromPrevious?: CarePlanChange[];
  clinicalNotes: string;
  createdAt: string;
  authorizedAt?: string;
  authorizedByDoctorSignature?: string;
  acknowledgedAt?: string;
  acknowledgedByPatient?: boolean;
  effectiveDate: string;
}

// Master PRD §49: Audit Logging
export interface AuditRecord {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | 'SYSTEM' | 'SAFETY_CONTROLLER';
  action:
    | 'LOGIN'
    | 'DOSE_TAKEN'
    | 'DOSE_SNOOZED'
    | 'DOSE_SKIPPED'
    | 'CARE_PLAN_CREATED'
    | 'CARE_PLAN_AUTHORIZED'
    | 'CARE_PLAN_ACKNOWLEDGED'
    | 'CARE_PLAN_ACTIVATED'
    | 'MEDICINE_ADDED'
    | 'REFILL_ORDERED'
    | 'REFILL_DELIVERED'
    | 'EMERGENCY_SOS_TRIGGERED'
    | 'EMERGENCY_SOS_DISMISSED'
    | 'OBSERVATION_SUBMITTED'
    | 'PERMISSION_MODIFIED'
    | 'BIOMETRIC_AUTH_VERIFIED'
    | 'BIOMETRIC_AUTH_FAILED'
    | 'SYNC_COMPLETED'
    | 'MEDICATION_LIST_EXPORTED';
  resourceType: 'DOSE_EVENT' | 'CARE_PLAN' | 'MEDICINE' | 'REFILL_ORDER' | 'EMERGENCY' | 'OBSERVATION' | 'SYSTEM_SYNC' | 'SECURITY';
  resourceId: string;
  previousState?: string;
  newState?: string;
  evidenceSource: EvidenceSource;
  deviceId: string;
  result: 'SUCCESS' | 'BLOCKED_BY_SAFETY_POLICY' | 'FAILED';
  notes?: string;
}

// Master PRD §29: Notification Lifecycle
export type NotificationState =
  | 'CREATED'
  | 'QUEUED'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'ACKNOWLEDGED'
  | 'FAILED';

export interface NotificationItem {
  id: string;
  recipientId: string;
  recipientRole: UserRole;
  title: string;
  body: string;
  state: NotificationState;
  createdAt: string;
  deliveredAt?: string;
  acknowledgedAt?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';
  actionRoute?: string;
}

// Master PRD §22: Treatment Timeline Item
export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  category: 'MEDICATION' | 'CARE_PLAN' | 'OBSERVATION' | 'CLINICAL_VISIT' | 'EMERGENCY';
  source: EvidenceSource;
  actor: string;
  statusBadge?: string;
}

export interface BiometricSecuritySettings {
  isEnabled: boolean;
  allowFingerprint: boolean;
  allowFaceId: boolean;
  requireOnExportMedications: boolean;
  requireOnEmergencyProfile: boolean;
  requireOnCaregiverPermissions: boolean;
  requireOnAppResume: boolean;
  lastVerifiedTimestamp?: number;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  trigger: 'CONNECTIVITY_RESTORED' | 'MANUAL_TRIGGER' | 'SCHEDULED_INTERVAL';
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  entitiesCount: {
    medicines: number;
    doses: number;
    stockEvents: number;
    auditLogs: number;
    carePlans: number;
  };
  snapshotChecksum: string;
  durationMs: number;
  message: string;
}

export interface CloudBackupInfo {
  version: string;
  lastBackupTime: string;
  status: 'SYNCED' | 'PENDING' | 'SYNCING' | 'OFFLINE';
  pendingQueueLength: number;
  serverEndpoint: string;
  encryption: string;
}
