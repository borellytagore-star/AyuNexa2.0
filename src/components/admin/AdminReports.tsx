import React, { useState } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  FileSpreadsheet,
  Download,
  Users,
  CreditCard,
  ShoppingBag,
  History,
  ShieldCheck,
  Calendar,
  Lock,
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const reportsList = [
    {
      id: 'users',
      title: 'User Demographics & Verification Roster',
      description: 'Comprehensive roster of registered patients, primary caregivers, doctors, and verification states.',
      icon: Users,
      color: 'text-purple-600 bg-purple-50',
      recordCount: '10 Accounts',
      containsSensitiveHealth: false,
    },
    {
      id: 'orders',
      title: 'Pharmacy Refills & Fulfillment Audit',
      description: 'Prescription refill requests, fulfilling partner pharmacies, order status timelines, and doorstep deliveries.',
      icon: ShoppingBag,
      color: 'text-amber-600 bg-amber-50',
      recordCount: '3 Orders',
      containsSensitiveHealth: true,
    },
    {
      id: 'payments',
      title: 'Financial Settlements & Idempotent Refunds',
      description: 'Transaction ledger across UPI, Cards, NetBanking, mock provider gateways, and refund logs.',
      icon: CreditCard,
      color: 'text-emerald-600 bg-emerald-50',
      recordCount: '3 Transactions',
      containsSensitiveHealth: false,
    },
    {
      id: 'audit',
      title: 'Append-Only Governance & Security Audit Trail',
      description: 'Immutable security log tracking role escalations, care plan authorizations, suspensions, and system syncs.',
      icon: History,
      color: 'text-indigo-600 bg-indigo-50',
      recordCount: '3+ Security Events',
      containsSensitiveHealth: true,
    },
  ];

  const handleDownload = (reportId: 'users' | 'payments' | 'orders' | 'audit') => {
    setDownloading(reportId);
    try {
      adminApi.downloadReportCsv(reportId);
    } catch (e: any) {
      alert(`Export error: ${e.message}`);
    } finally {
      setTimeout(() => setDownloading(null), 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-purple-700" />
          <span>Operational Reports & CSV Data Export</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate sanitized, compliance-ready CSV exports for administrative audits, clinical record reviews, and financial reconciliation.
        </p>
      </div>

      {/* Compliance Callout */}
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-purple-900">Data Minimization & Compliance Guard:</span>
          <p className="text-slate-600">
            Exported records automatically strip raw patient biometrics and sensitive passcodes. Every export request is logged to
            the immutable security audit trail with actor credentials and timestamp.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportsList.map((rep) => {
          const Icon = rep.icon;
          const isCurrentDownloading = downloading === rep.id;

          return (
            <div key={rep.id} className="ayunexa-card p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${rep.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">{rep.recordCount}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{rep.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{rep.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {rep.containsSensitiveHealth ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    <Lock className="w-3 h-3 text-purple-700" />
                    <span>Clinical Access Required</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-400">Standard Operational Ledger</span>
                )}

                <button
                  onClick={() => handleDownload(rep.id as any)}
                  disabled={Boolean(downloading)}
                  className="btn-ayunexa-primary text-xs"
                >
                  <Download className={`w-3.5 h-3.5 ${isCurrentDownloading ? 'animate-bounce' : ''}`} />
                  <span>{isCurrentDownloading ? 'Generating...' : 'Export CSV'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
