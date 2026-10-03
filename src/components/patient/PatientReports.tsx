import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  Package,
  Award,
  ChevronRight,
  Share2,
} from 'lucide-react';

export const PatientReports: React.FC = () => {
  const { dosesToday, medicines, isAssistedMode, speakText } = useApp();
  const [timeframe, setTimeframe] = useState<'WEEK' | 'MONTH'>('WEEK');

  const totalDoses = dosesToday.length;
  const takenDoses = dosesToday.filter((d) => d.status === 'TAKEN').length;
  const adherenceRate = Math.round((takenDoses / totalDoses) * 100);

  // Weekly compliance data
  const weekDays = [
    { day: 'Mon', rate: 100, status: 'complete' },
    { day: 'Tue', rate: 100, status: 'complete' },
    { day: 'Wed', rate: 100, status: 'complete' },
    { day: 'Thu', rate: 75, status: 'pending' }, // Today
    { day: 'Fri', rate: 0, status: 'upcoming' },
    { day: 'Sat', rate: 0, status: 'upcoming' },
    { day: 'Sun', rate: 0, status: 'upcoming' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2
            className={`font-black text-slate-900 ${
              isAssistedMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}
          >
            Health & Adherence Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Daily logs, weekly consistency scores, and family caregiver summaries
          </p>
        </div>

        {/* Week / Month filter */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold self-start">
          <button
            onClick={() => setTimeframe('WEEK')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              timeframe === 'WEEK'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('MONTH')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              timeframe === 'MONTH'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* TODAY'S SUMMARY SCORECARD (PRD §26) */}
      <div className="bg-gradient-to-br from-teal-700 to-cyan-800 text-white p-6 rounded-3xl shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-teal-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
              Daily Care Adherence
            </span>
          </div>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">
            Today
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-black">{adherenceRate}%</span>
          <span className="text-teal-100 text-sm font-medium">
            ({takenDoses} of {totalDoses} doses confirmed)
          </span>
        </div>

        <p className="text-xs text-teal-100 leading-relaxed font-medium">
          “Today’s medication routine was followed well in the morning. Evening dose of Metformin is awaiting your confirmation.”
        </p>

        <div className="pt-2 flex items-center justify-between border-t border-white/20 text-xs text-teal-200">
          <span>Avg Response Time: 6 minutes</span>
          <button
            onClick={() => speakText(`Your adherence today is ${adherenceRate} percent.`)}
            className="text-white underline underline-offset-2 font-bold hover:text-teal-100"
          >
            Listen to Digest
          </button>
        </div>
      </div>

      {/* WEEKLY ADHERENCE VISUAL BARS (PRD §27) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Weekly Adherence Rhythm</h3>
            <p className="text-xs text-slate-500 font-medium">
              Consistency helps your cardiologist assess treatment stability
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            96% 7-day average
          </span>
        </div>

        {/* Day Bars */}
        <div className="grid grid-cols-7 gap-2 pt-2 text-center">
          {weekDays.map((item) => (
            <div key={item.day} className="space-y-2">
              <div className="h-32 bg-slate-100 rounded-2xl p-1 flex flex-col justify-end">
                <div
                  className={`w-full rounded-xl transition-all duration-700 ${
                    item.status === 'complete'
                      ? 'bg-emerald-500'
                      : item.status === 'pending'
                      ? 'bg-amber-400'
                      : 'bg-slate-200'
                  }`}
                  style={{ height: `${item.rate}%` }}
                />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{item.day}</p>
                <p className="text-[10px] text-slate-400">
                  {item.status === 'upcoming' ? '—' : `${item.rate}%`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* METRIC BREAKDOWN CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Medication count */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Medication</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {takenDoses} / {totalDoses}
          </p>
          <p className="text-xs text-slate-500 mt-1">Confirmed on schedule</p>
        </div>

        {/* Stock status */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Refill Alerts</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-700">1 Item Low</p>
          <p className="text-xs text-slate-500 mt-1">Metformin ~2 days left</p>
        </div>

        {/* Health Observation check */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Observations</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">1 Logged</p>
          <p className="text-xs text-slate-500 mt-1">Mild fatigue pattern noted</p>
        </div>
      </div>
    </div>
  );
};
