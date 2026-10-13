'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  ShieldAlert,
  Users,
  Briefcase,
  PieChart as PieIcon,
  Sparkles,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Line,
  ComposedChart,
} from 'recharts';
import { ClayCard } from '../ui/ClayCard';
import { ClayBadge } from '../ui/ClayBadge';
import {
  DepartmentMetric,
  HeatmapCell,
  getDepartmentComparison,
  getRiskHeatmapData,
  getSegmentSizeBreakdown,
} from '@/lib/data/admin';
import { getPlacementAggregates } from '@/lib/data/placements';
import { YearPlacementAggregate } from '@/lib/data/types';

export function InstitutionalDashboard() {
  const [departments, setDepartments] = useState<DepartmentMetric[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [segments, setSegments] = useState<{ segment: string; count: number; pct: number; color: string }[]>([]);
  const [placementTrend, setPlacementTrend] = useState<YearPlacementAggregate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [deptData, heatData, segData, placeData] = await Promise.all([
        getDepartmentComparison(),
        getRiskHeatmapData(),
        getSegmentSizeBreakdown(),
        getPlacementAggregates(),
      ]);
      setDepartments(deptData);
      setHeatmap(heatData);
      setSegments(segData);
      setPlacementTrend(placeData);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-sm font-bold text-[var(--clay-muted)]">
        Aggregating cross-departmental telemetry and institutional benchmarks...
      </div>
    );
  }

  // Unique sections and indicators for heatmap grid
  const sections = ['Section A', 'Section B', 'Section C'];
  const indicatorNames = ['Academic', 'Attendance', 'LMS Activity', 'Engagement', 'Placement', 'Skills Profile', 'Feedback'];

  return (
    <div className="w-full space-y-8">
      {/* 1. Cross-Departmental Benchmarking */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              Cross-Departmental Performance Matrix
            </h3>
            <p className="text-xs text-white/95 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
              Institutional comparison across Academic Success, Placement Rates, and At-Risk Proportions.
            </p>
          </div>
          <ClayBadge variant="teal" size="sm">4 Engineering Branches</ClayBadge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept) => (
            <ClayCard key={dept.code} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="h-8 px-2.5 rounded-xl bg-[#5B6CFF]/15 text-[#5B6CFF] font-heading font-black text-xs flex items-center justify-center">
                  {dept.code}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {dept.placement_rate_pct}% Placed
                </span>
              </div>

              <div>
                <h4 className="font-heading font-extrabold text-base text-[var(--clay-text)] truncate">
                  {dept.department}
                </h4>
                <span className="text-[11px] font-semibold text-[var(--clay-muted)] block">
                  {dept.student_count} Students • {dept.faculty_count} Faculty
                </span>
              </div>

              <div className="pt-2 border-t border-[var(--clay-border)] flex items-center justify-between text-xs font-bold">
                <div>
                  <span className="text-[10px] text-[var(--clay-muted)] block">Success Score</span>
                  <span className="font-heading font-black text-base text-[var(--clay-text)] tabular-nums">
                    {dept.avg_success_score}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[var(--clay-muted)] block">At-Risk Rate</span>
                  <span
                    className={`font-heading font-black text-base tabular-nums ${
                      dept.at_risk_rate_pct > 5 ? 'text-rose-500' : 'text-emerald-600'
                    }`}
                  >
                    {dept.at_risk_count} ({dept.at_risk_rate_pct}%)
                  </span>
                </div>
              </div>
            </ClayCard>
          ))}
        </div>
      </section>

      {/* 2. Risk Heatmap by Section x 7 Indicators */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              Risk Heatmap: Section × 7 Key Success Indicators
            </h3>
            <p className="text-xs text-white/95 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
              Multi-dimensional cross-section diagnostic matrix revealing targeted intervention areas.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> ≥75% Safe</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> 60-74% Watch</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> &lt;60% Deficit</span>
          </div>
        </div>

        <ClayCard className="overflow-hidden p-0 border border-[var(--clay-border)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Risk Heatmap Matrix">
              <thead className="bg-[var(--clay-pressed)]/80 text-[var(--clay-muted)] font-heading font-extrabold uppercase tracking-wider border-b border-[var(--clay-border)]">
                <tr>
                  <th className="py-3.5 px-4">Cohort Section</th>
                  {indicatorNames.map((ind) => (
                    <th key={ind} className="py-3.5 px-3 text-center">
                      {ind}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--clay-border)] font-medium">
                {sections.map((sec) => (
                  <tr key={sec}>
                    <td className="py-4 px-4 font-heading font-extrabold text-sm text-[var(--clay-text)]">
                      {sec}
                    </td>
                    {indicatorNames.map((indName) => {
                      const cell = heatmap.find((c) => c.section === sec && c.indicator === indName);
                      if (!cell) return <td key={indName} className="py-4 px-3 text-center">-</td>;

                      return (
                        <td key={indName} className="py-3 px-2 text-center">
                          <div
                            className={`p-2 rounded-xl transition-all font-heading font-extrabold text-xs inline-flex flex-col items-center justify-center min-w-[70px] ${
                              cell.status === 'safe'
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                : cell.status === 'warning'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 shadow-sm'
                            }`}
                          >
                            <span className="text-xs tabular-nums">{cell.avg_score}</span>
                            <span className="text-[10px] opacity-80 tabular-nums">({cell.pct_of_max}%)</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ClayCard>
      </section>

      {/* 3. Placement Trend (8-Year Multi-Series Bar & Curve Chart) & Segment Sizes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Trend Chart (2 Columns) */}
        <ClayCard className="lg:col-span-2 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-base text-[var(--clay-text)]">
                8-Year Institutional Placement Trend (2019 - 2026)
              </h3>
              <p className="text-xs text-[var(--clay-muted)]">
                Placed vs. Eligible cohorts alongside average CTC compensation trajectories.
              </p>
            </div>
            <ClayBadge variant="indigo" size="sm">8-Year Longitudinal</ClayBadge>
          </div>

          <div className="h-[250px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={placementTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="year" stroke="var(--clay-muted)" fontSize={11} />
                <YAxis yAxisId="left" stroke="var(--clay-muted)" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" unit="L" stroke="#FF7A59" fontSize={11} domain={[0, 16]} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="total_placed" name="Placed Students" fill="#2EC4B6" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar yAxisId="left" dataKey="not_placed" name="Unplaced / Higher Ed" fill="#CBD5E1" opacity={0.5} radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Line yAxisId="right" type="monotone" dataKey="avg_package_lpa" name="Avg CTC (LPA)" stroke="#FF7A59" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>

        {/* Behavioral Segment Breakdown Donut */}
        <ClayCard className="p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-heading font-extrabold text-base text-[var(--clay-text)]">
              Behavioral Segment Sizes
            </h3>
            <p className="text-xs text-[var(--clay-muted)]">
              5-Cluster K-means operational student breakdown.
            </p>
          </div>

          <div className="h-[180px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segments}
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {segments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs font-bold">
            {segments.map((s) => (
              <div key={s.segment} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-[var(--clay-text)] truncate">{s.segment}</span>
                </div>
                <span className="text-[var(--clay-muted)] tabular-nums flex-shrink-0">
                  {s.count} ({s.pct}%)
                </span>
              </div>
            ))}
          </div>
        </ClayCard>
      </div>
    </div>
  );
}
