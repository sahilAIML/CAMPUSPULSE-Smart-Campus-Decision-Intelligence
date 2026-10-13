'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  TrendingUp,
  Filter,
  DollarSign,
  Users,
  Award,
} from 'lucide-react';
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
import { ClayCard } from '../ui/ClayCard';
import { ClayBadge } from '../ui/ClayBadge';
import { PlacementRecord, RecruiterMetric } from '@/lib/data/types';

interface PlacementsSectionProps {
  initialPlacements: PlacementRecord[];
  recruiters: RecruiterMetric[];
}

export function PlacementsSection({
  initialPlacements,
  recruiters,
}: PlacementsSectionProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Available Companies
  const companies = ['all', 'Blinkit', 'TCS', 'Cognizant', 'HCL', 'Infosys', 'Amazon', 'Capgemini'];
  const years = ['all', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'];

  // Filter raw placement records
  const filteredRecords = initialPlacements.filter((p) => {
    const matchesCo = selectedCompany === 'all' || p.company.toLowerCase() === selectedCompany.toLowerCase();
    const matchesYr = selectedYear === 'all' || p.year === Number(selectedYear);
    return matchesCo && matchesYr;
  });

  // Aggregate year-wise data for BarChart (Placed vs Not Placed)
  const yearAggMap = new Map<number, { year: number; placed: number; notPlaced: number; total: number; avgLpa: number; count: number }>();

  // Determine which records to feed to the chart:
  // If a company is selected, show that company's year-by-year trajectory.
  // If 'all' is selected, aggregate all companies per year.
  const recordsForChart = selectedCompany === 'all'
    ? initialPlacements
    : initialPlacements.filter((p) => p.company.toLowerCase() === selectedCompany.toLowerCase());

  for (const item of recordsForChart) {
    if (selectedYear !== 'all' && item.year !== Number(selectedYear)) {
      continue;
    }
    const curr = yearAggMap.get(item.year) ?? {
      year: item.year,
      placed: 0,
      notPlaced: 0,
      total: 0,
      avgLpa: 0,
      count: 0,
    };
    curr.placed += item.students_placed;
    curr.total += item.total_eligible;
    curr.notPlaced += Math.max(0, item.total_eligible - item.students_placed);
    curr.avgLpa += item.package_lpa;
    curr.count += 1;
    yearAggMap.set(item.year, curr);
  }

  const chartData = Array.from(yearAggMap.values())
    .map((d) => ({
      ...d,
      avgLpa: Number((d.avgLpa / Math.max(1, d.count)).toFixed(2)),
      placementPct: Number(((d.placed / Math.max(1, d.total)) * 100).toFixed(1)),
    }))
    .sort((a, b) => a.year - b.year);

  // Custom tactile tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-2xl bg-[var(--clay-card)] p-4 shadow-[var(--shadow-clay-card-hover)] border border-[var(--clay-border)] text-xs font-heading">
          <p className="font-extrabold text-sm text-[var(--clay-text)] mb-2">
            Academic Year {label} {selectedCompany !== 'all' ? `(${selectedCompany})` : ''}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Placed Offers:</span>
              <span className="tabular-nums font-extrabold">{data.placed} students</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-rose-500 font-bold">
              <span>Unplaced Runway:</span>
              <span className="tabular-nums font-extrabold">{data.notPlaced} students</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[#5B6CFF] font-bold border-t border-[var(--clay-border)] pt-1.5 mt-1.5">
              <span>Placement Rate:</span>
              <span className="tabular-nums font-extrabold">{data.placementPct}%</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[#FF7A59] font-bold">
              <span>Avg Package:</span>
              <span className="tabular-nums font-extrabold">{data.avgLpa} LPA</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="placements" className="w-full py-12 sm:py-16 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ClayBadge variant="sun" icon={<Briefcase className="h-3.5 w-3.5" />}>
                Career & Corporate Intelligence
              </ClayBadge>
              <span className="text-xs font-bold text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">8-Year Placement Track Record</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              Placement Trends & Recruiters
            </h2>
            <p className="text-sm sm:text-base text-white/95 mt-1 max-w-xl font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
              Historical conversion trends, package benchmarks, and top enterprise & quick-commerce recruiters.
            </p>
          </div>

          {/* Controls: Year Selector */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-heading font-extrabold text-white uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">Year:</span>
            <div className="flex items-center gap-1.5 bg-[var(--clay-pressed)]/60 p-1 rounded-2xl border border-[var(--clay-border)]">
              {['all', '2026', '2025', '2024'].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all min-h-[36px] ${
                    selectedYear === yr
                      ? 'bg-[var(--clay-card)] text-[#FF7A59] shadow-[var(--shadow-clay-btn)]'
                      : 'text-[var(--clay-muted)] hover:text-[var(--clay-text)]'
                  }`}
                >
                  {yr === 'all' ? 'All Years' : yr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Company Quick-Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-heading font-extrabold text-white uppercase pl-1 pr-2 flex-shrink-0 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
            <Building2 className="h-3.5 w-3.5" />
            <span>Recruiter:</span>
          </div>
          {companies.map((co) => {
            const isSelected = selectedCompany === co;
            return (
              <button
                key={co}
                onClick={() => setSelectedCompany(co)}
                className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-heading font-bold text-xs select-none transition-all duration-200 min-h-[44px] ${
                  isSelected
                    ? 'bg-[#2EC4B6] text-white border border-white/40 shadow-[var(--shadow-clay-teal)] scale-[1.02]'
                    : 'bg-[var(--clay-card)] text-[var(--clay-text)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-btn)] hover:-translate-y-[1px]'
                }`}
              >
                <span>{co === 'all' ? 'All Companies' : co}</span>
              </button>
            );
          })}
        </div>

        {/* Primary Analytical Bar Chart: Placed vs Not Placed */}
        <ClayCard className="p-5 sm:p-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[var(--clay-text)] flex items-center gap-2">
                <span>Placed vs. Unplaced Cohort</span>
                {selectedCompany !== 'all' && (
                  <ClayBadge variant="teal" size="sm">
                    {selectedCompany}
                  </ClayBadge>
                )}
              </h3>
              <p className="text-xs text-[var(--clay-muted)] mt-0.5">
                Eligible candidate volume vs. secured corporate placement offers
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-heading font-bold">
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 rounded-lg bg-[#2EC4B6]" />
                <span className="text-[var(--clay-text)]">Students Placed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 rounded-lg bg-slate-300 dark:bg-slate-700" />
                <span className="text-[var(--clay-muted)]">Unplaced Runway</span>
              </div>
            </div>
          </div>

          {/* Recharts Bar Chart Container */}
          <div className="h-[280px] sm:h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey="year"
                  stroke="var(--clay-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--clay-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="placed"
                  name="Placed Students"
                  fill="#2EC4B6"
                  radius={[10, 10, 0, 0]}
                  maxBarSize={48}
                  animationDuration={1200}
                />
                <Bar
                  dataKey="notPlaced"
                  name="Unplaced Runway"
                  fill="rgba(163, 177, 198, 0.45)"
                  radius={[10, 10, 0, 0]}
                  maxBarSize={48}
                  animationDuration={1400}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>

        {/* Featured Recruiter Showcase Cards */}
        <div>
          <h3 className="font-heading font-extrabold text-xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] mb-4">
            Key Corporate Hiring Partners
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recruiters.map((rec) => (
              <ClayCard
                key={rec.company}
                hoverable
                onClick={() => setSelectedCompany(rec.company)}
                className={`p-5 cursor-pointer transition-all ${
                  selectedCompany === rec.company ? 'ring-2 ring-[#2EC4B6]' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] flex items-center justify-center font-heading font-black text-sm text-[var(--clay-text)] shadow-[var(--shadow-clay-btn)]">
                      {rec.company.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-base text-[var(--clay-text)]">
                        {rec.company}
                      </h4>
                      <span className="text-[11px] font-semibold text-[var(--clay-muted)] block">
                        {rec.industry}
                      </span>
                    </div>
                  </div>
                  <ClayBadge variant={rec.avg_package_lpa >= 15 ? 'coral' : 'teal'} size="sm">
                    {rec.avg_package_lpa} LPA
                  </ClayBadge>
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-[var(--clay-border)] text-[var(--clay-muted)] font-semibold">
                  <span>8-Yr Total Hires:</span>
                  <span className="tabular-nums font-extrabold text-[var(--clay-text)] text-sm">
                    {rec.total_hires}+
                  </span>
                </div>
              </ClayCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
