import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { ModerationItem } from '../../types/admin';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  MessageSquare,
  ThumbsDown,
} from 'lucide-react';

export const AdminModeration: React.FC = () => {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getModerationItems();
      setItems(data.items);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED' | 'REMOVED', notes?: string) => {
    try {
      await adminApi.actionModerationItem(id, action, notes);
      fetchItems();
    } catch (e: any) {
      alert(`Error updating moderation item: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-700" />
            <span>Content Moderation & Harmful Medical Claim Queue</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Triage patient reviews, community feedback, and flagged submissions to prevent dangerous medical misinformation.
          </p>
        </div>

        <button
          onClick={fetchItems}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Safety Policy */}
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-slate-700 leading-relaxed">
        <strong className="text-purple-900 block mb-0.5">Human Medical Review Mandate:</strong>
        AI models assist with flagging suspicious content, but human clinical oversight is mandatory before classifying or
        quarantining medical advice.
      </div>

      {/* Moderation Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="ayunexa-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 uppercase">
                  {item.contentType.replace('_', ' ')}
                </span>
                <span className="text-xs font-semibold text-slate-900">
                  By {item.authorName} ({item.authorRole})
                </span>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.status === 'REMOVED'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {item.status.replace('_', ' ')}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-800 font-medium">
              "{item.text}"
            </div>

            <div className="text-[11px] text-rose-700 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Flag Reason: {item.flagReason}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400 font-mono">
                Flagged: {item.createdAt} {item.reviewedBy ? `· Reviewed by ${item.reviewedBy}` : ''}
              </span>

              {item.status === 'PENDING_REVIEW' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(item.id, 'APPROVED', 'Content verified safe')}
                    className="btn-ayunexa-secondary text-xs px-2.5 py-1"
                  >
                    Approve Content
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'REMOVED', 'Quarantined dangerous medical claim')}
                    className="btn-ayunexa-destructive text-xs px-2.5 py-1"
                  >
                    Quarantine & Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
