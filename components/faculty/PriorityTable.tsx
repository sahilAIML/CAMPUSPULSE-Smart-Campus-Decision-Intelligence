'use client';

import React, { useState } from 'react';
import {
  ArrowUpDown,
  Download,
  Printer,
  FileText,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Filter,
  Search,
  Users,
  X,
} from 'lucide-react';
import { ClayCard } from '../ui/ClayCard';
import { ClayBadge } from '../ui/ClayBadge';
import { ClayButton } from '../ui/ClayButton';
import { ClayInput } from '../ui/ClayInput';
import { StudentListItem } from '@/lib/data/students';

interface PriorityTableProps {
  students: StudentListItem[];
  onSelectStudent: (student: StudentListItem) => void;
  segmentFilter?: string | null;
  onClearSegmentFilter?: () => void;
}

type SortField = 'reg_no' | 'full_name' | 'avg_cie_marks' | 'backlogs' | 'cgpa' | 'attendance_pct' | 'risk_probability' | 'segment';

export function PriorityTable({
  students,
  onSelectStudent,
  segmentFilter,
  onClearSegmentFilter,
}: PriorityTableProps) {
  const [sortField, setSortField] = useState<SortField>('risk_probability');
  const [sortAsc, setSortAsc] = useState<boolean>(false); // default desc for risk
  const [filterMode, setFilterMode] = useState<'all' | 'at_risk' | 'backlogs' | 'att_low'>('all');
  const [search, setSearch] = useState('');
  const [expandedMobileId, setExpandedMobileId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'full_name' || field === 'reg_no');
    }
  };

  // Filter pipeline
  const filtered = students.filter((s) => {
    if (segmentFilter && s.segment !== segmentFilter) return false;
    if (filterMode === 'at_risk' && !(s.risk_level === 'critical' || s.risk_level === 'high')) return false;
    if (filterMode === 'backlogs' && s.backlogs === 0) return false;
    if (filterMode === 'att_low' && s.attendance_pct >= 75) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!s.reg_no.toLowerCase().includes(q) && !s.full_name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Sort pipeline
  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    switch (sortField) {
      case 'reg_no':
        diff = a.reg_no.localeCompare(b.reg_no);
        break;
      case 'full_name':
        diff = a.full_name.localeCompare(b.full_name);
        break;
      case 'avg_cie_marks':
        diff = a.avg_cie_marks - b.avg_cie_marks;
        break;
      case 'backlogs':
        diff = a.backlogs - b.backlogs;
        break;
      case 'cgpa':
        diff = a.cgpa - b.cgpa;
        break;
      case 'attendance_pct':
        diff = a.attendance_pct - b.attendance_pct;
        break;
      case 'risk_probability':
        diff = a.risk_probability - b.risk_probability;
        break;
      case 'segment':
        diff = a.segment.localeCompare(b.segment);
        break;
      default:
        diff = a.risk_probability - b.risk_probability;
    }
    return sortAsc ? diff : -diff;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Reg No', 'Full Name', 'Section', 'CGPA', 'Backlogs', 'Attendance %', 'CIE Marks', 'Risk Probability', 'Risk Level', 'Segment'];
    const rows = sorted.map((s) => [
      s.reg_no,
      `"${s.full_name}"`,
      s.section_name,
      s.cgpa,
      s.backlogs,
      `${s.attendance_pct}%`,
      s.avg_cie_marks,
      s.risk_probability,
      s.risk_level,
      `"${s.segment}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusPulse_Priority_Cohort_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF via Print Formatter
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CampusPulse Priority Student Telemetry Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1E293B; }
            h1 { font-size: 20px; margin-bottom: 4px; color: #0F172A; }
            p { font-size: 12px; color: #64748B; margin-top: 0; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background: #F1F5F9; text-align: left; padding: 8px; border-bottom: 2px solid #CBD5E1; font-weight: 700; }
            td { padding: 8px; border-bottom: 1px solid #E2E8F0; }
            .risk-crit { color: #DC2626; font-weight: bold; }
            .risk-high { color: #EA580C; font-weight: bold; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>CampusPulse • Faculty Priority Watchlist</h1>
          <p>Generated: ${new Date().toLocaleString()} | Filtered Cohort: ${sorted.length} students</p>
          <table>
            <thead>
              <tr>
                <th>Reg No</th>
                <th>Name</th>
                <th>Section</th>
                <th>CGPA</th>
                <th>Backlogs</th>
                <th>Attendance</th>
                <th>CIE Marks</th>
                <th>Risk Score</th>
                <th>Segment</th>
              </tr>
            </thead>
            <tbody>
              ${sorted
                .map(
                  (s) => `
                <tr>
                  <td><strong>${s.reg_no}</strong></td>
                  <td>${s.full_name}</td>
                  <td>${s.section_name}</td>
                  <td>${s.cgpa}</td>
                  <td>${s.backlogs > 0 ? `<span style="color:#DC2626;font-weight:bold">${s.backlogs}</span>` : '0'}</td>
                  <td>${s.attendance_pct}%</td>
                  <td>${s.avg_cie_marks} / 10</td>
                  <td><span class="${s.risk_level === 'critical' ? 'risk-crit' : 'risk-high'}">${s.risk_probability} (${s.risk_level.toUpperCase()})</span></td>
                  <td>${s.segment}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="w-full mb-10">
      {/* Priority Table Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ClayBadge variant="coral" icon={<ShieldAlert className="h-3.5 w-3.5" />}>
              Priority Watchlist
            </ClayBadge>
            <span className="text-xs font-bold text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              Showing {sorted.length} students
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Students Needing Attention
          </h2>
        </div>

        {/* Action Controls & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <ClayButton variant="default" size="sm" onClick={handleExportCSV}>
            <Download className="h-3.5 w-3.5 text-[#2EC4B6]" />
            <span>Export CSV</span>
          </ClayButton>
          <ClayButton variant="default" size="sm" onClick={handleExportPDF}>
            <FileText className="h-3.5 w-3.5 text-rose-500" />
            <span>Export PDF</span>
          </ClayButton>
          <ClayButton variant="default" size="sm" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5 text-[#5B6CFF]" />
            <span>Print Report</span>
          </ClayButton>
        </div>
      </div>

      {/* Active Segment Cross-Filter Indicator */}
      {segmentFilter && (
        <div className="flex items-center gap-2 mb-3.5 bg-[#5B6CFF]/20 border border-[#5B6CFF]/40 px-3.5 py-1.5 rounded-2xl w-fit">
          <span className="text-xs font-heading font-extrabold text-white drop-shadow">
            Segment Filter: <span className="underline text-[#5B6CFF]">{segmentFilter}</span>
          </span>
          <button
            onClick={onClearSegmentFilter}
            className="p-1 hover:bg-[#5B6CFF]/30 rounded-xl text-white transition-colors"
            title="Clear segment filter"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Filter Chips & Inline Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none bg-black/35 backdrop-blur-md border border-white/20 shadow-sm p-1 rounded-2xl">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl font-heading text-xs transition-all flex-shrink-0 min-h-[38px] ${
              filterMode === 'all'
                ? 'bg-[#FF7A59] text-white shadow-[var(--shadow-clay-coral)] font-extrabold'
                : 'text-white/90 hover:text-white hover:bg-white/10 font-bold'
            }`}
          >
            All ({students.length})
          </button>
          <button
            onClick={() => setFilterMode('at_risk')}
            className={`px-3 py-1.5 rounded-xl font-heading text-xs transition-all flex-shrink-0 min-h-[38px] ${
              filterMode === 'at_risk'
                ? 'bg-rose-600 text-white shadow-md font-extrabold'
                : 'text-white/90 hover:text-white hover:bg-white/10 font-bold'
            }`}
          >
            High & Critical Risk
          </button>
          <button
            onClick={() => setFilterMode('att_low')}
            className={`px-3 py-1.5 rounded-xl font-heading text-xs transition-all flex-shrink-0 min-h-[38px] ${
              filterMode === 'att_low'
                ? 'bg-[#FFC857] text-gray-900 shadow-md font-extrabold'
                : 'text-white/90 hover:text-white hover:bg-white/10 font-bold'
            }`}
          >
            Attendance &lt; 75%
          </button>
          <button
            onClick={() => setFilterMode('backlogs')}
            className={`px-3 py-1.5 rounded-xl font-heading text-xs transition-all flex-shrink-0 min-h-[38px] ${
              filterMode === 'backlogs'
                ? 'bg-[#5B6CFF] text-white shadow-md font-extrabold'
                : 'text-white/90 hover:text-white hover:bg-white/10 font-bold'
            }`}
          >
            Has Backlogs
          </button>
        </div>

        {/* Quick Search Input */}
        <div className="w-full sm:w-64 flex-shrink-0">
          <ClayInput
            placeholder="Filter list..."
            icon={<Search className="h-3.5 w-3.5" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 1. Desktop Responsive Table View (Hidden on mobile) */}
      <ClayCard className="hidden sm:block overflow-hidden p-0 border border-[var(--clay-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Priority Student Table">
            <thead className="bg-[var(--clay-pressed)]/80 text-[var(--clay-muted)] font-heading font-extrabold uppercase tracking-wider border-b border-[var(--clay-border)]">
              <tr>
                <th
                  onClick={() => handleSort('reg_no')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[var(--clay-text)] select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Reg No</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('full_name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[var(--clay-text)] select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Name</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avg_cie_marks')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[var(--clay-text)] select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Marks</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('backlogs')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[var(--clay-text)] select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Backlog</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cgpa')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[var(--clay-text)] select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>CGPA</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('attendance_pct')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[var(--clay-text)] select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Attendance</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('risk_probability')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[var(--clay-text)] select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Risk Score</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('segment')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[var(--clay-text)] select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Segment</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--clay-border)] font-medium">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[var(--clay-muted)] font-semibold">
                    No students match the current filters.
                  </td>
                </tr>
              ) : (
                sorted.map((student) => {
                  const isCritical = student.risk_level === 'critical';
                  const isHigh = student.risk_level === 'high';

                  return (
                    <tr
                      key={student.student_id}
                      onClick={() => onSelectStudent(student)}
                      className={`cursor-pointer hover:bg-[var(--clay-pressed)]/60 transition-colors group ${
                        isCritical
                          ? 'bg-rose-500/5'
                          : isHigh
                          ? 'bg-amber-500/5'
                          : ''
                      }`}
                    >
                      {/* Reg No */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[var(--clay-text)] tabular-nums group-hover:text-[#FF7A59]">
                        {student.reg_no}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-[var(--clay-text)]">
                        <div className="flex items-center gap-2">
                          <span>{student.full_name}</span>
                          {student.attendance_pct < 75 && (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                              Att &lt; 75%
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Marks (Avg CIE) */}
                      <td className="py-3.5 px-3 tabular-nums font-bold text-[var(--clay-text)]">
                        {student.avg_cie_marks} / 10
                      </td>

                      {/* Backlogs */}
                      <td className="py-3.5 px-3 tabular-nums font-extrabold">
                        {student.backlogs > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-lg">
                            {student.backlogs} BL
                          </span>
                        ) : (
                          <span className="text-[var(--clay-muted)]">0</span>
                        )}
                      </td>

                      {/* CGPA */}
                      <td className="py-3.5 px-3 tabular-nums font-bold text-[var(--clay-text)]">
                        {student.cgpa}
                      </td>

                      {/* Attendance % */}
                      <td className="py-3.5 px-4 tabular-nums font-extrabold">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            student.attendance_pct < 75
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {student.attendance_pct}%
                          {student.attendance_pct < 75 && (
                            <AlertTriangle className="h-3 w-3 text-rose-500" />
                          )}
                        </span>
                      </td>

                      {/* Risk Score */}
                      <td className="py-3.5 px-4">
                        <ClayBadge
                          variant={
                            isCritical
                              ? 'risk-critical'
                              : isHigh
                              ? 'risk-high'
                              : student.risk_level === 'medium'
                              ? 'risk-medium'
                              : 'risk-low'
                          }
                          size="sm"
                          icon={
                            isCritical || isHigh ? (
                              <ShieldAlert className="h-3 w-3" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )
                          }
                        >
                          {student.risk_probability} ({student.risk_level.toUpperCase()})
                        </ClayBadge>
                      </td>

                      {/* Segment */}
                      <td className="py-3.5 px-4 text-[11px] font-bold text-[var(--clay-muted)] truncate max-w-[150px]">
                        {student.segment}
                      </td>

                      {/* Inspect Arrow */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="h-8 w-8 rounded-xl bg-[var(--clay-card)] shadow-[var(--shadow-clay-btn)] inline-flex items-center justify-center text-[var(--clay-muted)] group-hover:text-[#FF7A59] group-hover:scale-105 transition-all">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </ClayCard>

      {/* 2. Mobile Responsive Expandable Card List (Visible on mobile screens) */}
      <div className="sm:hidden space-y-3">
        {sorted.map((student) => {
          const isExpanded = expandedMobileId === student.student_id;
          const isCritical = student.risk_level === 'critical';

          return (
            <ClayCard
              key={student.student_id}
              className="p-4 transition-all"
            >
              {/* Card Header & Toggle */}
              <div
                className="flex items-start justify-between gap-3 cursor-pointer"
                onClick={() =>
                  setExpandedMobileId(isExpanded ? null : student.student_id)
                }
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading font-extrabold text-base text-[var(--clay-text)]">
                      {student.full_name}
                    </span>
                    <ClayBadge
                      variant={
                        isCritical
                          ? 'risk-critical'
                          : student.risk_level === 'high'
                          ? 'risk-high'
                          : student.risk_level === 'medium'
                          ? 'risk-medium'
                          : 'risk-low'
                      }
                      size="sm"
                    >
                      {student.risk_probability}
                    </ClayBadge>
                  </div>
                  <span className="font-mono text-xs font-bold text-[var(--clay-muted)] block">
                    {student.reg_no} • {student.section_name}
                  </span>
                </div>

                <button
                  type="button"
                  aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
                  className="h-9 w-9 rounded-xl bg-[var(--clay-card)] shadow-[var(--shadow-clay-btn)] flex items-center justify-center text-[var(--clay-muted)] flex-shrink-0 transition-transform"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-[#FF7A59]" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Primary Key Metrics Row */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[var(--clay-pressed)]/60 text-center text-xs font-bold mt-3">
                <div>
                  <span className="text-[10px] text-[var(--clay-muted)] block">CGPA</span>
                  <span className="tabular-nums text-[var(--clay-text)]">{student.cgpa}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--clay-muted)] block">Attendance</span>
                  <span
                    className={`tabular-nums ${
                      student.attendance_pct < 75 ? 'text-rose-500 font-extrabold' : 'text-emerald-600'
                    }`}
                  >
                    {student.attendance_pct}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--clay-muted)] block">Backlogs</span>
                  <span className="tabular-nums text-[var(--clay-text)]">
                    {student.backlogs > 0 ? `${student.backlogs} BL` : '0'}
                  </span>
                </div>
              </div>

              {/* Expandable Details Tray */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-[var(--clay-border)] space-y-3 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-[var(--clay-card)] border border-[var(--clay-border)]">
                      <span className="text-[10px] font-bold text-[var(--clay-muted)] block">Avg CIE Marks</span>
                      <span className="font-extrabold text-[var(--clay-text)]">{student.avg_cie_marks} / 10</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--clay-card)] border border-[var(--clay-border)]">
                      <span className="text-[10px] font-bold text-[var(--clay-muted)] block">Success Score</span>
                      <span className="font-extrabold text-[#5B6CFF]">{student.success_score} / 100</span>
                    </div>
                  </div>

                  <div className="text-[11px] font-semibold text-[var(--clay-muted)]">
                    <span className="font-bold text-[var(--clay-text)]">Segment:</span> {student.segment}
                  </div>

                  <ClayButton
                    variant="coral"
                    size="sm"
                    fullWidth
                    onClick={() => onSelectStudent(student)}
                  >
                    <span>Open Detailed Telemetry & Profile Dossier</span>
                    <ChevronRight className="h-4 w-4" />
                  </ClayButton>
                </div>
              )}
            </ClayCard>
          );
        })}
      </div>
    </section>
  );
}
