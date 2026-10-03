import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { AdminNotificationBroadcast, ContentAudience } from '../../types/admin';
import {
  Send,
  Bell,
  Clock,
  CheckCircle2,
  Users,
  AlertTriangle,
  Smartphone,
  Plus,
  Radio,
} from 'lucide-react';

export const AdminNotifications: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<AdminNotificationBroadcast[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<ContentAudience | 'ALL_USERS'>('ALL_USERS');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'SAFETY_CRITICAL'>('NORMAL');
  const [channel, setChannel] = useState<'IN_APP' | 'PUSH' | 'BOTH'>('BOTH');

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getNotifications();
      setBroadcasts(data.broadcasts);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    try {
      await adminApi.sendNotification({
        title,
        body,
        audience,
        priority,
        channel,
      });
      setShowCreateModal(false);
      setTitle('');
      setBody('');
      fetchBroadcasts();
    } catch (e: any) {
      alert(`Error sending notification: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-700" />
            <span>Notification & Announcement Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compose and broadcast targeted announcements, caregiver advisories, and critical health reminders.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-ayunexa-primary text-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Safety Policy Notice */}
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-purple-900">Safety Priority Constraint:</span>
          <p className="text-slate-600">
            Administrative marketing broadcasts are strictly prioritized BELOW safety-critical medication reminders and emergency SOS alerts.
            Notifications will never override scheduled dose chimes or quiet-hours consent preferences.
          </p>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="ayunexa-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Broadcast Subject</th>
                <th className="py-3 px-4">Target Audience</th>
                <th className="py-3 px-4">Priority & Channel</th>
                <th className="py-3 px-4">Delivery Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Created By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {broadcasts.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-bold text-slate-900">{b.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{b.body}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {b.audience}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          b.priority === 'SAFETY_CRITICAL'
                            ? 'bg-rose-100 text-rose-900'
                            : b.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {b.priority}
                      </span>
                      <span className="text-[11px] text-slate-500">{b.channel}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold text-slate-800">
                        {b.deliveredCount} / {b.recipientCount} Delivered
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {b.sentAt || b.createdAt}
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {b.createdBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compose Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Compose New Broadcast</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled Clinical Follow-Up"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="ALL_USERS">All Users</option>
                    <option value="PATIENTS">Patients Only</option>
                    <option value="CAREGIVERS">Caregivers Only</option>
                    <option value="DOCTORS">Doctors Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="LOW">Low (Informational)</option>
                    <option value="HIGH">High (Important)</option>
                    <option value="SAFETY_CRITICAL">Safety Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message Body *</label>
                <textarea
                  rows={4}
                  placeholder="Type clear and concise announcement text..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Channel</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="channel"
                      checked={channel === 'BOTH'}
                      onChange={() => setChannel('BOTH')}
                    />
                    <span>Push & In-App</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="channel"
                      checked={channel === 'IN_APP'}
                      onChange={() => setChannel('IN_APP')}
                    />
                    <span>In-App Only</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-ayunexa-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!title.trim() || !body.trim()}
                className="btn-ayunexa-primary text-xs"
              >
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
