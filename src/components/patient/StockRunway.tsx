import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  AlertTriangle,
  ShoppingBag,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Truck,
  Plus,
  History,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  Edit3,
  X,
  PhoneCall,
} from 'lucide-react';
import { PharmacyRefillModal } from './PharmacyRefillModal';
import { StockEvent } from '../../types';

interface StockRunwayProps {
  onOpenRefill: (medicineId: string) => void;
}

export const StockRunway: React.FC<StockRunwayProps> = ({ onOpenRefill }) => {
  const {
    medicines,
    stockEvents,
    refillOrders,
    deliverRefill,
    adjustMedicineStock,
    caregiver,
    isAssistedMode,
    t,
  } = useApp();

  const [activeView, setActiveView] = useState<'RUNWAY' | 'HISTORY' | 'DELIVERIES'>('RUNWAY');
  const [selectedMedForRefill, setSelectedMedForRefill] = useState<string | null>(null);

  // History filtering
  const [selectedMedicineFilter, setSelectedMedicineFilter] = useState<string>('ALL');
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<string>('ALL');

  // Manual stock reconciliation modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustMedId, setAdjustMedId] = useState<string>(medicines[0]?.id || '');
  const [adjustCount, setAdjustCount] = useState<number>(medicines[0]?.currentStock || 0);
  const [adjustNotes, setAdjustNotes] = useState<string>('');

  // Active refills in transit
  const activeOrders = refillOrders.filter((o) => o.status !== 'DELIVERED');
  const deliveredOrders = refillOrders.filter((o) => o.status === 'DELIVERED');

  const filteredEvents = stockEvents.filter((ev) => {
    if (selectedMedicineFilter !== 'ALL' && ev.medicineId !== selectedMedicineFilter) return false;
    if (selectedReasonFilter !== 'ALL' && ev.reason !== selectedReasonFilter) return false;
    return true;
  });

  const handleOpenAdjust = (medId?: string) => {
    const target = medicines.find((m) => m.id === (medId || medicines[0]?.id)) || medicines[0];
    if (target) {
      setAdjustMedId(target.id);
      setAdjustCount(target.currentStock);
      setAdjustNotes('');
      setIsAdjustModalOpen(true);
    }
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const target = medicines.find((m) => m.id === adjustMedId);
    if (!target) return;
    const diff = adjustCount - target.currentStock;
    if (diff !== 0) {
      adjustMedicineStock(
        target.id,
        diff,
        'MANUAL_CORRECTION',
        adjustNotes || 'Manual physical pill count audit'
      );
    }
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Runway Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2
            className={`font-black text-slate-900 ${
              isAssistedMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}
          >
            Medicine Runway & Stock History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Visual supply countdowns, deterministic inventory ledger & pharmacy delivery sync
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => handleOpenAdjust()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-700" />
            <span>Audit / Count Stock</span>
          </button>
        </div>
      </div>

      {/* Caregiver Safety Connection Banner */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0" />
          <span className="text-indigo-950 font-medium">
            Proactive refill alerts are automatically sent to caregiver <strong>{caregiver.name} (Son)</strong> at{' '}
            <span className="font-mono font-semibold">{caregiver.phone}</span> when stock falls below reorder thresholds.
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-white px-2 py-0.5 rounded-full border border-indigo-200 self-start sm:self-auto">
          Auto-Sync Active
        </span>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveView('RUNWAY')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeView === 'RUNWAY'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 text-teal-700" />
          <span>Inventory Runway ({medicines.length})</span>
        </button>

        <button
          onClick={() => setActiveView('HISTORY')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeView === 'HISTORY'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4 text-indigo-700" />
          <span>Stock Movement Ledger ({stockEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveView('DELIVERIES')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeView === 'DELIVERIES'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4 text-purple-700" />
          <span>Pharmacy Orders & Deliveries ({refillOrders.length})</span>
        </button>
      </div>

      {/* VIEW 1: RUNWAY OVERVIEW */}
      {activeView === 'RUNWAY' && (
        <div className="space-y-6">
          {/* ACTIVE REFILL ORDERS BANNER (IF ANY) */}
          {activeOrders.length > 0 && (
            <section className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                  <Truck className="w-5 h-5 text-indigo-600 animate-bounce" />
                  <span>Active Pharmacy Deliveries in Transit</span>
                </div>
                <span className="text-xs font-semibold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {activeOrders.length} in progress
                </span>
              </div>

              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{order.medicineName}</h4>
                        <p className="text-xs text-slate-500">
                          From {order.pharmacyName} • {order.price}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        ETA: {order.estimatedDelivery}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                        <span className="text-emerald-700 font-bold">1. Confirmed</span>
                        <span className="text-indigo-700 font-bold">2. Preparing</span>
                        <span className="text-slate-400">3. Out for Delivery</span>
                        <span className="text-slate-400">4. Delivered</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full w-2/3 transition-all" />
                      </div>
                    </div>

                    {/* Delivery confirmation button */}
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => deliverRefill(order.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Received & Restock (+{order.quantity} units)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* MEDICINE RUNWAY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicines.map((med) => {
              const dailyDoses = med.schedules.length || 1;
              const daysRemaining = Math.max(1, Math.round(med.currentStock / dailyDoses));
              const isLow = med.currentStock <= med.reorderThreshold;
              const percentage = Math.min(100, Math.round((med.currentStock / 30) * 100));

              const completionDate = new Date();
              completionDate.setDate(completionDate.getDate() + daysRemaining);

              return (
                <div
                  key={med.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isLow
                      ? 'bg-amber-50/50 border-amber-300 shadow-sm'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 font-bold"
                        style={{ backgroundColor: med.colorHex }}
                      >
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                          {med.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {med.strength} • {med.schedules.map((s) => s.timeOfDay).join(' & ')}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isLow
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isLow ? 'Refill Needed' : 'Healthy Stock'}
                    </span>
                  </div>

                  {/* Runway Numbers */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-2xl bg-white/80 border border-slate-200 text-center">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase block">
                        Current Supply
                      </span>
                      <span
                        className={`text-2xl font-black ${
                          isLow ? 'text-amber-700' : 'text-slate-900'
                        }`}
                      >
                        {med.currentStock}{' '}
                        <span className="text-xs font-semibold text-slate-500">{med.unit}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase block">
                        Days Runway
                      </span>
                      <span
                        className={`text-2xl font-black ${
                          isLow ? 'text-rose-600' : 'text-teal-700'
                        }`}
                      >
                        ~{daysRemaining}{' '}
                        <span className="text-xs font-semibold text-slate-500">days</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>Supply runway</span>
                      <span>{percentage}% of 30-day target</span>
                    </div>
                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isLow ? 'bg-amber-500' : 'bg-teal-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Runs out:{' '}
                      <strong className="text-slate-700">
                        {completionDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenAdjust(med.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        title="Reconcile physical stock count"
                      >
                        Count
                      </button>
                      <button
                        onClick={() => setSelectedMedForRefill(med.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isLow
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isLow ? 'Order Refill' : 'Pre-order'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: HISTORICAL STOCK MOVEMENTS LEDGER */}
      {activeView === 'HISTORY' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Stock Movements & Audit Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Deterministic history of every dose consumed, refill received, and manual adjustment
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={selectedMedicineFilter}
                onChange={(e) => setSelectedMedicineFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Medicines</option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedReasonFilter}
                onChange={(e) => setSelectedReasonFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Reasons</option>
                <option value="DOSE_CONSUMED">Dose Consumed</option>
                <option value="REFILL_RECEIVED">Refill Received</option>
                <option value="INITIAL_STOCK">Initial Stock</option>
                <option value="MANUAL_CORRECTION">Manual Correction</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Medicine</th>
                  <th className="py-3 px-3">Transaction</th>
                  <th className="py-3 px-3 text-right">Change</th>
                  <th className="py-3 px-3 text-right">Resulting Balance</th>
                  <th className="py-3 px-3">Sync State</th>
                  <th className="py-3 px-3">Audit Details / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(ev.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        ,{' '}
                        {new Date(ev.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {ev.medicineName}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            ev.reason === 'DOSE_CONSUMED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : ev.reason === 'REFILL_RECEIVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ev.reason === 'MANUAL_CORRECTION'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {ev.reason.replace('_', ' ')}
                        </span>
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-black ${
                          ev.quantityChange > 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {ev.quantityChange > 0 ? `+${ev.quantityChange}` : ev.quantityChange}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                        {ev.resultingStock} units
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                            ev.syncState === 'SYNCED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {ev.syncState}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                        {ev.notes || '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      No stock movement events match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: PHARMACY ORDERS & DELIVERIES */}
      {activeView === 'DELIVERIES' && (
        <div className="space-y-6">
          {/* Active Orders Section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">In-Progress Refill Orders</h3>
                <p className="text-xs text-slate-500">Live order status and dispatch updates from registered pharmacies</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                {activeOrders.length} In Transit
              </span>
            </div>

            {activeOrders.length > 0 ? (
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{order.medicineName}</h4>
                        <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Pharmacy: <strong>{order.pharmacyName}</strong> • {order.price} • Ordered: {order.orderDate}
                      </p>
                      <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                        Estimated arrival: {order.estimatedDelivery}
                      </p>
                    </div>

                    <button
                      onClick={() => deliverRefill(order.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Received & Restock (+{order.quantity})</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl text-xs">
                No active pharmacy deliveries in progress right now.
              </div>
            )}
          </div>

          {/* Delivered Orders History */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Completed Delivery History</h3>
              <p className="text-xs text-slate-500">Fulfilled prescription packages that were successfully delivered and added to stock</p>
            </div>

            <div className="space-y-2.5">
              {deliveredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">{order.medicineName}</h4>
                    <p className="text-slate-500">
                      {order.pharmacyName} • {order.price} • Order placed: {order.orderDate}
                    </p>
                  </div>

                  <span className="flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Delivered (+{order.quantity} units restocked)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MANUAL STOCK COUNT ADJUSTMENT MODAL */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-700" />
                <h3 className="font-extrabold text-slate-900 text-base">Reconcile Physical Pill Count</h3>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Medicine</label>
                <select
                  value={adjustMedId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setAdjustMedId(id);
                    const target = medicines.find((m) => m.id === id);
                    if (target) setAdjustCount(target.currentStock);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-slate-50 text-slate-900"
                >
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.currentStock} {m.unit} currently)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Actual Physical Count ({medicines.find((m) => m.id === adjustMedId)?.unit || 'units'})
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={adjustCount}
                  onChange={(e) => setAdjustCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-base bg-white text-slate-900"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Net adjustment:{' '}
                  <strong className="font-bold">
                    {adjustCount - (medicines.find((m) => m.id === adjustMedId)?.currentStock || 0) > 0 ? '+' : ''}
                    {adjustCount - (medicines.find((m) => m.id === adjustMedId)?.currentStock || 0)} units
                  </strong>
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Audit Notes</label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g., Verified unopened blister strip in cabinet"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold"
                >
                  Save Count
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FOR REFILL / PHARMACY DISCOVERY */}
      {selectedMedForRefill && (
        <PharmacyRefillModal
          medicineId={selectedMedForRefill}
          onClose={() => setSelectedMedForRefill(null)}
        />
      )}
    </div>
  );
};
