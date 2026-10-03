import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { AdminUser, AdminRole, UserAccountStatus } from '../../types/admin';
import { getRoleBadgeInfo } from '../../services/adminRbac';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Shield,
  Smartphone,
  Eye,
  RefreshCw,
  UserCheck,
  Lock,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers(search, roleFilter, statusFilter);
      setUsers(data.users);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const handleVerify = async (userId: string) => {
    try {
      await adminApi.verifyUser(userId);
      fetchUsers();
    } catch (e: any) {
      alert(`Error verifying user: ${e.message}`);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser || !suspendReason.trim()) return;
    try {
      await adminApi.updateUserStatus(selectedUser.id, 'SUSPENDED', suspendReason);
      setShowSuspendModal(false);
      setSuspendReason('');
      fetchUsers();
    } catch (e: any) {
      alert(`Error suspending user: ${e.message}`);
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      await adminApi.updateUserStatus(userId, 'ACTIVE', 'Reactivated by administrator after review.');
      fetchUsers();
    } catch (e: any) {
      alert(`Error reactivating user: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Privacy Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-700" />
            <span>User Identity & Access Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View profiles, manage verification status, enforce account suspensions, and monitor active sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-purple-700" />
            <span>Healthcare Data Isolation Active</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="ayunexa-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="PATIENT">Patients</option>
            <option value="CAREGIVER">Caregivers</option>
            <option value="DOCTOR">Doctors</option>
            <option value="PHARMACY_PARTNER">Pharmacy Partners</option>
            <option value="SUPPORT_AGENT">Support Agents</option>
            <option value="FINANCE">Finance</option>
            <option value="ADMIN">Operations Admins</option>
            <option value="SUPER_ADMIN">Super Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          <button
            onClick={fetchUsers}
            title="Refresh User List"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="ayunexa-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User & Contact</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Identity Verification</th>
                <th className="py-3 px-4">Active Sessions</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const badge = getRoleBadgeInfo(u.role);
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                      {u.assignedDoctorName && (
                        <div className="text-[10px] text-slate-500 mt-1">MD: {u.assignedDoctorName}</div>
                      )}
                      {u.assignedCaregiverName && (
                        <div className="text-[10px] text-slate-500">Caregiver: {u.assignedCaregiverName}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.status === 'ACTIVE' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Active
                        </span>
                      )}
                      {u.status === 'PENDING_VERIFICATION' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Pending Verification
                        </span>
                      )}
                      {u.status === 'SUSPENDED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          Suspended
                        </span>
                      )}
                      {u.status === 'BLOCKED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-400">
                          Blocked
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.isVerified ? (
                        <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-700 font-semibold">
                          <XCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Unverified</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 font-mono">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.activeSessionsCount} active</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Last: {u.lastActiveAt}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {!u.isVerified && (
                          <button
                            onClick={() => handleVerify(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold text-[11px] cursor-pointer"
                          >
                            Verify
                          </button>
                        )}

                        {u.status === 'ACTIVE' ? (
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowSuspendModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 font-semibold text-[11px] cursor-pointer"
                          >
                            Suspend
                          </button>
                        ) : u.status === 'SUSPENDED' ? (
                          <button
                            onClick={() => handleReactivate(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 font-semibold text-[11px] cursor-pointer"
                          >
                            Reactivate
                          </button>
                        ) : null}

                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          title="View Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend User Modal */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertOctagon className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Suspend Account Access</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to suspend <strong>{selectedUser.name}</strong> ({selectedUser.email})?
              All active sessions will be terminated and emergency contacts will be notified if applicable.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Suspension (Recorded in Audit Log) *
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Identity verification failure, reported compromised credentials..."
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspendReason('');
                }}
                className="btn-ayunexa-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={!suspendReason.trim()}
                className="btn-ayunexa-destructive text-xs"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Detail Drawer Modal */}
      {selectedUser && !showSuspendModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedUser.name}</h3>
                <span className="text-xs text-slate-500 font-mono">ID: {selectedUser.id}</span>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Email</span>
                <span className="font-semibold text-slate-900">{selectedUser.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Phone</span>
                <span className="font-semibold text-slate-900 font-mono">{selectedUser.phone}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Assigned Role</span>
                <span className="font-semibold text-purple-900">{selectedUser.role}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Account Status</span>
                <span className="font-semibold text-emerald-800">{selectedUser.status}</span>
              </div>
            </div>

            {selectedUser.notes && (
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs">
                <span className="text-purple-900 font-bold block mb-1">Administrative Notes:</span>
                <p className="text-slate-600">{selectedUser.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedUser(null)} className="btn-ayunexa-secondary text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
