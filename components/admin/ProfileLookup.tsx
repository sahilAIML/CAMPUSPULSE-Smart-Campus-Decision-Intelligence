'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  GraduationCap,
  Briefcase,
  ExternalLink,
  Github,
  Linkedin,
  Code2,
  Trophy,
  ShieldAlert,
  Calendar,
  Clock,
  Mail,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ClayCard } from '../ui/ClayCard';
import { ClayBadge } from '../ui/ClayBadge';
import { ClayButton } from '../ui/ClayButton';
import { ClayInput } from '../ui/ClayInput';
import {
  FacultyProfile,
  StudentAdminProfile,
  lookupFacultyProfile,
  lookupStudentProfile,
} from '@/lib/data/admin';

interface ProfileLookupProps {
  initialId?: string;
}

export function ProfileLookup({ initialId }: ProfileLookupProps = {}) {
  const [roleMode, setRoleMode] = useState<'student' | 'faculty'>('student');
  const [searchId, setSearchId] = useState(initialId || '241FA18067');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Result cards
  const [studentResult, setStudentResult] = useState<StudentAdminProfile | null>(null);
  const [facultyResult, setFacultyResult] = useState<FacultyProfile | null>(null);

  const handleLookup = async (idToSearch?: string, mode?: 'student' | 'faculty') => {
    const targetId = (idToSearch || searchId).trim();
    const targetMode = mode || roleMode;
    if (!targetId) return;

    setLoading(true);
    setSearched(true);

    if (targetMode === 'student') {
      const stu = await lookupStudentProfile(targetId);
      setStudentResult(stu);
      setFacultyResult(null);
    } else {
      const fac = await lookupFacultyProfile(targetId);
      setFacultyResult(fac);
      setStudentResult(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (initialId) {
      setSearchId(initialId);
      setRoleMode('student');
      handleLookup(initialId, 'student');
    }
    const handleDataUpdate = () => {
      if (searchId) handleLookup(searchId, roleMode);
    };
    window.addEventListener('campuspulse-data-updated', handleDataUpdate);
    return () => window.removeEventListener('campuspulse-data-updated', handleDataUpdate);
  }, [initialId]);

  const handleQuickSelect = (id: string, mode: 'student' | 'faculty') => {
    setRoleMode(mode);
    setSearchId(id);
    setLoading(true);
    setSearched(true);
    setTimeout(async () => {
      if (mode === 'student') {
        const stu = await lookupStudentProfile(id);
        setStudentResult(stu);
        setFacultyResult(null);
      } else {
        const fac = await lookupFacultyProfile(id);
        setFacultyResult(fac);
        setStudentResult(null);
      }
      setLoading(false);
    }, 150);
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Bar & Role Pill Toggle */}
      <ClayCard className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-[var(--clay-text)] flex items-center gap-2">
              <User className="h-5 w-5 text-[#FF7A59]" />
              <span>Campus Identity & Profile Dossier Lookup</span>
            </h3>
            <p className="text-xs text-[var(--clay-muted)]">
              Inspect comprehensive institutional telemetry, coding metrics, and workload dossiers.
            </p>
          </div>

          {/* Faculty / Student Toggle Pill */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--clay-pressed)] border border-[var(--clay-border)]">
            <button
              type="button"
              onClick={() => {
                setRoleMode('student');
                if (searchId === 'FAC210' || searchId === 'FAC204') setSearchId('241FA18067');
              }}
              className={`px-4 py-1.5 rounded-xl font-heading font-extrabold text-xs transition-all ${
                roleMode === 'student'
                  ? 'bg-[var(--clay-card)] text-[#FF7A59] shadow-sm'
                  : 'text-[var(--clay-muted)] hover:text-[var(--clay-text)]'
              }`}
            >
              Student Dossier
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleMode('faculty');
                if (searchId === '241FA18067' || searchId === '241FA04070') setSearchId('CSE_001');
              }}
              className={`px-4 py-1.5 rounded-xl font-heading font-extrabold text-xs transition-all ${
                roleMode === 'faculty'
                  ? 'bg-[var(--clay-card)] text-[#5B6CFF] shadow-sm'
                  : 'text-[var(--clay-muted)] hover:text-[var(--clay-text)]'
              }`}
            >
              Faculty Dossier
            </button>
          </div>
        </div>

        {/* Input & Submit */}
        <form onSubmit={(e) => { e.preventDefault(); handleLookup(); }} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full flex-1">
            <ClayInput
              placeholder={roleMode === 'student' ? 'Enter Reg No (e.g. 241FA18067)...' : 'Enter Faculty ID (e.g. CSE_001) or Name...'}
              icon={<Search className="h-4 w-4" />}
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              required
            />
          </div>
          <ClayButton variant="coral" size="md" type="submit" disabled={loading}>
            <span>{loading ? 'Searching...' : 'Open Profile Card'}</span>
          </ClayButton>
        </form>

        {/* Registered Identity Directory */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-bold text-[var(--clay-muted)]">Registered Institutional Records:</span>
          <button
            type="button"
            onClick={() => handleQuickSelect('241FA18067', 'student')}
            className="px-2.5 py-1 rounded-xl bg-[var(--clay-pressed)] hover:bg-[#FF7A59]/15 text-[var(--clay-text)] hover:text-[#FF7A59] font-mono font-bold transition-all"
          >
            241FA18067 (MD SAHIL - Student)
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect('241FA04070', 'student')}
            className="px-2.5 py-1 rounded-xl bg-[var(--clay-pressed)] hover:bg-rose-500/15 text-[var(--clay-text)] hover:text-rose-600 font-mono font-bold transition-all"
          >
            241FA04070 (SAGAR - At-Risk)
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect('CSE_001', 'faculty')}
            className="px-2.5 py-1 rounded-xl bg-[var(--clay-pressed)] hover:bg-[#5B6CFF]/15 text-[var(--clay-text)] hover:text-[#5B6CFF] font-mono font-bold transition-all"
          >
            CSE_001 (Dr. K.V. Krishna Kishore)
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect('CSE_002', 'faculty')}
            className="px-2.5 py-1 rounded-xl bg-[var(--clay-pressed)] hover:bg-[#2EC4B6]/15 text-[var(--clay-text)] hover:text-[#2EC4B6] font-mono font-bold transition-all"
          >
            CSE_002 (Dr. Venkatrama Phani Kumar)
          </button>
        </div>
      </ClayCard>

      {/* Profile Card Output */}
      {searched && (
        <div>
          {loading ? (
            <div className="py-16 text-center text-sm font-bold text-[var(--clay-muted)]">
              Retrieving institutional dossier...
            </div>
          ) : roleMode === 'student' && studentResult ? (
            /* STUDENT PROFILE CARD */
            <ClayCard className="p-6 sm:p-8 space-y-6 border-2 border-[var(--clay-border)]">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--clay-border)]">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#FF7A59] to-[#E05F3F] text-white flex items-center justify-center font-heading font-black text-2xl shadow-[var(--shadow-clay-coral)]">
                    {studentResult.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-extrabold text-2xl text-[var(--clay-text)]">
                        {studentResult.full_name}
                      </h3>
                      <ClayBadge
                        variant={
                          studentResult.risk_level === 'critical'
                            ? 'risk-critical'
                            : studentResult.risk_level === 'high'
                            ? 'risk-high'
                            : studentResult.risk_level === 'medium'
                            ? 'risk-medium'
                            : 'risk-low'
                        }
                        size="sm"
                      >
                        Risk {studentResult.risk_probability} ({studentResult.risk_level.toUpperCase()})
                      </ClayBadge>
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--clay-muted)]">
                      Reg No: <strong className="text-[var(--clay-text)]">{studentResult.reg_no}</strong> • {studentResult.section_name} • B.Tech CSE (Year 3)
                    </span>
                  </div>
                </div>

                {/* Score Gauge Chip */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--clay-pressed)]/60 border border-[var(--clay-border)]">
                  <div className="text-right">
                    <span className="text-[10px] font-heading font-extrabold text-[var(--clay-muted)] uppercase block">
                      Success Score
                    </span>
                    <span className="font-heading font-black text-2xl text-[#5B6CFF] tabular-nums">
                      {studentResult.success_score} <span className="text-xs text-[var(--clay-muted)]">/ 100</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Core Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)]">
                  <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">CGPA</span>
                  <span className="font-heading font-black text-xl text-[var(--clay-text)] tabular-nums">
                    {studentResult.cgpa}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)]">
                  <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Attendance</span>
                  <span
                    className={`font-heading font-black text-xl tabular-nums ${
                      studentResult.attendance_pct < 75 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {studentResult.attendance_pct}%
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)]">
                  <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Backlogs</span>
                  <span
                    className={`font-heading font-black text-xl tabular-nums ${
                      studentResult.backlogs > 0 ? 'text-rose-600' : 'text-[var(--clay-text)]'
                    }`}
                  >
                    {studentResult.backlogs}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)]">
                  <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Avg CIE Marks</span>
                  <span className="font-heading font-black text-xl text-[#5B6CFF] tabular-nums">
                    {studentResult.avg_cie_marks} / 10
                  </span>
                </div>
              </div>

              {/* Segment Classification */}
              <div className="p-4 rounded-2xl bg-[#5B6CFF]/10 border border-[#5B6CFF]/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-heading font-extrabold text-[#5B6CFF] uppercase tracking-wider">
                    Operational Behavioral Segment
                  </span>
                  <ClayBadge variant="indigo" size="sm">{studentResult.segment}</ClayBadge>
                </div>
                <p className="text-xs text-[var(--clay-text)] font-medium">
                  {studentResult.analytics.segment.rationale}
                </p>
              </div>

              {/* External Professional & Coding Links */}
              <div className="space-y-2 pt-2 border-t border-[var(--clay-border)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-extrabold text-[var(--clay-muted)] uppercase tracking-wider block">
                    Coding Profiles & Professional Networks
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Live Synced with Student Dashboard</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={studentResult.leetcode_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)] flex items-center justify-between group hover:border-[#FFA116] transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-[#FFA116]/15 text-[#FFA116] flex items-center justify-center font-bold">
                        <Code2 className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-heading font-extrabold text-xs text-[var(--clay-text)] block">LeetCode Profile</span>
                        <span className="text-[10px] text-[var(--clay-muted)]">{studentResult.leetcode_url.replace('https://', '')}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-[var(--clay-muted)] group-hover:text-[#FFA116]" />
                  </a>

                  <a
                    href={studentResult.codechef_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)] flex items-center justify-between group hover:border-[#5B4638] transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-[#5B4638]/15 text-[#5B4638] dark:text-[#D1C0B3] flex items-center justify-center font-bold">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-heading font-extrabold text-xs text-[var(--clay-text)] block">CodeChef Profile</span>
                        <span className="text-[10px] text-[var(--clay-muted)]">{studentResult.codechef_url.replace('https://', '')}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-[var(--clay-muted)] group-hover:text-[#5B4638]" />
                  </a>

                  <a
                    href={studentResult.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)] flex items-center justify-between group hover:border-[#0A66C2] transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-[#0A66C2]/15 text-[#0A66C2] flex items-center justify-center font-bold">
                        <Linkedin className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-heading font-extrabold text-xs text-[var(--clay-text)] block">LinkedIn Profile</span>
                        <span className="text-[10px] text-[var(--clay-muted)]">{studentResult.linkedin_url.replace('https://', '')}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-[var(--clay-muted)] group-hover:text-[#0A66C2]" />
                  </a>

                  <a
                    href={studentResult.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)] flex items-center justify-between group hover:border-black dark:hover:border-white transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-gray-500/15 text-[var(--clay-text)] flex items-center justify-center font-bold">
                        <Github className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-heading font-extrabold text-xs text-[var(--clay-text)] block">GitHub Repositories</span>
                        <span className="text-[10px] text-[var(--clay-muted)]">{studentResult.github_url.replace('https://', '')}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-[var(--clay-muted)] group-hover:text-[var(--clay-text)]" />
                  </a>
                </div>
              </div>
            </ClayCard>
          ) : roleMode === 'faculty' && facultyResult ? (
            /* FACULTY PROFILE CARD */
            <ClayCard className="p-6 sm:p-8 space-y-6 border-2 border-[var(--clay-border)]">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--clay-border)]">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-[var(--clay-pressed)] border border-[var(--clay-border)] flex-shrink-0 shadow-[var(--shadow-clay-badge)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={facultyResult.photo_url || facultyResult.avatar_url}
                      alt={facultyResult.full_name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="h-full w-full flex items-center justify-center font-heading font-black text-2xl text-white bg-gradient-to-br from-[#2EC4B6] to-[#1BA89B]">
                      {facultyResult.full_name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-extrabold text-2xl text-[var(--clay-text)]">
                        {facultyResult.full_name}
                      </h3>
                      <ClayBadge variant="coral" size="sm">
                        {facultyResult.designation || 'Active Faculty'}
                      </ClayBadge>
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--clay-muted)]">
                      Faculty ID: <strong className="text-[var(--clay-text)]">{facultyResult.faculty_id || facultyResult.reg_no}</strong> • {facultyResult.department}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:text-right text-xs text-[var(--clay-muted)] font-semibold">
                  <div className="flex items-center sm:justify-end gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#FF7A59]" />
                    <span>{facultyResult.office_location}</span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#5B6CFF]" />
                    <span>Office Hours: {facultyResult.cabin_hours}</span>
                  </div>
                  {facultyResult.profile_url && (
                    <a
                      href={facultyResult.profile_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center sm:justify-end gap-1 text-[11px] font-bold text-[#FF7A59] hover:underline"
                    >
                      <span>Vignan Official Profile</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Research Specializations */}
              {facultyResult.research_interests && (
                <div className="p-4 rounded-2xl bg-[#5B6CFF]/10 border border-[#5B6CFF]/30 space-y-1">
                  <span className="text-[10px] font-heading font-extrabold text-[#5B6CFF] uppercase tracking-wider block">
                    Research Specializations
                  </span>
                  <p className="text-xs text-[var(--clay-text)] font-semibold">
                    {facultyResult.research_interests}
                  </p>
                </div>
              )}

              {/* Faculty Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)]">
                  <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Assigned Sections</span>
                  <span className="font-heading font-extrabold text-sm text-[var(--clay-text)] block mt-1">
                    {facultyResult.assigned_sections.join(', ')}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)]">
                  <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Lecture Attendance</span>
                  <span className="font-heading font-black text-xl text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {facultyResult.attendance_pct}%
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)]">
                  <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Teaching Workload</span>
                  <span className="font-heading font-black text-xl text-[#5B6CFF] tabular-nums">
                    {facultyResult.workload_hours_per_week} <span className="text-xs text-[var(--clay-muted)]">hrs/wk</span>
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)]">
                  <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Official Email</span>
                  <span className="font-mono font-bold text-xs text-[#FF7A59] block mt-1 truncate">
                    {facultyResult.email}
                  </span>
                </div>
              </div>

              {/* Courses Taught List */}
              <div className="space-y-2 pt-2 border-t border-[var(--clay-border)]">
                <span className="text-xs font-heading font-extrabold text-[var(--clay-muted)] uppercase tracking-wider block">
                  Current Semester Teaching Assignments ({facultyResult.courses_taught.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {facultyResult.courses_taught.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[var(--clay-pressed)]/50 border border-[var(--clay-border)] text-xs font-bold text-[var(--clay-text)] flex items-center gap-2"
                    >
                      <GraduationCap className="h-4 w-4 text-[#5B6CFF] flex-shrink-0" />
                      <span className="truncate">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ClayCard>
          ) : (
            <div className="py-12 text-center text-xs font-bold text-rose-500">
              No matching {roleMode} profile found for identifier &quot;{searchId}&quot;. Please verify the registration number.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
