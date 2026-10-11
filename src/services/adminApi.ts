import { supabase } from '../lib/supabase';
import {
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
  AdminRole,
} from '../types/admin';

class AdminApiService {
  // Kept for UI compatibility only. The API server never trusts client-supplied roles.
  private currentRole: AdminRole = 'PATIENT';

  setActor(role: AdminRole, _userId: string = '') {
    this.currentRole = role;
  }

  getActorRole(): AdminRole {
    return this.currentRole;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (error || !accessToken) {
      throw new Error('You must be signed in to access the Operations API.');
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
  }

  async getAuthSession() {
    const res = await fetch('/api/auth/me', { headers: await this.getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async getUsers(q: string = '', role: string = 'ALL', status: string = 'ALL') {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (role && role !== 'ALL') params.set('role', role);
    if (status && status !== 'ALL') params.set('status', status);

    const res = await fetch(`/api/admin/users?${params.toString()}`, { headers: await this.getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { total: number; users: AdminUser[] };
  }

  async updateUserStatus(id: string, status: string, reason: string) {
    const res = await fetch(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify({ status, reason }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async verifyUser(id: string) {
    const res = await fetch(`/api/admin/users/${id}/verify`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async getAuditLogs(q: string = '') {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    const res = await fetch(`/api/admin/audit-logs${params}`, { headers: await this.getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { logs: AdminAuditLog[] };
  }

  async getContent() {
    const res = await fetch('/api/admin/content', { headers: await this.getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { items: ContentItem[] };
  }

  async createContent(item: Partial<ContentItem>) {
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async deleteContent(id: string) {
    const res = await fetch(`/api/admin/content/${id}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async getPayments() {
    const res = await fetch('/api/admin/payments', { headers: await this.getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as {
      transactions: PaymentTransaction[];
      summary: {
        totalVolumeINR: number;
        successfulCount: number;
        refundedCount: number;
        failedCount: number;
        provider: string;
      };
    };
  }

  async refundPayment(id: string, reason: string, idempotencyKey: string) {
    const res = await fetch(`/api/admin/payments/${id}/refund`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify({ reason, idempotencyKey }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async getNotifications() {
    const res = await fetch('/api/admin/notifications', { headers: await this.getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { broadcasts: AdminNotificationBroadcast[] };
  }

  async sendNotification(broadcast: Partial<AdminNotificationBroadcast>) {
    const res = await fetch('/api/admin/notifications', {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(broadcast),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async getOrders() {
    const res = await fetch('/api/admin/orders', { headers: await this.getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { orders: AdminRefillOrder[] };
  }

  async updateOrderStatus(id: string, status: string, notes?: string) {
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async getSupportTickets() {
    const res = await fetch('/api/admin/support', { headers: await this.getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { tickets: SupportTicket[] };
  }

  async sendSupportMessage(ticketId: string, text: string, isInternal: boolean) {
    const res = await fetch(`/api/admin/support/${ticketId}/messages`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify({ text, isInternal }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async getAnalytics() {
    const res = await fetch('/api/admin/analytics', { headers: await this.getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { metrics: AdminAnalyticsMetrics };
  }

  async getConfiguration() {
    const res = await fetch('/api/admin/configuration', { headers: await this.getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { flags: FeatureFlag[] };
  }

  async toggleFeatureFlag(key: string, isEnabled: boolean, reason?: string) {
    const res = await fetch(`/api/admin/configuration/flags/${key}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify({ isEnabled, reason }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async getAppVersions() {
    const res = await fetch('/api/admin/app-versions', { headers: await this.getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { versions: AppVersionConfig[] };
  }

  async updateAppVersion(platform: string, data: Partial<AppVersionConfig>) {
    const res = await fetch(`/api/admin/app-versions/${platform}`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async getCoupons() {
    const res = await fetch('/api/admin/coupons', { headers: await this.getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { coupons: CouponItem[] };
  }

  async createCoupon(data: Partial<CouponItem>) {
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async getPartners() {
    const res = await fetch('/api/admin/partners', { headers: await this.getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { partners: PartnerVendor[] };
  }

  async updatePartnerStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/partners/${id}/status`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async getModerationItems() {
    const res = await fetch('/api/admin/moderation', { headers: await this.getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { items: ModerationItem[] };
  }

  async actionModerationItem(id: string, action: string, notes?: string) {
    const res = await fetch(`/api/admin/moderation/${id}/action`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify({ action, notes }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async getDevices() {
    const res = await fetch('/api/admin/devices', { headers: await this.getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { devices: UserSessionDevice[] };
  }

  async revokeDeviceSession(id: string) {
    const res = await fetch(`/api/admin/devices/${id}/revoke`, {
      method: 'POST',
      headers: await this.getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async downloadReportCsv(type: 'users' | 'payments' | 'orders' | 'audit') {
    const response = await fetch(`/api/admin/reports/${type}/export`, {
      headers: await this.getHeaders(),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ayunexa-${type}-report.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
}

export const adminApi = new AdminApiService();
