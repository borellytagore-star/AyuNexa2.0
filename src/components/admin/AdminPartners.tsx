import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { PartnerVendor } from '../../types/admin';
import {
  Building2,
  CheckCircle2,
  Clock,
  Star,
  FileCheck,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

export const AdminPartners: React.FC = () => {
  const [partners, setPartners] = useState<PartnerVendor[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPartners();
      setPartners(data.partners);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleVerify = async (id: string) => {
    try {
      await adminApi.updatePartnerStatus(id, 'VERIFIED');
      fetchPartners();
    } catch (e: any) {
      alert(`Error verifying partner: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-700" />
            <span>Healthcare Partner & Vendor Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage verified pharmacy partners, clinical testing laboratories, and service provider integrations.
          </p>
        </div>

        <button
          onClick={fetchPartners}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Partner Isolation Notice */}
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-slate-700 leading-relaxed">
        <strong className="text-purple-900 block mb-0.5">Partner Data Isolation Mandate:</strong>
        Pharmacy partners can only access orders assigned directly to their licensed location.
        Cross-pharmacy patient or prescription sharing is strictly blocked.
      </div>

      {/* Partner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {partners.map((partner) => (
          <div key={partner.id} className="ayunexa-card p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 uppercase">
                  {partner.type}
                </span>

                <div className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{partner.rating}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{partner.name}</h3>

              <div className="space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{partner.contactEmail}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{partner.contactPhone}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{partner.address}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              {partner.status === 'VERIFIED' ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Partner</span>
                </span>
              ) : (
                <button
                  onClick={() => handleVerify(partner.id)}
                  className="btn-ayunexa-primary text-xs px-2.5 py-1"
                >
                  Verify Partner
                </button>
              )}

              <span className="text-slate-500 font-mono text-[11px]">
                {partner.activeOrdersCount} Active Refills
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
