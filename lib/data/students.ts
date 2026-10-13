// ============================================================================
// CAMPUSPULSE: SMART CAMPUS ANALYTICS
// Data Access Layer: Students, Section Cohorts, and Interventions
// ============================================================================

import {
  RawStudentMetrics,
  StudentSuccessResult,
  ScoreWeightsConfig,
  DEFAULT_SCORE_WEIGHTS,
} from '../analytics/types';
import {
  computeStudentSuccessScore,
  computeSectionBenchmarks,
  batchComputeStudentScores,
} from '../analytics/engine';
import { getSupabaseClient, isSupabaseConfigured } from './supabase-client';

export interface StudentListItem {
  student_id: string;
  reg_no: string;
  full_name: string;
  section_id: string;
  section_name: string;
  cgpa: number;
  backlogs: number;
  attendance_pct: number;
  avg_cie_marks: number;
  success_score: number;
  risk_probability: number; // 0.00 to 1.00
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  academic_risk: boolean;
  placement_risk: boolean;
  segment: string;
  active_interventions_count: number;
  coding_score: number;
  avatar_url?: string;
}

export interface StudentDetail extends StudentListItem {
  analytics: StudentSuccessResult;
  raw_metrics: RawStudentMetrics;
  attendance_trend: { month: string; attendance_pct: number; held: number; attended: number }[];
  marks_trend: { subject: string; f1: number; f2: number; semester: number }[];
  skills_breakdown: { skill: string; score: number }[];
  interventions: {
    id: string;
    type: string;
    note: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'escalated';
    created_at: string;
    due_date?: string;
  }[];
}

// ----------------------------------------------------------------------------
// Deterministic 120-Student Generation (CSE Year 3: Sections A, B, C)
// Matches SQL Seed: MD SAHIL (241FA18067, 74% att) and SAGAR (241FA04070, risk 0.99)
// ----------------------------------------------------------------------------
function generateMockCohort(): RawStudentMetrics[] {
  const firstNames = [
    'Aarav', 'Aditya', 'Akash', 'Ananya', 'Aniket', 'Anushka', 'Arjun', 'Bhavya',
    'Chaitanya', 'Deepak', 'Divya', 'Gautam', 'Harsh', 'Ishaan', 'Kavya', 'Kiran',
    'Manish', 'Meera', 'Nikhil', 'Pooja', 'Pranav', 'Priya', 'Rahul', 'Rhea',
    'Rohan', 'Rohit', 'Sanjana', 'Sneha', 'Sourabh', 'Suhani', 'Tanvi', 'Tarun',
    'Utkarsh', 'Varun', 'Vikas', 'Yash', 'Zoya', 'Karthik', 'Swati', 'Harini',
  ];
  const lastNames = [
    'Sharma', 'Verma', 'Patel', 'Reddy', 'Rao', 'Iyer', 'Nair', 'Deshmukh',
    'Gupta', 'Kumar', 'Singh', 'Choudhury', 'Joshi', 'Mehta', 'Bhat', 'Menon',
    'Pillai', 'Hegde', 'Kulkarni', 'Sen', 'Das', 'Chatterjee', 'Mishra', 'Agarwal',
  ];

  const sectionIds = ['sec-a', 'sec-b', 'sec-c'];
  const prefixes = ['241FA18', '241FA04', '241FA05'];
  const students: RawStudentMetrics[] = [];

  for (let sIdx = 0; sIdx < 3; sIdx++) {
    for (let idx = 1; idx <= 40; idx++) {
      const studentId = `stu-${sIdx}-${idx}`;
      const sectionId = sectionIds[sIdx];

      // MD SAHIL (Target Wireframe Persona)
      if (sIdx === 0 && idx === 27) {
        students.push({
          student_id: studentId,
          section_id: sectionId,
          reg_no: '241FA18067',
          full_name: 'MD SAHIL',
          cgpa: 8.5,
          backlogs: 0,
          avg_cie_marks: 8.4,
          attendance_pct: 74, // Exactly 74%
          logins_30d: 26,
          assignments_done: 18,
          assignments_total: 20,
          events: 4,
          clubs: 2,
          hackathons: 2,
          certifications: 2,
          aptitude: 82.5,
          coding: 86.0,
          mock_interview: 84.0,
          communication: 8.0,
          programming: 8.8,
          leadership: 7.5,
          sports: 6.5,
          avg_feedback: 4.5,
        });
        continue;
      }

      // SAGAR (Target Wireframe Persona - Critical Risk)
      if (sIdx === 1 && idx === 30) {
        students.push({
          student_id: studentId,
          section_id: sectionId,
          reg_no: '241FA04070',
          full_name: 'SAGAR',
          cgpa: 5.5,
          backlogs: 5,
          avg_cie_marks: 4.8,
          attendance_pct: 42, // Critical attendance
          logins_30d: 3,
          assignments_done: 4,
          assignments_total: 20,
          events: 0,
          clubs: 0,
          hackathons: 0,
          certifications: 0,
          aptitude: 38.0,
          coding: 32.0,
          mock_interview: 25.0,
          communication: 3.5,
          programming: 4.0,
          leadership: 2.5,
          sports: 4.0,
          avg_feedback: 2.0,
        });
        continue;
      }

      // Outlier: Aniket Rao (High marks, low attendance medical leave)
      if (sIdx === 0 && idx === 12) {
        students.push({
          student_id: studentId,
          section_id: sectionId,
          reg_no: `${prefixes[sIdx]}${String(idx).padStart(3, '0')}`,
          full_name: 'Aniket Rao',
          cgpa: 9.15,
          backlogs: 0,
          avg_cie_marks: 9.2,
          attendance_pct: 66,
          logins_30d: 29,
          assignments_done: 19,
          assignments_total: 20,
          events: 1,
          clubs: 1,
          hackathons: 1,
          certifications: 3,
          aptitude: 92.0,
          coding: 88.0,
          mock_interview: 90.0,
          communication: 8.5,
          programming: 9.0,
          leadership: 8.0,
          sports: 3.0,
          avg_feedback: 4.8,
        });
        continue;
      }

      // Correlated Realistic Distribution
      const regNo = `${prefixes[sIdx]}${String(idx).padStart(3, '0')}`;
      const fn = firstNames[(idx * 7 + sIdx * 13) % firstNames.length];
      const ln = lastNames[(idx * 11 + sIdx * 5) % lastNames.length];
      const fullName = `${fn} ${ln}`;

      if (idx % 8 === 0) {
        // Struggling cohort
        students.push({
          student_id: studentId,
          section_id: sectionId,
          reg_no: regNo,
          full_name: fullName,
          cgpa: Number((5.2 + (idx % 12) * 0.12).toFixed(2)),
          backlogs: 2 + (idx % 3),
          avg_cie_marks: Number((4.5 + (idx % 8) * 0.2).toFixed(1)),
          attendance_pct: 52 + (idx * 3) % 18,
          logins_30d: 5 + (idx % 6),
          assignments_done: 6 + (idx % 6),
          assignments_total: 20,
          events: idx % 2,
          clubs: idx % 2,
          hackathons: 0,
          certifications: idx % 2,
          aptitude: 45 + (idx % 15),
          coding: 38 + (idx % 18),
          mock_interview: 40 + (idx % 12),
          communication: 4.0,
          programming: 4.5,
          leadership: 3.5,
          sports: 4.5,
          avg_feedback: 2.5,
        });
      } else if (idx % 4 === 0) {
        // Borderline cohort
        students.push({
          student_id: studentId,
          section_id: sectionId,
          reg_no: regNo,
          full_name: fullName,
          cgpa: Number((6.8 + (idx % 8) * 0.1).toFixed(2)),
          backlogs: idx % 2,
          avg_cie_marks: Number((6.6 + (idx % 6) * 0.2).toFixed(1)),
          attendance_pct: 71 + (idx % 8),
          logins_30d: 15 + (idx % 8),
          assignments_done: 13 + (idx % 4),
          assignments_total: 20,
          events: 1 + (idx % 2),
          clubs: 1,
          hackathons: idx % 2,
          certifications: 1,
          aptitude: 66 + (idx % 12),
          coding: 64 + (idx % 15),
          mock_interview: 68 + (idx % 10),
          communication: 6.5,
          programming: 6.8,
          leadership: 6.0,
          sports: 5.5,
          avg_feedback: 3.8,
        });
      } else {
        // High performer cohort
        const cgpaVal = Math.min(9.85, Number((7.6 + (idx % 20) * 0.1).toFixed(2)));
        students.push({
          student_id: studentId,
          section_id: sectionId,
          reg_no: regNo,
          full_name: fullName,
          cgpa: cgpaVal,
          backlogs: 0,
          avg_cie_marks: Number((7.8 + (idx % 10) * 0.18).toFixed(1)),
          attendance_pct: 82 + (idx % 16),
          logins_30d: 22 + (idx % 8),
          assignments_done: 17 + (idx % 4),
          assignments_total: 20,
          events: 2 + (idx % 3),
          clubs: 1 + (idx % 2),
          hackathons: 1 + (idx % 2),
          certifications: 2 + (idx % 2),
          aptitude: 78 + (idx % 18),
          coding: 76 + (idx % 20),
          mock_interview: 82 + (idx % 14),
          communication: 7.5,
          programming: 8.2,
          leadership: 7.0,
          sports: 6.5,
          avg_feedback: 4.6,
        });
      }
    }
  }

  return students;
}

// In-memory cache for fast mock mode execution
let cachedMockCohort: RawStudentMetrics[] | null = null;
export function getCohort(): RawStudentMetrics[] {
  if (!cachedMockCohort) {
    cachedMockCohort = generateMockCohort();
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('campuspulse_custom_students');
        if (saved) {
          const custom = JSON.parse(saved) as RawStudentMetrics[];
          custom.forEach((c) => {
            if (!cachedMockCohort!.some((s) => s.reg_no.toUpperCase() === c.reg_no.toUpperCase())) {
              cachedMockCohort!.unshift(c);
            }
          });
        }
      } catch {}
    }
  }
  return cachedMockCohort;
}

export function addStudentToCohort(student: RawStudentMetrics) {
  const cohort = getCohort();
  const existingIdx = cohort.findIndex((s) => s.reg_no.toUpperCase() === student.reg_no.toUpperCase());
  if (existingIdx >= 0) {
    cohort[existingIdx] = student;
  } else {
    cohort.unshift(student);
  }
  if (typeof window !== 'undefined') {
    try {
      const saved = JSON.parse(localStorage.getItem('campuspulse_custom_students') || '[]');
      const filtered = saved.filter((s: RawStudentMetrics) => s.reg_no.toUpperCase() !== student.reg_no.toUpperCase());
      localStorage.setItem('campuspulse_custom_students', JSON.stringify([student, ...filtered]));
    } catch {}
  }
}

export function addStudentsToCohort(students: RawStudentMetrics[]) {
  const cohort = getCohort();
  for (const student of students) {
    const existingIdx = cohort.findIndex((s) => s.reg_no.toUpperCase() === student.reg_no.toUpperCase());
    if (existingIdx >= 0) {
      cohort[existingIdx] = student;
    } else {
      cohort.unshift(student);
    }
  }
  if (typeof window !== 'undefined') {
    try {
      const saved = JSON.parse(localStorage.getItem('campuspulse_custom_students') || '[]');
      const studentMap = new Map<string, RawStudentMetrics>();
      saved.forEach((s: RawStudentMetrics) => studentMap.set(s.reg_no.toUpperCase(), s));
      students.forEach((s: RawStudentMetrics) => studentMap.set(s.reg_no.toUpperCase(), s));
      localStorage.setItem('campuspulse_custom_students', JSON.stringify(Array.from(studentMap.values())));
    } catch {}
  }
}

// Active in-memory interventions store for mock mode
const mockInterventionsStore = new Map<string, Array<{
  id: string;
  type: string;
  note: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated';
  created_at: string;
  due_date?: string;
}>>();

// Initialize default interventions for SAGAR and MD SAHIL
mockInterventionsStore.set('241FA18067', [
  {
    id: 'int-sahil-1',
    type: 'attendance_warning',
    note: 'One-on-one tutorial session arranged. Target: attend 12 consecutive lectures to exceed 75% cutoff before mid-sem freeze.',
    status: 'in_progress',
    created_at: '2026-10-06T10:00:00Z',
    due_date: '2026-10-20',
  },
]);

mockInterventionsStore.set('241FA04070', [
  {
    id: 'int-sagar-1',
    type: 'parent_meeting',
    note: 'Guardian summoned regarding 5 backlogs and 42% attendance. Weekly sign-off sheet instituted.',
    status: 'escalated',
    created_at: '2026-10-04T14:30:00Z',
    due_date: '2026-10-18',
  },
  {
    id: 'int-sagar-2',
    type: 'remedial_class',
    note: 'Enrolled in Saturday Remedial Clinic for Algorithms & Operating Systems backlog clearance.',
    status: 'pending',
    created_at: '2026-10-05T09:00:00Z',
    due_date: '2026-10-25',
  },
]);

/**
 * Fetch students for a section (A, B, or C) with live computed success scores.
 */
export async function getSectionStudents(
  sectionKey: 'A' | 'B' | 'C' | 'all' = 'A',
  filter?: {
    riskLevel?: 'all' | 'critical' | 'high' | 'medium' | 'low';
    attendanceBelow75?: boolean;
    search?: string;
    sortBy?: 'risk' | 'cgpa' | 'attendance' | 'marks' | 'backlogs' | 'score';
    sortOrder?: 'asc' | 'desc';
  }
): Promise<StudentListItem[]> {
  const sectionIdMap: Record<string, string> = {
    A: 'sec-a',
    B: 'sec-b',
    C: 'sec-c',
  };

  const rawList = getCohort();
  const targetSectionId = sectionKey === 'all' ? null : sectionIdMap[sectionKey];

  const cohortToScore = targetSectionId
    ? rawList.filter((s) => s.section_id === targetSectionId)
    : rawList;

  // Compute live scores and risk probabilities via TypeScript engine
  const scoredResults = batchComputeStudentScores(cohortToScore, DEFAULT_SCORE_WEIGHTS);
  const scoredMap = new Map(scoredResults.map((r) => [r.student_id, r]));

  let list: StudentListItem[] = cohortToScore.map((raw) => {
    const analysis = scoredMap.get(raw.student_id);
    const existingInterventions = mockInterventionsStore.get(raw.reg_no) ?? [];

    const sectionName = raw.section_id === 'sec-a' ? 'Section A' : raw.section_id === 'sec-b' ? 'Section B' : 'Section C';

    const safeSuccessScore = analysis ? analysis.scores.total : Math.round((raw.cgpa / 10.0) * 85);
    const safeRiskProb = analysis ? analysis.risk.probability : (raw.attendance_pct < 75 ? 0.65 : 0.15);
    const safeRiskLevel = analysis ? analysis.risk.level : (raw.attendance_pct < 65 ? 'critical' : raw.attendance_pct < 75 ? 'high' : 'low');
    const safeAcademicRisk = analysis ? analysis.risk.academic_risk : raw.cgpa < 6.5;
    const safePlacementRisk = analysis ? analysis.risk.placement_risk : raw.cgpa < 6.0;
    const safeSegment = analysis ? analysis.segment.segment : (raw.cgpa >= 8.5 ? 'High Achiever' : 'Consistent Performer');

    return {
      student_id: raw.student_id,
      reg_no: raw.reg_no,
      full_name: raw.full_name || 'Unknown Student',
      section_id: raw.section_id,
      section_name: sectionName,
      cgpa: raw.cgpa,
      backlogs: raw.backlogs,
      attendance_pct: raw.attendance_pct,
      avg_cie_marks: raw.avg_cie_marks ?? 7.0,
      success_score: safeSuccessScore,
      risk_probability: safeRiskProb,
      risk_level: safeRiskLevel,
      academic_risk: safeAcademicRisk,
      placement_risk: safePlacementRisk,
      segment: safeSegment,
      active_interventions_count: existingInterventions.filter((i) => i.status !== 'resolved').length,
      coding_score: raw.coding ?? 50,
      avatar_url: `https://images.unsplash.com/photo-${
        ['1535713875002-d1d0cf377fde', '1494790108377-be9c29b29330', '1570295999919-56ceb5ecca61', '1580489944761-15a19d654956'][
          (raw.reg_no.charCodeAt(raw.reg_no.length - 1)) % 4
        ]
      }?w=150`,
    };
  });

  // Apply filters
  if (filter?.riskLevel && filter.riskLevel !== 'all') {
    list = list.filter((s) => s.risk_level === filter.riskLevel);
  }
  if (filter?.attendanceBelow75) {
    list = list.filter((s) => s.attendance_pct < 75.0);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(
      (s) => s.reg_no.toLowerCase().includes(q) || s.full_name.toLowerCase().includes(q)
    );
  }

  // Apply sorting
  const sortBy = filter?.sortBy || 'risk';
  const order = filter?.sortOrder || 'desc';
  const mult = order === 'desc' ? -1 : 1;

  list.sort((a, b) => {
    switch (sortBy) {
      case 'risk':
        return (a.risk_probability - b.risk_probability) * mult;
      case 'cgpa':
        return (a.cgpa - b.cgpa) * mult;
      case 'attendance':
        return (a.attendance_pct - b.attendance_pct) * mult;
      case 'marks':
        return (a.avg_cie_marks - b.avg_cie_marks) * mult;
      case 'backlogs':
        return (a.backlogs - b.backlogs) * mult;
      case 'score':
        return (a.success_score - b.success_score) * mult;
      default:
        return (a.risk_probability - b.risk_probability) * mult;
    }
  });

  return list;
}

/**
 * Get comprehensive student detail for the Slide-Out Drawer.
 */
export async function getStudentDetail(regNoOrId: string): Promise<StudentDetail | null> {
  const cohort = getCohort();
  const raw = cohort.find(
    (s) => s.reg_no.toLowerCase() === regNoOrId.toLowerCase() || s.student_id === regNoOrId
  );

  if (!raw) return null;

  const sectionCohort = cohort.filter((s) => s.section_id === raw.section_id);
  const benchmarks = computeSectionBenchmarks(raw.section_id, sectionCohort, DEFAULT_SCORE_WEIGHTS);
  const analytics = computeStudentSuccessScore(raw, benchmarks, DEFAULT_SCORE_WEIGHTS);

  const existingInterventions = mockInterventionsStore.get(raw.reg_no) ?? [];

  // Generate realistic monthly attendance trends
  const attTrend = [
    { month: 'Jul', attendance_pct: Math.min(100, raw.attendance_pct + 8), held: 24, attended: Math.round(24 * ((raw.attendance_pct + 8) / 100)) },
    { month: 'Aug', attendance_pct: Math.min(100, raw.attendance_pct + 3), held: 28, attended: Math.round(28 * ((raw.attendance_pct + 3) / 100)) },
    { month: 'Sep', attendance_pct: Math.max(30, raw.attendance_pct - 4), held: 26, attended: Math.round(26 * ((raw.attendance_pct - 4) / 100)) },
    { month: 'Oct', attendance_pct: raw.attendance_pct, held: 18, attended: Math.round(18 * (raw.attendance_pct / 100)) },
  ];

  const cieVal = raw.avg_cie_marks ?? 7.0;
  // Subject marks trends
  const marksTrend = [
    { subject: 'Data Structures', f1: 8.5, f2: cieVal, semester: Math.round(raw.cgpa * 8.8) },
    { subject: 'DBMS', f1: 8.0, f2: Math.min(10, cieVal + 0.5), semester: Math.round(raw.cgpa * 8.6) },
    { subject: 'Networks', f1: 7.5, f2: Math.max(4, cieVal - 0.5), semester: Math.round(raw.cgpa * 8.2) },
    { subject: 'Algorithms', f1: 8.2, f2: cieVal, semester: Math.round(raw.cgpa * 8.5) },
  ];

  // Skills breakdown
  const skills = [
    { skill: 'Programming', score: raw.programming ?? 7.5 },
    { skill: 'Communication', score: raw.communication ?? 7.0 },
    { skill: 'Leadership', score: raw.leadership ?? 6.5 },
    { skill: 'Sports', score: raw.sports ?? 6.0 },
  ];

  const sectionName = raw.section_id === 'sec-a' ? 'Section A' : raw.section_id === 'sec-b' ? 'Section B' : 'Section C';

  return {
    student_id: raw.student_id,
    reg_no: raw.reg_no,
    full_name: raw.full_name || 'Student',
    section_id: raw.section_id,
    section_name: sectionName,
    cgpa: raw.cgpa,
    backlogs: raw.backlogs,
    attendance_pct: raw.attendance_pct,
    avg_cie_marks: raw.avg_cie_marks ?? 7.0,
    success_score: analytics.scores.total,
    risk_probability: analytics.risk.probability,
    risk_level: analytics.risk.level,
    academic_risk: analytics.risk.academic_risk,
    placement_risk: analytics.risk.placement_risk,
    segment: analytics.segment.segment,
    active_interventions_count: existingInterventions.filter((i) => i.status !== 'resolved').length,
    coding_score: raw.coding ?? 50,
    avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
    analytics,
    raw_metrics: raw,
    attendance_trend: attTrend,
    marks_trend: marksTrend,
    skills_breakdown: skills,
    interventions: existingInterventions,
  };
}

/**
 * Assign an intervention to a student (Faculty action).
 */
export async function assignIntervention(
  regNo: string,
  type: string,
  note: string,
  dueDate?: string
): Promise<{ success: boolean; intervention: any }> {
  const current = mockInterventionsStore.get(regNo) ?? [];
  const newIntervention = {
    id: `int-${Date.now()}`,
    type,
    note,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
    due_date: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  };

  mockInterventionsStore.set(regNo, [newIntervention, ...current]);
  return { success: true, intervention: newIntervention };
}

/**
 * Feed an exam score into the student's academic telemetry,
 * updating avg_cie_marks, marks progression, and recomputing the Success Score.
 */
export async function feedExamScoreIntoStudentTelemetry(
  regNo: string,
  examName: string,
  examScore: number,
  totalMarks: number
): Promise<{
  success: boolean;
  old_score: number;
  new_score: number;
  old_cie: number;
  new_cie: number;
  student: StudentDetail | null;
}> {
  const cohort = getCohort();
  const raw = cohort.find((s) => s.reg_no.toLowerCase() === regNo.toLowerCase());
  if (!raw) {
    return { success: false, old_score: 0, new_score: 0, old_cie: 0, new_cie: 0, student: null };
  }

  // Pre-calculation
  const sectionCohort = cohort.filter((s) => s.section_id === raw.section_id);
  const benchmarksPre = computeSectionBenchmarks(raw.section_id, sectionCohort, DEFAULT_SCORE_WEIGHTS);
  const analyticsPre = computeStudentSuccessScore(raw, benchmarksPre, DEFAULT_SCORE_WEIGHTS);
  const oldScore = analyticsPre.scores.total;
  const oldCie = raw.avg_cie_marks ?? 7.0;

  // Normalize exam score to 10 scale
  const normalizedExamOutOf10 = (examScore / totalMarks) * 10;
  // Blend into average CIE marks (70% previous assessments, 30% new exam)
  const updatedCie = Number(((oldCie * 0.7) + (normalizedExamOutOf10 * 0.3)).toFixed(1));
  raw.avg_cie_marks = updatedCie;

  // Recompute with updated benchmarks & student metrics
  const benchmarksPost = computeSectionBenchmarks(raw.section_id, sectionCohort, DEFAULT_SCORE_WEIGHTS);
  const analyticsPost = computeStudentSuccessScore(raw, benchmarksPost, DEFAULT_SCORE_WEIGHTS);
  const newScore = analyticsPost.scores.total;

  const detail = await getStudentDetail(regNo);

  return {
    success: true,
    old_score: oldScore,
    new_score: newScore,
    old_cie: oldCie,
    new_cie: updatedCie,
    student: detail,
  };
}
