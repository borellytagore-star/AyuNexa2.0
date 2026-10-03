import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { AdminRefillOrder, AdminOrderStatus } from '../../types/admin';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  FileCheck,
  Building2,
  RefreshCw,
  Eye,
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminRefillOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminRefillOrder | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getOrders();
      setOrders(data.orders);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: AdminOrderStatus, notes?: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, status, notes);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status, notes: notes || prev.notes } : null));
      }
    } catch (e: any) {
      alert(`Error updating order: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-700" />
            <span>Pharmacy Refill & Order Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate prescription fulfillment, track pharmacy dispatch status, and resolve clinical dosage change alerts.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Medication Plan Mismatch Safety Banner */}
      {orders.some((o) => o.medicationPlanChanged) && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-900">Clinical Safety Alert: Medication Plan Mismatch</span>
            <p className="text-slate-700">
              One or more orders require clinical review because the patient's care plan was modified after the refill request was placed.
              Prescription medicines must never be automatically substituted without authorized doctor approval.
            </p>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="ayunexa-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Prescription Item</th>
                <th className="py-3 px-4">Partner Pharmacy</th>
                <th className="py-3 px-4">Prescription Gate</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold font-mono text-slate-900">{o.id}</div>
                    <div className="text-[10px] text-slate-500">{o.orderDate}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{o.patientName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">ID: {o.patientId}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-purple-950">{o.medicineName}</div>
                    <div className="text-[11px] text-slate-600">
                      Qty: {o.quantity} units · <strong>{o.priceFormatted}</strong>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Building2 className="w-3.5 h-3.5 text-cyan-700" />
                      <span>{o.pharmacyName}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {o.medicationPlanChanged ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        ⚠ Plan Changed Review
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Verified Valid
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        o.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : o.status === 'PROCESSING'
                          ? 'bg-blue-100 text-blue-800'
                          : o.status === 'REQUIRES_REVIEW'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-purple-100 text-purple-900'
                      }`}
                    >
                      {o.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {o.status === 'REQUIRES_REVIEW' && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(o.id, 'CONFIRMED', 'Doctor approved modified dosage.')
                          }
                          className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 font-semibold text-[11px] cursor-pointer"
                        >
                          Resolve & Approve
                        </button>
                      )}

                      {o.status === 'PROCESSING' && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'OUT_FOR_DELIVERY', 'Dispatched with delivery partner.')}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 font-semibold text-[11px] cursor-pointer"
                        >
                          Dispatch
                        </button>
                      )}

                      {o.status === 'OUT_FOR_DELIVERY' && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'DELIVERED', 'Delivered at patient doorstep.')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold text-[11px] cursor-pointer"
                        >
                          Confirm Delivery
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Refill Order Details</h3>
                <span className="text-xs text-slate-500 font-mono">ID: {selectedOrder.id}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                <span className="text-slate-500 block mb-0.5">Medicine Prescribed</span>
                <span className="text-base font-bold text-purple-950">{selectedOrder.medicineName}</span>
                <div className="text-slate-600 mt-1">
                  Quantity: {selectedOrder.quantity} units · Price: {selectedOrder.priceFormatted}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Patient</span>
                  <span className="font-semibold text-slate-900">{selectedOrder.patientName}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Fulfilling Pharmacy</span>
                  <span className="font-semibold text-slate-900">{selectedOrder.pharmacyName}</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Delivery Address</span>
                <span className="font-medium text-slate-900">{selectedOrder.deliveryAddress}</span>
              </div>

              {selectedOrder.notes && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold block">Triage Note:</span>
                  <span>{selectedOrder.notes}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedOrder(null)} className="btn-ayunexa-secondary text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
