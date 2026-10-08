import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Laptop, 
  Wrench, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Activity
} from 'lucide-react';
import { DailyTrendChart, CategoryBreakdownChart, ResolutionSlaMetrics } from '../../components/charts/AnalyticsCharts';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { tickets, activityLogs, payments } = useData();
  const navigate = useNavigate();

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Operations & Enterprise Control Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervisory monitoring across all client SLA tickets, expert claims, and field dispatches
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/queries')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            Incident Queue ({tickets.length})
          </button>
        </div>
      </div>

      {/* 6 Core Executive KPI Counters specified in prompt */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] text-slate-500 block font-medium">Total Platform Users</span>
          <span className="font-mono text-xl font-bold text-slate-900 block mt-1 tabular-nums">
            12,450
          </span>
          <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">+142 this week</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] text-slate-500 block font-medium">Active Remote Experts</span>
          <span className="font-mono text-xl font-bold text-blue-700 block mt-1 tabular-nums">
            2,340
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Top 3% vetted</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] text-slate-500 block font-medium">Field Engineers</span>
          <span className="font-mono text-xl font-bold text-indigo-700 block mt-1 tabular-nums">
            1,240
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">30+ metro hubs</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] text-slate-500 block font-medium">Open Queries</span>
          <span className="font-mono text-xl font-bold text-amber-700 block mt-1 tabular-nums">
            {tickets.filter(t => t.status === 'OPEN').length + 1120}
          </span>
          <span className="text-[10px] text-amber-600 font-medium block mt-0.5">15m triage SLA</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] text-slate-500 block font-medium">Active In-Progress Jobs</span>
          <span className="font-mono text-xl font-bold text-sky-700 block mt-1 tabular-nums">
            680
          </span>
          <span className="text-[10px] text-sky-600 font-medium block mt-0.5">0 breached</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] text-slate-500 block font-medium">Total Platform GMV</span>
          <span className="font-mono text-xl font-bold text-emerald-700 block mt-1 tabular-nums">
            ₹25.4L
          </span>
          <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">100% in Escrow</span>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Platform Influx & Resolution Trend</h3>
              <p className="text-xs text-slate-500">Live operational volume across all accounts</p>
            </div>
            <span className="text-xs font-mono text-slate-400 tabular-nums">7-Day Real-Time</span>
          </div>
          <DailyTrendChart />
        </div>

        <div className="lg:col-span-4 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Incident Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown by technical infrastructure stack</p>
          </div>
          <CategoryBreakdownChart />
        </div>
      </div>

      {/* SLA Metrics & Active Escalations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">SLA Resolution Time Performance</h3>
            <p className="text-xs text-slate-500">Mean Time To Resolution (MTTR) by Severity</p>
          </div>
          <ResolutionSlaMetrics />
        </div>

        <div className="lg:col-span-6 p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Incident Queue Overview</h3>
              <p className="text-xs text-slate-500">Live supervisor oversight</p>
            </div>
            <button
              onClick={() => navigate('/admin/queries')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Manage All →
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {tickets.slice(0, 4).map((t) => (
              <div key={t.id} className="py-2.5 flex items-center justify-between">
                <div className="space-y-0.5 truncate pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{t.ticketNumber}</span>
                    <PriorityBadge priority={t.priority} size="sm" />
                    <StatusBadge status={t.status} size="sm" />
                  </div>
                  <p className="text-slate-600 truncate">{t.title}</p>
                </div>
                <button
                  onClick={() => navigate(`/client/query/${t.id}`)}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                >
                  Supervise
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
