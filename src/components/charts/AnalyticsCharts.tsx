import React, { useState } from 'react';

interface DailyTrendProps {
  data?: { date: string; queries: number; resolved: number }[];
}

const DEFAULT_TREND = [
  { date: 'Mon', queries: 14, resolved: 12 },
  { date: 'Tue', queries: 22, resolved: 19 },
  { date: 'Wed', queries: 18, resolved: 17 },
  { date: 'Thu', queries: 31, resolved: 28 },
  { date: 'Fri', queries: 27, resolved: 24 },
  { date: 'Sat', queries: 12, resolved: 11 },
  { date: 'Sun', queries: 8, resolved: 7 }
];

export const DailyTrendChart: React.FC<DailyTrendProps> = ({ data = DEFAULT_TREND }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(...data.map(d => Math.max(d.queries, d.resolved)), 35);
  
  const width = 500;
  const height = 180;
  const padX = 35;
  const padY = 25;
  
  const stepX = (width - padX * 2) / (data.length - 1);
  const scaleY = (val: number) => height - padY - ((val / maxVal) * (height - padY * 2));

  // Compute SVG polyline points
  const queriesPoints = data.map((d, i) => `${padX + i * stepX},${scaleY(d.queries)}`).join(' ');
  const resolvedPoints = data.map((d, i) => `${padX + i * stepX},${scaleY(d.resolved)}`).join(' ');

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
            <span className="text-slate-600 font-medium">Queries Raised</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
            <span className="text-slate-600 font-medium">Resolved</span>
          </div>
        </div>
        {hoveredIdx !== null && (
          <div className="font-mono text-slate-700 tabular-nums">
            {data[hoveredIdx].date}: <strong className="text-blue-600">{data[hoveredIdx].queries}</strong> raised · <strong className="text-emerald-600">{data[hoveredIdx].resolved}</strong> resolved
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = height - padY - pct * (height - padY * 2);
          const val = Math.round(pct * maxVal);
          return (
            <g key={idx}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x={padX - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                {val}
              </text>
            </g>
          );
        })}

        {/* Lines */}
        <polyline fill="none" stroke="#2563eb" strokeWidth="2.5" points={queriesPoints} strokeLinecap="round" strokeLinejoin="round" />
        <polyline fill="none" stroke="#10b981" strokeWidth="2" points={resolvedPoints} strokeLinecap="round" strokeLinejoin="round" />

        {/* Interactive Data points */}
        {data.map((d, i) => {
          const x = padX + i * stepX;
          const yQ = scaleY(d.queries);
          const isHovered = hoveredIdx === i;

          return (
            <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
              <circle cx={x} cy={yQ} r={isHovered ? 5 : 3.5} fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
              <text x={x} y={height - 6} textAnchor="middle" className={`text-[10px] font-mono ${isHovered ? 'fill-blue-600 font-semibold' : 'fill-slate-500'}`}>
                {d.date}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const CategoryBreakdownChart: React.FC = () => {
  const categories = [
    { name: 'Cloud Infrastructure', count: 48, percentage: 36, color: 'bg-blue-600' },
    { name: 'Network & Firewall', count: 32, percentage: 24, color: 'bg-sky-500' },
    { name: 'Hardware & Servers', count: 26, percentage: 20, color: 'bg-indigo-600' },
    { name: 'Security & Compliance', count: 18, percentage: 14, color: 'bg-emerald-500' },
    { name: 'Software & DevOps', count: 8, percentage: 6, color: 'bg-amber-500' }
  ];

  return (
    <div className="space-y-3.5">
      {categories.map((cat, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">{cat.name}</span>
            <span className="font-mono text-slate-500 tabular-nums">
              {cat.count} ({cat.percentage}%)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${cat.color} rounded-full transition-all duration-500`}
              style={{ width: `${cat.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ResolutionSlaMetrics: React.FC = () => {
  const metrics = [
    { tier: 'P1 - Critical', mttr: '1.4 hrs', target: '2.0 hrs', adherence: 98.2, status: 'text-emerald-600' },
    { tier: 'P2 - High', mttr: '3.1 hrs', target: '4.0 hrs', adherence: 96.5, status: 'text-emerald-600' },
    { tier: 'P3 - Medium', mttr: '8.6 hrs', target: '12.0 hrs', adherence: 99.1, status: 'text-emerald-600' },
    { tier: 'P4 - Low', mttr: '16.4 hrs', target: '24.0 hrs', adherence: 99.8, status: 'text-emerald-600' }
  ];

  return (
    <div className="divide-y divide-slate-100 text-xs">
      <div className="grid grid-cols-4 py-2 font-medium text-slate-500 uppercase tracking-wider text-[10px]">
        <span>Severity</span>
        <span className="text-right">Avg MTTR</span>
        <span className="text-right">SLA Target</span>
        <span className="text-right">Compliance</span>
      </div>
      {metrics.map((m, i) => (
        <div key={i} className="grid grid-cols-4 py-2.5 items-center">
          <span className="font-medium text-slate-800">{m.tier}</span>
          <span className="font-mono text-slate-600 text-right tabular-nums">{m.mttr}</span>
          <span className="font-mono text-slate-400 text-right tabular-nums">{m.target}</span>
          <span className={`font-mono font-medium text-right tabular-nums ${m.status}`}>
            {m.adherence}%
          </span>
        </div>
      ))}
    </div>
  );
};
