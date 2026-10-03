import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertSeverity, AlertItem } from '../../types';
import {
  HeartHandshake,
  ShieldCheck,
  AlertTriangle,
  Bell,
  Clock,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Package,
  Calendar,
  Battery,
  Wifi,
  ChevronRight,
  TrendingUp,
  MapPin,
  FileText,
  User,
  Truck,
  History,
} from 'lucide-react';

interface CaregiverDashboardProps {
  onOpenRefill: (medicineId: string) => void;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({ onOpenRefill }) => {
  const {
    patient,
    caregiver,
    medicines,
    dosesToday,
    stockEvents,
    refillOrders,
    deliverRefill,
    alerts,
    dismissAlert,
    isOnline,
    batteryLevel,
    lastSyncTime,
    speakText,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'STOCK' | 'ALERTS' | 'REPORTS'>('OVERVIEW');
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'CRITICAL' | 'ATTENTION' | 'INFO'>('ALL');
  const [nudgeSent, setNudgeSent] = useState(false);

  // Status calculation
  const totalScheduled = dosesToday.length;
  const confirmedCount = dosesToday.filter((d) => d.status === 'TAKEN').length;
  const pendingCount = dosesToday.filter(
    (d) => d.status === 'REMINDER_SENT' || d.status === 'SCHEDULED'
  ).length;
  const unconfirmedOverdue = dosesToday.some((d) => d.status === 'REMINDER_SENT');

  const overallStatus = unconfirmedOverdue ? 'ATTENTION' : 'STABLE';

  const unreadAlerts = alerts.filter((a) => !a.isRead);
  const filteredAlerts = alerts.filter((a) => {
    if (alertFilter === 'ALL') return true;
    return a.severity === alertFilter;
  });

  const handleSendNudge = () => {
    setNudgeSent(true);
    speakText(`Sent gentle reminder notification to ${patient.name}'s phone.`);
    setTimeout(() => setNudgeSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Caregiver Identity Banner */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center font-bold text-lg">
              TG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 bg-white/15 px-2.5 py-0.5 rounded-full">
                  Caregiver Portal • Son
                </span>
                <span className="text-xs text-indigo-300 font-semibold">{caregiver.name}</span>
                <span className="text-xs text-indigo-200 font-mono hidden sm:inline">({caregiver.phone})</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Caring for {patient.name} (Father, {patient.age})
              </h2>
            </div>
          </div>

          {/* Quick Call Button */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${patient.phone}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-indigo-600" />
              <span>Call Father</span>
            </a>
            <button
              onClick={handleSendNudge}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-bold text-xs border border-indigo-500/40 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{nudgeSent ? 'Nudge Sent!' : 'Send Reminder'}</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 pt-5 border-t border-white/15 mt-5 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Status Overview' },
            { id: 'STOCK', label: `Stock & Refills (${medicines.filter((m) => m.currentStock <= m.reorderThreshold).length} Low)` },
            { id: 'ALERTS', label: `Alerts (${unreadAlerts.length})` },
            { id: 'REPORTS', label: 'Adherence Digest' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as 'OVERVIEW' | 'STOCK' | 'ALERTS' | 'REPORTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-white text-indigo-950 shadow-sm'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: OVERVIEW DASHBOARD (PRD §24) */}
      {activeSubTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* PATIENT HEALTH OVERVIEW BANNER */}
          <div
            className={`p-5 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              overallStatus === 'STABLE'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/90 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 ${
                  overallStatus === 'STABLE' ? 'bg-emerald-600' : 'bg-amber-600 animate-pulse'
                }`}
              >
                {overallStatus === 'STABLE' ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg">
                    {overallStatus === 'STABLE'
                      ? 'Overall Status: Stable'
                      : 'Overall Status: Attention Needed'}
                  </h3>
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                      overallStatus === 'STABLE'
                        ? 'bg-emerald-200/80 text-emerald-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {overallStatus === 'STABLE' ? 'Normal' : '1 Dose Pending'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {overallStatus === 'STABLE'
                    ? 'All doses on track. No active health alarms.'
                    : 'Metformin 500 mg (8:00 PM) has not been confirmed yet.'}
                </p>
              </div>
            </div>

            {/* Device Telemetry status */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold bg-white/70 px-3 py-2 rounded-2xl border border-slate-200">
              <span className="flex items-center gap-1 text-emerald-700">
                <Wifi className="w-3.5 h-3.5" />
                {isOnline ? 'Phone Online' : 'Local Mode'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700">
                <Battery className="w-3.5 h-3.5 text-emerald-600" />
                {batteryLevel}%
              </span>
              <span>•</span>
              <span className="text-slate-500">Sync: {lastSyncTime}</span>
            </div>
          </div>

          {/* MEDICATION TODAY TRACKER (PRD §24) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Ravi's Medication Today
                </h3>
                <p className="text-xs text-slate-500">
                  {totalScheduled} scheduled • {confirmedCount} confirmed • {pendingCount} unconfirmed
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                {Math.round((confirmedCount / totalScheduled) * 100)}% Adherence
              </span>
            </div>

            <div className="space-y-2.5">
              {dosesToday.map((dose) => (
                <div
                  key={dose.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    dose.status === 'TAKEN'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : dose.status === 'REMINDER_SENT'
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        dose.status === 'TAKEN'
                          ? 'bg-emerald-100 text-emerald-700'
                          : dose.status === 'REMINDER_SENT'
                          ? 'bg-amber-100 text-amber-700 animate-pulse'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {dose.status === 'TAKEN' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{dose.medicineName}</h4>
                      <p className="text-xs text-slate-500">
                        Scheduled: {dose.scheduledTime} ({dose.doseQuantity} {dose.unit})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        dose.status === 'TAKEN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : dose.status === 'REMINDER_SENT'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {dose.status === 'TAKEN'
                        ? `Taken at ${dose.actionTime}`
                        : dose.status === 'REMINDER_SENT'
                        ? 'Pending Confirmation'
                        : 'Scheduled'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MEDICINE STOCK RUNWAY & REFILL RECOMMENDED (PRD §24) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Medicine Runway & Refills</h3>
                <p className="text-xs text-slate-500">Days remaining before replenishment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {medicines.map((med) => {
                const daysLeft = Math.max(1, Math.round(med.currentStock / (med.schedules.length || 1)));
                const isLow = med.currentStock <= med.reorderThreshold;

                return (
                  <div
                    key={med.id}
                    className={`p-4 rounded-2xl border ${
                      isLow ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-900 text-sm">{med.name}</h4>
                      <span
                        className={`text-xs font-black ${
                          isLow ? 'text-amber-800' : 'text-slate-800'
                        }`}
                      >
                        {med.currentStock} {med.unit} left
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-2">
                      ~{daysLeft} days remaining ({med.strength})
                    </p>

                    {isLow && (
                      <button
                        onClick={() => onOpenRefill(med.id)}
                        className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Order Refill for Father
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: STOCK & REFILLS OVERSIGHT FOR CAREGIVER */}
      {activeSubTab === 'STOCK' && (
        <div className="space-y-6">
          {/* Active Deliveries Banner */}
          {refillOrders.filter((o) => o.status !== 'DELIVERED').length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                  <Truck className="w-5 h-5 text-indigo-600 animate-bounce" />
                  <span>Caregiver Pharmacy Delivery Tracker</span>
                </div>
                <span className="text-xs font-semibold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {refillOrders.filter((o) => o.status !== 'DELIVERED').length} active
                </span>
              </div>

              <div className="space-y-2.5">
                {refillOrders
                  .filter((o) => o.status !== 'DELIVERED')
                  .map((order) => (
                    <div
                      key={order.id}
                      className="bg-white p-4 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{order.medicineName}</h4>
                        <p className="text-xs text-slate-500">
                          {order.pharmacyName} • {order.price} • ETA: {order.estimatedDelivery}
                        </p>
                      </div>
                      <button
                        onClick={() => deliverRefill(order.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Received & Restock (+{order.quantity})</span>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Current Stock Inventory Cards */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Prescription Inventory Status</h3>
                <p className="text-xs text-slate-500">Real-time counts synced with Ravi's daily consumption</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {medicines.map((med) => {
                const dailyDoses = med.schedules.length || 1;
                const daysRemaining = Math.max(1, Math.round(med.currentStock / dailyDoses));
                const isLow = med.currentStock <= med.reorderThreshold;

                return (
                  <div
                    key={med.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isLow ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{med.name}</h4>
                        <p className="text-xs text-slate-500">{med.strength} • {med.instructions}</p>
                      </div>
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          isLow ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isLow ? 'Low Stock' : 'Good'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-2 p-2.5 rounded-xl bg-white/80 border border-slate-200 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Balance</span>
                        <span className="font-black text-slate-900 text-base">
                          {med.currentStock} <span className="text-xs font-normal text-slate-500">{med.unit}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Runway</span>
                        <span className={`font-black text-base ${isLow ? 'text-amber-700' : 'text-teal-700'}`}>
                          ~{daysRemaining} <span className="text-xs font-normal text-slate-500">days</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => onOpenRefill(med.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isLow
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        Order Refill via Pharmacy
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Stock Movements Ledger */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Inventory Movements Ledger</h3>
                <p className="text-xs text-slate-500">Every dose consumption and pharmacy delivery is deterministically logged</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Medicine</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Change</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockEvents.slice(0, 10).map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                        {new Date(ev.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">{ev.medicineName}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            ev.reason === 'DOSE_CONSUMED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : ev.reason === 'REFILL_RECEIVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {ev.reason.replace('_', ' ')}
                        </span>
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-black ${
                          ev.quantityChange > 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {ev.quantityChange > 0 ? `+${ev.quantityChange}` : ev.quantityChange}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                        {ev.resultingStock}
                      </td>
                      <td className="py-2 px-3 text-slate-500 italic max-w-xs truncate">
                        {ev.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ALERTS FEED WITH SEVERITY FILTERS (PRD §25) */}
      {activeSubTab === 'ALERTS' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
            {(['ALL', 'CRITICAL', 'ATTENTION', 'INFO'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setAlertFilter(sev)}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  alertFilter === sev
                    ? 'bg-indigo-700 text-white border-indigo-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {sev === 'ALL' && 'All Alerts'}
                {sev === 'CRITICAL' && '🔴 Critical (Emergency)'}
                {sev === 'ATTENTION' && '🟠 Attention'}
                {sev === 'INFO' && '🔵 Informational'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => {
                const isCrit = alert.severity === 'CRITICAL';
                const isAttn = alert.severity === 'ATTENTION';

                return (
                  <div
                    key={alert.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      isCrit
                        ? 'bg-rose-50 border-rose-300'
                        : isAttn
                        ? 'bg-amber-50/70 border-amber-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isCrit ? 'bg-rose-600' : isAttn ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                        />
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {alert.title}
                        </h4>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{alert.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{alert.description}</p>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/60 text-xs">
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="text-slate-500 hover:text-slate-700 font-bold"
                      >
                        {alert.isRead ? 'Acknowledged' : 'Mark as Acknowledged'}
                      </button>

                      {alert.actionRequired === 'CALL_PATIENT' && (
                        <a
                          href={`tel:${patient.phone}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-700 text-white font-bold hover:bg-indigo-800"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call Father</span>
                        </a>
                      )}

                      {alert.actionRequired === 'REFILL_ORDER' && alert.medicineId && (
                        <button
                          onClick={() => onOpenRefill(alert.medicineId!)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700"
                        >
                          Order Pharmacy Refill
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl text-slate-500 text-sm">
                No alerts matching this filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: CAREGIVER DIGEST & ADHERENCE (PRD §26) */}
      {activeSubTab === 'REPORTS' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Daily Caregiver Report</h3>
              <p className="text-xs text-slate-500">Automated synchronization with Ravi's app</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              75% Confirmed Today
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <p>
              <strong>Medication:</strong> 4 scheduled, 3 confirmed, 1 awaiting evening confirmation.
            </p>
            <p>
              <strong>Inventory:</strong> Metformin 500 mg has 4 tablets remaining (~2 days). Auto-refill recommendation sent.
            </p>
            <p>
              <strong>Observations:</strong> 1 camera-based check logged mild drowsiness earlier this afternoon.
            </p>
            <p>
              <strong>Summary:</strong> Ravi took his morning doses promptly. Evening check-in advised.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <a
              href={`tel:${patient.phone}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Ravi Kumar</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
