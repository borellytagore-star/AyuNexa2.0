import React, { useState } from 'react';
import { AyuNexaLogo } from '../common/AyuNexaLogo';
import { AdminRole } from '../../types/admin';
import { adminApi } from '../../services/adminApi';
import { getRoleBadgeInfo } from '../../services/adminRbac';

// Subcomponents
import { AdminDashboard } from './AdminDashboard';
import { AdminUsers } from './AdminUsers';
import { AdminRoles } from './AdminRoles';
import { AdminContent } from './AdminContent';
import { AdminNotifications } from './AdminNotifications';
import { AdminOrders } from './AdminOrders';
import { AdminPayments } from './AdminPayments';
import { AdminReports } from './AdminReports';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminSupport } from './AdminSupport';
import { AdminPartners } from './AdminPartners';
import { AdminModeration } from './AdminModeration';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminDevices } from './AdminDevices';
import { AdminFeatureFlags } from './AdminFeatureFlags';
import { AdminAppVersions } from './AdminAppVersions';
import { AdminCoupons } from './AdminCoupons';

import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileText,
  Bell,
  ShoppingBag,
  CreditCard,
  FileSpreadsheet,
  BarChart3,
  LifeBuoy,
  Building2,
  ShieldAlert,
  History,
  Smartphone,
  Sliders,
  Tag,
  ArrowLeft,
  Lock,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

interface AdminLayoutProps {
  onBackToApp: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToApp }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<AdminRole>('SUPER_ADMIN');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);

  const handleRoleChange = (role: AdminRole) => {
    setCurrentRole(role);
    adminApi.setActor(role, role === 'SUPER_ADMIN' ? 'usr-4' : 'usr-5');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Core' },
    { id: 'users', label: 'Users', icon: Users, category: 'Access' },
    { id: 'roles', label: 'Roles & RBAC', icon: ShieldCheck, category: 'Access' },
    { id: 'content', label: 'Content (CMS)', icon: FileText, category: 'Engagement' },
    { id: 'notifications', label: 'Notifications', icon: Bell, category: 'Engagement' },
    { id: 'orders', label: 'Refill Orders', icon: ShoppingBag, category: 'Operations' },
    { id: 'payments', label: 'Payments & Refunds', icon: CreditCard, category: 'Operations' },
    { id: 'reports', label: 'Reports & CSV', icon: FileSpreadsheet, category: 'Intelligence' },
    { id: 'analytics', label: 'Live Analytics', icon: BarChart3, category: 'Intelligence' },
    { id: 'support', label: 'Support Desk', icon: LifeBuoy, category: 'Support' },
    { id: 'partners', label: 'Partners & Vendors', icon: Building2, category: 'Ecosystem' },
    { id: 'moderation', label: 'Content Moderation', icon: ShieldAlert, category: 'Governance' },
    { id: 'audit', label: 'Audit Logs', icon: History, category: 'Governance' },
    { id: 'devices', label: 'Devices & Sessions', icon: Smartphone, category: 'Security' },
    { id: 'feature-flags', label: 'Feature Flags', icon: Sliders, category: 'System' },
    { id: 'app-versions', label: 'App Versions', icon: Smartphone, category: 'System' },
    { id: 'coupons', label: 'Refill Coupons', icon: Tag, category: 'Operations' },
  ];

  return (
    <div className="min-h-screen bg-[#faf8fa] flex flex-col font-sans text-slate-900 selection:bg-purple-900 selection:text-white">
      {/* Top Admin Navigation Header */}
      <header className="bg-white border-b border-purple-100 sticky top-0 z-40 px-4 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpenMobile((prev) => !prev)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {isSidebarOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <AyuNexaLogo variant="horizontal" showTagline={false} size={32} />

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              <span className="text-xs font-black tracking-wide text-purple-950 uppercase">
                Operations Console
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                16 Modules Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Persona Simulation Switcher for Demo / Evaluation */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-semibold pl-1.5 text-[11px] hidden md:inline">
                Simulate Role:
              </span>
              <select
                value={currentRole}
                onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-purple-950 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="SUPER_ADMIN">Super Admin (Kavita)</option>
                <option value="ADMIN">Operations Admin (Suresh)</option>
                <option value="CLINICAL_ADMIN">Clinical Admin</option>
                <option value="FINANCE">Finance (Vikram)</option>
                <option value="SUPPORT_AGENT">Support (Ananya)</option>
                <option value="PHARMACY_PARTNER">Pharmacy Partner</option>
              </select>
            </div>

            {/* Back to Client App Button */}
            <button
              onClick={onBackToApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-950 font-bold text-xs transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-purple-700" />
              <span>Return to App</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex">
        {/* Left Navigation Sidebar */}
        <aside
          className={`fixed lg:sticky top-14 bottom-0 left-0 z-30 w-64 bg-white border-r border-purple-100 p-3 overflow-y-auto transition-transform ${
            isSidebarOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Administration & Operations
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpenMobile(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#4a044e] to-[#701a75] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-purple-50/70 hover:text-purple-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-purple-700'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                </button>
              );
            })}
          </div>

          {/* Security Policy Reminder */}
          <div className="mt-8 p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1 text-purple-900 font-bold">
              <Lock className="w-3 h-3 text-purple-700" />
              <span>Least Privilege Active</span>
            </div>
            <p>Every admin action generates an immutable append-only audit event.</p>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden min-w-0">
          {activeTab === 'dashboard' && (
            <AdminDashboard onNavigateTab={(tab) => setActiveTab(tab)} currentRole={currentRole} />
          )}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'roles' && <AdminRoles />}
          {activeTab === 'content' && <AdminContent />}
          {activeTab === 'notifications' && <AdminNotifications />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'payments' && <AdminPayments />}
          {activeTab === 'reports' && <AdminReports />}
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'support' && <AdminSupport />}
          {activeTab === 'partners' && <AdminPartners />}
          {activeTab === 'moderation' && <AdminModeration />}
          {activeTab === 'audit' && <AdminAuditLogs />}
          {activeTab === 'devices' && <AdminDevices />}
          {activeTab === 'feature-flags' && <AdminFeatureFlags />}
          {activeTab === 'app-versions' && <AdminAppVersions />}
          {activeTab === 'coupons' && <AdminCoupons />}
        </main>
      </div>
    </div>
  );
};
