// ============================================================================
// CAMPUSPULSE: SMART CAMPUS ANALYTICS
// Data Access Layer: Admin Intelligence, Profile Lookup, Weight Tuning,
// Institutional Dashboard, CSV Ingestion, and Audit Logs
// ============================================================================

import {
  ScoreWeightsConfig,
  DEFAULT_SCORE_WEIGHTS,
  RawStudentMetrics,
} from '../analytics/types';
import {
  batchComputeStudentScores,
  computeSectionBenchmarks,
} from '../analytics/engine';
import { getSectionStudents, getStudentDetail, StudentDetail, addStudentToCohort, addStudentsToCohort } from './students';
import { MOCK_ANNOUNCEMENTS, MOCK_PLACEMENTS } from './mock-store';
import { Announcement, PlacementRecord } from './types';
import vignanFacultyJson from './vignan_faculty.json';
import { STUDENT_DOSSIERS, getSavedStudentProfileMap } from './student-portal';

// ----------------------------------------------------------------------------
// FACULTY PROFILES DATA (Vignan CSE Official Dataset - 123 Records)
// ----------------------------------------------------------------------------
export interface FacultyProfile {
  faculty_id: string; // e.g. CSE_001
  reg_no: string; // e.g. CSE_001
  full_name: string;
  department: string;
  designation: string;
  research_interests: string;
  photo_url: string;
  profile_url: string;
  source?: string;
  assigned_sections: string[];
  attendance_pct: number;
  workload_hours_per_week: number;
  courses_taught: string[];
  email: string;
  avatar_url: string;
  office_location: string;
  cabin_hours: string;
}

export interface StudentAdminProfile extends StudentDetail {
  leetcode_url: string;
  codechef_url: string;
  linkedin_url: string;
  github_url: string;
}

export interface DepartmentMetric {
  department: string;
  code: string;
  student_count: number;
  faculty_count: number;
  avg_success_score: number;
  placement_rate_pct: number;
  at_risk_count: number;
  at_risk_rate_pct: number;
}

export interface HeatmapCell {
  section: string;
  indicator: string;
  weight_max: number;
  avg_score: number;
  pct_of_max: number;
  status: 'safe' | 'warning' | 'critical';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  target: string;
  details: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'faculty' | 'student';
  reg_no: string;
  status: 'active' | 'suspended';
  created_at: string;
}

// In-Memory Faculty Directory populated from Official Vignan CSE Dataset
const MOCK_FACULTY_PROFILES: Record<string, FacultyProfile> = {};

(vignanFacultyJson as FacultyProfile[]).forEach((fac) => {
  MOCK_FACULTY_PROFILES[fac.faculty_id] = fac;
  MOCK_FACULTY_PROFILES[fac.reg_no] = fac;
});

// Backward-compatible aliases for existing FAC210 and FAC204 links
if (MOCK_FACULTY_PROFILES['CSE_001']) {
  MOCK_FACULTY_PROFILES['FAC210'] = {
    ...MOCK_FACULTY_PROFILES['CSE_001'],
    reg_no: 'FAC210',
  };
}
if (MOCK_FACULTY_PROFILES['CSE_002']) {
  MOCK_FACULTY_PROFILES['FAC204'] = {
    ...MOCK_FACULTY_PROFILES['CSE_002'],
    reg_no: 'FAC204',
  };
}

// In-Memory Users Directory
let MOCK_USERS_STORE: AdminUser[] = [
  {
    id: 'usr-1',
    email: 'admin@campus.edu.in',
    full_name: 'Dr. S. K. Narayanan (Dean of Academics)',
    role: 'admin',
    reg_no: 'ADM001',
    status: 'active',
    created_at: '2026-01-15T08:00:00Z',
  },
  {
    id: 'usr-fac-1',
    email: 'ananya.sharma@campus.edu.in',
    full_name: 'Prof. Ananya Sharma',
    role: 'faculty',
    reg_no: 'FAC210',
    status: 'active',
    created_at: '2026-02-01T09:30:00Z',
  },
  {
    id: 'usr-fac-2',
    email: 'k.v.krishna.kishore@campus.edu.in',
    full_name: 'Dr. K.V. Krishna Kishore',
    role: 'faculty',
    reg_no: 'CSE_001',
    status: 'active',
    created_at: '2026-02-01T09:30:00Z',
  },
  {
    id: 'usr-fac-3',
    email: 'venkatrama.phani.kumar.s@campus.edu.in',
    full_name: 'Dr. Venkatrama Phani Kumar S',
    role: 'faculty',
    reg_no: 'CSE_002',
    status: 'active',
    created_at: '2026-02-01T09:30:00Z',
  },
  {
    id: 'usr-4',
    email: '241fa18067@campus.edu.in',
    full_name: 'MD SAHIL',
    role: 'student',
    reg_no: '241FA18067',
    status: 'active',
    created_at: '2026-07-20T11:00:00Z',
  },
  {
    id: 'usr-5',
    email: '241fa04070@campus.edu.in',
    full_name: 'SAGAR',
    role: 'student',
    reg_no: '241FA04070',
    status: 'active',
    created_at: '2026-07-20T11:00:00Z',
  },
];

// In-Memory Audit Trail
let MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-105',
    timestamp: '2026-10-09T08:15:22Z',
    action: 'EXAM_PUBLISHED',
    actor: 'Prof. Ananya Sharma (FAC210)',
    target: 'CIE-2: Data Structures & Algorithms',
    details: 'Published 10-question MCQ assessment to All Sections. Autograding and Academic score feed active.',
    severity: 'success',
  },
  {
    id: 'aud-104',
    timestamp: '2026-10-08T16:40:10Z',
    action: 'INTERVENTION_ASSIGNED',
    actor: 'Prof. Ananya Sharma (FAC210)',
    target: 'MD SAHIL (241FA18067)',
    details: 'Assigned Attendance Warning: Target 12 consecutive lectures to exceed 75% cutoff.',
    severity: 'warning',
  },
  {
    id: 'aud-103',
    timestamp: '2026-10-08T11:20:00Z',
    action: 'WEIGHT_CONFIG_TUNED',
    actor: 'Dr. S. K. Narayanan (ADM001)',
    target: 'Global Success Weights',
    details: 'Calibrated Academic weight to 30% and Placement to 15%. Recomputed campus-wide scores.',
    severity: 'info',
  },
  {
    id: 'aud-102',
    timestamp: '2026-10-07T09:15:00Z',
    action: 'ANNOUNCEMENT_POSTED',
    actor: 'Academic Registrar',
    target: 'All B.Tech CSE Cohorts',
    details: 'Posted: Mid-Term Examination Timetable Rescheduled for October 24th.',
    severity: 'info',
  },
  {
    id: 'aud-101',
    timestamp: '2026-10-06T14:00:00Z',
    action: 'CSV_COHORT_INGEST',
    actor: 'Data Ops Team (ADM002)',
    target: 'CSE Section C Roster',
    details: 'Ingested 40 verified student profiles with RFID attendance telemetry.',
    severity: 'success',
  },
];

// In-Memory Global Weights
let currentScoreWeights: ScoreWeightsConfig = { ...DEFAULT_SCORE_WEIGHTS };

// In-Memory Announcements and Placements CRUD clones
let adminAnnouncements: Announcement[] = [...MOCK_ANNOUNCEMENTS];
let adminPlacements: PlacementRecord[] = [...MOCK_PLACEMENTS];

// ----------------------------------------------------------------------------
// 1. QUICK PROFILE LOOKUP (Faculty & Student)
// ----------------------------------------------------------------------------

export async function getAllFacultyProfiles(): Promise<FacultyProfile[]> {
  const base = vignanFacultyJson as FacultyProfile[];
  let custom: FacultyProfile[] = [];
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('campuspulse_custom_faculty');
      if (saved) custom = JSON.parse(saved);
    } catch {}
  }
  const seen = new Set<string>();
  const combined: FacultyProfile[] = [];
  for (const f of [...custom, ...base]) {
    const key = f.faculty_id.toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(f);
      MOCK_FACULTY_PROFILES[key] = f;
      MOCK_FACULTY_PROFILES[f.reg_no.toUpperCase()] = f;
    }
  }
  return combined;
}

export async function lookupFacultyProfile(id: string): Promise<FacultyProfile | null> {
  const cleanId = id.trim().toUpperCase();
  const all = await getAllFacultyProfiles();
  const found = all.find(
    (f) =>
      f.reg_no.toUpperCase() === cleanId ||
      f.faculty_id.toUpperCase() === cleanId ||
      f.full_name.toLowerCase().includes(cleanId.toLowerCase()) ||
      (f.research_interests && f.research_interests.toLowerCase().includes(cleanId.toLowerCase()))
  );
  return found || null;
}

export async function lookupStudentProfile(id: string): Promise<StudentAdminProfile | null> {
  const cleanId = id.trim().toUpperCase();
  const detail = await getStudentDetail(cleanId);
  if (!detail) return null;

  // Default fallback URLs based on student name
  const slug = detail.full_name.toLowerCase().replace(/[^a-z0-9]/g, '');
  let leetcode = `https://leetcode.com/u/${slug}_dev`;
  let codechef = `https://www.codechef.com/users/${slug}_tech`;
  let linkedin = `https://linkedin.com/in/${slug}-cse`;
  let github = `https://github.com/${slug}`;
  let fullName = detail.full_name;

  // 1. Check in-memory STUDENT_DOSSIERS
  if (STUDENT_DOSSIERS[cleanId]) {
    const d = STUDENT_DOSSIERS[cleanId];
    if (d.full_name) fullName = d.full_name;
    if (d.coding_profiles?.leetcode?.url) leetcode = d.coding_profiles.leetcode.url;
    if (d.coding_profiles?.codechef?.url) codechef = d.coding_profiles.codechef.url;
    if (d.coding_profiles?.linkedin?.url) linkedin = d.coding_profiles.linkedin.url;
    if (d.coding_profiles?.github?.url) github = d.coding_profiles.github.url;
  }

  // 2. Check localStorage saved student profiles (live synced from student dashboard)
  const map = getSavedStudentProfileMap();
  const saved = map[cleanId];
  if (saved) {
    if (saved.full_name) fullName = saved.full_name;
    if (saved.coding_profiles?.leetcode?.url) leetcode = saved.coding_profiles.leetcode.url;
    if (saved.coding_profiles?.codechef?.url) codechef = saved.coding_profiles.codechef.url;
    if (saved.coding_profiles?.linkedin?.url) linkedin = saved.coding_profiles.linkedin.url;
    if (saved.coding_profiles?.github?.url) github = saved.coding_profiles.github.url;
  }

  return {
    ...detail,
    full_name: fullName,
    leetcode_url: leetcode,
    codechef_url: codechef,
    linkedin_url: linkedin,
    github_url: github,
  };
}

// ----------------------------------------------------------------------------
// 2. INSTITUTION-WIDE DASHBOARD DATA
// ----------------------------------------------------------------------------

export async function getDepartmentComparison(): Promise<DepartmentMetric[]> {
  return [
    {
      department: 'Computer Science & Engineering',
      code: 'CSE',
      student_count: 120,
      faculty_count: 123,
      avg_success_score: 79.4,
      placement_rate_pct: 88.5,
      at_risk_count: 5,
      at_risk_rate_pct: 4.2,
    },
    {
      department: 'AI & Data Science',
      code: 'AIDS',
      student_count: 85,
      faculty_count: 9,
      avg_success_score: 81.2,
      placement_rate_pct: 91.0,
      at_risk_count: 3,
      at_risk_rate_pct: 3.5,
    },
    {
      department: 'Electronics & Communication',
      code: 'ECE',
      student_count: 110,
      faculty_count: 12,
      avg_success_score: 75.8,
      placement_rate_pct: 79.0,
      at_risk_count: 8,
      at_risk_rate_pct: 7.3,
    },
    {
      department: 'Information Technology',
      code: 'IT',
      student_count: 90,
      faculty_count: 10,
      avg_success_score: 78.1,
      placement_rate_pct: 84.5,
      at_risk_count: 4,
      at_risk_rate_pct: 4.4,
    },
  ];
}

export async function getRiskHeatmapData(): Promise<HeatmapCell[]> {
  // Matrix of 3 sections x 7 indicators
  const sections = ['Section A', 'Section B', 'Section C'];
  const indicators = [
    { name: 'Academic', weight: 30, scores: [25.4, 21.8, 24.2] },
    { name: 'Attendance', weight: 20, scores: [16.8, 13.9, 17.5] },
    { name: 'LMS Activity', weight: 10, scores: [8.5, 6.4, 8.1] },
    { name: 'Engagement', weight: 10, scores: [7.2, 5.1, 7.8] },
    { name: 'Placement', weight: 15, scores: [12.6, 9.8, 11.9] },
    { name: 'Skills Profile', weight: 10, scores: [8.1, 6.9, 7.9] },
    { name: 'Feedback', weight: 5, scores: [4.4, 3.8, 4.3] },
  ];

  const cells: HeatmapCell[] = [];

  sections.forEach((sec, sIdx) => {
    indicators.forEach((ind) => {
      const avgScore = ind.scores[sIdx];
      const pct = (avgScore / ind.weight) * 100;
      let status: 'safe' | 'warning' | 'critical' = 'safe';
      if (pct < 60) status = 'critical';
      else if (pct < 75) status = 'warning';

      cells.push({
        section: sec,
        indicator: ind.name,
        weight_max: ind.weight,
        avg_score: Number(avgScore.toFixed(1)),
        pct_of_max: Math.round(pct),
        status,
      });
    });
  });

  return cells;
}

export async function getSegmentSizeBreakdown(): Promise<{ segment: string; count: number; pct: number; color: string }[]> {
  const students = await getSectionStudents('all');
  const counts: Record<string, number> = {};

  students.forEach((s) => {
    counts[s.segment] = (counts[s.segment] || 0) + 1;
  });

  const colors: Record<string, string> = {
    'Consistent Achievers': '#2EC4B6',
    'High Academics / Low Placement Readiness': '#5B6CFF',
    'Disengaged but Capable': '#FFC857',
    'Academically At-Risk': '#EF4444',
    'Skill-Strong, Marks-Weak': '#FF7A59',
  };

  const total = students.length || 1;
  return Object.entries(counts).map(([seg, count]) => ({
    segment: seg,
    count,
    pct: Math.round((count / total) * 100),
    color: colors[seg] || '#A0AEC0',
  }));
}

// ----------------------------------------------------------------------------
// 3. SCORE WEIGHT TUNING & LIVE RECOMPUTE PREVIEW
// ----------------------------------------------------------------------------

export async function getActiveScoreWeights(): Promise<ScoreWeightsConfig> {
  return currentScoreWeights;
}

export async function saveScoreWeights(newWeights: ScoreWeightsConfig): Promise<ScoreWeightsConfig> {
  currentScoreWeights = { ...newWeights };

  // Log audit event
  await logAuditEvent({
    action: 'WEIGHT_CONFIG_TUNED',
    actor: 'Administrator (ADM001)',
    target: 'score_weights_config',
    details: `Updated weights: Academic=${newWeights.academic_weight}%, Attendance=${newWeights.attendance_weight}%, Placement=${newWeights.placement_weight}%.`,
    severity: 'warning',
  });

  return currentScoreWeights;
}

export async function previewWeightTuning(newWeights: ScoreWeightsConfig): Promise<{
  baseline_avg: number;
  tuned_avg: number;
  delta_avg: number;
  baseline_at_risk_count: number;
  tuned_at_risk_count: number;
  delta_at_risk: number;
  affected_students: {
    reg_no: string;
    name: string;
    old_score: number;
    new_score: number;
    risk_direction: 'elevated' | 'reduced' | 'neutral';
  }[];
}> {
  const students = await getSectionStudents('all');

  // Compute baseline average
  const baselineSum = students.reduce((acc, s) => acc + s.success_score, 0);
  const baselineAvg = Number((baselineSum / students.length).toFixed(1));
  const baselineAtRisk = students.filter((s) => s.risk_level === 'critical' || s.risk_level === 'high').length;

  // Simulate new scores
  const affected: any[] = [];
  let tunedSum = 0;
  let tunedAtRiskCount = 0;

  students.forEach((s) => {
    // Dynamic adjustment simulation
    const weightShiftRatio =
      (newWeights.academic_weight * (s.cgpa / 10) +
        newWeights.attendance_weight * (s.attendance_pct / 100) +
        newWeights.placement_weight * (s.coding_score / 100)) /
      (DEFAULT_SCORE_WEIGHTS.academic_weight * (s.cgpa / 10) +
        DEFAULT_SCORE_WEIGHTS.attendance_weight * (s.attendance_pct / 100) +
        DEFAULT_SCORE_WEIGHTS.placement_weight * (s.coding_score / 100));

    const simulatedScore = Math.max(20, Math.min(99, Number((s.success_score * (0.8 + weightShiftRatio * 0.2)).toFixed(1))));
    tunedSum += simulatedScore;

    const isNowAtRisk = simulatedScore < 60;
    if (isNowAtRisk) tunedAtRiskCount++;

    const wasAtRisk = s.risk_level === 'critical' || s.risk_level === 'high';
    let riskDir: 'elevated' | 'reduced' | 'neutral' = 'neutral';
    if (!wasAtRisk && isNowAtRisk) riskDir = 'elevated';
    else if (wasAtRisk && !isNowAtRisk) riskDir = 'reduced';

    if (s.reg_no === '241FA18067' || s.reg_no === '241FA04070' || Math.abs(simulatedScore - s.success_score) > 3) {
      affected.push({
        reg_no: s.reg_no,
        name: s.full_name,
        old_score: s.success_score,
        new_score: simulatedScore,
        risk_direction: riskDir,
      });
    }
  });

  const tunedAvg = Number((tunedSum / students.length).toFixed(1));

  return {
    baseline_avg: baselineAvg,
    tuned_avg: tunedAvg,
    delta_avg: Number((tunedAvg - baselineAvg).toFixed(1)),
    baseline_at_risk_count: baselineAtRisk,
    tuned_at_risk_count: tunedAtRiskCount,
    delta_at_risk: tunedAtRiskCount - baselineAtRisk,
    affected_students: affected.slice(0, 8),
  };
}

// ----------------------------------------------------------------------------
// 4. CSV BULK IMPORTER & VALIDATION REPORT
// ----------------------------------------------------------------------------

export interface CSVValidationError {
  row: number;
  field: string;
  error: string;
  value: string;
}

export interface CSVValidationReport {
  total_rows: number;
  valid_rows_count: number;
  failed_rows_count: number;
  valid_records: any[];
  errors: CSVValidationError[];
}

export function validateStudentCSV(csvText: string): CSVValidationReport {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return {
      total_rows: 0,
      valid_rows_count: 0,
      failed_rows_count: 0,
      valid_records: [],
      errors: [{ row: 1, field: 'header', error: 'File is empty or contains no data lines', value: '' }],
    };
  }

  const errors: CSVValidationError[] = [];
  const validRecords: any[] = [];
  const seenRegNos = new Set<string>();

  // Check header
  const header = lines[0].toLowerCase();
  const requiredColumns = ['reg_no', 'full_name', 'section', 'cgpa', 'attendance_pct'];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const parts = rawLine.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length < 5) {
      errors.push({
        row: i + 1,
        field: 'row_length',
        error: `Insufficient columns (${parts.length}/5 required)`,
        value: rawLine,
      });
      continue;
    }

    const [regNo, name, sec, cgpaStr, attStr, backlogsStr] = parts;
    let hasRowError = false;

    // 1. Reg No validation (e.g. 241FA18067)
    if (!regNo || regNo.length < 8) {
      errors.push({ row: i + 1, field: 'reg_no', error: 'Invalid registration number format', value: regNo });
      hasRowError = true;
    } else if (seenRegNos.has(regNo.toUpperCase())) {
      errors.push({ row: i + 1, field: 'reg_no', error: 'Duplicate reg_no within import file', value: regNo });
      hasRowError = true;
    } else {
      seenRegNos.add(regNo.toUpperCase());
    }

    // 2. Name validation
    if (!name || name.length < 2) {
      errors.push({ row: i + 1, field: 'full_name', error: 'Student full name is missing', value: name });
      hasRowError = true;
    }

    // 3. Section validation
    if (!sec || !['A', 'B', 'C', 'SEC-A', 'SEC-B', 'SEC-C'].includes(sec.toUpperCase())) {
      errors.push({ row: i + 1, field: 'section', error: 'Section must be A, B, or C', value: sec });
      hasRowError = true;
    }

    // 4. CGPA validation (0.0 to 10.0)
    const cgpa = parseFloat(cgpaStr);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10.0) {
      errors.push({ row: i + 1, field: 'cgpa', error: 'CGPA must be between 0.00 and 10.00', value: cgpaStr });
      hasRowError = true;
    }

    // 5. Attendance validation (0 to 100)
    const att = parseFloat(attStr);
    if (isNaN(att) || att < 0 || att > 100) {
      errors.push({ row: i + 1, field: 'attendance_pct', error: 'Attendance must be between 0% and 100%', value: attStr });
      hasRowError = true;
    }

    // 6. Backlogs validation (>= 0)
    const backlogs = backlogsStr ? parseInt(backlogsStr, 10) : 0;
    if (isNaN(backlogs) || backlogs < 0) {
      errors.push({ row: i + 1, field: 'backlogs', error: 'Backlogs count must be a non-negative integer', value: backlogsStr });
      hasRowError = true;
    }

    if (!hasRowError) {
      validRecords.push({
        reg_no: regNo.toUpperCase(),
        full_name: name,
        section: sec.toUpperCase().replace('SEC-', ''),
        cgpa,
        attendance_pct: att,
        backlogs,
      });
    }
  }

  return {
    total_rows: lines.length - 1,
    valid_rows_count: validRecords.length,
    failed_rows_count: (lines.length - 1) - validRecords.length,
    valid_records: validRecords,
    errors,
  };
}

export async function commitCSVStudentImport(validRecords: any[]): Promise<{
  imported_count: number;
  imported_students: RawStudentMetrics[];
}> {
  if (!validRecords || validRecords.length === 0) {
    return { imported_count: 0, imported_students: [] };
  }

  const newMetricsList: RawStudentMetrics[] = [];
  const newUsersList: AdminUser[] = [];

  for (const record of validRecords) {
    const cleanRegNo = String(record.reg_no).trim().toUpperCase();
    const rawSec = String(record.section || 'A').toUpperCase();
    const secId = rawSec.includes('B') ? 'sec-b' : rawSec.includes('C') ? 'sec-c' : 'sec-a';
    const cgpa = Number(record.cgpa) || 7.0;
    const att = Number(record.attendance_pct) || 75.0;
    const backlogs = Number(record.backlogs ?? 0) || 0;
    const fullName = String(record.full_name || 'Student').trim();
    const rawEmail = `${cleanRegNo.toLowerCase()}@campus.edu.in`;

    const rawMetric: RawStudentMetrics = {
      student_id: `stu-${cleanRegNo.toLowerCase()}`,
      section_id: secId,
      reg_no: cleanRegNo,
      full_name: fullName,
      cgpa,
      backlogs,
      avg_cie_marks: Number((cgpa * 0.95).toFixed(1)),
      attendance_pct: att,
      logins_30d: 22,
      assignments_done: 18,
      assignments_total: 20,
      events: 2,
      clubs: 1,
      hackathons: 1,
      certifications: 1,
      aptitude: Math.min(100, Math.round(cgpa * 9.5)),
      coding: Math.min(100, Math.round(cgpa * 9.2)),
      mock_interview: Math.min(100, Math.round(cgpa * 9.0)),
      communication: 7.5,
      programming: 8.0,
      leadership: 6.5,
      sports: 6.0,
      avg_feedback: 4.2,
    };

    newMetricsList.push(rawMetric);

    const newUser: AdminUser = {
      id: `usr-stu-${cleanRegNo.toLowerCase()}`,
      email: rawEmail,
      full_name: fullName,
      role: 'student',
      reg_no: cleanRegNo,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    newUsersList.push(newUser);

    // Update in-memory MOCK_USERS_STORE
    const existingUserIdx = MOCK_USERS_STORE.findIndex((u) => u.reg_no.toUpperCase() === cleanRegNo);
    if (existingUserIdx >= 0) {
      MOCK_USERS_STORE[existingUserIdx] = newUser;
    } else {
      MOCK_USERS_STORE.unshift(newUser);
    }
  }

  // 1. Commit and synchronize into student cohort in memory and localStorage
  addStudentsToCohort(newMetricsList);

  // 2. Persist to localStorage for client-side state longevity
  if (typeof window !== 'undefined') {
    try {
      const savedUsers = JSON.parse(localStorage.getItem('campuspulse_custom_users') || '[]');
      const userMap = new Map<string, AdminUser>();
      savedUsers.forEach((u: AdminUser) => userMap.set(u.reg_no.toUpperCase(), u));
      newUsersList.forEach((u) => userMap.set(u.reg_no.toUpperCase(), u));
      localStorage.setItem('campuspulse_custom_users', JSON.stringify(Array.from(userMap.values())));

      // Broadcast sync event to all listening components
      window.dispatchEvent(new CustomEvent('campuspulse-data-updated'));
    } catch (e) {
      console.warn('[commitCSVStudentImport] localStorage persist error:', e);
    }
  }

  // 3. Log audit event
  await logAuditEvent({
    action: 'CSV_COHORT_INGEST',
    actor: 'Administrator (ADM001)',
    target: `students_master (${validRecords.length} records)`,
    details: `Ingested and committed ${validRecords.length} student profiles: ${validRecords.map((r) => `${r.full_name} (${r.reg_no})`).join(', ')}. Synced into students list and cohort database.`,
    severity: 'success',
  });

  return { imported_count: validRecords.length, imported_students: newMetricsList };
}

// ----------------------------------------------------------------------------
// 5. USER MANAGEMENT
// ----------------------------------------------------------------------------

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('campuspulse_custom_users');
      if (saved) {
        const customUsers = JSON.parse(saved) as AdminUser[];
        customUsers.forEach((cu) => {
          if (!MOCK_USERS_STORE.some((u) => u.reg_no.toUpperCase() === cu.reg_no.toUpperCase())) {
            MOCK_USERS_STORE.unshift(cu);
          }
        });
      }
    } catch {}
  }
  return MOCK_USERS_STORE;
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'faculty' | 'student'): Promise<AdminUser | null> {
  const target = MOCK_USERS_STORE.find((u) => u.id === userId);
  if (!target) return null;

  target.role = newRole;
  await logAuditEvent({
    action: 'USER_ROLE_UPDATED',
    actor: 'Administrator (ADM001)',
    target: `${target.full_name} (${target.reg_no})`,
    details: `Role updated to ${newRole.toUpperCase()}. Permissions updated.`,
    severity: 'warning',
  });
  return target;
}

export async function toggleUserStatus(userId: string): Promise<AdminUser | null> {
  const target = MOCK_USERS_STORE.find((u) => u.id === userId);
  if (!target) return null;

  target.status = target.status === 'active' ? 'suspended' : 'active';
  await logAuditEvent({
    action: 'USER_STATUS_TOGGLED',
    actor: 'Administrator (ADM001)',
    target: `${target.full_name} (${target.reg_no})`,
    details: `Account status set to ${target.status.toUpperCase()}.`,
    severity: target.status === 'active' ? 'success' : 'critical',
  });
  return target;
}

export interface NewFacultyInput {
  full_name: string;
  faculty_id: string;
  email: string;
  designation: string;
  department: string;
  assigned_sections: string[];
  office_location?: string;
  workload_hours_per_week?: number;
  research_interests?: string;
  courses_taught?: string[];
  photo_url?: string;
}

export interface NewStudentInput {
  full_name: string;
  reg_no: string;
  email: string;
  section: string;
  department: string;
  cgpa: number;
  attendance_pct: number;
  cie1_marks?: number;
  cie2_marks?: number;
  assignments_marks?: number;
  backlogs?: number;
  placement_status?: string;
  leetcode_handle?: string;
  github_handle?: string;
  codechef_handle?: string;
}

export async function addFacultyProfile(data: NewFacultyInput): Promise<FacultyProfile> {
  const cleanId = data.faculty_id.trim().toUpperCase();
  const rawEmail = data.email.trim().toLowerCase();
  const normEmail = rawEmail.endsWith('@campus.edu.in') ? rawEmail : `${rawEmail.split('@')[0]}@campus.edu.in`;

  const newProfile: FacultyProfile = {
    faculty_id: cleanId,
    reg_no: cleanId,
    full_name: data.full_name.trim(),
    department: data.department || 'Computer Science & Engineering',
    designation: data.designation,
    research_interests: data.research_interests || 'Artificial Intelligence, Software Systems',
    photo_url: data.photo_url?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    profile_url: `https://vignan.ac.in/faculty/${cleanId.toLowerCase()}`,
    source: 'Admin Direct Registration',
    assigned_sections: data.assigned_sections.length > 0 ? data.assigned_sections : ['Section A'],
    attendance_pct: 96.5,
    workload_hours_per_week: data.workload_hours_per_week || 16,
    courses_taught: data.courses_taught && data.courses_taught.length > 0 ? data.courses_taught : ['Computer Science Core'],
    email: normEmail,
    avatar_url: data.photo_url?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    office_location: data.office_location || 'Block-A, Room 302',
    cabin_hours: '10:00 AM - 12:00 PM (Mon-Fri)',
  };

  MOCK_FACULTY_PROFILES[cleanId] = newProfile;
  MOCK_FACULTY_PROFILES[newProfile.reg_no] = newProfile;

  const newUser: AdminUser = {
    id: `usr-fac-${Date.now()}`,
    email: normEmail,
    full_name: newProfile.full_name,
    role: 'faculty',
    reg_no: cleanId,
    status: 'active',
    created_at: new Date().toISOString(),
  };
  MOCK_USERS_STORE = [newUser, ...MOCK_USERS_STORE];

  if (typeof window !== 'undefined') {
    try {
      const savedFaculty = JSON.parse(localStorage.getItem('campuspulse_custom_faculty') || '[]');
      localStorage.setItem('campuspulse_custom_faculty', JSON.stringify([newProfile, ...savedFaculty]));
      const savedUsers = JSON.parse(localStorage.getItem('campuspulse_custom_users') || '[]');
      localStorage.setItem('campuspulse_custom_users', JSON.stringify([newUser, ...savedUsers]));
    } catch {}
  }

  await logAuditEvent({
    action: 'FACULTY_REGISTERED',
    actor: 'Administrator (ADM001)',
    target: `${newProfile.full_name} (${cleanId})`,
    details: `Registered faculty member. Designation: ${newProfile.designation}, Dept: ${newProfile.department}, Email: ${normEmail}.`,
    severity: 'success',
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('campuspulse-data-updated'));
  }

  return newProfile;
}

export async function addStudentProfile(data: NewStudentInput): Promise<AdminUser> {
  const cleanRegNo = data.reg_no.trim().toUpperCase();
  const rawEmail = data.email.trim().toLowerCase();
  const normEmail = rawEmail.endsWith('@campus.edu.in') ? rawEmail : `${rawEmail.split('@')[0]}@campus.edu.in`;

  const secId = data.section.includes('B') ? 'sec-b' : data.section.includes('C') ? 'sec-c' : 'sec-a';
  const cie1 = Number(data.cie1_marks ?? 24);
  const cie2 = Number(data.cie2_marks ?? 22);
  const avgCie = Number(((cie1 + cie2) / 2).toFixed(1));

  const rawMetrics: RawStudentMetrics = {
    student_id: `stu-${cleanRegNo.toLowerCase()}`,
    section_id: secId,
    reg_no: cleanRegNo,
    full_name: data.full_name.trim(),
    cgpa: Number(data.cgpa),
    backlogs: Number(data.backlogs ?? 0),
    avg_cie_marks: avgCie,
    attendance_pct: Number(data.attendance_pct),
    logins_30d: 24,
    assignments_done: Number(data.assignments_marks ?? 18),
    assignments_total: 20,
    events: 2,
    clubs: 1,
    hackathons: 1,
    certifications: 2,
    aptitude: 78,
    coding: 82,
    mock_interview: 80,
  };

  addStudentToCohort(rawMetrics);

  const newUser: AdminUser = {
    id: `usr-stu-${Date.now()}`,
    email: normEmail,
    full_name: data.full_name.trim(),
    role: 'student',
    reg_no: cleanRegNo,
    status: 'active',
    created_at: new Date().toISOString(),
  };
  MOCK_USERS_STORE = [newUser, ...MOCK_USERS_STORE];

  if (typeof window !== 'undefined') {
    try {
      const savedStudents = JSON.parse(localStorage.getItem('campuspulse_custom_students') || '[]');
      localStorage.setItem('campuspulse_custom_students', JSON.stringify([rawMetrics, ...savedStudents]));
      const savedUsers = JSON.parse(localStorage.getItem('campuspulse_custom_users') || '[]');
      localStorage.setItem('campuspulse_custom_users', JSON.stringify([newUser, ...savedUsers]));
    } catch {}
  }

  await logAuditEvent({
    action: 'STUDENT_ENROLLED',
    actor: 'Administrator (ADM001)',
    target: `${data.full_name} (${cleanRegNo})`,
    details: `Enrolled student in ${data.section}. CGPA: ${data.cgpa}, Attendance: ${data.attendance_pct}%, Backlogs: ${data.backlogs ?? 0}, Email: ${normEmail}.`,
    severity: 'success',
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('campuspulse-data-updated'));
  }

  return newUser;
}

// ----------------------------------------------------------------------------
// 6. ANNOUNCEMENTS & PLACEMENTS CRUD
// ----------------------------------------------------------------------------

export async function getAdminAnnouncements(): Promise<Announcement[]> {
  return adminAnnouncements;
}

export async function createAdminAnnouncement(data: {
  title: string;
  body: string;
  type: string;
  audience: string;
}): Promise<Announcement> {
  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    title: data.title,
    body: data.body,
    type: data.type as any,
    audience: data.audience,
    created_at: new Date().toISOString(),
    created_by_name: 'Academic Affairs Admin',
    created_by_role: 'admin',
  };

  adminAnnouncements = [newAnn, ...adminAnnouncements];
  await logAuditEvent({
    action: 'ANNOUNCEMENT_CREATED',
    actor: 'Academic Affairs Admin',
    target: newAnn.title,
    details: `Published announcement for audience: ${newAnn.audience}.`,
    severity: 'info',
  });
  return newAnn;
}

export async function deleteAdminAnnouncement(id: string): Promise<boolean> {
  adminAnnouncements = adminAnnouncements.filter((a) => a.id !== id);
  await logAuditEvent({
    action: 'ANNOUNCEMENT_DELETED',
    actor: 'Administrator (ADM001)',
    target: `Announcement #${id}`,
    details: 'Removed from public notices.',
    severity: 'warning',
  });
  return true;
}

export async function getAdminPlacements(): Promise<PlacementRecord[]> {
  return adminPlacements;
}

export async function createAdminPlacement(data: {
  company: string;
  year: number;
  students_placed: number;
  total_eligible: number;
  package_lpa: number;
  roles: string[];
}): Promise<PlacementRecord> {
  const newPlace: PlacementRecord = {
    id: `pl-${Date.now()}`,
    company: data.company,
    year: data.year,
    students_placed: data.students_placed,
    total_eligible: data.total_eligible,
    package_lpa: data.package_lpa,
    roles: data.roles,
  };

  adminPlacements = [newPlace, ...adminPlacements];
  await logAuditEvent({
    action: 'PLACEMENT_RECORD_ADDED',
    actor: 'Placement Officer',
    target: `${data.company} (${data.year})`,
    details: `Logged ${data.students_placed} hires at ${data.package_lpa} LPA.`,
    severity: 'success',
  });
  return newPlace;
}

export async function deleteAdminPlacement(id: string): Promise<boolean> {
  adminPlacements = adminPlacements.filter((p) => p.id !== id);
  await logAuditEvent({
    action: 'PLACEMENT_RECORD_DELETED',
    actor: 'Placement Officer',
    target: `Placement Record #${id}`,
    details: 'Removed placement entry.',
    severity: 'warning',
  });
  return true;
}

// ----------------------------------------------------------------------------
// 7. AUDIT LOGGING
// ----------------------------------------------------------------------------

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  return MOCK_AUDIT_LOGS;
}

export async function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  MOCK_AUDIT_LOGS = [newEntry, ...MOCK_AUDIT_LOGS];
  return newEntry;
}
