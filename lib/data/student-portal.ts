// ============================================================================
// CAMPUSPULSE STUDENT PORTAL DATA ACCESS LAYER
// Typed DAL supporting student self-service, sensitivity improvements,
// upcoming exams, results & rank, coding links, and anonymous feedback.
// ============================================================================

export interface StudentImprovementAction {
  id: string;
  indicator: 'attendance' | 'academic' | 'lms' | 'engagement' | 'placement' | 'skills' | 'feedback';
  title: string;
  description: string;
  actionText: string;
  effortLevel: 'Low' | 'Medium' | 'High';
  effortHours: number; // approximate time investment in hours
  pointsGain: number; // point increase on 0-100 Success Score
  roiRatio: number; // points per hour of effort
  badgeText: string;
  category: string;
}

export interface StudentExamSchedule {
  id: string;
  title: string;
  subjectCode: string;
  date: string;
  time: string;
  durationMin: number;
  totalMarks: number;
  examType: 'CIE Internal' | 'Lab Exam' | 'Mid-Term Quiz';
  status: 'upcoming' | 'live' | 'completed';
  examRouteId?: string;
  syllabus: string[];
}

export interface StudentExamResultItem {
  id: string;
  subject: string;
  code: string;
  examName: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  classAverage: number;
  topperMarks: number;
  rank: number;
  totalStudents: number;
  grade: string;
  date: string;
}

export interface StudentAnonymousFeedback {
  id: string;
  category: 'Teaching & Academics' | 'Labs & Computing' | 'Hostel & Wi-Fi' | 'Exam Pacing' | 'Mental Well-being';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  details: string;
  status: 'received' | 'under_review' | 'resolved';
  submittedAt: string;
  anonymousToken: string;
}

export interface DetailedStudentDossier {
  reg_no: string;
  full_name: string;
  email: string;
  section: string;
  semester: number;
  department: string;
  avatar_url?: string;
  cgpa: number;
  backlogs: number;
  attendance_pct: number;
  success_score: number;
  risk_score: number;
  segment: string;
  section_rank: number;
  total_in_section: number;
  percentile: number;
  
  // 7 Indicators breakdown (current contribution out of total weight)
  indicators: {
    name: string;
    key: 'academic' | 'attendance' | 'lms' | 'engagement' | 'placement' | 'skills' | 'feedback';
    score: number; // current points earned
    max_weight: number; // maximum weight available
    norm_score: number; // 0-1 normalised
    benchmark: string;
    description: string;
  }[];

  // Focus areas (encouraging phrasing instead of "risk")
  focus_areas: {
    indicator: string;
    title: string;
    reason: string;
    recommendation: string;
    urgency: 'high' | 'moderate' | 'low';
  }[];

  // Coding platforms
  coding_profiles: {
    leetcode: {
      username: string;
      url: string;
      problems_solved: number;
      contest_rating: number;
      ranking: string;
      verified: boolean;
    };
    codechef: {
      username: string;
      url: string;
      stars: string;
      rating: number;
      global_rank: number;
      verified: boolean;
    };
    linkedin: {
      url: string;
      headline: string;
      connections: string;
      verified: boolean;
    };
    github: {
      username: string;
      url: string;
      public_repos: number;
      commits_this_year: number;
      top_language: string;
      verified: boolean;
    };
  };
}

// ----------------------------------------------------------------------------
// MOCK DATA STORE
// ----------------------------------------------------------------------------

export const STUDENT_DOSSIERS: Record<string, DetailedStudentDossier> = {
  '241FA18067': {
    reg_no: '241FA18067',
    full_name: 'MD SAHIL',
    email: '241fa18067@campus.edu.in',
    section: 'A',
    semester: 4,
    department: 'Computer Science & Engineering',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    cgpa: 7.82,
    backlogs: 0,
    attendance_pct: 74.0, // Alert: 1% below 75%
    success_score: 78.4,
    risk_score: 0.35,
    segment: 'Steady Strivers',
    section_rank: 4,
    total_in_section: 42,
    percentile: 90.5,
    indicators: [
      {
        name: 'Academic Performance',
        key: 'academic',
        score: 23.5,
        max_weight: 30,
        norm_score: 0.78,
        benchmark: 'Cohort Top 15%',
        description: 'CGPA 7.82, CIE average 8.4/10 with 0 backlogs.',
      },
      {
        name: 'Biometric Attendance',
        key: 'attendance',
        score: 14.8,
        max_weight: 20,
        norm_score: 0.74,
        benchmark: 'Attention: 74.0%',
        description: 'Currently 1.0% below the mandatory 75% threshold.',
      },
      {
        name: 'LMS Digital Activity',
        key: 'lms',
        score: 8.2,
        max_weight: 10,
        norm_score: 0.82,
        benchmark: 'High Activity',
        description: '24 logins in 30 days, 15 of 16 assignments turned in.',
      },
      {
        name: 'Campus Engagement',
        key: 'engagement',
        score: 6.5,
        max_weight: 10,
        norm_score: 0.65,
        benchmark: 'Active Member',
        description: 'Hackathon participant, Coding Club member, 1 cert.',
      },
      {
        name: 'Placement Readiness',
        key: 'placement',
        score: 11.2,
        max_weight: 15,
        norm_score: 0.75,
        benchmark: 'Industry Ready',
        description: 'Aptitude 76%, Coding 84%, Mock Interview 68%.',
      },
      {
        name: 'Practical Skills',
        key: 'skills',
        score: 8.0,
        max_weight: 10,
        norm_score: 0.80,
        benchmark: 'Strong Coder',
        description: 'Full-stack web proficiency, solid data structures.',
      },
      {
        name: 'Institutional Feedback',
        key: 'feedback',
        score: 4.2,
        max_weight: 5,
        norm_score: 0.84,
        benchmark: 'Positive Rating',
        description: 'Engaged and collaborative in practical labs.',
      },
    ],
    focus_areas: [
      {
        indicator: 'Biometric Attendance',
        title: 'Clear the 75% Attendance Threshold',
        reason: 'Current attendance is 74.0%. Attending the next 3 sessions will immediately remove the biometric caution flag.',
        recommendation: 'Prioritize attending 100% of upcoming Discrete Mathematics and OOP theory hours this fortnight.',
        urgency: 'high',
      },
      {
        indicator: 'Mock Interview Prep',
        title: 'Elevate Technical Communication',
        reason: 'Mock interview readiness scored 68%. System architecture communication can be strengthened.',
        recommendation: 'Schedule a peer practice round through the Career Development Cell portal.',
        urgency: 'moderate',
      },
    ],
    coding_profiles: {
      leetcode: {
        username: 'mdsahil_code',
        url: 'https://leetcode.com/mdsahil_code',
        problems_solved: 312,
        contest_rating: 1720,
        ranking: 'Top 9.4%',
        verified: true,
      },
      codechef: {
        username: 'sahil_bytes',
        url: 'https://codechef.com/users/sahil_bytes',
        stars: '3★',
        rating: 1684,
        global_rank: 14210,
        verified: true,
      },
      linkedin: {
        url: 'https://linkedin.com/in/md-sahil-campus',
        headline: 'B.Tech CSE Sophomore | Full-Stack & Systems Enthusiast',
        connections: '500+',
        verified: true,
      },
      github: {
        username: 'mdsahil-dev',
        url: 'https://github.com/mdsahil-dev',
        public_repos: 18,
        commits_this_year: 428,
        top_language: 'TypeScript / Go',
        verified: true,
      },
    },
  },

  '241FA04070': {
    reg_no: '241FA04070',
    full_name: 'SAGAR',
    email: '241fa04070@campus.edu.in',
    section: 'B',
    semester: 4,
    department: 'Computer Science & Engineering',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    cgpa: 5.40,
    backlogs: 5,
    attendance_pct: 61.2,
    success_score: 36.2,
    risk_score: 0.99,
    segment: 'Struggling Starter',
    section_rank: 39,
    total_in_section: 40,
    percentile: 2.5,
    indicators: [
      {
        name: 'Academic Performance',
        key: 'academic',
        score: 8.5,
        max_weight: 30,
        norm_score: 0.28,
        benchmark: 'Needs Support',
        description: 'CGPA 5.40 with 5 pending arrears; backlog penalty applied.',
      },
      {
        name: 'Biometric Attendance',
        key: 'attendance',
        score: 9.0,
        max_weight: 20,
        norm_score: 0.45,
        benchmark: 'Critical: 61.2%',
        description: 'Below 75% statutory norm; requires faculty mentor waiver.',
      },
      {
        name: 'LMS Digital Activity',
        key: 'lms',
        score: 3.5,
        max_weight: 10,
        norm_score: 0.35,
        benchmark: 'Low Logins',
        description: 'Only 5 logins this month, 6 assignments incomplete.',
      },
      {
        name: 'Campus Engagement',
        key: 'engagement',
        score: 2.0,
        max_weight: 10,
        norm_score: 0.20,
        benchmark: 'Passive',
        description: 'No active student club memberships recorded.',
      },
      {
        name: 'Placement Readiness',
        key: 'placement',
        score: 5.2,
        max_weight: 15,
        norm_score: 0.35,
        benchmark: 'Early Stage',
        description: 'Aptitude test missing, coding basics need reinforcement.',
      },
      {
        name: 'Practical Skills',
        key: 'skills',
        score: 4.0,
        max_weight: 10,
        norm_score: 0.40,
        benchmark: 'Developing',
        description: 'Proficient in Python basics, needs Data Structures practice.',
      },
      {
        name: 'Institutional Feedback',
        key: 'feedback',
        score: 4.0,
        max_weight: 5,
        norm_score: 0.80,
        benchmark: 'Help Requested',
        description: 'Requested remedial coaching for Data Structures and Math.',
      },
    ],
    focus_areas: [
      {
        indicator: 'Backlog Clearance',
        title: 'Remedial Arrear Support Plan',
        reason: '5 backlogs create a 15% academic penalty on your overall standing.',
        recommendation: 'Enroll in the Faculty-led Saturday Remedial clinics for Data Structures and Signals.',
        urgency: 'high',
      },
      {
        indicator: 'Biometric Attendance',
        title: 'Daily Attendance Recovery',
        reason: '61.2% attendance risks semester detention if uncorrected.',
        recommendation: 'Target 90%+ attendance over the next 4 weeks to regain exam eligibility.',
        urgency: 'high',
      },
      {
        indicator: 'LMS Assignments',
        title: 'Catch Up on 6 Missed Labs',
        reason: 'Each missed lab directly impacts internal CIE marks.',
        recommendation: 'Submit late assignments with peer mentor review before Friday.',
        urgency: 'moderate',
      },
    ],
    coding_profiles: {
      leetcode: {
        username: 'sagar_learns',
        url: 'https://leetcode.com/sagar_learns',
        problems_solved: 34,
        contest_rating: 1350,
        ranking: 'Top 78%',
        verified: true,
      },
      codechef: {
        username: 'sagar_start',
        url: 'https://codechef.com/users/sagar_start',
        stars: '1★',
        rating: 1220,
        global_rank: 75200,
        verified: true,
      },
      linkedin: {
        url: 'https://linkedin.com/in/sagar-learner',
        headline: 'Computer Science Student exploring Python & Web',
        connections: '120+',
        verified: false,
      },
      github: {
        username: 'sagar-codes',
        url: 'https://github.com/sagar-codes',
        public_repos: 4,
        commits_this_year: 45,
        top_language: 'Python',
        verified: true,
      },
    },
  },
};

// Sensitivity "How to Improve" actions catalogue
const IMPROVEMENT_ACTIONS: Record<string, StudentImprovementAction[]> = {
  '241FA18067': [
    {
      id: 'act-att-1',
      indicator: 'attendance',
      title: 'Attend Next 4 Classes (+1.5% Biometric)',
      description: 'Your attendance is at 74.0%. Attending 4 straight classes crosses the crucial 75% boundary, removing the risk flag and unlocking full attendance points.',
      actionText: '100% attendance this week in discrete maths & DBMS',
      effortLevel: 'Low',
      effortHours: 4,
      pointsGain: 2.4,
      roiRatio: 0.60, // 2.4 pts / 4 hrs = 0.60 pts/hr (Highest ROI!)
      badgeText: 'Highest ROI 🚀',
      category: 'Attendance',
    },
    {
      id: 'act-lms-1',
      indicator: 'lms',
      title: 'Complete 1 Pending LMS Lab Assignment',
      description: 'Submit Lab Experiment #8 in Cloud Computing. Takes approximately 90 minutes and boosts your LMS indicator to 92%.',
      actionText: 'Upload code and lab write-up to LMS',
      effortLevel: 'Low',
      effortHours: 1.5,
      pointsGain: 1.2,
      roiRatio: 0.80,
      badgeText: 'Quick Win ⚡',
      category: 'LMS Activity',
    },
    {
      id: 'act-acad-1',
      indicator: 'academic',
      title: 'Score ≥ 9/10 in Upcoming CIE Quiz 2',
      description: 'Upcoming Object-Oriented Programming MCQ on CampusPulse. High performance directly raises your continuous evaluation index.',
      actionText: 'Revise Java OOP principles & polymorphism',
      effortLevel: 'Medium',
      effortHours: 3.5,
      pointsGain: 1.8,
      roiRatio: 0.51,
      badgeText: 'High Impact 🎯',
      category: 'Academics',
    },
    {
      id: 'act-cert-1',
      indicator: 'engagement',
      title: 'Upload 1 Hackathon / Skill Certification',
      description: 'Submit your recent GitHub open-source PR or AWS Cloud badge to the student portal for verification.',
      actionText: 'Submit verified certificate link',
      effortLevel: 'Medium',
      effortHours: 2,
      pointsGain: 0.9,
      roiRatio: 0.45,
      badgeText: 'Verified Badge 🏆',
      category: 'Engagement',
    },
    {
      id: 'act-plac-1',
      indicator: 'placement',
      title: 'Retake CDC Mock Technical Interview',
      description: 'Raise your mock interview score from 68% to 80% with focused practice on system design questions.',
      actionText: 'Book 30-min slot with Alumni Mentors',
      effortLevel: 'High',
      effortHours: 5,
      pointsGain: 1.6,
      roiRatio: 0.32,
      badgeText: 'Career Boost 💼',
      category: 'Placement Readiness',
    },
  ],

  '241FA04070': [
    {
      id: 'sagar-att-1',
      indicator: 'attendance',
      title: 'Attend 12 Consecutive Lecture Hours (+8% Attendance)',
      description: 'Your attendance is at 61.2%. Consistent attendance over the next 10 days will lift you toward 70% and prevent exam debarment.',
      actionText: 'Check-in on biometric scanner for all Section B slots',
      effortLevel: 'Low',
      effortHours: 12,
      pointsGain: 6.5,
      roiRatio: 0.54,
      badgeText: 'Critical Lifeline 🚨',
      category: 'Attendance',
    },
    {
      id: 'sagar-acad-1',
      indicator: 'academic',
      title: 'Attend Saturday Remedial Clinic for 1 Backlog',
      description: 'Register for the Data Structures Remedial Clinic organized by Dr. Ananya Sharma. Clearing 1 backlog restores 20% of your academic weight.',
      actionText: 'Join Saturday 10:00 AM clinic in Lab 304',
      effortLevel: 'Medium',
      effortHours: 6,
      pointsGain: 5.8,
      roiRatio: 0.96,
      badgeText: 'Massive Points Gain ⭐',
      category: 'Backlog Clearance',
    },
    {
      id: 'sagar-lms-1',
      indicator: 'lms',
      title: 'Turn in 3 Backlogged LMS Assignments',
      description: 'Submitting late assignments with faculty waiver unlocks critical internal marks.',
      actionText: 'Complete experiments 4, 5, and 6 in C++',
      effortLevel: 'Medium',
      effortHours: 4,
      pointsGain: 3.2,
      roiRatio: 0.80,
      badgeText: 'Fast Recovery ⚡',
      category: 'LMS Activity',
    },
  ],
};

// Upcoming exams
const UPCOMING_EXAMS: StudentExamSchedule[] = [
  {
    id: 'exam-cie2-oop',
    title: 'CIE-2: Object Oriented Programming & Java',
    subjectCode: 'CS204',
    date: 'Oct 14, 2026',
    time: '10:00 AM – 11:00 AM',
    durationMin: 45,
    totalMarks: 30,
    examType: 'CIE Internal',
    status: 'upcoming',
    examRouteId: 'exam-1',
    syllabus: ['Polymorphism & Interfaces', 'Exception Handling', 'Collections Framework & Streams'],
  },
  {
    id: 'exam-dsa-quiz',
    title: 'Data Structures & Algorithms MCQ Sprint',
    subjectCode: 'CS202',
    date: 'Oct 18, 2026',
    time: '02:00 PM – 02:45 PM',
    durationMin: 30,
    totalMarks: 25,
    examType: 'Mid-Term Quiz',
    status: 'upcoming',
    syllabus: ['Binary Search Trees', 'Heap Sort & Priority Queues', 'Graph Traversals (BFS/DFS)'],
  },
  {
    id: 'exam-dbms-lab',
    title: 'DBMS Schema Normalization & SQL Exam',
    subjectCode: 'CS206',
    date: 'Oct 22, 2026',
    time: '09:30 AM – 11:30 AM',
    durationMin: 120,
    totalMarks: 50,
    examType: 'Lab Exam',
    status: 'upcoming',
    syllabus: ['3NF & BCNF Normalization', 'Complex SQL Joins & Subqueries', 'ACID Transactions'],
  },
];

// Student past exam results & rank
const STUDENT_EXAM_RESULTS: Record<string, StudentExamResultItem[]> = {
  '241FA18067': [
    {
      id: 'res-1',
      subject: 'Data Structures & Algorithms',
      code: 'CS202',
      examName: 'CIE-1 Internal Examination',
      marksObtained: 27.5,
      totalMarks: 30,
      percentage: 91.6,
      classAverage: 21.2,
      topperMarks: 29.0,
      rank: 3,
      totalStudents: 42,
      grade: 'A+',
      date: 'Sept 15, 2026',
    },
    {
      id: 'res-2',
      subject: 'Computer Organization & Architecture',
      code: 'CS203',
      examName: 'Mid-Semester Exam',
      marksObtained: 44.0,
      totalMarks: 50,
      percentage: 88.0,
      classAverage: 35.4,
      topperMarks: 48.0,
      rank: 5,
      totalStudents: 42,
      grade: 'A',
      date: 'Sept 22, 2026',
    },
    {
      id: 'res-3',
      subject: 'Database Management Systems',
      code: 'CS206',
      examName: 'CIE-1 Written Test',
      marksObtained: 26.0,
      totalMarks: 30,
      percentage: 86.6,
      classAverage: 19.8,
      topperMarks: 28.5,
      rank: 4,
      totalStudents: 42,
      grade: 'A',
      date: 'Sept 28, 2026',
    },
    {
      id: 'res-4',
      subject: 'Discrete Mathematical Structures',
      code: 'MA201',
      examName: 'CIE-1 Internal Examination',
      marksObtained: 24.0,
      totalMarks: 30,
      percentage: 80.0,
      classAverage: 18.2,
      topperMarks: 30.0,
      rank: 7,
      totalStudents: 42,
      grade: 'B+',
      date: 'Oct 02, 2026',
    },
  ],

  '241FA04070': [
    {
      id: 'res-sagar-1',
      subject: 'Data Structures & Algorithms',
      code: 'CS202',
      examName: 'CIE-1 Internal Examination',
      marksObtained: 12.0,
      totalMarks: 30,
      percentage: 40.0,
      classAverage: 20.4,
      topperMarks: 29.0,
      rank: 37,
      totalStudents: 40,
      grade: 'F (Backlog)',
      date: 'Sept 15, 2026',
    },
    {
      id: 'res-sagar-2',
      subject: 'Computer Organization & Architecture',
      code: 'CS203',
      examName: 'Mid-Semester Exam',
      marksObtained: 22.0,
      totalMarks: 50,
      percentage: 44.0,
      classAverage: 34.8,
      topperMarks: 47.0,
      rank: 36,
      totalStudents: 40,
      grade: 'C',
      date: 'Sept 22, 2026',
    },
  ],
};

// In-memory store for anonymous feedback submissions
let ANONYMOUS_FEEDBACK_LOG: StudentAnonymousFeedback[] = [
  {
    id: 'fb-001',
    category: 'Labs & Computing',
    severity: 'moderate',
    details: 'Lab 3 Linux terminal machines in row 4 frequently lose internet connectivity during live coding sessions.',
    status: 'under_review',
    submittedAt: '2026-10-02T11:20:00Z',
    anonymousToken: 'ANON-8891-XK',
  },
  {
    id: 'fb-002',
    category: 'Exam Pacing',
    severity: 'low',
    details: 'The DBMS assignment deadline overlaps directly with the CIE-2 internal test timetable.',
    status: 'resolved',
    submittedAt: '2026-09-28T14:15:00Z',
    anonymousToken: 'ANON-3342-PL',
  },
];

// ----------------------------------------------------------------------------
// DATA ACCESS FUNCTIONS
// ----------------------------------------------------------------------------

export function getSynchronousStudentDossier(regNo: string = '241FA18067'): DetailedStudentDossier {
  const dossier = STUDENT_DOSSIERS[regNo] || STUDENT_DOSSIERS['241FA18067'];
  return JSON.parse(JSON.stringify(dossier));
}

export function getSynchronousImprovementActions(regNo: string = '241FA18067'): StudentImprovementAction[] {
  const actions = IMPROVEMENT_ACTIONS[regNo] || IMPROVEMENT_ACTIONS['241FA18067'];
  return [...actions].sort((a, b) => b.roiRatio - a.roiRatio);
}

export function getSynchronousUpcomingExams(): StudentExamSchedule[] {
  return UPCOMING_EXAMS;
}

export function getSynchronousExamResults(regNo: string = '241FA18067'): StudentExamResultItem[] {
  return STUDENT_EXAM_RESULTS[regNo] || STUDENT_EXAM_RESULTS['241FA18067'];
}

export const STORAGE_KEY_STUDENT_PROFILES = 'campuspulse_student_profiles';

export function getSavedStudentProfileMap(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENT_PROFILES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStudentProfileToStorage(regNo: string, profileData: any) {
  if (typeof window === 'undefined') return;
  try {
    const map = getSavedStudentProfileMap();
    map[regNo.toUpperCase()] = profileData;
    localStorage.setItem(STORAGE_KEY_STUDENT_PROFILES, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent('campuspulse-data-updated'));
  } catch {}
}

export async function getStudentDossier(regNo: string = '241FA18067'): Promise<DetailedStudentDossier> {
  const cleanReg = regNo.toUpperCase();
  const base = STUDENT_DOSSIERS[cleanReg] || STUDENT_DOSSIERS['241FA18067'];
  const dossier: DetailedStudentDossier = JSON.parse(JSON.stringify(base));

  // Merge any persisted edits from localStorage
  const map = getSavedStudentProfileMap();
  const saved = map[cleanReg];
  if (saved) {
    if (saved.full_name) dossier.full_name = saved.full_name;
    if (saved.coding_profiles) {
      if (saved.coding_profiles.leetcode?.url) {
        dossier.coding_profiles.leetcode.url = saved.coding_profiles.leetcode.url;
        if (saved.coding_profiles.leetcode.username) {
          dossier.coding_profiles.leetcode.username = saved.coding_profiles.leetcode.username;
        }
      }
      if (saved.coding_profiles.github?.url) {
        dossier.coding_profiles.github.url = saved.coding_profiles.github.url;
        if (saved.coding_profiles.github.username) {
          dossier.coding_profiles.github.username = saved.coding_profiles.github.username;
        }
      }
      if (saved.coding_profiles.linkedin?.url) {
        dossier.coding_profiles.linkedin.url = saved.coding_profiles.linkedin.url;
      }
      if (saved.coding_profiles.codechef?.url) {
        dossier.coding_profiles.codechef.url = saved.coding_profiles.codechef.url;
        if (saved.coding_profiles.codechef.username) {
          dossier.coding_profiles.codechef.username = saved.coding_profiles.codechef.username;
        }
      }
    }
  }

  return dossier;
}

export async function getStudentImprovementActions(regNo: string = '241FA18067'): Promise<StudentImprovementAction[]> {
  const actions = IMPROVEMENT_ACTIONS[regNo] || IMPROVEMENT_ACTIONS['241FA18067'];
  // Sort by highest ROI first (most points per hour of effort)
  return [...actions].sort((a, b) => b.roiRatio - a.roiRatio);
}

export async function getStudentUpcomingExams(): Promise<StudentExamSchedule[]> {
  return UPCOMING_EXAMS;
}

export async function getStudentExamResults(regNo: string = '241FA18067'): Promise<StudentExamResultItem[]> {
  const results = STUDENT_EXAM_RESULTS[regNo] || STUDENT_EXAM_RESULTS['241FA18067'];
  return results;
}

export async function updateStudentProfile(
  regNo: string,
  updates: {
    full_name?: string;
    leetcode_url?: string;
    github_url?: string;
    linkedin_url?: string;
    codechef_url?: string;
  }
): Promise<DetailedStudentDossier> {
  const cleanReg = regNo.toUpperCase();
  const current = STUDENT_DOSSIERS[cleanReg] || STUDENT_DOSSIERS['241FA18067'];

  if (updates.full_name && updates.full_name.trim()) {
    current.full_name = updates.full_name.trim();
  }
  if (updates.leetcode_url !== undefined) {
    current.coding_profiles.leetcode.url = updates.leetcode_url.trim();
    const parts = updates.leetcode_url.trim().split('/').filter(Boolean);
    const user = parts[parts.length - 1];
    if (user && !user.includes('http')) current.coding_profiles.leetcode.username = user;
  }
  if (updates.github_url !== undefined) {
    current.coding_profiles.github.url = updates.github_url.trim();
    const parts = updates.github_url.trim().split('/').filter(Boolean);
    const user = parts[parts.length - 1];
    if (user && !user.includes('http')) current.coding_profiles.github.username = user;
  }
  if (updates.linkedin_url !== undefined) {
    current.coding_profiles.linkedin.url = updates.linkedin_url.trim();
  }
  if (updates.codechef_url !== undefined) {
    current.coding_profiles.codechef.url = updates.codechef_url.trim();
    const parts = updates.codechef_url.trim().split('/').filter(Boolean);
    const user = parts[parts.length - 1];
    if (user && !user.includes('http')) current.coding_profiles.codechef.username = user;
  }

  // Persist to localStorage for cross-page & cross-role access (Admin & Student)
  saveStudentProfileToStorage(cleanReg, {
    reg_no: cleanReg,
    full_name: current.full_name,
    coding_profiles: {
      leetcode: {
        url: current.coding_profiles.leetcode.url,
        username: current.coding_profiles.leetcode.username,
      },
      github: {
        url: current.coding_profiles.github.url,
        username: current.coding_profiles.github.username,
      },
      linkedin: {
        url: current.coding_profiles.linkedin.url,
      },
      codechef: {
        url: current.coding_profiles.codechef.url,
        username: current.coding_profiles.codechef.username,
      },
    },
    updated_at: new Date().toISOString(),
  });

  // Update session user if matching
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('campuspulse_active_user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u.reg_no?.toUpperCase() === cleanReg && updates.full_name) {
          u.full_name = updates.full_name.trim();
          localStorage.setItem('campuspulse_active_user', JSON.stringify(u));
        }
      } catch {}
    }
  }

  return JSON.parse(JSON.stringify(current));
}

export async function submitAnonymousFeedback(input: {
  category: StudentAnonymousFeedback['category'];
  severity: StudentAnonymousFeedback['severity'];
  details: string;
}): Promise<{ success: boolean; anonymousToken: string }> {
  // Generate random crypto-like pseudo token without any user relation
  const token = `ANON-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  
  const newFeedback: StudentAnonymousFeedback = {
    id: `fb-${Date.now()}`,
    category: input.category,
    severity: input.severity,
    details: input.details,
    status: 'received',
    submittedAt: new Date().toISOString(),
    anonymousToken: token,
  };

  ANONYMOUS_FEEDBACK_LOG = [newFeedback, ...ANONYMOUS_FEEDBACK_LOG];
  return { success: true, anonymousToken: token };
}

export async function getAnonymousFeedbackList(): Promise<StudentAnonymousFeedback[]> {
  return ANONYMOUS_FEEDBACK_LOG;
}
