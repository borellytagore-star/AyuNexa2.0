import React, { useState } from 'react';
import { AdminRole, AdminPermission } from '../../types/admin';
import { ROLE_PERMISSIONS, hasPermission, getRoleBadgeInfo } from '../../services/adminRbac';
import { ShieldCheck, Lock, AlertCircle, Check, X } from 'lucide-react';

export const AdminRoles: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<AdminRole>('SUPER_ADMIN');

  const allRoles: AdminRole[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'CLINICAL_ADMIN',
    'DOCTOR',
    'CAREGIVER',
    'PATIENT',
    'PHARMACY_PARTNER',
    'SUPPORT_AGENT',
    'FINANCE',
  ];

  const permissionCategories: { name: string; permissions: { key: AdminPermission; desc: string; isSensitive?: boolean }[] }[] = [
    {
      name: 'User & Identity Management',
      permissions: [
        { key: 'USER_VIEW', desc: 'Search and inspect user profiles and active status' },
        { key: 'USER_EDIT', desc: 'Update contact info and basic profile records' },
        { key: 'USER_SUSPEND', desc: 'Suspend or reactivate accounts with audit reason', isSensitive: true },
        { key: 'USER_VERIFY', desc: 'Approve identity documents and phone verification' },
        { key: 'USER_CREATE', desc: 'Create internal staff and support accounts' },
        { key: 'USER_DELETE', desc: 'Hard deletion / GDPR purge (Super Admin only)', isSensitive: true },
      ],
    },
    {
      name: 'Healthcare & Clinical Records (Strictly Guarded)',
      permissions: [
        { key: 'PATIENT_DATA_VIEW', desc: 'Access medical history, diagnoses, and allergies', isSensitive: true },
        { key: 'PATIENT_DATA_EXPORT', desc: 'Generate HIPAA/NABH clinical exports', isSensitive: true },
        { key: 'MEDICATION_VIEW', desc: 'View current prescription dosage and schedules' },
        { key: 'MEDICATION_MANAGE', desc: 'Authorize or modify clinical medication regimens', isSensitive: true },
        { key: 'CAREGIVER_MANAGE', desc: 'Authorize or revoke caregiver proxy access' },
        { key: 'DOCTOR_MANAGE', desc: 'Assign primary doctors to patient care plans' },
      ],
    },
    {
      name: 'Pharmacy Orders & Refill Operations',
      permissions: [
        { key: 'ORDER_VIEW', desc: 'Inspect refill delivery orders and status' },
        { key: 'ORDER_MANAGE', desc: 'Process, dispatch, or flag prescription mismatch' },
      ],
    },
    {
      name: 'Billing & Payments',
      permissions: [
        { key: 'PAYMENT_VIEW', desc: 'View transaction ledgers, gateways, and payment status' },
        { key: 'REFUND_MANAGE', desc: 'Issue idempotent refunds to patients', isSensitive: true },
      ],
    },
    {
      name: 'Content & Notifications',
      permissions: [
        { key: 'CONTENT_CREATE', desc: 'Draft non-clinical health education and banners' },
        { key: 'CONTENT_PUBLISH', desc: 'Publish announcements (requires clinical review for health info)' },
        { key: 'NOTIFICATION_SEND', desc: 'Broadcast push and in-app notifications' },
        { key: 'NOTIFICATION_MANAGE', desc: 'Cancel scheduled broadcasts and review analytics' },
      ],
    },
    {
      name: 'Support & Audit Governance',
      permissions: [
        { key: 'SUPPORT_MANAGE', desc: 'Triage, assign, and resolve user support tickets' },
        { key: 'SUPPORT_REPLY', desc: 'Post responses and private internal triage notes' },
        { key: 'AUDIT_VIEW', desc: 'Inspect immutable system security and activity log' },
        { key: 'AUDIT_EXPORT', desc: 'Export compliance audit records as CSV' },
        { key: 'FEATURE_FLAG_MANAGE', desc: 'Toggle runtime application capability flags' },
        { key: 'APP_VERSION_MANAGE', desc: 'Manage minimum supported app versions & maintenance' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-700" />
          <span>Role-Based Access Control (RBAC) Matrix</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          AyuNexa enforces strict least-privilege security. Clinical data access requires authorized medical roles,
          while operations and billing staff operate in isolated domains.
        </p>
      </div>

      {/* Safety Guardrail Callout */}
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3">
        <Lock className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-purple-900">Healthcare Safety Guardrail:</span>
          <p className="text-slate-600">
            Operations Admins, Support Agents, and Finance staff are strictly prohibited from viewing or modifying private clinical
            diagnoses, medical notes, or prescribing actions. Any attempt at privilege escalation triggers an immediate immutable audit alert.
          </p>
        </div>
      </div>

      {/* Role Picker Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200">
        {allRoles.map((role) => {
          const badge = getRoleBadgeInfo(role);
          const isSelected = selectedRole === role;
          return (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-purple-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {badge.label}
            </button>
          );
        })}
      </div>

      {/* Role Summary Card */}
      <div className="ayunexa-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getRoleBadgeInfo(selectedRole).color}`}>
              {getRoleBadgeInfo(selectedRole).label}
            </span>
            <span className="text-xs text-slate-500 font-mono">Role ID: {selectedRole}</span>
          </div>

          <span className="text-xs font-bold text-purple-900 bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">
            {ROLE_PERMISSIONS[selectedRole]?.length || 0} Permissions Granted
          </span>
        </div>

        <p className="text-xs text-slate-600">
          {selectedRole === 'SUPER_ADMIN' && 'Full administrative configuration across all platform capabilities, security rules, and user lifecycles.'}
          {selectedRole === 'ADMIN' && 'Day-to-day operations management: user support, content publishing, notification broadcasts, and partner management.'}
          {selectedRole === 'CLINICAL_ADMIN' && 'Authorized clinical administrator managing doctor assignments, care plan governance, and clinical compliance.'}
          {selectedRole === 'DOCTOR' && 'Registered medical practitioner managing treatment regimens, care plan authorizations, and medication schedules.'}
          {selectedRole === 'FINANCE' && 'Financial operations specialist managing payment transactions, gateways, and authorized refund requests.'}
          {selectedRole === 'SUPPORT_AGENT' && 'Customer success and caregiver helpline agent with ticket management and contact verification.'}
          {selectedRole === 'PHARMACY_PARTNER' && 'Verified external pharmacy partner managing refill fulfillment, delivery coordination, and stock verification.'}
          {selectedRole === 'CAREGIVER' && 'Family member or professional caregiver with proxy access strictly limited to authorized patient.'}
          {selectedRole === 'PATIENT' && 'Self-service patient access strictly limited to own profile, medication schedule, and consent preferences.'}
        </p>
      </div>

      {/* Detailed Permissions Grid */}
      <div className="space-y-4">
        {permissionCategories.map((cat) => (
          <div key={cat.name} className="ayunexa-card overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800">{cat.name}</h3>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Permission Status</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {cat.permissions.map((perm) => {
                const granted = hasPermission(selectedRole, perm.key);
                return (
                  <div key={perm.key} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono text-[11px]">{perm.key}</span>
                        {perm.isSensitive && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                            SENSITIVE HEALTH / SECURITY
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{perm.desc}</p>
                    </div>

                    <div>
                      {granted ? (
                        <div className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Enabled</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
                          <X className="w-3.5 h-3.5 text-slate-400" />
                          <span>Denied</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
