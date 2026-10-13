'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  ExternalLink,
  User,
} from 'lucide-react';
import { ClayCard } from '../ui/ClayCard';
import { ClayBadge } from '../ui/ClayBadge';
import { ClayInput } from '../ui/ClayInput';
import { ClayButton } from '../ui/ClayButton';
import { StudentListItem, getSectionStudents } from '@/lib/data/students';

interface StudentsDirectoryProps {
  onSelectStudent?: (regNo: string) => void;
}

export function StudentsDirectory({ onSelectStudent }: StudentsDirectoryProps) {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [selectedRisk, setSelectedRisk] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [recentImportedRegNos, setRecentImportedRegNos] = useState<Set<string>>(new Set());

  const loadStudents = async () => {
    setLoading(true);
    const data = await getSectionStudents(selectedSection);
    setStudents(data);

    // Check newly imported students in localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('campuspulse_custom_students') || '[]');
        const regSet = new Set<string>(saved.map((s: any) => String(s.reg_no).toUpperCase()));
        setRecentImportedRegNos(regSet);
      } catch {}
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStudents();
    const handleUpdate = () => loadStudents();
    window.addEventListener('campuspulse-data-updated', handleUpdate);
    return () => window.removeEventListener('campuspulse-data-updated', handleUpdate);
  }, [selectedSection]);

  const filtered = students.filter((s) => {
    if (selectedRisk !== 'all' && s.risk_level !== selectedRisk) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.full_name.toLowerCase().includes(q) ||
        s.reg_no.toLowerCase().includes(q) ||
        s.section_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const newlyImportedCount = students.filter((s) => recentImportedRegNos.has(s.reg_no.toUpperCase())).length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ClayBadge variant="indigo" icon={<Users className="h-3.5 w-3.5" />}>
              Institutional Student Roster
            </ClayBadge>
            <ClayBadge variant="teal" size="sm">
              Live Synchronized Cohort
            </ClayBadge>
            {newlyImportedCount > 0 && (
              <ClayBadge variant="coral" size="sm">
                {newlyImportedCount} CSV Ingested
              </ClayBadge>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Institutional Students List ({students.length})
          </h2>
          <p className="text-xs sm:text-sm text-white/95 font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            Verified student cohort database with live academic telemetry, biometric attendance, and early-warning indicators.
          </p>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <ClayCard className="p-4 text-center">
          <span className="text-[10px] font-heading font-extrabold text-[var(--clay-muted)] uppercase block">
            Total Enrolled
          </span>
          <span className="font-heading font-black text-2xl text-[var(--clay-text)] tabular-nums">
            {students.length}
          </span>
        </ClayCard>

        <ClayCard className="p-4 text-center">
          <span className="text-[10px] font-heading font-extrabold text-[#5B6CFF] uppercase block">
            Section A
          </span>
          <span className="font-heading font-black text-2xl text-[#5B6CFF] tabular-nums">
            {students.filter((s) => s.section_id === 'sec-a').length}
          </span>
        </ClayCard>

        <ClayCard className="p-4 text-center">
          <span className="text-[10px] font-heading font-extrabold text-[#2EC4B6] uppercase block">
            Section B
          </span>
          <span className="font-heading font-black text-2xl text-[#2EC4B6] tabular-nums">
            {students.filter((s) => s.section_id === 'sec-b').length}
          </span>
        </ClayCard>

        <ClayCard className="p-4 text-center">
          <span className="text-[10px] font-heading font-extrabold text-[#FF7A59] uppercase block">
            Section C
          </span>
          <span className="font-heading font-black text-2xl text-[#FF7A59] tabular-nums">
            {students.filter((s) => s.section_id === 'sec-c').length}
          </span>
        </ClayCard>
      </div>

      {/* Filters & Search Toolbar */}
      <ClayCard className="p-4 sm:p-5 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-heading font-extrabold text-[var(--clay-muted)] uppercase pr-1">
              Section:
            </span>
            {(['all', 'A', 'B', 'C'] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-3 py-1.5 rounded-xl font-heading font-bold text-xs transition-all ${
                  selectedSection === sec
                    ? 'bg-[#FF7A59] text-white shadow-[var(--shadow-clay-coral)]'
                    : 'bg-[var(--clay-card)] text-[var(--clay-muted)] hover:text-[var(--clay-text)] border border-[var(--clay-border)]'
                }`}
              >
                {sec === 'all' ? 'All Sections' : `Section ${sec}`}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full md:w-72">
            <ClayInput
              placeholder="Search by name, roll no..."
              icon={<Search className="h-3.5 w-3.5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Risk Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[var(--clay-border)] scrollbar-none">
          <span className="text-xs font-heading font-extrabold text-[var(--clay-muted)] uppercase pr-1">
            Risk:
          </span>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((rk) => (
            <button
              key={rk}
              onClick={() => setSelectedRisk(rk)}
              className={`px-2.5 py-1 rounded-lg font-heading font-bold text-[11px] capitalize transition-all ${
                selectedRisk === rk
                  ? 'bg-[var(--clay-text)] text-white'
                  : 'bg-[var(--clay-pressed)] text-[var(--clay-muted)] hover:text-[var(--clay-text)]'
              }`}
            >
              {rk === 'all' ? 'All Risk Levels' : rk}
            </button>
          ))}
        </div>
      </ClayCard>

      {/* Main Students Table */}
      <ClayCard className="overflow-hidden p-0 border border-[var(--clay-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Institutional Students Table">
            <thead className="bg-[var(--clay-pressed)] text-[var(--clay-muted)] font-heading font-extrabold uppercase tracking-wider border-b border-[var(--clay-border)]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Reg No</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Backlogs</th>
                <th className="py-3 px-4">Success Score</th>
                <th className="py-3 px-4">Risk Status</th>
                <th className="py-3 px-4 text-right">Cohort Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--clay-border)] font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[var(--clay-muted)] font-bold">
                    Loading student cohort records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[var(--clay-muted)] font-bold">
                    No student records match the specified filters.
                  </td>
                </tr>
              ) : (
                filtered.map((stu) => {
                  const isNewlyImported = recentImportedRegNos.has(stu.reg_no.toUpperCase());
                  return (
                    <tr
                      key={stu.student_id}
                      className={`hover:bg-[var(--clay-pressed)]/60 transition-colors ${
                        isNewlyImported ? 'bg-emerald-500/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-heading font-extrabold text-sm text-[var(--clay-text)] block">
                              {stu.full_name}
                            </span>
                            <span className="text-[11px] text-[var(--clay-muted)]">
                              {stu.reg_no.toLowerCase()}@campus.edu.in
                            </span>
                          </div>
                          {isNewlyImported && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] border border-emerald-500/30">
                              ✓ Newly Ingested
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-[var(--clay-text)] tabular-nums">
                        {stu.reg_no}
                      </td>

                      <td className="py-3 px-4 font-bold text-[var(--clay-text)]">
                        {stu.section_name}
                      </td>

                      <td className="py-3 px-4 font-bold tabular-nums">
                        <span
                          className={
                            stu.cgpa >= 8.0
                              ? 'text-emerald-600'
                              : stu.cgpa >= 6.5
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }
                        >
                          {stu.cgpa.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold tabular-nums">
                        <span
                          className={
                            stu.attendance_pct >= 75
                              ? 'text-emerald-600'
                              : stu.attendance_pct >= 65
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }
                        >
                          {stu.attendance_pct}%
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold tabular-nums">
                        {stu.backlogs > 0 ? (
                          <span className="text-rose-600 font-extrabold">{stu.backlogs}</span>
                        ) : (
                          <span className="text-emerald-600">0</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-black text-sm text-[var(--clay-text)] tabular-nums">
                            {stu.success_score}
                          </span>
                          <span className="text-[10px] text-[var(--clay-muted)]">/ 100</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <ClayBadge
                          variant={
                            stu.risk_level === 'critical'
                              ? 'risk-critical'
                              : stu.risk_level === 'high'
                              ? 'risk-high'
                              : stu.risk_level === 'medium'
                              ? 'risk-medium'
                              : 'risk-low'
                          }
                          size="sm"
                        >
                          {stu.risk_level.toUpperCase()}
                        </ClayBadge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onSelectStudent && (
                            <button
                              onClick={() => onSelectStudent(stu.reg_no)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#5B6CFF]/15 hover:bg-[#5B6CFF] text-[#5B6CFF] hover:text-white font-heading font-extrabold text-[11px] transition-all shadow-sm active:scale-95 border border-[#5B6CFF]/30"
                              title="View saved profile links & complete dossier"
                            >
                              <User className="h-3 w-3" />
                              <span>View Dossier & Links</span>
                            </button>
                          )}
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Active</span>
                          </span>
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
    </div>
  );
}
