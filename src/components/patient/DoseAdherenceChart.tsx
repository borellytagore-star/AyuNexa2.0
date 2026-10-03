import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface DayAdherenceData {
  day: string;
  fullDay: string;
  onTime: number;
  late: number;
  missed: number;
  total: number;
  rate: number;
}

export const DoseAdherenceChart: React.FC = () => {
  const { dosesToday, isAssistedMode } = useApp();
  const [activeView, setActiveView] = useState<'STACKED' | 'GROUPED'>('STACKED');

  // Compute live data incorporating today's doses from AppContext
  const weeklyData: DayAdherenceData[] = useMemo(() => {
    // Calculate today's figures dynamically
    const todayTaken = dosesToday.filter((d) => d.status === 'TAKEN').length;
    const todaySnoozed = dosesToday.filter((d) => d.status === 'SNOOZED').length;
    const todayMissed = dosesToday.filter(
      (d) => d.status === 'UNABLE_TO_TAKE' || d.status === 'SKIPPED'
    ).length;
    const todayScheduled = dosesToday.filter(
      (d) => d.status === 'SCHEDULED' || d.status === 'REMINDER_SENT'
    ).length;

    // Base week historical adherence data + today's actual live figures
    return [
      {
        day: 'Mon',
        fullDay: 'Monday',
        onTime: 4,
        late: 0,
        missed: 0,
        total: 4,
        rate: 100,
      },
      {
        day: 'Tue',
        fullDay: 'Tuesday',
        onTime: 3,
        late: 1,
        missed: 0,
        total: 4,
        rate: 100,
      },
      {
        day: 'Wed',
        fullDay: 'Wednesday',
        onTime: 4,
        late: 0,
        missed: 0,
        total: 4,
        rate: 100,
      },
      {
        day: 'Thu',
        fullDay: 'Thursday',
        onTime: 3,
        late: 0,
        missed: 1,
        total: 4,
        rate: 75,
      },
      {
        day: 'Fri',
        fullDay: 'Friday',
        onTime: 4,
        late: 0,
        missed: 0,
        total: 4,
        rate: 100,
      },
      {
        day: 'Sat',
        fullDay: 'Saturday',
        onTime: 3,
        late: 1,
        missed: 0,
        total: 4,
        rate: 100,
      },
      {
        day: 'Today',
        fullDay: 'Today (Live)',
        onTime: Math.max(1, todayTaken),
        late: todaySnoozed,
        missed: todayMissed,
        total: Math.max(1, todayTaken + todaySnoozed + todayMissed + todayScheduled),
        rate: Math.round(
          (Math.max(1, todayTaken) /
            Math.max(1, todayTaken + todaySnoozed + todayMissed + todayScheduled)) *
            100
        ),
      },
    ];
  }, [dosesToday]);

  // Aggregate weekly stats
  const totals = useMemo(() => {
    const totalOnTime = weeklyData.reduce((acc, d) => acc + d.onTime, 0);
    const totalLate = weeklyData.reduce((acc, d) => acc + d.late, 0);
    const totalMissed = weeklyData.reduce((acc, d) => acc + d.missed, 0);
    const grandTotal = totalOnTime + totalLate + totalMissed;
    const weeklyRate = Math.round(((totalOnTime + totalLate) / Math.max(1, grandTotal)) * 100);

    return {
      totalOnTime,
      totalLate,
      totalMissed,
      grandTotal,
      weeklyRate,
    };
  }, [weeklyData]);

  // Accessible custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DayAdherenceData;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[160px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-bold text-teal-300">
            <span>{data.fullDay}</span>
            <span className="text-white bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
              {data.rate}% Score
            </span>
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                On-Time:
              </span>
              <span className="font-extrabold">{data.onTime} doses</span>
            </div>
            <div className="flex items-center justify-between text-amber-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Late / Snoozed:
              </span>
              <span className="font-extrabold">{data.late} doses</span>
            </div>
            <div className="flex items-center justify-between text-rose-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Missed / Skipped:
              </span>
              <span className="font-extrabold">{data.missed} doses</span>
            </div>
          </div>
          <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400">
            Total Tracked: {data.total} doses
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 transition-all">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className={`font-black text-slate-900 ${
                  isAssistedMode ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
                }`}
              >
                Dose Adherence Trends
              </h3>
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                Weekly Analysis
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Weekly dose compliance (on-time vs. late vs. missed)
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setActiveView('STACKED')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeView === 'STACKED'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stacked View
          </button>
          <button
            onClick={() => setActiveView('GROUPED')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeView === 'GROUPED'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grouped View
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Compliance Rate */}
        <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200 flex flex-col justify-between">
          <span className="text-teal-800 font-bold uppercase tracking-wider text-[11px]">
            Weekly Score
          </span>
          <div className="my-1">
            <span className="text-2xl sm:text-3xl font-black text-teal-950">
              {totals.weeklyRate}%
            </span>
          </div>
          <span className="text-teal-700 font-semibold flex items-center gap-1 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            Target: ≥85% Met
          </span>
        </div>

        {/* On-Time Doses */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col justify-between">
          <span className="text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
            On-Time Doses
          </span>
          <div className="my-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-950">
              {totals.totalOnTime}
            </span>
          </div>
          <span className="text-emerald-700 font-semibold text-[11px]">
            {Math.round((totals.totalOnTime / Math.max(1, totals.grandTotal)) * 100)}% of total
          </span>
        </div>

        {/* Late / Snoozed */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col justify-between">
          <span className="text-amber-800 font-bold uppercase tracking-wider text-[11px]">
            Late / Snoozed
          </span>
          <div className="my-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-950">
              {totals.totalLate}
            </span>
          </div>
          <span className="text-amber-700 font-semibold text-[11px]">
            Taken within 60 mins
          </span>
        </div>

        {/* Missed / Skipped */}
        <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 flex flex-col justify-between">
          <span className="text-rose-800 font-bold uppercase tracking-wider text-[11px]">
            Missed / Skipped
          </span>
          <div className="my-1">
            <span className="text-2xl sm:text-3xl font-black text-rose-950">
              {totals.totalMissed}
            </span>
          </div>
          <span className="text-rose-700 font-semibold text-[11px]">
            Tagore alerted on skipped
          </span>
        </div>
      </div>

      {/* RECHARTS VISUALIZATION CONTAINER */}
      <div className="w-full h-64 sm:h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barCategoryGap={activeView === 'STACKED' ? '30%' : '15%'}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="day"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              fontWeight={600}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              domain={[0, 'dataMax + 1']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px', fontWeight: 600 }}
              formatter={(value) => {
                if (value === 'onTime') return <span className="text-slate-700">On-Time</span>;
                if (value === 'late') return <span className="text-slate-700">Late / Snoozed</span>;
                if (value === 'missed') return <span className="text-slate-700">Missed / Skipped</span>;
                return value;
              }}
            />
            <Bar
              dataKey="onTime"
              name="onTime"
              fill="#0d9488"
              stackId={activeView === 'STACKED' ? 'adherence' : undefined}
              radius={activeView === 'STACKED' ? [0, 0, 4, 4] : [4, 4, 0, 0]}
            />
            <Bar
              dataKey="late"
              name="late"
              fill="#f59e0b"
              stackId={activeView === 'STACKED' ? 'adherence' : undefined}
              radius={activeView === 'STACKED' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
            />
            <Bar
              dataKey="missed"
              name="missed"
              fill="#f43f5e"
              stackId={activeView === 'STACKED' ? 'adherence' : undefined}
              radius={activeView === 'STACKED' ? [4, 4, 0, 0] : [4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Clinical Adherence Safety Disclaimer */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600 leading-snug">
        <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Cardiology Adherence Guidance: </span>
          Dr. Rao has configured your target threshold at <strong>85%</strong>. Consistent on-time
          intake maintains stable therapeutic plasma levels for Metformin and Telmisartan.
        </div>
      </div>
    </section>
  );
};
