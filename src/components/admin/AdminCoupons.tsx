import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { CouponItem } from '../../types/admin';
import {
  Tag,
  Plus,
  CheckCircle2,
  XCircle,
  Calendar,
  Percent,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED');
  const [discountValue, setDiscountValue] = useState(50);
  const [usageLimit, setUsageLimit] = useState(100);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCoupons();
      setCoupons(data.coupons);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async () => {
    if (!code.trim()) return;
    try {
      await adminApi.createCoupon({
        code,
        description,
        discountType,
        discountValue,
        usageLimit,
      });
      setShowCreateModal(false);
      setCode('');
      setDescription('');
      fetchCoupons();
    } catch (e: any) {
      alert(`Error creating coupon: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-purple-700" />
            <span>Refill Delivery Coupons & Commercial Promotions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure delivery fee subsidies and promotions for senior chronic medication fulfillment.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-ayunexa-primary text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Promo Code</span>
        </button>
      </div>

      {/* Regulatory Notice */}
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-slate-700 leading-relaxed">
        <strong className="text-purple-900 block mb-0.5">Healthcare Regulatory Compliance:</strong>
        Coupons apply exclusively to doorstep delivery logistics and commercial wellness supplies. Under medical regulations,
        scheduled prescription medicines maintain standard statutory MRP price structures.
      </div>

      {/* Coupons Table */}
      <div className="ayunexa-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Benefit</th>
                <th className="py-3 px-4">Target Application</th>
                <th className="py-3 px-4">Validity Range</th>
                <th className="py-3 px-4">Usage Track</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200 text-xs">
                      {c.code}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1">{c.description}</div>
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-900">
                    {c.discountType === 'FIXED' ? `₹${c.discountValue} OFF` : `${c.discountValue}% OFF`}
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {c.applicableTo.replace('_', ' ')}
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {c.startDate} to {c.endDate}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-mono font-semibold text-slate-800">
                      {c.timesUsed} / {c.usageLimit}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {c.isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Expired
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Refill Delivery Promo</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. MONSOONCARE"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Free doorstep delivery on refills"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="FIXED">Fixed (₹)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Value ({discountType === 'FIXED' ? '₹' : '%'})</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowCreateModal(false)} className="btn-ayunexa-secondary text-xs">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!code.trim()}
                className="btn-ayunexa-primary text-xs"
              >
                Create Promo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
