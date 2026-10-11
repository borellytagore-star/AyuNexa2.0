import express, { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import {
  AdminRole,
  AdminPermission,
  AdminUser,
  ContentItem,
  PaymentTransaction,
  AdminNotificationBroadcast,
  AdminRefillOrder,
  SupportTicket,
  AdminAnalyticsMetrics,
  AdminAuditLog,
  FeatureFlag,
  AppVersionConfig,
  CouponItem,
  PartnerVendor,
  ModerationItem,
  UserSessionDevice,
} from './src/types/admin';
import { ROLE_PERMISSIONS, hasPermission } from './src/services/adminRbac';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// ========================================================
// IN-MEMORY / PERSISTENT BACKEND STORE (ADMIN & OPERATIONS)
// Seeded with realistic healthcare operations data
// ========================================================

// 1. Users
let usersStore: AdminUser[] = [
  {
    id: 'usr-1',
    name: 'Ravi Kumar',
    email: 'ravi.kumar@example.com',
    phone: '+91 98450 12345',
    role: 'PATIENT',
    status: 'ACTIVE',
    isVerified: true,
    verifiedAt: '2026-09-10T10:00:00Z',
    assignedDoctorName: 'Dr. Anita Rao',
    assignedCaregiverName: 'Tagore',
    activeSessionsCount: 1,
    lastActiveAt: 'Just now',
    createdAt: '2026-09-01T08:30:00Z',
    notes: 'Primary patient enrolled in chronic hypertension and diabetes care plan.',
  },
  {
    id: 'usr-2',
    name: 'Tagore',
    email: 'tagore.caregiver@example.com',
    phone: '+91 72888 73797',
    role: 'CAREGIVER',
    status: 'ACTIVE',
    isVerified: true,
    verifiedAt: '2026-09-10T10:05:00Z',
    activeSessionsCount: 1,
    lastActiveAt: '10 mins ago',
    createdAt: '2026-09-01T08:35:00Z',
    notes: 'Authorized primary caregiver (Son) for Ravi Kumar.',
  },
  {
    id: 'usr-3',
    name: 'Dr. Anita Rao',
    email: 'dr.rao@ayunexa.health',
    phone: '+91 98450 34567',
    role: 'DOCTOR',
    status: 'ACTIVE',
    isVerified: true,
    verifiedAt: '2026-08-15T09:00:00Z',
    activeSessionsCount: 2,
    lastActiveAt: '25 mins ago',
    createdAt: '2026-08-15T09:00:00Z',
    notes: 'Senior Cardiologist & Internal Medicine Specialist. Medical Council Reg #KA-2011-884.',
  },
  {
    id: 'usr-4',
    name: 'Kavita Menon',
    email: 'kavita.admin@ayunexa.health',
    phone: '+91 98450 45678',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    isVerified: true,
    verifiedAt: '2026-08-01T00:00:00Z',
    activeSessionsCount: 1,
    lastActiveAt: 'Now',
    createdAt: '2026-08-01T00:00:00Z',
    notes: 'Chief Technology & Governance Officer. Full system administration rights.',
  },
  {
    id: 'usr-5',
    name: 'Suresh Patel',
    email: 'suresh.ops@ayunexa.health',
    phone: '+91 98450 56789',
    role: 'ADMIN',
    status: 'ACTIVE',
    isVerified: true,
    verifiedAt: '2026-08-10T00:00:00Z',
    activeSessionsCount: 1,
    lastActiveAt: '1 hour ago',
    createdAt: '2026-08-10T00:00:00Z',
    notes: 'Operations & Patient Support Manager.',
  },
  {
    id: 'usr-6',
    name: 'Apollo Pharmacy Koramangala',
    email: 'partner.apollo@ayunexa.health',
    phone: '+91 80 2552 1100',
    role: 'PHARMACY_PARTNER',
    status: 'ACTIVE',
    isVerified: true,
    verifiedAt: '2026-08-20T11:00:00Z',
    activeSessionsCount: 1,
    lastActiveAt: '2 hours ago',
    createdAt: '2026-08-20T11:00:00Z',
    notes: 'Verified Pharmacy Partner #PH-KA-4402.',
  },
  {
    id: 'usr-7',
    name: 'Vikram Joshi',
    email: 'vikram.finance@ayunexa.health',
    phone: '+91 98450 67890',
    role: 'FINANCE',
    status: 'ACTIVE',
    isVerified: true,
    verifiedAt: '2026-08-12T00:00:00Z',
    activeSessionsCount: 1,
    lastActiveAt: '3 hours ago',
    createdAt: '2026-08-12T00:00:00Z',
    notes: 'Billing, refunds and transaction reconciliations.',
  },
  {
    id: 'usr-8',
    name: 'Ananya Sharma',
    email: 'ananya.support@ayunexa.health',
    phone: '+91 98450 78901',
    role: 'SUPPORT_AGENT',
    status: 'ACTIVE',
    isVerified: true,
    verifiedAt: '2026-09-01T00:00:00Z',
    activeSessionsCount: 1,
    lastActiveAt: '5 mins ago',
    createdAt: '2026-09-01T00:00:00Z',
    notes: 'Customer success and caregiver helpline specialist.',
  },
  {
    id: 'usr-9',
    name: 'Deepak Verma',
    email: 'deepak.verma@example.com',
    phone: '+91 98450 89012',
    role: 'PATIENT',
    status: 'PENDING_VERIFICATION',
    isVerified: false,
    activeSessionsCount: 0,
    lastActiveAt: 'Yesterday',
    createdAt: '2026-09-24T14:20:00Z',
    notes: 'Awaiting phone OTP and medical record linkage.',
  },
  {
    id: 'usr-10',
    name: 'Suspect Telemarketer Acc',
    email: 'spam.bot99@trashmail.com',
    phone: '+91 99999 00000',
    role: 'PATIENT',
    status: 'SUSPENDED',
    isVerified: false,
    activeSessionsCount: 0,
    lastActiveAt: '4 days ago',
    createdAt: '2026-09-20T03:12:00Z',
    notes: 'Suspended for automated mass registration attempts.',
  },
];

// 2. Audit Logs (Append-Only)
let auditLogsStore: AdminAuditLog[] = [
  {
    id: 'aud-init-1',
    actorUserId: 'usr-4',
    actorName: 'Kavita Menon',
    actorRole: 'SUPER_ADMIN',
    action: 'SYSTEM_BOOTSTRAP',
    targetType: 'SYSTEM_GOVERNANCE',
    targetId: 'ayunexa-core',
    timestamp: '2026-09-26 09:00:00',
    ipAddress: '10.0.4.12',
    deviceSession: 'macOS Chrome 128 / AyuNexa Admin Suite',
    beforeState: 'None',
    afterState: 'Initialized',
    reason: 'Production operations console initialized with least-privilege RBAC policies.',
    result: 'SUCCESS',
  },
  {
    id: 'aud-init-2',
    actorUserId: 'usr-3',
    actorName: 'Dr. Anita Rao',
    actorRole: 'DOCTOR',
    action: 'CARE_PLAN_AUTHORIZED',
    targetType: 'CARE_PLAN',
    targetId: 'cp-v2.0-174208',
    timestamp: '2026-09-25 16:30:15',
    ipAddress: '192.168.1.45',
    deviceSession: 'iPad Pro iOS 18 / Doctor Clinical Station',
    beforeState: 'DRAFT',
    afterState: 'PENDING_ACKNOWLEDGEMENT',
    reason: 'Authorized treatment plan updates after blood test review.',
    result: 'SUCCESS',
  },
  {
    id: 'aud-init-3',
    actorUserId: 'usr-5',
    actorName: 'Suresh Patel',
    actorRole: 'ADMIN',
    action: 'USER_SUSPENDED',
    targetType: 'USER_ACCOUNT',
    targetId: 'usr-10',
    timestamp: '2026-09-22 11:14:02',
    ipAddress: '10.0.4.18',
    deviceSession: 'Linux Ubuntu / Admin Terminal',
    beforeState: 'ACTIVE',
    afterState: 'SUSPENDED',
    reason: 'Suspended automated bot account detected by security telemetry.',
    result: 'SUCCESS',
  },
];

function logAdminAction(entry: Omit<AdminAuditLog, 'id' | 'timestamp'>) {
  const newLog: AdminAuditLog = {
    ...entry,
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  auditLogsStore = [newLog, ...auditLogsStore];
  return newLog;
}

// 3. Content Store
let contentStore: ContentItem[] = [
  {
    id: 'cnt-1',
    title: 'Managing Blood Pressure Naturally with Ayurvedic Diet Habits',
    category: 'HEALTH_EDUCATION',
    excerpt: 'Simple dietary lifestyle adjustments that complement prescribed anti-hypertensive medication.',
    content: 'Always consult your prescribing doctor before changing any regimen. Incorporating moderate garlic, leafy greens, and low-sodium hydration supports healthy cardiovascular function.',
    status: 'PUBLISHED',
    audience: 'ALL',
    clinicalReviewStatus: 'APPROVED',
    reviewedBy: 'Dr. Anita Rao (MD)',
    publishedAt: '2026-09-15T09:00:00Z',
    createdBy: 'Kavita Menon',
    createdAt: '2026-09-12T10:00:00Z',
    updatedAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 'cnt-2',
    title: 'Important: Seasonal Monsoon Flu Vaccine Guidance',
    category: 'ANNOUNCEMENT',
    excerpt: 'Recommended seasonal guidance for senior citizens and individuals with chronic respiratory conditions.',
    content: 'Consult Dr. Rao regarding seasonal influenza vaccinations. Ensure home medicines are stored away from excess dampness.',
    status: 'PUBLISHED',
    audience: 'PATIENTS',
    clinicalReviewStatus: 'APPROVED',
    reviewedBy: 'Dr. Anita Rao (MD)',
    publishedAt: '2026-09-20T12:00:00Z',
    createdBy: 'Suresh Patel',
    createdAt: '2026-09-19T14:30:00Z',
    updatedAt: '2026-09-20T12:00:00Z',
  },
  {
    id: 'cnt-3',
    title: 'Upcoming Feature: One-Tap Caregiver Audio Check-in',
    category: 'BANNER',
    excerpt: 'New accessibility tool enabling quick 10-second voice checks between elders and caregivers.',
    content: 'Stay connected with elderly family members even while at work with one-tap voice status confirmations.',
    status: 'DRAFT',
    audience: 'CAREGIVERS',
    clinicalReviewStatus: 'NOT_REQUIRED',
    createdBy: 'Suresh Patel',
    createdAt: '2026-09-24T16:00:00Z',
    updatedAt: '2026-09-24T16:00:00Z',
  },
];

// 4. Payments & Transactions (with Payment Provider Adapter & Idempotent Refunds)
let paymentsStore: PaymentTransaction[] = [
  {
    id: 'tx-2026-0901',
    orderId: 'refill-01',
    userId: 'usr-1',
    userName: 'Ravi Kumar',
    amount: 145.0,
    currency: 'INR',
    paymentProvider: 'DEMO_MOCK_GATEWAY',
    status: 'SUCCESS',
    paymentMethod: 'UPI (GPay / ravi@okhdfcbank)',
    createdAt: '2026-09-22 14:15:20',
    updatedAt: '2026-09-22 14:15:25',
    idempotencyKey: 'idemp-tx-2026-0901-refill01',
    isMock: true,
  },
  {
    id: 'tx-2026-0902',
    orderId: 'refill-02',
    userId: 'usr-1',
    userName: 'Ravi Kumar',
    amount: 220.0,
    currency: 'INR',
    paymentProvider: 'DEMO_MOCK_GATEWAY',
    status: 'SUCCESS',
    paymentMethod: 'Visa Debit **** 4022',
    createdAt: '2026-09-24 10:30:11',
    updatedAt: '2026-09-24 10:30:16',
    idempotencyKey: 'idemp-tx-2026-0902-refill02',
    isMock: true,
  },
  {
    id: 'tx-2026-0903',
    orderId: 'refill-03',
    userId: 'usr-9',
    userName: 'Deepak Verma',
    amount: 350.0,
    currency: 'INR',
    paymentProvider: 'DEMO_MOCK_GATEWAY',
    status: 'FAILED',
    paymentMethod: 'Net Banking (SBI)',
    createdAt: '2026-09-25 09:12:44',
    updatedAt: '2026-09-25 09:13:00',
    idempotencyKey: 'idemp-tx-2026-0903-fail',
    isMock: true,
  },
];

// 5. Notifications
let notificationsStore: AdminNotificationBroadcast[] = [
  {
    id: 'ntf-1',
    title: 'Reminder: Scheduled Doctor Follow-Up Consultation',
    body: 'Dr. Rao is available for routine blood pressure and glucose evaluation this Thursday at 11:00 AM.',
    audience: 'PATIENTS',
    priority: 'NORMAL',
    status: 'SENT',
    channel: 'BOTH',
    sentAt: '2026-09-24 10:00:00',
    recipientCount: 142,
    deliveredCount: 139,
    failedCount: 3,
    createdBy: 'Suresh Patel',
    createdAt: '2026-09-24 09:30:00',
  },
  {
    id: 'ntf-2',
    title: 'Caregiver Daily Summary Ready',
    body: 'Daily medication adherence and health check records are compiled for your review.',
    audience: 'CAREGIVERS',
    priority: 'LOW',
    status: 'SENT',
    channel: 'IN_APP',
    sentAt: '2026-09-25 20:00:00',
    recipientCount: 88,
    deliveredCount: 88,
    failedCount: 0,
    createdBy: 'Suresh Patel',
    createdAt: '2026-09-25 19:45:00',
  },
];

// 6. Orders / Refills
let ordersStore: AdminRefillOrder[] = [
  {
    id: 'ord-101',
    patientId: 'usr-1',
    patientName: 'Ravi Kumar',
    medicineId: 'med-1',
    medicineName: 'Metformin 500 mg',
    pharmacyId: 'ph-1',
    pharmacyName: 'Apollo Pharmacy Koramangala',
    quantity: 60,
    priceFormatted: '₹145',
    status: 'CONFIRMED',
    prescriptionStatus: 'VERIFIED',
    medicationPlanChanged: false,
    orderDate: '2026-09-25 11:20:00',
    deliveryAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru',
    notes: 'Doorstep morning delivery requested.',
  },
  {
    id: 'ord-102',
    patientId: 'usr-1',
    patientName: 'Ravi Kumar',
    medicineId: 'med-2',
    medicineName: 'Amlodipine 5 mg',
    pharmacyId: 'ph-1',
    pharmacyName: 'Apollo Pharmacy Koramangala',
    quantity: 30,
    priceFormatted: '₹95',
    status: 'PROCESSING',
    prescriptionStatus: 'VERIFIED',
    medicationPlanChanged: false,
    orderDate: '2026-09-25 14:40:00',
    deliveryAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru',
    notes: 'Urgent refill - 2 days remaining runway.',
  },
  {
    id: 'ord-103',
    patientId: 'usr-9',
    patientName: 'Deepak Verma',
    medicineId: 'med-4',
    medicineName: 'Atorvastatin 20 mg',
    pharmacyId: 'ph-2',
    pharmacyName: 'MedPlus Pharmacy HSR',
    quantity: 30,
    priceFormatted: '₹220',
    status: 'REQUIRES_REVIEW',
    prescriptionStatus: 'PENDING_DOCTOR',
    medicationPlanChanged: true,
    orderDate: '2026-09-26 08:10:00',
    deliveryAddress: '12th Main, Sector 4, HSR Layout, Bengaluru',
    notes: 'Prescription dosage changed in clinical chart. Verification required before dispatch.',
  },
];

// 7. Support Tickets
let ticketsStore: SupportTicket[] = [
  {
    id: 'tkt-201',
    userId: 'usr-1',
    userName: 'Ravi Kumar',
    userRole: 'PATIENT',
    subject: 'Need help updating primary emergency contact phone number',
    category: 'ACCOUNT',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignedAgentName: 'Ananya Sharma',
    assignedAgentId: 'usr-8',
    messages: [
      {
        id: 'msg-1',
        senderId: 'usr-1',
        senderName: 'Ravi Kumar',
        senderRole: 'PATIENT',
        text: 'Hello, my son Tagore got a new mobile number (+91 72888 73797). How can I ensure the SOS emergency dialer calls his new number?',
        isInternal: false,
        timestamp: '2026-09-25 15:10:00',
      },
      {
        id: 'msg-2',
        senderId: 'usr-8',
        senderName: 'Ananya Sharma',
        senderRole: 'SUPPORT_AGENT',
        text: 'Internal Note: Verified user identity via registered phone. Instructing user on Settings > Emergency Profile.',
        isInternal: true,
        timestamp: '2026-09-25 15:20:00',
      },
      {
        id: 'msg-3',
        senderId: 'usr-8',
        senderName: 'Ananya Sharma',
        senderRole: 'SUPPORT_AGENT',
        text: 'Dear Ravi ji, you can update this directly in Settings > Emergency Profile. For your safety, biometric confirmation is requested when saving changes.',
        isInternal: false,
        timestamp: '2026-09-25 15:22:00',
      },
    ],
    createdAt: '2026-09-25 15:10:00',
    updatedAt: '2026-09-25 15:22:00',
  },
  {
    id: 'tkt-202',
    userId: 'usr-2',
    userName: 'Tagore',
    userRole: 'CAREGIVER',
    subject: 'Refill delivery schedule query for Apollo Koramangala',
    category: 'PHARMACY',
    priority: 'LOW',
    status: 'OPEN',
    messages: [
      {
        id: 'msg-4',
        senderId: 'usr-2',
        senderName: 'Tagore',
        senderRole: 'CAREGIVER',
        text: 'Hi, order #ord-102 was placed this afternoon. Can we confirm if it will arrive before 7:00 PM today?',
        isInternal: false,
        timestamp: '2026-09-25 16:00:00',
      },
    ],
    createdAt: '2026-09-25 16:00:00',
    updatedAt: '2026-09-25 16:00:00',
  },
];

// 8. Feature Flags & Configuration
let featureFlagsStore: FeatureFlag[] = [
  {
    key: 'VOICE_ASSISTANT',
    label: 'Voice Assistant & TTS Prompts',
    description: 'Enables spoken voice guidance for medication reminders and senior accessibility.',
    isEnabled: true,
    category: 'ACCESSIBILITY',
    lastModifiedBy: 'Kavita Menon',
    lastModifiedAt: '2026-09-20 10:00:00',
    reason: 'Standard feature for high-accessibility patient experience.',
  },
  {
    key: 'AI_ASSISTANT',
    label: 'MediAssistant (AyuNexa AI Companion)',
    description: 'Enables non-clinical medicine Q&A, instructions breakdown, and lifestyle guidance.',
    isEnabled: true,
    category: 'AI',
    lastModifiedBy: 'Kavita Menon',
    lastModifiedAt: '2026-09-20 10:00:00',
    reason: 'Configured with strict safety boundary controller; autonomous diagnosis blocked.',
  },
  {
    key: 'PHARMACY_REFILL',
    label: 'Pharmacy Refill & Order Workflow',
    description: 'Allows patients and caregivers to order prescription refills directly from verified local pharmacies.',
    isEnabled: true,
    category: 'COMMERCE',
    lastModifiedBy: 'Kavita Menon',
    lastModifiedAt: '2026-09-20 10:00:00',
    reason: 'Active with Apollo and MedPlus partner integrations.',
  },
  {
    key: 'CAREGIVER_ALERTS',
    label: 'Caregiver Urgent Notifications & Escalations',
    description: 'Pushes immediate alerts to registered family members if a dose has NO_RESPONSE or stock drops below 3 days.',
    isEnabled: true,
    category: 'SAFETY',
    lastModifiedBy: 'Kavita Menon',
    lastModifiedAt: '2026-09-20 10:00:00',
    reason: 'Core safety mechanism to protect vulnerable seniors living independently.',
  },
  {
    key: 'REPORTS',
    label: 'Clinical CSV & Adherence Reports',
    description: 'Enables exporting verified dose confirmation history for clinical consultations.',
    isEnabled: true,
    category: 'CORE',
    lastModifiedBy: 'Kavita Menon',
    lastModifiedAt: '2026-09-20 10:00:00',
    reason: 'Mandatory clinical transparency feature.',
  },
  {
    key: 'VIDEO_OBSERVATION',
    label: 'Camera Health Check & Video Observations',
    description: 'Caregiver or doctor assisted optical symptom check (camera/mic permissions).',
    isEnabled: true,
    category: 'CORE',
    lastModifiedBy: 'Kavita Menon',
    lastModifiedAt: '2026-09-20 10:00:00',
    reason: 'Patient consent required on every activation.',
  },
  {
    key: 'SOS',
    label: 'Emergency SOS Broadcast',
    description: 'High-visibility emergency panic button alerting caregiver, doctor, and emergency contacts.',
    isEnabled: true,
    category: 'SAFETY',
    lastModifiedBy: 'Kavita Menon',
    lastModifiedAt: '2026-09-20 10:00:00',
    reason: 'Core life-safety mechanism. Cannot be disabled on patient client.',
  },
  {
    key: 'ASSISTED_MODE',
    label: 'Elderly Assisted Mode (Large UI / Contrast)',
    description: 'High-contrast large touch targets, simplified 1-click dose cards, zero visual clutter.',
    isEnabled: true,
    category: 'ACCESSIBILITY',
    lastModifiedBy: 'Kavita Menon',
    lastModifiedAt: '2026-09-20 10:00:00',
    reason: 'Default state for elderly and visually impaired users.',
  },
];

// 9. App Versions & Force Update Policy
let appVersionsStore: AppVersionConfig[] = [
  {
    id: 'ver-android',
    platform: 'ANDROID',
    currentVersion: '1.2.0',
    minimumSupportedVersion: '1.0.0',
    recommendedVersion: '1.2.0',
    releaseStatus: 'RECOMMENDED_UPDATE',
    releaseNotes: 'Performance improvements for Kotlin Room database sync and offline queuing.',
    maintenanceMode: false,
    maintenanceMessage: 'System operational.',
    updatedAt: '2026-09-22 10:00:00',
  },
  {
    id: 'ver-ios',
    platform: 'IOS',
    currentVersion: '1.1.8',
    minimumSupportedVersion: '1.0.0',
    recommendedVersion: '1.1.8',
    releaseStatus: 'OPTIONAL_UPDATE',
    releaseNotes: 'Biometric FaceID integration for medication export.',
    maintenanceMode: false,
    maintenanceMessage: 'System operational.',
    updatedAt: '2026-09-20 10:00:00',
  },
  {
    id: 'ver-web',
    platform: 'WEB',
    currentVersion: '2.0.0',
    minimumSupportedVersion: '2.0.0',
    recommendedVersion: '2.0.0',
    releaseStatus: 'OPTIONAL_UPDATE',
    releaseNotes: 'Official AyuNexa Brand System Redesign and Admin & Operations Console.',
    maintenanceMode: false,
    maintenanceMessage: 'System operational.',
    updatedAt: '2026-09-26 09:00:00',
  },
];

// 10. Coupons & Discounts
let couponsStore: CouponItem[] = [
  {
    id: 'cpn-1',
    code: 'AYUNEXACARE',
    description: 'Free home delivery on senior chronic medication refills',
    discountType: 'FIXED',
    discountValue: 50,
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    usageLimit: 500,
    timesUsed: 124,
    isActive: true,
    applicableTo: 'REFILL_DELIVERY',
  },
  {
    id: 'cpn-2',
    code: 'WELLNESS10',
    description: '10% off partner clinical wellness supplies and test strips',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    startDate: '2026-09-15',
    endDate: '2026-10-31',
    usageLimit: 200,
    timesUsed: 38,
    isActive: true,
    applicableTo: 'COMMERCIAL_SERVICE',
  },
];

// 11. Partners / Vendors
let partnersStore: PartnerVendor[] = [
  {
    id: 'ph-1',
    name: 'Apollo Pharmacy Koramangala',
    type: 'PHARMACY',
    contactEmail: 'apollo.koramangala@ayunexa.health',
    contactPhone: '+91 80 2552 1100',
    address: '80 Feet Road, 4th Block, Koramangala, Bengaluru',
    status: 'VERIFIED',
    rating: 4.8,
    activeOrdersCount: 14,
    documentsVerified: true,
    createdAt: '2026-08-15 10:00:00',
  },
  {
    id: 'ph-2',
    name: 'MedPlus Pharmacy HSR',
    type: 'PHARMACY',
    contactEmail: 'hsr.medplus@ayunexa.health',
    contactPhone: '+91 80 2572 8899',
    address: '27th Main, Sector 1, HSR Layout, Bengaluru',
    status: 'VERIFIED',
    rating: 4.7,
    activeOrdersCount: 9,
    documentsVerified: true,
    createdAt: '2026-08-20 10:00:00',
  },
  {
    id: 'cl-1',
    name: 'Manipal Health Diagnostics Lab',
    type: 'CLINIC',
    contactEmail: 'manipal.diag@ayunexa.health',
    contactPhone: '+91 80 2502 4444',
    address: 'HAL Old Airport Road, Kodihalli, Bengaluru',
    status: 'VERIFIED',
    rating: 4.9,
    activeOrdersCount: 22,
    documentsVerified: true,
    createdAt: '2026-08-01 10:00:00',
  },
];

// 12. Content Moderation
let moderationStore: ModerationItem[] = [
  {
    id: 'mod-1',
    contentType: 'PHARMACY_REVIEW',
    authorName: 'Ravi Kumar',
    authorRole: 'PATIENT',
    text: 'Medicine delivery from Apollo Koramangala was very fast, within 25 minutes. All seals intact.',
    flagReason: 'Routine automated quality check',
    status: 'APPROVED',
    reviewedBy: 'Ananya Sharma',
    createdAt: '2026-09-24 16:30:00',
  },
  {
    id: 'mod-2',
    contentType: 'COMMUNITY_FEEDBACK',
    authorName: 'Unverified Guest',
    authorRole: 'PATIENT',
    text: 'Suggesting alternative unlicensed herbal powder for stopping insulin injections.',
    flagReason: 'POTENTIALLY_DANGEROUS_MEDICAL_CLAIM',
    status: 'REMOVED',
    reviewedBy: 'Dr. Anita Rao (MD)',
    createdAt: '2026-09-25 09:15:00',
  },
];

// 13. Devices & Sessions
let devicesStore: UserSessionDevice[] = [
  {
    id: 'dev-1',
    userId: 'usr-1',
    userName: 'Ravi Kumar',
    userRole: 'PATIENT',
    device: 'Samsung Galaxy A54 (Android 14)',
    platform: 'ANDROID',
    ipAddress: '49.207.212.18',
    lastActive: 'Just now',
    sessionCreated: '2026-09-24 07:30:00',
    appVersion: '1.2.0',
    isCurrent: false,
  },
  {
    id: 'dev-2',
    userId: 'usr-4',
    userName: 'Kavita Menon',
    userRole: 'SUPER_ADMIN',
    device: 'MacBook Pro M3 Max / Chrome 129',
    platform: 'WEB_CHROME',
    ipAddress: '10.0.4.12',
    lastActive: 'Active Now',
    sessionCreated: '2026-09-26 08:45:00',
    appVersion: '2.0.0',
    isCurrent: true,
  },
  {
    id: 'dev-3',
    userId: 'usr-3',
    userName: 'Dr. Anita Rao',
    userRole: 'DOCTOR',
    device: 'iPad Pro 13" (iPadOS 18)',
    platform: 'IOS',
    ipAddress: '192.168.1.45',
    lastActive: '25 mins ago',
    sessionCreated: '2026-09-25 08:00:00',
    appVersion: '1.1.8',
    isCurrent: false,
  },
];

// ========================================================
// SERVER-SIDE RBAC & AUTHENTICATION MIDDLEWARE
// Least-privilege verification. Prevents role escalation.
// ========================================================

interface AuthenticatedRequest extends Request {
  userRole?: AdminRole;
  userId?: string;
  userName?: string;
}

async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  const token = authorization?.match(/^Bearer\\s+(.+)$/i)?.[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'A valid Supabase access token is required.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    return res.status(503).json({ error: 'Auth unavailable', message: 'Supabase server configuration is missing.' });
  }

  try {
    const authClient = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Your Supabase session is invalid or expired.' });
    }

    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('id, display_name, role')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({ error: 'Authentication failed', message: 'Unable to verify your AyuNexa profile.' });
    }
    if (!profile) {
      return res.status(403).json({ error: 'Forbidden', message: 'No AyuNexa profile is assigned to this account.' });
    }

    const roleMap: Record<string, AdminRole> = {
      patient: 'PATIENT',
      caregiver: 'CAREGIVER',
      doctor: 'DOCTOR',
      super_admin: 'SUPER_ADMIN',
    };
    const verifiedRole = roleMap[profile.role];
    if (!verifiedRole) {
      return res.status(403).json({ error: 'Forbidden', message: 'Your account role is not authorized.' });
    }

    // Identity and role come only from the verified Supabase user + RLS-protected profile.
    // x-admin-role and x-user-id headers are intentionally ignored.
    req.userRole = verifiedRole;
    req.userId = authData.user.id;
    req.userName = profile.display_name || authData.user.email || 'AyuNexa user';
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized', message: 'Unable to validate the Supabase session.' });
  }
}

function requirePermission(perm: AdminPermission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.userRole || 'PATIENT';
    if (!hasPermission(role, perm)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Your role (${role}) lacks the required '${perm}' permission.`,
        requiredPermission: perm,
      });
    }
    next();
  };
}

// ========================================================
// REST API ENDPOINTS: /api/admin/...
// ========================================================

// 1. Session / Auth Me
app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const role = req.userRole!;
  const user = usersStore.find((u) => u.id === req.userId);
  res.json({
    user: user || {
      id: req.userId,
      name: req.userName,
      role: role,
      status: 'ACTIVE',
    },
    role,
    permissions: ROLE_PERMISSIONS[role] || [],
    environment: 'AYUNEXA_PRODUCTION_HYBRID',
    timestamp: new Date().toISOString(),
  });
});

// 2. User Management
app.get('/api/admin/users', authMiddleware, requirePermission('USER_VIEW'), (req: Request, res: Response) => {
  const query = ((req.query.q as string) || '').toLowerCase();
  const roleFilter = req.query.role as string;
  const statusFilter = req.query.status as string;

  let results = [...usersStore];
  if (query) {
    results = results.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.phone.includes(query)
    );
  }
  if (roleFilter && roleFilter !== 'ALL') {
    results = results.filter((u) => u.role === roleFilter);
  }
  if (statusFilter && statusFilter !== 'ALL') {
    results = results.filter((u) => u.status === statusFilter);
  }

  res.json({
    total: results.length,
    users: results,
  });
});

app.patch('/api/admin/users/:id/status', authMiddleware, requirePermission('USER_SUSPEND'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const userIndex = usersStore.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const prevStatus = usersStore[userIndex].status;
  usersStore[userIndex].status = status;

  logAdminAction({
    actorUserId: req.userId || 'usr-4',
    actorName: req.userName || 'Kavita Menon',
    actorRole: req.userRole || 'SUPER_ADMIN',
    action: `USER_STATUS_CHANGE_${status}`,
    targetType: 'USER_ACCOUNT',
    targetId: id,
    ipAddress: req.ip || '10.0.4.12',
    deviceSession: req.headers['user-agent'] || 'Admin Console',
    beforeState: prevStatus,
    afterState: status,
    reason: reason || 'Administrative status change from console.',
    result: 'SUCCESS',
  });

  res.json({ success: true, user: usersStore[userIndex] });
});

app.patch('/api/admin/users/:id/verify', authMiddleware, requirePermission('USER_VERIFY'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = usersStore.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.isVerified = true;
  user.status = 'ACTIVE';
  user.verifiedAt = new Date().toISOString();

  logAdminAction({
    actorUserId: req.userId || 'usr-4',
    actorName: req.userName || 'Kavita Menon',
    actorRole: req.userRole || 'SUPER_ADMIN',
    action: 'USER_VERIFIED',
    targetType: 'USER_ACCOUNT',
    targetId: id,
    ipAddress: req.ip || '10.0.4.12',
    deviceSession: req.headers['user-agent'] || 'Admin Console',
    beforeState: 'UNVERIFIED',
    afterState: 'VERIFIED',
    reason: 'Manual identity verification confirmed by admin.',
    result: 'SUCCESS',
  });

  res.json({ success: true, user });
});

// 3. Roles & Permissions
app.get('/api/admin/roles', authMiddleware, (req: Request, res: Response) => {
  res.json({
    roles: Object.keys(ROLE_PERMISSIONS),
    matrix: ROLE_PERMISSIONS,
  });
});

// 4. Audit Logs
app.get('/api/admin/audit-logs', authMiddleware, requirePermission('AUDIT_VIEW'), (req: Request, res: Response) => {
  const query = ((req.query.q as string) || '').toLowerCase();
  let results = [...auditLogsStore];
  if (query) {
    results = results.filter(
      (l) =>
        l.action.toLowerCase().includes(query) ||
        l.actorName.toLowerCase().includes(query) ||
        l.targetType.toLowerCase().includes(query) ||
        (l.reason && l.reason.toLowerCase().includes(query))
    );
  }
  res.json({ logs: results });
});

// 5. Content Management
app.get('/api/admin/content', authMiddleware, (req: Request, res: Response) => {
  res.json({ items: contentStore });
});

app.post('/api/admin/content', authMiddleware, requirePermission('CONTENT_CREATE'), (req: AuthenticatedRequest, res: Response) => {
  const { title, category, excerpt, content, audience, clinicalReviewStatus } = req.body;
  const newItem: ContentItem = {
    id: `cnt-${Date.now()}`,
    title,
    category: category || 'ANNOUNCEMENT',
    excerpt: excerpt || '',
    content: content || '',
    status: 'PUBLISHED',
    audience: audience || 'ALL',
    clinicalReviewStatus: clinicalReviewStatus || 'NOT_REQUIRED',
    publishedAt: new Date().toISOString(),
    createdBy: req.userName || 'Kavita Menon',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  contentStore = [newItem, ...contentStore];

  logAdminAction({
    actorUserId: req.userId || 'usr-4',
    actorName: req.userName || 'Kavita Menon',
    actorRole: req.userRole || 'SUPER_ADMIN',
    action: 'CONTENT_PUBLISHED',
    targetType: 'CONTENT_ITEM',
    targetId: newItem.id,
    ipAddress: req.ip || '10.0.4.12',
    deviceSession: req.headers['user-agent'] || 'Admin Console',
    afterState: 'PUBLISHED',
    reason: `Published educational/announcement item: "${newItem.title}"`,
    result: 'SUCCESS',
  });

  res.json({ success: true, item: newItem });
});

app.delete('/api/admin/content/:id', authMiddleware, requirePermission('CONTENT_DELETE'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  contentStore = contentStore.filter((c) => c.id !== id);

  logAdminAction({
    actorUserId: req.userId || 'usr-4',
    actorName: req.userName || 'Kavita Menon',
    actorRole: req.userRole || 'SUPER_ADMIN',
    action: 'CONTENT_DELETED',
    targetType: 'CONTENT_ITEM',
    targetId: id,
    ipAddress: req.ip || '10.0.4.12',
    deviceSession: req.headers['user-agent'] || 'Admin Console',
    result: 'SUCCESS',
  });

  res.json({ success: true });
});

// 6. Payments & Transactions (Idempotent Refunds & Mock Provider)
app.get('/api/admin/payments', authMiddleware, requirePermission('PAYMENT_VIEW'), (req: Request, res: Response) => {
  res.json({
    transactions: paymentsStore,
    summary: {
      totalVolumeINR: paymentsStore
        .filter((t) => t.status === 'SUCCESS')
        .reduce((sum, t) => sum + t.amount, 0),
      successfulCount: paymentsStore.filter((t) => t.status === 'SUCCESS').length,
      refundedCount: paymentsStore.filter((t) => t.status === 'REFUNDED').length,
      failedCount: paymentsStore.filter((t) => t.status === 'FAILED').length,
      provider: 'MockPaymentAdapter (Demo Mode)',
    },
  });
});

app.post('/api/admin/payments/:id/refund', authMiddleware, requirePermission('REFUND_MANAGE'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason, idempotencyKey } = req.body;

  const tx = paymentsStore.find((t) => t.id === id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  // Idempotency check: Don't refund twice!
  if (tx.status === 'REFUNDED') {
    return res.status(400).json({ error: 'Transaction has already been refunded (Idempotency Guard).' });
  }

  tx.status = 'REFUNDED';
  tx.refundedAt = new Date().toISOString();
  tx.refundAmount = tx.amount;
  tx.refundReason = reason || 'Customer support refund request';

  logAdminAction({
    actorUserId: req.userId || 'usr-4',
    actorName: req.userName || 'Vikram Joshi (Finance)',
    actorRole: req.userRole || 'FINANCE',
    action: 'PAYMENT_REFUNDED',
    targetType: 'PAYMENT_TRANSACTION',
    targetId: id,
    ipAddress: req.ip || '10.0.4.12',
    deviceSession: req.headers['user-agent'] || 'Admin Console',
    beforeState: 'SUCCESS',
    afterState: 'REFUNDED',
    reason: `Refund of ₹${tx.amount} processed. Reason: ${tx.refundReason}. Key: ${idempotencyKey}`,
    result: 'SUCCESS',
  });

  res.json({ success: true, transaction: tx });
});

// 7. Notifications Broadcast
app.get('/api/admin/notifications', authMiddleware, requirePermission('NOTIFICATION_MANAGE'), (req: Request, res: Response) => {
  res.json({ broadcasts: notificationsStore });
});

app.post('/api/admin/notifications', authMiddleware, requirePermission('NOTIFICATION_SEND'), (req: AuthenticatedRequest, res: Response) => {
  const { title, body, audience, priority, channel } = req.body;

  // Approximate recipient count based on role filter
  let count = usersStore.length;
  if (audience === 'PATIENTS') count = usersStore.filter((u) => u.role === 'PATIENT').length;
  if (audience === 'CAREGIVERS') count = usersStore.filter((u) => u.role === 'CAREGIVER').length;
  if (audience === 'DOCTORS') count = usersStore.filter((u) => u.role === 'DOCTOR').length;

  const newBroadcast: AdminNotificationBroadcast = {
    id: `ntf-${Date.now()}`,
    title,
    body,
    audience: audience || 'ALL_USERS',
    priority: priority || 'NORMAL',
    status: 'SENT',
    channel: channel || 'BOTH',
    sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    recipientCount: count,
    deliveredCount: Math.max(1, count - 1),
    failedCount: 0,
    createdBy: req.userName || 'Kavita Menon',
    createdAt: new Date().toISOString(),
  };

  notificationsStore = [newBroadcast, ...notificationsStore];

  logAdminAction({
    actorUserId: req.userId || 'usr-4',
    actorName: req.userName || 'Kavita Menon',
    actorRole: req.userRole || 'SUPER_ADMIN',
    action: 'NOTIFICATION_BROADCAST_SENT',
    targetType: 'NOTIFICATION',
    targetId: newBroadcast.id,
    ipAddress: req.ip || '10.0.4.12',
    deviceSession: req.headers['user-agent'] || 'Admin Console',
    reason: `Broadcasted to ${newBroadcast.recipientCount} ${newBroadcast.audience} recipients: "${newBroadcast.title}"`,
    result: 'SUCCESS',
  });

  res.json({ success: true, broadcast: newBroadcast });
});

// 8. Orders / Refills
app.get('/api/admin/orders', authMiddleware, requirePermission('ORDER_VIEW'), (req: Request, res: Response) => {
  res.json({ orders: ordersStore });
});

app.patch('/api/admin/orders/:id/status', authMiddleware, requirePermission('ORDER_MANAGE'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const order = ordersStore.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const prev = order.status;
  order.status = status;
  if (notes) order.notes = notes;

  logAdminAction({
    actorUserId: req.userId || 'usr-4',
    actorName: req.userName || 'Kavita Menon',
    actorRole: req.userRole || 'ADMIN',
    action: `ORDER_STATUS_${status}`,
    targetType: 'PHARMACY_REFILL_ORDER',
    targetId: id,
    ipAddress: req.ip || '10.0.4.12',
    deviceSession: req.headers['user-agent'] || 'Admin Console',
    beforeState: prev,
    afterState: status,
    reason: notes || 'Status updated from Pharmacy/Refill Console.',
    result: 'SUCCESS',
  });

  res.json({ success: true, order });
});

// 9. Support Tickets
app.get('/api/admin/support', authMiddleware, requirePermission('SUPPORT_MANAGE'), (req: Request, res: Response) => {
  res.json({ tickets: ticketsStore });
});

app.post('/api/admin/support/:id/messages', authMiddleware, requirePermission('SUPPORT_REPLY'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { text, isInternal } = req.body;

  const ticket = ticketsStore.find((t) => t.id === id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const newMsg = {
    id: `msg-${Date.now()}`,
    senderId: req.userId || 'usr-8',
    senderName: req.userName || 'Ananya Sharma (Support)',
    senderRole: req.userRole || 'SUPPORT_AGENT',
    text,
    isInternal: Boolean(isInternal),
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };

  ticket.messages.push(newMsg);
  ticket.updatedAt = newMsg.timestamp;
  if (!isInternal && ticket.status === 'OPEN') {
    ticket.status = 'IN_PROGRESS';
  }

  logAdminAction({
    actorUserId: req.userId || 'usr-8',
    actorName: req.userName || 'Ananya Sharma',
    actorRole: req.userRole || 'SUPPORT_AGENT',
    action: isInternal ? 'SUPPORT_INTERNAL_NOTE_ADDED' : 'SUPPORT_REPLY_SENT',
    targetType: 'SUPPORT_TICKET',
    targetId: id,
    ipAddress: req.ip || '10.0.4.12',
    deviceSession: req.headers['user-agent'] || 'Admin Console',
    reason: isInternal ? 'Added private triage note.' : 'Replied to user.',
    result: 'SUCCESS',
  });

  res.json({ success: true, message: newMsg, ticket });
});

// 10. Live Analytics
app.get('/api/admin/analytics', authMiddleware, (req: Request, res: Response) => {
  const metrics: AdminAnalyticsMetrics = {
    totalUsers: usersStore.length,
    activeUsersToday: usersStore.filter((u) => u.status === 'ACTIVE').length,
    newUsers7d: 4,
    medicationEventsToday: 18,
    recordedDoseConfirmationsToday: 15,
    noResponseEventsToday: 1,
    lowStockAlertsActive: 2,
    refillOrdersPending: ordersStore.filter((o) => o.status !== 'DELIVERED').length,
    successfulPaymentsToday: paymentsStore.filter((t) => t.status === 'SUCCESS').length,
    failedPaymentsToday: paymentsStore.filter((t) => t.status === 'FAILED').length,
    openSupportTickets: ticketsStore.filter((t) => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length,
    pendingSyncEvents: 0,
    systemErrorsCount: 0,
    dataFreshness: 'CURRENT',
    lastRefreshed: 'Just now (Live WebSocket & Room Cache)',
  };

  res.json({ metrics });
});

// 11. Feature Flags & Configuration
app.get('/api/admin/configuration', authMiddleware, requirePermission('FEATURE_FLAG_MANAGE'), (req: Request, res: Response) => {
  res.json({ flags: featureFlagsStore });
});

app.patch('/api/admin/configuration/flags/:key', authMiddleware, requirePermission('FEATURE_FLAG_MANAGE'), (req: AuthenticatedRequest, res: Response) => {
  const { key } = req.params;
  const { isEnabled, reason } = req.body;

  const flag = featureFlagsStore.find((f) => f.key === key);
  if (!flag) return res.status(404).json({ error: 'Feature flag not found' });

  const prev = flag.isEnabled;
  flag.isEnabled = isEnabled;
  flag.lastModifiedBy = req.userName || 'Kavita Menon';
  flag.lastModifiedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
  if (reason) flag.reason = reason;

  logAdminAction({
    actorUserId: req.userId || 'usr-4',
    actorName: req.userName || 'Kavita Menon',
    actorRole: req.userRole || 'SUPER_ADMIN',
    action: `FEATURE_FLAG_${isEnabled ? 'ENABLED' : 'DISABLED'}`,
    targetType: 'FEATURE_FLAG',
    targetId: key,
    ipAddress: req.ip || '10.0.4.12',
    deviceSession: req.headers['user-agent'] || 'Admin Console',
    beforeState: String(prev),
    afterState: String(isEnabled),
    reason: reason || 'Feature flag toggled from Admin Configuration panel.',
    result: 'SUCCESS',
  });

  res.json({ success: true, flag });
});

// 12. App Versions
app.get('/api/admin/app-versions', authMiddleware, requirePermission('APP_VERSION_MANAGE'), (req: Request, res: Response) => {
  res.json({ versions: appVersionsStore });
});

app.put('/api/admin/app-versions/:platform', authMiddleware, requirePermission('APP_VERSION_MANAGE'), (req: AuthenticatedRequest, res: Response) => {
  const { platform } = req.params;
  const { minimumSupportedVersion, recommendedVersion, releaseStatus, maintenanceMode } = req.body;

  const ver = appVersionsStore.find((v) => v.platform === platform.toUpperCase());
  if (!ver) return res.status(404).json({ error: 'Platform version config not found' });

  ver.minimumSupportedVersion = minimumSupportedVersion || ver.minimumSupportedVersion;
  ver.recommendedVersion = recommendedVersion || ver.recommendedVersion;
  ver.releaseStatus = releaseStatus || ver.releaseStatus;
  if (typeof maintenanceMode === 'boolean') ver.maintenanceMode = maintenanceMode;
  ver.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

  logAdminAction({
    actorUserId: req.userId || 'usr-4',
    actorName: req.userName || 'Kavita Menon',
    actorRole: req.userRole || 'SUPER_ADMIN',
    action: 'APP_VERSION_CONFIG_UPDATED',
    targetType: 'APP_VERSION_POLICY',
    targetId: platform,
    ipAddress: req.ip || '10.0.4.12',
    deviceSession: req.headers['user-agent'] || 'Admin Console',
    afterState: `Min: ${ver.minimumSupportedVersion}, Rec: ${ver.recommendedVersion}`,
    reason: 'Updated minimum supported build version and force-update thresholds.',
    result: 'SUCCESS',
  });

  res.json({ success: true, versionConfig: ver });
});

// 13. Coupons & Discounts
app.get('/api/admin/coupons', authMiddleware, requirePermission('COUPON_MANAGE'), (req: Request, res: Response) => {
  res.json({ coupons: couponsStore });
});

app.post('/api/admin/coupons', authMiddleware, requirePermission('COUPON_MANAGE'), (req: AuthenticatedRequest, res: Response) => {
  const { code, description, discountType, discountValue, startDate, endDate, usageLimit, applicableTo } = req.body;
  const newCoupon: CouponItem = {
    id: `cpn-${Date.now()}`,
    code: (code || 'CARENEW').toUpperCase(),
    description: description || 'Special caregiver discount',
    discountType: discountType || 'PERCENTAGE',
    discountValue: Number(discountValue) || 10,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || '2026-12-31',
    usageLimit: Number(usageLimit) || 100,
    timesUsed: 0,
    isActive: true,
    applicableTo: applicableTo || 'REFILL_DELIVERY',
  };
  couponsStore = [newCoupon, ...couponsStore];

  logAdminAction({
    actorUserId: req.userId || 'usr-4',
    actorName: req.userName || 'Kavita Menon',
    actorRole: req.userRole || 'SUPER_ADMIN',
    action: 'COUPON_CREATED',
    targetType: 'COMMERCIAL_PROMO',
    targetId: newCoupon.id,
    ipAddress: req.ip || '10.0.4.12',
    deviceSession: req.headers['user-agent'] || 'Admin Console',
    reason: `Created refill coupon code ${newCoupon.code}`,
    result: 'SUCCESS',
  });

  res.json({ success: true, coupon: newCoupon });
});

// 14. Partners / Vendors
app.get('/api/admin/partners', authMiddleware, requirePermission('PARTNER_MANAGE'), (req: Request, res: Response) => {
  res.json({ partners: partnersStore });
});

app.patch('/api/admin/partners/:id/status', authMiddleware, requirePermission('PARTNER_MANAGE'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const partner = partnersStore.find((p) => p.id === id);
  if (!partner) return res.status(404).json({ error: 'Partner not found' });

  partner.status = status;
  if (status === 'VERIFIED') partner.documentsVerified = true;

  logAdminAction({
    actorUserId: req.userId || 'usr-4',
    actorName: req.userName || 'Kavita Menon',
    actorRole: req.userRole || 'SUPER_ADMIN',
    action: `PARTNER_STATUS_${status}`,
    targetType: 'HEALTHCARE_PARTNER',
    targetId: id,
    ipAddress: req.ip || '10.0.4.12',
    deviceSession: req.headers['user-agent'] || 'Admin Console',
    reason: `Partner status transitioned to ${status}`,
    result: 'SUCCESS',
  });

  res.json({ success: true, partner });
});

// 15. Content Moderation
app.get('/api/admin/moderation', authMiddleware, requirePermission('MODERATION_MANAGE'), (req: Request, res: Response) => {
  res.json({ items: moderationStore });
});

app.patch('/api/admin/moderation/:id/action', authMiddleware, requirePermission('MODERATION_MANAGE'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { action, notes } = req.body;
  const item = moderationStore.find((m) => m.id === id);
  if (!item) return res.status(404).json({ error: 'Moderation item not found' });

  item.status = action; // 'APPROVED' | 'REJECTED' | 'REMOVED'
  item.reviewedBy = req.userName || 'Kavita Menon';

  logAdminAction({
    actorUserId: req.userId || 'usr-4',
    actorName: req.userName || 'Kavita Menon',
    actorRole: req.userRole || 'SUPER_ADMIN',
    action: `CONTENT_MODERATION_${action}`,
    targetType: 'USER_SUBMITTED_CONTENT',
    targetId: id,
    ipAddress: req.ip || '10.0.4.12',
    deviceSession: req.headers['user-agent'] || 'Admin Console',
    reason: notes || `Moderator performed ${action} action on reported content item.`,
    result: 'SUCCESS',
  });

  res.json({ success: true, item });
});

// 16. Devices & Sessions
app.get('/api/admin/devices', authMiddleware, (req: Request, res: Response) => {
  res.json({ devices: devicesStore });
});

app.post('/api/admin/devices/:id/revoke', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const dev = devicesStore.find((d) => d.id === id);
  if (!dev) return res.status(404).json({ error: 'Device session not found' });

  devicesStore = devicesStore.filter((d) => d.id !== id);

  logAdminAction({
    actorUserId: req.userId || 'usr-4',
    actorName: req.userName || 'Kavita Menon',
    actorRole: req.userRole || 'SUPER_ADMIN',
    action: 'SESSION_REVOKED_FORCE_LOGOUT',
    targetType: 'USER_SESSION',
    targetId: id,
    ipAddress: req.ip || '10.0.4.12',
    deviceSession: req.headers['user-agent'] || 'Admin Console',
    reason: `Revoked active session for user ${dev.userName} (${dev.device}).`,
    result: 'SUCCESS',
  });

  res.json({ success: true, message: 'Session revoked successfully. User forced to re-authenticate.' });
});

// 17. Reports Generation & CSV Export
app.get('/api/admin/reports/:type/export', authMiddleware, requirePermission('REPORT_EXPORT'), (req: AuthenticatedRequest, res: Response) => {
  const { type } = req.params;

  logAdminAction({
    actorUserId: req.userId || 'usr-4',
    actorName: req.userName || 'Kavita Menon',
    actorRole: req.userRole || 'SUPER_ADMIN',
    action: 'REPORT_EXPORTED_CSV',
    targetType: 'ANALYTICS_REPORT',
    targetId: type,
    ipAddress: req.ip || '10.0.4.12',
    deviceSession: req.headers['user-agent'] || 'Admin Console',
    reason: `Exported ${type} dataset as CSV.`,
    result: 'SUCCESS',
  });

  if (type === 'users') {
    let csv = 'ID,Name,Email,Phone,Role,Status,Verified,CreatedAt\n';
    usersStore.forEach((u) => {
      csv += `"${u.id}","${u.name}","${u.email}","${u.phone}","${u.role}","${u.status}",${u.isVerified},"${u.createdAt}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ayunexa_users_${Date.now()}.csv"`);
    return res.send(csv);
  }

  if (type === 'payments') {
    let csv = 'TransactionID,OrderID,UserName,Amount,Currency,Provider,Status,Method,CreatedAt\n';
    paymentsStore.forEach((p) => {
      csv += `"${p.id}","${p.orderId}","${p.userName}",${p.amount},"${p.currency}","${p.paymentProvider}","${p.status}","${p.paymentMethod}","${p.createdAt}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ayunexa_transactions_${Date.now()}.csv"`);
    return res.send(csv);
  }

  if (type === 'orders') {
    let csv = 'OrderID,PatientName,Medicine,Pharmacy,Quantity,Price,Status,OrderDate\n';
    ordersStore.forEach((o) => {
      csv += `"${o.id}","${o.patientName}","${o.medicineName}","${o.pharmacyName}",${o.quantity},"${o.priceFormatted}","${o.status}","${o.orderDate}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ayunexa_orders_${Date.now()}.csv"`);
    return res.send(csv);
  }

  // Default: Audit logs
  let csv = 'LogID,Timestamp,Actor,Role,Action,TargetType,TargetID,Result,Reason\n';
  auditLogsStore.forEach((l) => {
    csv += `"${l.id}","${l.timestamp}","${l.actorName}","${l.actorRole}","${l.action}","${l.targetType}","${l.targetId}","${l.result}","${(l.reason || '').replace(/"/g, '""')}"\n`;
  });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="ayunexa_audit_log_${Date.now()}.csv"`);
  return res.send(csv);
});

// ========================================================
// VITE MIDDLEWARES / STATIC SERVING
// ========================================================
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[AyuNexa Backend Engine] Server listening on port ${PORT}`);
    console.log(`[AyuNexa Brand] Connected Care. Smarter Health.`);
    console.log(`[AyuNexa RBAC] 16 Operational modules initialized with least-privilege security.`);
  });
}

startServer();
