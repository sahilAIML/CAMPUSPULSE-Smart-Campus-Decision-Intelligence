'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileCheck2,
  GraduationCap,
  ExternalLink,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { FacultySidebar } from '@/components/faculty/FacultySidebar';
import { FacultyBottomBar } from '@/components/faculty/FacultyBottomBar';
import { FacultyHeader } from '@/components/faculty/FacultyHeader';
import { FacultyKpiRow } from '@/components/faculty/FacultyKpiRow';
import { PriorityTable } from '@/components/faculty/PriorityTable';
import { FacultyAnalyticsGrid } from '@/components/faculty/FacultyAnalyticsGrid';
import { StudentDrawer } from '@/components/faculty/StudentDrawer';
import { ExamGenerator } from '@/components/faculty/ExamGenerator';
import { ExamResultsView } from '@/components/faculty/ExamResultsView';
import { StudentListItem, getSectionStudents } from '@/lib/data/students';
import { getSessionUser } from '@/lib/data/auth';
import { AuthUser } from '@/lib/data/types';
import { ClayCard } from '@/components/ui/ClayCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function FacultyDashboardPage() {
  const [currentSection, setCurrentSection] = useState<'A' | 'B' | 'C' | 'all'>('A');
  const [activeTab, setActiveTab] = useState('home');
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  // Authentication & Security Guard
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const user = getSessionUser();
    setCurrentUser(user);
    setAuthChecked(true);
  }, []);

  // Load section students
  const loadCohort = async () => {
    setLoading(true);
    const data = await getSectionStudents(currentSection);
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== 'student') {
      setSelectedSegment(null);
      loadCohort();
    }
  }, [currentSection, currentUser]);

  const handleSelectStudent = (student: StudentListItem) => {
    setSelectedStudent(student);
  };

  // Access Denied Guard: Block unauthenticated users or students
  if (authChecked && (!currentUser || currentUser.role === 'student')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--clay-bg)] text-[var(--clay-text)]">
        <ClayCard className="max-w-lg p-8 text-center space-y-5 border-2 border-[var(--clay-border)] shadow-[var(--shadow-clay-card-hover)] relative">
          <div className="flex justify-end">
            <ThemeToggle size="sm" />
          </div>
          <div className="h-16 w-16 rounded-3xl bg-rose-500/15 text-rose-600 mx-auto flex items-center justify-center shadow-[var(--shadow-clay-badge)]">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-2xl text-[var(--clay-text)] mb-2">
              Faculty Access Restricted
            </h2>
            <p className="text-xs sm:text-sm text-[var(--clay-muted)] leading-relaxed">
              This area contains faculty cohort management, exam lifecycle controls, and confidential student performance records. Students are not authorized to view cohort rosters.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--clay-pressed)] border border-[var(--clay-border)] text-xs text-[var(--clay-muted)] font-mono">
            Security Status: {currentUser ? `Signed in as Student (${currentUser.full_name})` : 'Unauthenticated Session'}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#FF7A59] text-white text-xs font-heading font-extrabold shadow-[var(--shadow-clay-coral)] hover:opacity-90 transition-all"
            >
              Sign In with Faculty Credentials
            </Link>
            {currentUser?.role === 'student' && (
              <Link
                href="/student"
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] text-[var(--clay-text)] text-xs font-heading font-bold shadow-[var(--shadow-clay-btn)] hover:text-[#5B6CFF] transition-all"
              >
                Go to My Student Portal
              </Link>
            )}
          </div>
        </ClayCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--clay-bg)] text-[var(--clay-text)] flex p-3 sm:p-5 gap-5 pb-24 lg:pb-5">
      {/* 1. Desktop Sticky Sidebar */}
      <FacultySidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 2. Main Dashboard Content Column */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col min-w-0">
        {/* Dynamic Header with Section Tabs & Instant Search */}
        <FacultyHeader
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          students={students}
          onSelectStudent={handleSelectStudent}
        />

        {/* Quick View Mode Switcher Pills */}
        <div className="flex items-center justify-between gap-3 mb-6 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/35 backdrop-blur-md border border-white/20 shadow-sm">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-heading text-xs transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-[#FF7A59] shadow-sm font-extrabold'
                  : 'text-white/90 hover:text-white hover:bg-white/10 font-bold'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('exams')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-heading text-xs transition-all ${
                activeTab === 'exams'
                  ? 'bg-white text-[#FF7A59] shadow-sm font-extrabold'
                  : 'text-white/90 hover:text-white hover:bg-white/10 font-bold'
              }`}
            >
              <FileCheck2 className="h-3.5 w-3.5 text-[#5B6CFF]" />
              <span>Generate Exam</span>
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-heading text-xs transition-all ${
                activeTab === 'results'
                  ? 'bg-white text-[#FF7A59] shadow-sm font-extrabold'
                  : 'text-white/90 hover:text-white hover:bg-white/10 font-bold'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5 text-[#2EC4B6]" />
              <span>Exam Results</span>
            </button>
          </div>

          {/* Direct Link to Student Exam Simulator */}
          <Link
            href="/student/exam/exam-cie2-dsa"
            target="_blank"
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#5B6CFF] to-[#2EC4B6] border border-white/30 text-xs font-heading font-extrabold text-white hover:opacity-95 active:scale-95 transition-all shadow-md flex-shrink-0 drop-shadow"
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span>Launch Timed Exam (Student View)</span>
            <ExternalLink className="h-3.5 w-3.5 text-white" />
          </Link>
        </div>

        {/* Tab-driven Content Views */}
        {activeTab === 'exams' ? (
          <ExamGenerator
            onExamCreated={() => {
              setActiveTab('results');
            }}
            onViewResults={() => {
              setActiveTab('results');
            }}
          />
        ) : activeTab === 'results' ? (
          <ExamResultsView
            onNavigateToBuilder={() => setActiveTab('exams')}
            onSelectStudent={handleSelectStudent}
          />
        ) : loading ? (
          <div className="py-24 text-center text-sm font-heading font-bold text-[var(--clay-muted)]">
            Analyzing student cohort and computing early-warning telemetry...
          </div>
        ) : (
          <>
            {/* KPI Row with Count-Up and Sparklines */}
            <FacultyKpiRow students={students} />

            {/* Cross-Linked Analytics Grid (Histogram, Scatter, Donut, Section Comparison) */}
            <FacultyAnalyticsGrid
              students={students}
              onSelectStudent={handleSelectStudent}
              onSelectSegment={(seg) => {
                setSelectedSegment(selectedSegment === seg ? null : seg);
              }}
            />

            {/* Priority Table "Needs Attention" (Sortable, Filterable, Export CSV/PDF, Mobile Cards) */}
            <PriorityTable
              students={students}
              onSelectStudent={handleSelectStudent}
              segmentFilter={selectedSegment}
              onClearSegmentFilter={() => setSelectedSegment(null)}
            />
          </>
        )}
      </main>

      {/* 3. Slide-Out Student Detail & Intervention Drawer */}
      <StudentDrawer
        studentId={selectedStudent?.student_id ?? null}
        onClose={() => setSelectedStudent(null)}
        onInterventionAdded={() => {
          loadCohort();
        }}
      />

      {/* 4. Mobile Bottom Tab Bar */}
      <FacultyBottomBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
