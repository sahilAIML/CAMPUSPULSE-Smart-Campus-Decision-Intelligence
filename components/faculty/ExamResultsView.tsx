'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Trophy,
  BarChart3,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Search,
  ChevronRight,
  ShieldAlert,
  Play,
  Square,
  Edit3,
  Save,
  X,
  Check,
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
  ReferenceLine,
} from 'recharts';
import { ClayCard } from '../ui/ClayCard';
import { ClayBadge } from '../ui/ClayBadge';
import { ClayButton } from '../ui/ClayButton';
import { ClayInput } from '../ui/ClayInput';
import {
  Exam,
  ExamResultSummary,
  StudentExamResult,
  getExams,
  getExamResults,
  startExam,
  stopExam,
  appointStudentMarks,
} from '@/lib/data/exams';
import { StudentListItem } from '@/lib/data/students';

interface ExamResultsViewProps {
  initialExamId?: string;
  onSelectStudent?: (student: StudentListItem) => void;
  onNavigateToBuilder?: () => void;
}

export function ExamResultsView({
  initialExamId,
  onSelectStudent,
  onNavigateToBuilder,
}: ExamResultsViewProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(initialExamId || 'exam-cie2-dsa');
  const [sectionFilter, setSectionFilter] = useState<'all' | 'sec-a' | 'sec-b' | 'sec-c'>('all');
  const [results, setResults] = useState<ExamResultSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Appoint Marks Modal State
  const [gradingStudent, setGradingStudent] = useState<StudentExamResult | null>(null);
  const [newScoreInput, setNewScoreInput] = useState<string>('8.5');
  const [noteInput, setNoteInput] = useState<string>('');
  const [appointing, setAppointing] = useState(false);

  // Load available exams
  const loadExamsList = async () => {
    const data = await getExams();
    setExams(data);
    if (!selectedExamId && data.length > 0) {
      setSelectedExamId(data[0].id);
    }
  };

  useEffect(() => {
    loadExamsList();
  }, []);

  // Load results for selected exam
  const loadExamTelemetry = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    const res = await getExamResults(selectedExamId, sectionFilter);
    setResults(res);
    setLoading(false);
  };

  useEffect(() => {
    loadExamTelemetry();
  }, [selectedExamId, sectionFilter]);

  const handleManualSync = async () => {
    setSyncing(true);
    await loadExamTelemetry();
    setSyncing(false);
    setStatusMessage({
      text: 'Exam scores synced with Academic CIE telemetry. Student Success Scores successfully recomputed!',
      type: 'success',
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Start Exam Handler
  const handleStartExam = async () => {
    if (!selectedExamId) return;
    setActionLoading(true);
    try {
      await startExam(selectedExamId);
      await Promise.all([loadExamsList(), loadExamTelemetry()]);
      setStatusMessage({
        text: `Exam "${results?.exam_name || 'Selected'}" has been STARTED. Student attempt portal is now open!`,
        type: 'success',
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to start exam', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Stop Exam Handler
  const handleStopExam = async () => {
    if (!selectedExamId) return;
    setActionLoading(true);
    try {
      await stopExam(selectedExamId);
      await Promise.all([loadExamsList(), loadExamTelemetry()]);
      setStatusMessage({
        text: `Exam "${results?.exam_name || 'Selected'}" has been STOPPED. Submissions are now closed and finalized.`,
        type: 'info',
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to stop exam', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Appoint Marks Modal
  const handleOpenAppointModal = (student: StudentExamResult) => {
    setGradingStudent(student);
    setNewScoreInput(String(student.score));
    setNoteInput(student.faculty_note || '');
  };

  // Save Appointed Marks
  const handleSaveAppointMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingStudent || !selectedExamId) return;

    const parsed = parseFloat(newScoreInput);
    if (isNaN(parsed) || parsed < 0 || parsed > gradingStudent.total) {
      alert(`Score must be between 0 and ${gradingStudent.total}.`);
      return;
    }

    setAppointing(true);
    try {
      await appointStudentMarks(
        selectedExamId,
        gradingStudent.reg_no,
        parsed,
        noteInput.trim() || undefined
      );

      await loadExamTelemetry();
      setGradingStudent(null);
      setStatusMessage({
        text: `Marks appointed for ${gradingStudent.full_name} (${gradingStudent.reg_no}): ${parsed}/${gradingStudent.total} pts. Success Score and tie-aware standings updated!`,
        type: 'success',
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to appoint marks.');
    } finally {
      setAppointing(false);
    }
  };

  // Search filtered student results
  const filteredStudents = (results?.student_results || []).filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.reg_no.toLowerCase().includes(q) || s.full_name.toLowerCase().includes(q);
  });

  // Weak topics (accuracy < 60%)
  const weakTopics = (results?.question_accuracy || []).filter((q) => q.is_weak_topic);

  // Custom Accuracy Chart Tooltip
  const CustomAccuracyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-2xl bg-[var(--clay-card)] p-3.5 shadow-[var(--shadow-clay-card-hover)] border border-[var(--clay-border)] text-xs font-heading">
          <p className="font-extrabold text-[var(--clay-text)]">
            Q{data.question_number}: {data.topic}
          </p>
          <p className="text-[10px] text-[var(--clay-muted)] line-clamp-2 max-w-xs mb-2">
            {data.question_text}
          </p>
          <div className="flex justify-between gap-3 font-bold">
            <span className={data.is_weak_topic ? 'text-rose-500' : 'text-emerald-600'}>
              Accuracy: {data.accuracy_pct}%
            </span>
            <span className="text-[var(--clay-muted)]">
              {data.correct_count}/{data.total_count} Correct
            </span>
          </div>
          {data.is_weak_topic && (
            <div className="mt-1 text-[10px] font-extrabold text-rose-500 uppercase tracking-wide">
              Weak Topic Alert (&lt; 60%)
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const isExamActive = results?.exam_status === 'active' || results?.exam_status === 'published';

  return (
    <div className="w-full space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <ClayBadge variant="indigo" icon={<GraduationCap className="h-3.5 w-3.5" />}>
              Exam Analytics & Evaluation
            </ClayBadge>
            {isExamActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-heading font-extrabold text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                LIVE (Accepting Submissions)
              </span>
            ) : results?.exam_status === 'stopped' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-heading font-extrabold text-xs">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                STOPPED (Submissions Closed)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-heading font-extrabold text-xs">
                DRAFT
              </span>
            )}
            <ClayBadge variant="teal" size="sm">
              Tie-Aware Standard Competition Rank
            </ClayBadge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Cohort Exam Results Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-white/95 font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            Start or stop examinations, track submission counts, appoint student marks, and view weak topic diagnostics.
          </p>
        </div>

        {/* Global Actions & Exam Selector */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Exam Selector Dropdown */}
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] text-[var(--clay-text)] shadow-[var(--shadow-clay-input)] px-4 py-2 text-xs font-bold outline-none min-h-[40px]"
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name} [{exam.status.toUpperCase()}]
              </option>
            ))}
          </select>

          {/* Exam Start / Stop Toggle */}
          {isExamActive ? (
            <ClayButton
              variant="coral"
              size="sm"
              onClick={handleStopExam}
              disabled={actionLoading}
            >
              <Square className="h-3.5 w-3.5" />
              <span>{actionLoading ? 'Updating...' : 'Stop Exam'}</span>
            </ClayButton>
          ) : (
            <ClayButton
              variant="teal"
              size="sm"
              onClick={handleStartExam}
              disabled={actionLoading}
            >
              <Play className="h-3.5 w-3.5" />
              <span>{actionLoading ? 'Updating...' : 'Start Exam'}</span>
            </ClayButton>
          )}

          <ClayButton
            variant="default"
            size="sm"
            onClick={handleManualSync}
            disabled={syncing}
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#2EC4B6] ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Recomputing...' : 'Recompute Scores'}</span>
          </ClayButton>

          {onNavigateToBuilder && (
            <ClayButton variant="coral" size="sm" onClick={onNavigateToBuilder}>
              <span>+ Create Exam</span>
            </ClayButton>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-800 dark:text-rose-300'
              : 'bg-blue-500/15 border-blue-500/30 text-blue-800 dark:text-blue-300'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Section Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-[var(--clay-muted)] mr-1">Section Roster:</span>
        <button
          onClick={() => setSectionFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl font-heading font-bold text-xs transition-all ${
            sectionFilter === 'all'
              ? 'bg-[#FF7A59] text-white shadow-[var(--shadow-clay-coral)]'
              : 'bg-[var(--clay-card)] text-[var(--clay-text)] shadow-[var(--shadow-clay-btn)]'
          }`}
        >
          All Sections (120 Students)
        </button>
        <button
          onClick={() => setSectionFilter('sec-a')}
          className={`px-3.5 py-1.5 rounded-xl font-heading font-bold text-xs transition-all ${
            sectionFilter === 'sec-a'
              ? 'bg-[#5B6CFF] text-white shadow-md'
              : 'bg-[var(--clay-card)] text-[var(--clay-text)] shadow-[var(--shadow-clay-btn)]'
          }`}
        >
          Section A (40 Students)
        </button>
        <button
          onClick={() => setSectionFilter('sec-b')}
          className={`px-3.5 py-1.5 rounded-xl font-heading font-bold text-xs transition-all ${
            sectionFilter === 'sec-b'
              ? 'bg-[#2EC4B6] text-white shadow-md'
              : 'bg-[var(--clay-card)] text-[var(--clay-text)] shadow-[var(--shadow-clay-btn)]'
          }`}
        >
          Section B (40 Students)
        </button>
        <button
          onClick={() => setSectionFilter('sec-c')}
          className={`px-3.5 py-1.5 rounded-xl font-heading font-bold text-xs transition-all ${
            sectionFilter === 'sec-c'
              ? 'bg-[#FFC857] text-gray-900 shadow-md'
              : 'bg-[var(--clay-card)] text-[var(--clay-text)] shadow-[var(--shadow-clay-btn)]'
          }`}
        >
          Section C (40 Students)
        </button>
      </div>

      {loading || !results ? (
        <div className="py-20 text-center text-sm font-bold text-[var(--clay-muted)]">
          Evaluating student attempts and calculating tie-aware standings...
        </div>
      ) : (
        <>
          {/* 1. Exam Performance KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Class Average */}
            <ClayCard className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#5B6CFF]/15 text-[#5B6CFF] flex items-center justify-center font-heading font-extrabold shadow-[var(--shadow-clay-badge)]">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-heading font-extrabold text-[var(--clay-muted)] uppercase tracking-wider block">
                  Class Average
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-[var(--clay-text)] tabular-nums">
                  {results.class_average} <span className="text-xs text-[var(--clay-muted)]">/ 10</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {results.pass_percentage}% Pass Rate
                </span>
              </div>
            </ClayCard>

            {/* Class Topper */}
            <ClayCard className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#FFC857] to-[#E5AC25] text-amber-950 flex items-center justify-center font-heading font-extrabold shadow-[var(--shadow-clay-sun)]">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-heading font-extrabold text-[var(--clay-muted)] uppercase tracking-wider block">
                  Cohort Topper
                </span>
                <h3 className="font-heading font-extrabold text-base text-[var(--clay-text)] truncate">
                  {results.topper.name}
                </h3>
                <span className="text-xs font-bold text-[#FF7A59] tabular-nums block">
                  {results.topper.reg_no} • {results.topper.score}/10
                </span>
              </div>
            </ClayCard>

            {/* Total Submissions with Real-Time Progress Bar */}
            <ClayCard className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#2EC4B6]/15 text-[#2EC4B6] flex items-center justify-center font-heading font-extrabold shadow-[var(--shadow-clay-badge)]">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-heading font-extrabold text-[var(--clay-muted)] uppercase tracking-wider block">
                  Submissions Turnout
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-[var(--clay-text)] tabular-nums">
                  {results.total_submissions}{' '}
                  <span className="text-xs text-[var(--clay-muted)] font-bold">
                    of {results.total_enrolled} students
                  </span>
                </h3>
                {/* Visual Turnout Bar */}
                <div className="w-full bg-[var(--clay-pressed)] h-2 rounded-full mt-2 overflow-hidden border border-[var(--clay-border)]">
                  <div
                    className="bg-[#2EC4B6] h-full rounded-full transition-all duration-500"
                    style={{ width: `${results.submission_percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-[var(--clay-muted)] mt-1">
                  <span>{results.submission_percentage}% Submitted</span>
                  <span>{Math.max(0, results.total_enrolled - results.total_submissions)} Pending</span>
                </div>
              </div>
            </ClayCard>

            {/* Weak Topics Flag */}
            <ClayCard className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center font-heading font-extrabold shadow-[var(--shadow-clay-badge)]">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-heading font-extrabold text-[var(--clay-muted)] uppercase tracking-wider block">
                  Weak Topics Detected
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-rose-600 dark:text-rose-400 tabular-nums">
                  {weakTopics.length} Topics
                </h3>
                <span className="text-[11px] font-bold text-[var(--clay-muted)]">
                  Accuracy &lt; 60%
                </span>
              </div>
            </ClayCard>
          </div>

          {/* 2. Question-Wise Accuracy Chart & Weak Topics Remediation */}
          <ClayCard className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading font-extrabold text-base text-[var(--clay-text)]">
                  Question-Wise Accuracy Breakdown
                </h3>
                <p className="text-xs text-[var(--clay-muted)]">
                  Percentage of students answering each question correctly across curriculum topics.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#2EC4B6]" />
                  <span>Safe (≥ 60%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#FF7A59]" />
                  <span>Weak Topic (&lt; 60%)</span>
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-[240px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results.question_accuracy} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="question_number"
                    tickFormatter={(val) => `Q${val}`}
                    stroke="var(--clay-muted)"
                    fontSize={11}
                  />
                  <YAxis domain={[0, 100]} unit="%" stroke="var(--clay-muted)" fontSize={11} />
                  <Tooltip content={<CustomAccuracyTooltip />} />
                  <ReferenceLine y={60} stroke="#FF7A59" strokeDasharray="3 3" label={{ value: '60% Cutoff', fill: '#FF7A59', fontSize: 10, position: 'right' }} />
                  <Bar dataKey="accuracy_pct" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {results.question_accuracy.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.is_weak_topic ? '#FF7A59' : '#2EC4B6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weak Topics Diagnostic Callout */}
            {weakTopics.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
                <div className="flex items-center gap-2 mb-2 font-heading font-extrabold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>Curriculum Weakness Alert (Remedial Action Recommended):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-900 dark:text-amber-200">
                  {weakTopics.map((wt) => (
                    <div
                      key={wt.question_id}
                      className="p-2.5 rounded-xl bg-[var(--clay-card)] border border-amber-500/20 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-extrabold">Q{wt.question_number}: {wt.topic}</span>
                        <span className="text-[11px] text-[var(--clay-muted)] block line-clamp-1">{wt.question_text}</span>
                      </div>
                      <span className="font-extrabold text-rose-500 tabular-nums ml-2">
                        {wt.accuracy_pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ClayCard>

          {/* 3. Tie-Aware Roster & Standings Table with Appoint Marks Action */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[var(--clay-text)]">
                  Student Leaderboard (Tie-Aware Standard Competition Rank)
                </h3>
                <span className="text-xs font-bold text-[var(--clay-muted)]">
                  Faculty can appoint and adjust marks directly. Feeds live into student success scores.
                </span>
              </div>

              <div className="w-full sm:w-64">
                <ClayInput
                  placeholder="Search by reg no or name..."
                  icon={<Search className="h-3.5 w-3.5" />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <ClayCard className="overflow-hidden p-0 border border-[var(--clay-border)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" aria-label="Exam Results Table">
                  <thead className="bg-[var(--clay-pressed)]/80 text-[var(--clay-muted)] font-heading font-extrabold uppercase tracking-wider border-b border-[var(--clay-border)]">
                    <tr>
                      <th className="py-3.5 px-4">Rank</th>
                      <th className="py-3.5 px-4">Reg No</th>
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-3">Section</th>
                      <th className="py-3.5 px-4 text-center">Marks Scored</th>
                      <th className="py-3.5 px-3 text-center">Accuracy</th>
                      <th className="py-3.5 px-4 text-center">Appoint Marks</th>
                      <th className="py-3.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--clay-border)] font-medium">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-[var(--clay-muted)] font-semibold">
                          No student submissions found matching the criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => {
                        const isTopper = student.rank === 1;
                        const isFailed = student.score < student.total * 0.5;

                        return (
                          <tr
                            key={student.reg_no}
                            className={`hover:bg-[var(--clay-pressed)]/60 transition-colors ${
                              isTopper ? 'bg-amber-500/5' : isFailed ? 'bg-rose-500/5' : ''
                            }`}
                          >
                            {/* Rank (Tie-Aware) */}
                            <td className="py-3.5 px-4 font-heading font-extrabold tabular-nums">
                              <span
                                className={`inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-lg text-xs ${
                                  student.rank === 1
                                    ? 'bg-[#FFC857] text-gray-950 font-black shadow-sm'
                                    : student.rank === 2
                                    ? 'bg-slate-300 dark:bg-slate-700 text-[var(--clay-text)] font-extrabold'
                                    : student.rank === 3
                                    ? 'bg-amber-700/20 text-amber-800 dark:text-amber-400 font-bold'
                                    : 'text-[var(--clay-muted)]'
                                }`}
                              >
                                #{student.rank}
                              </span>
                            </td>

                            {/* Reg No */}
                            <td className="py-3.5 px-4 font-mono font-bold text-[var(--clay-text)] tabular-nums">
                              {student.reg_no}
                            </td>

                            {/* Name */}
                            <td className="py-3.5 px-4 font-bold text-[var(--clay-text)]">
                              <div className="flex items-center gap-2">
                                <span>{student.full_name}</span>
                                {isTopper && (
                                  <ClayBadge variant="sun" size="sm">
                                    Topper
                                  </ClayBadge>
                                )}
                              </div>
                            </td>

                            {/* Section */}
                            <td className="py-3.5 px-3 font-semibold text-[var(--clay-muted)]">
                              {student.section_name}
                            </td>

                            {/* Marks Scored */}
                            <td className="py-3.5 px-4 text-center tabular-nums font-extrabold text-sm">
                              <span
                                className={
                                  isFailed
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                                }
                              >
                                {student.score}
                              </span>
                              <span className="text-xs text-[var(--clay-muted)]"> / {student.total}</span>
                            </td>

                            {/* Accuracy % */}
                            <td className="py-3.5 px-3 text-center tabular-nums font-bold">
                              {student.accuracy_pct}%
                            </td>

                            {/* Appoint Marks Action */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => handleOpenAppointModal(student)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-btn)] text-xs font-heading font-extrabold text-[#5B6CFF] hover:bg-[#5B6CFF]/10 active:scale-95 transition-all"
                              >
                                <Edit3 className="h-3 w-3" />
                                <span>Appoint Marks</span>
                              </button>
                              {student.faculty_note && (
                                <span className="block text-[10px] text-[var(--clay-muted)] italic truncate max-w-[130px] mx-auto mt-0.5">
                                  {student.faculty_note}
                                </span>
                              )}
                            </td>

                            {/* Academic Status */}
                            <td className="py-3.5 px-4 text-right">
                              {isFailed ? (
                                <ClayBadge variant="risk-critical" size="sm">
                                  Remedial Needed
                                </ClayBadge>
                              ) : (
                                <ClayBadge variant="risk-low" size="sm">
                                  Cleared
                                </ClayBadge>
                              )}
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
        </>
      )}

      {/* Appoint Marks Modal Dialog */}
      {gradingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setGradingStudent(null)}
          />
          <ClayCard className="relative w-full max-w-md rounded-[32px] p-6 sm:p-7 border-2 border-[var(--clay-border)] shadow-[var(--shadow-clay-card-hover)] z-10 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setGradingStudent(null)}
              className="absolute top-5 right-5 h-8 w-8 rounded-xl bg-[var(--clay-card)] border border-[var(--clay-border)] flex items-center justify-center text-[var(--clay-muted)] hover:text-[var(--clay-text)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-11 w-11 rounded-2xl bg-[#5B6CFF] text-white flex items-center justify-center shadow-[var(--shadow-clay-badge)]">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[var(--clay-text)]">
                  Appoint Student Marks
                </h3>
                <span className="text-xs font-bold text-[var(--clay-muted)]">
                  {gradingStudent.full_name} • <span className="font-mono text-[#FF7A59]">{gradingStudent.reg_no}</span>
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveAppointMarks} className="space-y-4">
              <div>
                <label className="text-xs font-heading font-extrabold text-[var(--clay-muted)] uppercase tracking-wider block mb-1.5">
                  Appointed Score (Max: {gradingStudent.total} pts)
                </label>
                <input
                  type="number"
                  min="0"
                  max={gradingStudent.total}
                  step="0.1"
                  value={newScoreInput}
                  onChange={(e) => setNewScoreInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] text-base font-extrabold text-[var(--clay-text)] shadow-[var(--shadow-clay-input)] outline-none focus:border-[#5B6CFF]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-heading font-extrabold text-[var(--clay-muted)] uppercase tracking-wider block mb-1.5">
                  Faculty Evaluation Remark / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Viva voce moderation +1.5, lab performance score..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] text-xs font-medium text-[var(--clay-text)] shadow-[var(--shadow-clay-input)] outline-none focus:border-[#5B6CFF]"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--clay-pressed)]/70 border border-[var(--clay-border)] text-[11px] text-[var(--clay-muted)] leading-relaxed">
                <strong className="text-[var(--clay-text)]">Immediate Telemetry Recomputation:</strong> Appointed marks will update the student's CIE score, recalculate class standings with tie-awareness, and recompute their Student Success Score in real time.
              </div>

              <div className="pt-3 border-t border-[var(--clay-border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setGradingStudent(null)}
                  className="px-4 py-2 text-xs font-heading font-bold text-[var(--clay-muted)] hover:text-[var(--clay-text)]"
                >
                  Cancel
                </button>
                <ClayButton
                  type="submit"
                  variant="coral"
                  size="sm"
                  disabled={appointing}
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{appointing ? 'Appointing...' : 'Save & Recompute'}</span>
                </ClayButton>
              </div>
            </form>
          </ClayCard>
        </div>
      )}
    </div>
  );
}
