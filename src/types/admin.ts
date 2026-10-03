/**
 * AyuNexa Admin Console & Operations Master Type System
 * "Connected Care. Smarter Health."
 *
 * Implements strict RBAC, least privilege, audit logging,
 * and the 16 operational capabilities.
 */

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CLINICAL_ADMIN'
  | 'DOCTOR'
  | 'CAREGIVER'
  | 'PATIENT'
  | 'PHARMACY_PARTNER'
  | 'SUPPORT_AGENT'
  | 'FINANCE';

export type AdminPermission =
  // User Management
  | 'USER_VIEW'
  | 'USER_EDIT'
  | 'USER_SUSPEND'
  | 'USER_VERIFY'
  | 'USER_CREATE'
  | 'USER_DELETE'
  // Healthcare Data (Strictly protected)
  | 'PATIENT_DATA_VIEW'
  | 'PATIENT_DATA_EXPORT'
  // Medication & Care
  | 'MEDICATION_VIEW'
  | 'MEDICATION_MANAGE'
  | 'CAREGIVER_MANAGE'
  | 'DOCTOR_MANAGE'
  // Orders & Pharmacy
  | 'ORDER_VIEW'
  | 'ORDER_MANAGE'
  // Payments & Finance
  | 'PAYMENT_VIEW'
  | 'REFUND_MANAGE'
  // Content
  | 'CONTENT_CREATE'
  | 'CONTENT_PUBLISH'
  | 'CONTENT_DELETE'
  // Notifications
  | 'NOTIFICATION_SEND'
  | 'NOTIFICATION_MANAGE'
  // Reports
  | 'REPORT_VIEW'
  | 'REPORT_EXPORT'
  // Support
  | 'SUPPORT_MANAGE'
  | 'SUPPORT_REPLY'
  // Audit
  | 'AUDIT_VIEW'
  | 'AUDIT_EXPORT'
  // Configuration & Operations
  | 'FEATURE_FLAG_MANAGE'
  | 'APP_VERSION_MANAGE'
  | 'PARTNER_MANAGE'
  | 'COUPON_MANAGE'
  | 'MODERATION_MANAGE';

export type UserAccountStatus =
  | 'ACTIVE'
  | 'PENDING_VERIFICATION'
  | 'SUSPENDED'
  | 'DEACTIVATED'
  | 'BLOCKED';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole;
  status: UserAccountStatus;
  isVerified: boolean;
  verifiedAt?: string;
  assignedDoctorName?: string;
  assignedCaregiverName?: string;
  activeSessionsCount: number;
  lastActiveAt: string;
  createdAt: string;
  notes?: string;
}

export type ContentStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type ContentCategory = 'ANNOUNCEMENT' | 'BANNER' | 'HEALTH_EDUCATION' | 'CARE_GUIDANCE' | 'FAQ' | 'HELP';
export type ContentAudience = 'ALL' | 'PATIENTS' | 'CAREGIVERS' | 'DOCTORS';

export interface ContentItem {
  id: string;
  title: string;
  category: ContentCategory;
  excerpt: string;
  content: string;
  status: ContentStatus;
  audience: ContentAudience;
  clinicalReviewStatus: 'NOT_REQUIRED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  imageUrl?: string;
  publishedAt?: string;
  scheduledFor?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED';

export interface PaymentTransaction {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  paymentProvider: 'DEMO_MOCK_GATEWAY' | 'STRIPE_ADAPTER' | 'RAZORPAY_ADAPTER';
  status: PaymentStatus;
  paymentMethod: string; // e.g. "UPI / NetBanking", "Visa **** 4022"
  createdAt: string;
  updatedAt: string;
  refundedAt?: string;
  refundAmount?: number;
  refundReason?: string;
  idempotencyKey: string;
  isMock: boolean;
}

export interface AdminNotificationBroadcast {
  id: string;
  title: string;
  body: string;
  audience: ContentAudience | 'ALL_USERS';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'SAFETY_CRITICAL';
  status: 'DRAFT' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'CANCELLED';
  channel: 'IN_APP' | 'PUSH' | 'BOTH';
  scheduledFor?: string;
  sentAt?: string;
  recipientCount: number;
  deliveredCount: number;
  failedCount: number;
  createdBy: string;
  createdAt: string;
}

export type AdminOrderStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PRESCRIPTION_REVIEW'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REQUIRES_REVIEW';

export interface AdminRefillOrder {
  id: string;
  patientId: string;
  patientName: string;
  medicineId: string;
  medicineName: string;
  pharmacyId: string;
  pharmacyName: string;
  quantity: number;
  priceFormatted: string;
  status: AdminOrderStatus;
  prescriptionStatus: 'VERIFIED' | 'PENDING_DOCTOR' | 'EXEMPT';
  medicationPlanChanged: boolean;
  orderDate: string;
  deliveryAddress: string;
  notes?: string;
}

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
export type TicketCategory =
  | 'ACCOUNT'
  | 'MEDICATION'
  | 'REMINDER'
  | 'PHARMACY'
  | 'PAYMENT'
  | 'CAREGIVER'
  | 'DOCTOR'
  | 'TECHNICAL'
  | 'PRIVACY'
  | 'OTHER';

export interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: AdminRole;
  text: string;
  isInternal: boolean;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: AdminRole;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgentName?: string;
  assignedAgentId?: string;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminAnalyticsMetrics {
  totalUsers: number;
  activeUsersToday: number;
  newUsers7d: number;
  medicationEventsToday: number;
  recordedDoseConfirmationsToday: number;
  noResponseEventsToday: number;
  lowStockAlertsActive: number;
  refillOrdersPending: number;
  successfulPaymentsToday: number;
  failedPaymentsToday: number;
  openSupportTickets: number;
  pendingSyncEvents: number;
  systemErrorsCount: number;
  dataFreshness: 'CURRENT' | 'RECENT' | 'STALE' | 'UNKNOWN';
  lastRefreshed: string;
}

export interface AdminAuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  actorRole: AdminRole;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  ipAddress: string;
  deviceSession: string;
  beforeState?: string;
  afterState?: string;
  reason?: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED';
}

export interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  isEnabled: boolean;
  category: 'CORE' | 'AI' | 'COMMERCE' | 'ACCESSIBILITY' | 'SAFETY';
  lastModifiedBy: string;
  lastModifiedAt: string;
  reason: string;
}

export interface AppVersionConfig {
  id: string;
  platform: 'ANDROID' | 'IOS' | 'WEB';
  currentVersion: string;
  minimumSupportedVersion: string;
  recommendedVersion: string;
  releaseStatus: 'OPTIONAL_UPDATE' | 'RECOMMENDED_UPDATE' | 'REQUIRED_UPDATE' | 'BLOCKED_VERSION';
  releaseNotes: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  updatedAt: string;
}

export interface CouponItem {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
  applicableTo: 'REFILL_DELIVERY' | 'COMMERCIAL_SERVICE';
}

export interface PartnerVendor {
  id: string;
  name: string;
  type: 'PHARMACY' | 'CLINIC' | 'DOCTOR' | 'HEALTHCARE_ORGANIZATION' | 'SERVICE_PROVIDER';
  contactEmail: string;
  contactPhone: string;
  address: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';
  rating: number;
  activeOrdersCount: number;
  documentsVerified: boolean;
  createdAt: string;
}

export interface ModerationItem {
  id: string;
  contentType: 'PHARMACY_REVIEW' | 'COMMUNITY_FEEDBACK' | 'USER_REPORT';
  authorName: string;
  authorRole: AdminRole;
  text: string;
  flagReason: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'REMOVED';
  reviewedBy?: string;
  createdAt: string;
}

export interface UserSessionDevice {
  id: string;
  userId: string;
  userName: string;
  userRole: AdminRole;
  device: string;
  platform: string;
  ipAddress: string;
  lastActive: string;
  sessionCreated: string;
  appVersion: string;
  isCurrent: boolean;
}
