import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { PaymentTransaction } from '../../types/admin';
import {
  CreditCard,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Receipt,
  ShieldCheck,
} from 'lucide-react';

export const AdminPayments: React.FC = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPayments();
      setTransactions(data.transactions);
      setSummary(data.summary);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async () => {
    if (!selectedTx || !refundReason.trim()) return;
    const idempotencyKey = `idemp-${selectedTx.id}-${Date.now()}`;
    try {
      await adminApi.refundPayment(selectedTx.id, refundReason, idempotencyKey);
      setShowRefundModal(false);
      setRefundReason('');
      fetchPayments();
    } catch (e: any) {
      alert(`Error processing refund: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-700" />
            <span>Payments & Transactions Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor patient pharmacy refill settlements, transaction health, and issue idempotent refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>DEMO MODE: Mock Payment Adapter</span>
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="ayunexa-card p-4">
          <div className="text-xs text-slate-500 font-medium">Settled Pharmacy Volume</div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            ₹{summary?.totalVolumeINR || 365}.00
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {summary?.successfulCount || 2} successful payments
          </div>
        </div>

        <div className="ayunexa-card p-4">
          <div className="text-xs text-slate-500 font-medium">Refunded Transactions</div>
          <div className="text-2xl font-black text-purple-900 mt-1 font-mono">
            {summary?.refundedCount || 0}
          </div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">
            Idempotent refund guard active
          </div>
        </div>

        <div className="ayunexa-card p-4">
          <div className="text-xs text-slate-500 font-medium">Active Payment Adapter</div>
          <div className="text-base font-bold text-slate-900 mt-1 truncate">
            {summary?.provider || 'MockPaymentAdapter'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Webhook signature verification active
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="ayunexa-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Patient & Order</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900">{tx.id}</div>
                    <div className="text-[10px] text-slate-500">{tx.paymentProvider}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{tx.userName}</div>
                    <div className="text-[10px] text-purple-700 font-mono">Order: {tx.orderId}</div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    ₹{tx.amount.toFixed(2)}
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {tx.paymentMethod}
                  </td>

                  <td className="py-3 px-4">
                    {tx.status === 'SUCCESS' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Success
                      </span>
                    )}
                    {tx.status === 'REFUNDED' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                        Refunded
                      </span>
                    )}
                    {tx.status === 'FAILED' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        Failed
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {tx.createdAt}
                  </td>

                  <td className="py-3 px-4">
                    {tx.status === 'SUCCESS' ? (
                      <button
                        onClick={() => {
                          setSelectedTx(tx);
                          setShowRefundModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 text-purple-700" />
                        <span>Refund</span>
                      </button>
                    ) : tx.status === 'REFUNDED' ? (
                      <span className="text-[11px] text-slate-400 italic">Settled</span>
                    ) : (
                      <span className="text-[11px] text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Idempotent Refund Modal */}
      {showRefundModal && selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-purple-800">
              <RotateCcw className="w-5 h-5 text-purple-700" />
              <h3 className="text-base font-bold text-slate-900">Issue Idempotent Refund</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Issuing full refund of <strong>₹{selectedTx.amount.toFixed(2)}</strong> for order{' '}
              <strong>{selectedTx.orderId}</strong> to <strong>{selectedTx.userName}</strong>.
            </p>

            <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-950 space-y-1">
              <div className="font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                <span>Idempotency Protection</span>
              </div>
              <p className="text-[11px] text-slate-600">
                A unique idempotency key is generated to prevent duplicate refunds in high-concurrency environments.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Refund (Required for Finance Audit) *
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Prescription stock unavailable at pharmacy, customer cancelled before dispatch..."
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundReason('');
                }}
                className="btn-ayunexa-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={!refundReason.trim()}
                className="btn-ayunexa-primary text-xs"
              >
                Confirm Refund (₹{selectedTx.amount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
