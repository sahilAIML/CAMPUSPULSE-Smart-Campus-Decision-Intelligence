'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  GraduationCap,
  Megaphone,
  Lock,
  ArrowRight,
  ShieldCheck,
  LogIn,
} from 'lucide-react';
import {
  DetailedStudentDossier,
  StudentImprovementAction,
  StudentExamSchedule,
  StudentExamResultItem,
  getStudentDossier,
  getStudentImprovementActions,
  getStudentUpcomingExams,
  getStudentExamResults,
} from '@/lib/data/student-portal';
import { getAnnouncements } from '@/lib/data/announcements';
import { Announcement } from '@/lib/data/types';
import { StudentPortalHeader } from '@/components/student/StudentPortalHeader';
import { StudentScoreGauge } from '@/components/student/StudentScoreGauge';
import { StudentIndicatorsList } from '@/components/student/StudentIndicatorsList';
import { PlacementRiskCard } from '@/components/student/PlacementRiskCard';
import { HowToImprovePlan } from '@/components/student/HowToImprovePlan';
import { StudentExamsAndResults } from '@/components/student/StudentExamsAndResults';
import { CodingProfilesCard } from '@/components/student/CodingProfilesCard';
import { AnonymousFeedbackForm } from '@/components/student/AnonymousFeedbackForm';
import { AnnouncementsSection } from '@/components/announcements/AnnouncementsSection';
import {
  getSynchronousStudentDossier,
  getSynchronousImprovementActions,
  getSynchronousUpcomingExams,
  getSynchronousExamResults,
} from '@/lib/data/student-portal';
import { getSessionUser } from '@/lib/data/auth';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function StudentPortalPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentRegNo, setCurrentRegNo] = useState<string>('241FA18067');

  const [dossier, setDossier] = useState<DetailedStudentDossier>(() =>
    getSynchronousStudentDossier('241FA18067')
  );
  const [actions, setActions] = useState<StudentImprovementAction[]>(() =>
    getSynchronousImprovementActions('241FA18067')
  );
  const [upcomingExams, setUpcomingExams] = useState<StudentExamSchedule[]>(() =>
    getSynchronousUpcomingExams()
  );
  const [results, setResults] = useState<StudentExamResultItem[]>(() =>
    getSynchronousExamResults('241FA18067')
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const user = getSessionUser();
    setCurrentUser(user);
    setAuthChecked(true);
    if (user && user.role === 'student' && user.reg_no) {
      setCurrentRegNo(user.reg_no);
      loadStudentData(user.reg_no);
    } else if (user) {
      loadStudentData(user.reg_no || currentRegNo);
    }
  }, []);

  const loadStudentData = async (regNo: string) => {
    const [dossierData, actionsData, examsData, resultsData, annData] = await Promise.all([
      getStudentDossier(regNo),
      getStudentImprovementActions(regNo),
      getStudentUpcomingExams(),
      getStudentExamResults(regNo),
      getAnnouncements(),
    ]);

    setDossier(dossierData);
    setActions(actionsData);
    setUpcomingExams(examsData);
    setResults(resultsData);
    setAnnouncements(annData);
  };

  const handleProfileUpdated = (updated: DetailedStudentDossier) => {
    setDossier(updated);
  };

  // Security Guard: Student Portal requires authenticated session
  if (authChecked && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--clay-bg)] text-[var(--clay-text)]">
        <ClayCard className="max-w-md p-8 text-center space-y-5 border-2 border-[var(--clay-border)] shadow-[var(--shadow-clay-card-hover)] relative">
          <div className="flex justify-end">
            <ThemeToggle size="sm" />
          </div>
          <div className="h-16 w-16 rounded-3xl bg-[#5B6CFF]/15 text-[#5B6CFF] mx-auto flex items-center justify-center shadow-[var(--shadow-clay-badge)]">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-2xl text-[var(--clay-text)] mb-2">
              Student Sign In Required
            </h2>
            <p className="text-xs sm:text-sm text-[var(--clay-muted)] leading-relaxed">
              To protect student academic privacy, please authenticate with your institutional credentials to access your personal performance telemetry, exams, and profile links.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF7A59] to-[#E05F3F] text-white text-xs font-heading font-extrabold shadow-[var(--shadow-clay-coral)] hover:opacity-95 transition-all"
            >
              <span>Sign In to Student Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ClayCard>
      </div>
    );
  }

  if (loading || !dossier) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--clay-bg)] text-[var(--clay-text)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#FF7A59] text-white flex items-center justify-center animate-spin">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-heading font-extrabold text-sm text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
            Loading Student Intelligence Dossier...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--clay-bg)] text-[var(--clay-text)] p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header with Edit Profile Action */}
      <StudentPortalHeader
        dossier={dossier}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* 2. Own Success Score Circular Gauge (Encouraging tone, never shaming) */}
      <StudentScoreGauge dossier={dossier} />

      {/* 3. AI Placement Risk Predictor (Trained ML Model with Real-Time Work Adaptation) */}
      <PlacementRiskCard regNo={dossier.reg_no} studentName={dossier.full_name} />

      {/* 4. "How to Improve" High-ROI Sensitivity Action Plan */}
      <HowToImprovePlan dossier={dossier} actions={actions} />

      {/* 4. The 7 Success Indicators & Constructive Focus Areas */}
      <StudentIndicatorsList dossier={dossier} />

      {/* 5. Upcoming Examinations, MCQ Launcher & Tie-Aware Past Rank Results */}
      <StudentExamsAndResults upcomingExams={upcomingExams} results={results} />

      {/* 6. Linked Coding Profiles (LeetCode, CodeChef, GitHub, LinkedIn) */}
      <CodingProfilesCard codingProfiles={dossier.coding_profiles} />

      {/* 7. Announcements Targeted to Student Cohorts */}
      <AnnouncementsSection initialAnnouncements={announcements} />

      {/* 8. Anonymous Feedback Form (Problems faced, 100% confidential) */}
      <AnonymousFeedbackForm />
    </div>
  );
}
