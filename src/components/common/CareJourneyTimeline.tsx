import React from 'react';
import {
  Stethoscope,
  FileCheck,
  CalendarCheck,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';

export interface CareJourneyStep {
  id: string;
  stageName: string;
  subtitle: string;
  status: 'COMPLETED' | 'CURRENT' | 'UPCOMING';
  dateLabel?: string;
  actor?: string;
}

interface CareJourneyTimelineProps {
  compact?: boolean;
}

export const CareJourneyTimeline: React.FC<CareJourneyTimelineProps> = ({ compact = false }) => {
  const steps: CareJourneyStep[] = [
    {
      id: 'step-1',
      stageName: 'Consultation',
      subtitle: 'Dr. Anita Rao review & baseline assessment',
      status: 'COMPLETED',
      dateLabel: 'Sept 15',
      actor: 'Dr. Rao (MD)',
    },
    {
      id: 'step-2',
      stageName: 'Medication Plan',
      subtitle: 'Care Plan v2.0 authorized & acknowledged',
      status: 'COMPLETED',
      dateLabel: 'Sept 20',
      actor: 'Acknowledged',
    },
    {
      id: 'step-3',
      stageName: 'Daily Care',
      subtitle: 'Recorded dose confirmations & runway tracking',
      status: 'CURRENT',
      dateLabel: 'Active Today',
      actor: 'Ravi & Tagore',
    },
    {
      id: 'step-4',
      stageName: 'Progress Tracking',
      subtitle: 'Symptom logs & adherence verification',
      status: 'CURRENT',
      dateLabel: 'Ongoing',
      actor: 'Device logs',
    },
    {
      id: 'step-5',
      stageName: 'Follow-up Review',
      subtitle: 'Scheduled evaluation with Dr. Rao',
      status: 'UPCOMING',
      dateLabel: 'Thursday 11 AM',
      actor: 'Clinic visit',
    },
  ];

  return (
    <section className="ayunexa-card p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Care Journey Progress
          </h3>
          <p className="text-xs text-slate-500">
            End-to-end clinical care journey from initial consultation to follow-up
          </p>
        </div>
        <span className="text-[11px] font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
          Stage 3: Daily Care
        </span>
      </div>

      {/* Horizontal Steps on desktop, vertical on mobile */}
      <div className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
          {steps.map((step, idx) => {
            const isCompleted = step.status === 'COMPLETED';
            const isCurrent = step.status === 'CURRENT';

            return (
              <div
                key={step.id}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-purple-50/70 border-[#701a75] shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                    <span className="font-mono text-slate-400">0{idx + 1}</span>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Done</span>
                      </span>
                    ) : isCurrent ? (
                      <span className="flex items-center gap-1 text-purple-900 font-bold">
                        <span className="w-2 h-2 rounded-full bg-purple-700 animate-pulse" />
                        <span>Current</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Upcoming</span>
                    )}
                  </div>

                  <h4
                    className={`font-extrabold text-xs sm:text-sm ${
                      isCurrent ? 'text-purple-950' : isCompleted ? 'text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    {step.stageName}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                    {step.subtitle}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] font-medium text-slate-500">
                  <span>{step.dateLabel}</span>
                  <span className="font-mono">{step.actor}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
