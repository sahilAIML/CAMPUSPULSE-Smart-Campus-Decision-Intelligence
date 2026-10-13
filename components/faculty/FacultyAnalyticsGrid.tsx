'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { ClayCard } from '../ui/ClayCard';
import { ClayBadge } from '../ui/ClayBadge';
import { StudentListItem } from '@/lib/data/students';

interface FacultyAnalyticsGridProps {
  students: StudentListItem[];
  onSelectSegment?: (segment: string) => void;
  onSelectStudent?: (student: StudentListItem) => void;
}

const SEGMENT_COLORS: Record<string, string> = {
  'Consistent Achievers': '#2EC4B6',
  'High Academics / Low Placement Readiness': '#5B6CFF',
  'Disengaged but Capable': '#FFC857',
  'Academically At-Risk': '#EF4444',
  'Skill-Strong, Marks-Weak': '#FF7A59',
};

export function FacultyAnalyticsGrid({
  students,
  onSelectSegment,
  onSelectStudent,
}: FacultyAnalyticsGridProps) {
  // 1. Histogram: Score Distribution
  const scoreBins = [
    { range: '< 40', count: 0, color: '#EF4444' },
    { range: '40-59', count: 0, color: '#F59E0B' },
    { range: '60-74', count: 0, color: '#FFC857' },
    { range: '75-89', count: 0, color: '#2EC4B6' },
    { range: '90-100', count: 0, color: '#5B6CFF' },
  ];

  for (const s of students) {
    if (s.success_score < 40) scoreBins[0].count++;
    else if (s.success_score < 60) scoreBins[1].count++;
    else if (s.success_score < 75) scoreBins[2].count++;
    else if (s.success_score < 90) scoreBins[3].count++;
    else scoreBins[4].count++;
  }

  // 2. Scatter Data: Attendance % vs Marks (Normalized out of 100)
  const scatterData = students.map((s) => ({
    name: s.full_name,
    reg_no: s.reg_no,
    attendance: s.attendance_pct,
    marks: Number((s.avg_cie_marks * 10).toFixed(1)),
    risk: s.risk_probability,
    studentRef: s,
  }));

  // 3. Segment Donut Data
  const segmentCounts: Record<string, number> = {};
  for (const s of students) {
    segmentCounts[s.segment] = (segmentCounts[s.segment] || 0) + 1;
  }
  const donutData = Object.entries(segmentCounts).map(([name, value]) => ({
    name,
    value,
    color: SEGMENT_COLORS[name] || '#A0AEC0',
  }));

  // 4. Section Risk Breakdown Data
  const sectionRiskMap = new Map<string, { section: string; critical: number; high: number; lowMed: number }>();
  for (const s of students) {
    const curr = sectionRiskMap.get(s.section_name) ?? { section: s.section_name, critical: 0, high: 0, lowMed: 0 };
    if (s.risk_level === 'critical') curr.critical++;
    else if (s.risk_level === 'high') curr.high++;
    else curr.lowMed++;
    sectionRiskMap.set(s.section_name, curr);
  }
  const sectionRiskData = Array.from(sectionRiskMap.values());

  // Custom Scatter Tooltip
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-2xl bg-[var(--clay-card)] p-3.5 shadow-[var(--shadow-clay-card-hover)] border border-[var(--clay-border)] text-xs font-heading">
          <p className="font-extrabold text-[var(--clay-text)]">{data.name}</p>
          <p className="text-[10px] text-[var(--clay-muted)] mb-1.5">{data.reg_no}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-3 text-emerald-600 font-bold">
              <span>Attendance:</span>
              <span className="tabular-nums">{data.attendance}%</span>
            </div>
            <div className="flex justify-between gap-3 text-[#5B6CFF] font-bold">
              <span>Marks Index:</span>
              <span className="tabular-nums">{data.marks}/100</span>
            </div>
            <div className="flex justify-between gap-3 text-rose-500 font-bold">
              <span>Risk:</span>
              <span className="tabular-nums">{data.risk}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="w-full mb-12">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Cohort Decision Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-white/95 font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            Correlated distributions, segment breakdown, and early warning risk telemetry.
          </p>
        </div>
        <ClayBadge variant="teal" size="sm">Cross-Linked Analytics</ClayBadge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Chart 1: Score Distribution Histogram */}
        <ClayCard className="p-5 sm:p-6">
          <div className="mb-4">
            <h3 className="font-heading font-extrabold text-base text-[var(--clay-text)]">
              Success Score Distribution
            </h3>
            <p className="text-xs text-[var(--clay-muted)]">
              Frequency distribution across 0-100 composite performance bands
            </p>
          </div>
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreBins}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="range" stroke="var(--clay-muted)" fontSize={11} />
                <YAxis stroke="var(--clay-muted)" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Students" radius={[8, 8, 0, 0]} maxBarSize={44}>
                  {scoreBins.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>

        {/* Chart 2: Attendance vs Marks Scatter Plot */}
        <ClayCard className="p-5 sm:p-6">
          <div className="mb-4">
            <h3 className="font-heading font-extrabold text-base text-[var(--clay-text)]">
              Attendance vs. Marks Correlation
            </h3>
            <p className="text-xs text-[var(--clay-muted)]">
              Scatter plot proving attendance drag on academic assessment performance
            </p>
          </div>
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  type="number"
                  dataKey="attendance"
                  name="Attendance %"
                  unit="%"
                  domain={[35, 100]}
                  stroke="var(--clay-muted)"
                  fontSize={11}
                />
                <YAxis
                  type="number"
                  dataKey="marks"
                  name="Marks"
                  domain={[30, 100]}
                  stroke="var(--clay-muted)"
                  fontSize={11}
                />
                <Tooltip content={<CustomScatterTooltip />} />
                <Scatter
                  name="Students"
                  data={scatterData}
                  fill="#FF7A59"
                  onClick={(node: any) => {
                    if (node?.payload?.studentRef && onSelectStudent) {
                      onSelectStudent(node.payload.studentRef);
                    }
                  }}
                  cursor="pointer"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>

        {/* Chart 3: Segment Donut Distribution */}
        <ClayCard className="p-5 sm:p-6">
          <div className="mb-4">
            <h3 className="font-heading font-extrabold text-base text-[var(--clay-text)]">
              Behavioral Student Segmentation
            </h3>
            <p className="text-xs text-[var(--clay-muted)]">
              Cohort proportions categorized by 5-cluster operational profiles
            </p>
          </div>
          <div className="h-[230px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  onClick={(entry) => onSelectSegment?.(entry.name)}
                  cursor="pointer"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Segment Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold mt-2">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 truncate">
                <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[var(--clay-text)] truncate">{d.name}</span>
                <span className="text-[var(--clay-muted)] tabular-nums">({d.value})</span>
              </div>
            ))}
          </div>
        </ClayCard>

        {/* Chart 4: Risk by Section */}
        <ClayCard className="p-5 sm:p-6">
          <div className="mb-4">
            <h3 className="font-heading font-extrabold text-base text-[var(--clay-text)]">
              Cross-Section Risk Comparison
            </h3>
            <p className="text-xs text-[var(--clay-muted)]">
              Departmental benchmarking across Section A, B, and C
            </p>
          </div>
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionRiskData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="section" stroke="var(--clay-muted)" fontSize={11} />
                <YAxis stroke="var(--clay-muted)" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="critical" name="Critical Risk" fill="#DC2626" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="high" name="High Risk" fill="#FF7A59" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="lowMed" name="Stable / Low" fill="#2EC4B6" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>
      </div>
    </section>
  );
}
