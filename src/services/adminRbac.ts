import { AdminRole, AdminPermission } from '../types/admin';

/**
 * AyuNexa Least-Privilege Role-Based Access Control (RBAC) Matrix
 * Healthcare safety rule: Administrative staff never receive unrestricted access to
 * clinical health records, and clinical/prescribing actions require authorized medical roles.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    'USER_VIEW',
    'USER_EDIT',
    'USER_SUSPEND',
    'USER_VERIFY',
    'USER_CREATE',
    'USER_DELETE',
    'PATIENT_DATA_VIEW',
    'PATIENT_DATA_EXPORT',
    'MEDICATION_VIEW',
    'MEDICATION_MANAGE',
    'CAREGIVER_MANAGE',
    'DOCTOR_MANAGE',
    'ORDER_VIEW',
    'ORDER_MANAGE',
    'PAYMENT_VIEW',
    'REFUND_MANAGE',
    'CONTENT_CREATE',
    'CONTENT_PUBLISH',
    'CONTENT_DELETE',
    'NOTIFICATION_SEND',
    'NOTIFICATION_MANAGE',
    'REPORT_VIEW',
    'REPORT_EXPORT',
    'SUPPORT_MANAGE',
    'SUPPORT_REPLY',
    'AUDIT_VIEW',
    'AUDIT_EXPORT',
    'FEATURE_FLAG_MANAGE',
    'APP_VERSION_MANAGE',
    'PARTNER_MANAGE',
    'COUPON_MANAGE',
    'MODERATION_MANAGE',
  ],

  ADMIN: [
    'USER_VIEW',
    'USER_EDIT',
    'USER_SUSPEND',
    'USER_VERIFY',
    'USER_CREATE',
    'ORDER_VIEW',
    'ORDER_MANAGE',
    'CONTENT_CREATE',
    'CONTENT_PUBLISH',
    'NOTIFICATION_SEND',
    'NOTIFICATION_MANAGE',
    'REPORT_VIEW',
    'REPORT_EXPORT',
    'SUPPORT_MANAGE',
    'SUPPORT_REPLY',
    'AUDIT_VIEW',
    'PARTNER_MANAGE',
    'COUPON_MANAGE',
    'MODERATION_MANAGE',
    'FEATURE_FLAG_MANAGE',
    'APP_VERSION_MANAGE',
  ],

  CLINICAL_ADMIN: [
    'PATIENT_DATA_VIEW',
    'PATIENT_DATA_EXPORT',
    'MEDICATION_VIEW',
    'MEDICATION_MANAGE',
    'CAREGIVER_MANAGE',
    'DOCTOR_MANAGE',
    'ORDER_VIEW',
    'REPORT_VIEW',
    'REPORT_EXPORT',
    'AUDIT_VIEW',
    'CONTENT_PUBLISH',
  ],

  DOCTOR: [
    'PATIENT_DATA_VIEW',
    'MEDICATION_VIEW',
    'MEDICATION_MANAGE',
    'ORDER_VIEW',
    'REPORT_VIEW',
  ],

  FINANCE: [
    'PAYMENT_VIEW',
    'REFUND_MANAGE',
    'ORDER_VIEW',
    'REPORT_VIEW',
    'REPORT_EXPORT',
    'AUDIT_VIEW',
  ],

  SUPPORT_AGENT: [
    'USER_VIEW',
    'SUPPORT_MANAGE',
    'SUPPORT_REPLY',
    'ORDER_VIEW',
  ],

  PHARMACY_PARTNER: [
    'ORDER_VIEW',
    'ORDER_MANAGE',
  ],

  CAREGIVER: [
    'PATIENT_DATA_VIEW',
    'MEDICATION_VIEW',
  ],

  PATIENT: [
    'PATIENT_DATA_VIEW',
    'MEDICATION_VIEW',
  ],
};

/**
 * Validates whether a given user role possesses a specific permission.
 */
export function hasPermission(role: AdminRole, permission: AdminPermission): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
}

/**
 * Returns role display metadata (badge color, description, classification)
 */
export function getRoleBadgeInfo(role: AdminRole) {
  switch (role) {
    case 'SUPER_ADMIN':
      return { label: 'Super Admin', color: 'bg-purple-100 text-purple-900 border-purple-300' };
    case 'ADMIN':
      return { label: 'Operations Admin', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
    case 'CLINICAL_ADMIN':
      return { label: 'Clinical Admin', color: 'bg-teal-100 text-teal-900 border-teal-300' };
    case 'DOCTOR':
      return { label: 'Doctor (MD)', color: 'bg-blue-100 text-blue-900 border-blue-300' };
    case 'FINANCE':
      return { label: 'Finance & Billing', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    case 'SUPPORT_AGENT':
      return { label: 'Support Agent', color: 'bg-amber-100 text-amber-900 border-amber-300' };
    case 'PHARMACY_PARTNER':
      return { label: 'Pharmacy Partner', color: 'bg-cyan-100 text-cyan-900 border-cyan-300' };
    case 'CAREGIVER':
      return { label: 'Caregiver', color: 'bg-rose-100 text-rose-900 border-rose-300' };
    case 'PATIENT':
      return { label: 'Patient', color: 'bg-slate-100 text-slate-800 border-slate-300' };
  }
}
