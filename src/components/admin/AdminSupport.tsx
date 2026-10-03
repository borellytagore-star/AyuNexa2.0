import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { SupportTicket, SupportMessage } from '../../types/admin';
import {
  LifeBuoy,
  Send,
  Lock,
  MessageSquare,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Tag,
  RefreshCw,
} from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSupportTickets();
      setTickets(data.tickets);
      if (selectedTicket) {
        const updated = data.tickets.find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      await adminApi.sendSupportMessage(selectedTicket.id, replyText, isInternalNote);
      setReplyText('');
      fetchTickets();
    } catch (e: any) {
      alert(`Error sending message: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-purple-700" />
            <span>Support Desk & Ticket Triage</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage inquiries, provide caregiver helpline assistance, and maintain internal clinical escalation notes.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Ticket List Column */}
        <div className="md:col-span-1 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            All Tickets ({tickets.length})
          </div>

          <div className="space-y-2">
            {tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50/70 border-purple-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-500 font-bold">{t.id}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        t.priority === 'HIGH' || t.priority === 'URGENT'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{t.subject}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>{t.userName}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 font-medium">
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversation Thread Column */}
        <div className="md:col-span-2 ayunexa-card p-5 flex flex-col justify-between min-h-[460px]">
          {selectedTicket ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              {/* Ticket Header */}
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-900">{selectedTicket.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 uppercase">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedTicket.subject}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    User: <strong>{selectedTicket.userName}</strong> ({selectedTicket.userRole})
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {selectedTicket.status}
                </span>
              </div>

              {/* Message History */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedTicket.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl text-xs space-y-1 ${
                      m.isInternal
                        ? 'bg-amber-50 border border-amber-200 text-amber-950'
                        : m.senderRole === 'SUPPORT_AGENT'
                        ? 'bg-purple-50/70 border border-purple-200 text-purple-950 ml-6'
                        : 'bg-slate-50 border border-slate-200 text-slate-900 mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="flex items-center gap-1.5">
                        {m.isInternal && <Lock className="w-3 h-3 text-amber-700" />}
                        <span>{m.senderName}</span>
                        {m.isInternal && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold uppercase">
                            Internal Note (Hidden from User)
                          </span>
                        )}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">{m.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className={isInternalNote ? 'font-bold text-amber-800' : 'font-medium'}>
                      Post as Private Internal Note (Invisible to patient)
                    </span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      isInternalNote
                        ? 'Type internal note for healthcare triage team...'
                        : 'Reply to user with helpful guidance...'
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className={isInternalNote ? 'btn-ayunexa-secondary text-xs' : 'btn-ayunexa-primary text-xs'}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isInternalNote ? 'Save Note' : 'Send'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 mb-2 stroke-1 text-slate-300" />
              <span>Select a support ticket from the list to view dialogue & history.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
