'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Building2,
  Search,
  Sliders,
  UploadCloud,
  Users,
  Megaphone,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  UserPlus,
} from 'lucide-react';
import { AdminSidebar, AdminTab } from '@/components/admin/AdminSidebar';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import { InstitutionalDashboard } from '@/components/admin/InstitutionalDashboard';
import { ProfileLookup } from '@/components/admin/ProfileLookup';
import { FacultyDirectory } from '@/components/admin/FacultyDirectory';
import { StudentsDirectory } from '@/components/admin/StudentsDirectory';
import { WeightTuner } from '@/components/admin/WeightTuner';
import { CSVImporter } from '@/components/admin/CSVImporter';
import { UserManagement } from '@/components/admin/UserManagement';
import { ContentManager } from '@/components/admin/ContentManager';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { AddEntityModal } from '@/components/admin/AddEntityModal';
import { ClayBadge } from '@/components/ui/ClayBadge';
import { ClayCard } from '@/components/ui/ClayCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { getSessionUser } from '@/lib/data/auth';
import { AuthUser } from '@/lib/data/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [selectedLookupId, setSelectedLookupId] = useState<string>('241FA18067');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const user = getSessionUser();
    setCurrentUser(user);
    setAuthChecked(true);
  }, []);

  // Admin Access Guard: Strictly require admin role
  if (authChecked && (!currentUser || currentUser.role !== 'admin')) {
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
              Administrator Clearance Required
            </h2>
            <p className="text-xs sm:text-sm text-[var(--clay-muted)] leading-relaxed">
              Institutional governance, score-weight configuration, user privilege assignment, and compliance ledgers require verified administrative credentials.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--clay-pressed)] border border-[var(--clay-border)] text-xs text-[var(--clay-muted)] font-mono">
            Security Status: {currentUser ? `Signed in as ${currentUser.role.toUpperCase()} (${currentUser.full_name})` : 'Unauthenticated Session'}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#FF7A59] text-white text-xs font-heading font-extrabold shadow-[var(--shadow-clay-coral)] hover:opacity-90 transition-all"
            >
              Sign In with Administrator Credentials
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] text-[var(--clay-text)] text-xs font-heading font-bold shadow-[var(--shadow-clay-btn)] hover:text-[#FF7A59] transition-all"
            >
              Return to Landing
            </Link>
          </div>
        </ClayCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--clay-bg)] text-[var(--clay-text)] flex p-3 sm:p-5 gap-5 pb-24 lg:pb-5">
      {/* 1. Desktop Sticky Admin Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 2. Main Admin Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col min-w-0">
        {/* Top Header Row */}
        <header className="mb-6 p-5 sm:p-6 rounded-[32px] bg-[var(--clay-card)] border-2 border-[var(--clay-border)] shadow-[var(--shadow-clay-card)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <ClayBadge variant="coral" icon={<Sparkles className="h-3 w-3" />}>
                  KPMG Smart Campus Analytics • Admin
                </ClayBadge>
                <ClayBadge variant="teal" icon={<ShieldCheck className="h-3 w-3" />}>
                  Institutional DB Active • Verifiable Records
                </ClayBadge>
                <ClayBadge variant="indigo" icon={<Layers className="h-3 w-3" />}>
                  RLS Scoped
                </ClayBadge>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-[var(--clay-text)] tracking-tight">
                Institutional Governance & Decision Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-[var(--clay-muted)] font-medium mt-1">
                Overseeing department KPIs, risk distributions, score weights, user access, and verifiable audit records.
              </p>
            </div>

            {/* Quick Switch Pills & Theme Mode */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="px-3.5 py-2 rounded-2xl bg-[#FF7A59] text-white shadow-[var(--shadow-clay-coral)] text-xs font-heading font-extrabold flex items-center gap-1.5 hover:opacity-95 transition-all"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>+ Add Member</span>
              </button>
              <ThemeToggle size="sm" />
              <Link
                href="/faculty"
                className="px-3.5 py-2 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-btn)] text-xs font-heading font-bold text-[var(--clay-text)] hover:text-[#FF7A59] transition-all flex items-center gap-1.5"
              >
                <span>Faculty View</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/"
                className="px-3.5 py-2 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-btn)] text-xs font-heading font-bold text-[var(--clay-muted)] hover:text-[var(--clay-text)] transition-all"
              >
                Landing
              </Link>
            </div>
          </div>

          {/* Quick Tab Header Indicator */}
          <div className="mt-4 pt-4 border-t border-[var(--clay-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-heading font-extrabold text-[var(--clay-muted)] uppercase tracking-wider">
                Active Module:
              </span>
              <span className="text-xs font-heading font-extrabold text-[#FF7A59] bg-[#FF7A59]/10 px-2.5 py-0.5 rounded-xl border border-[#FF7A59]/20">
                {activeTab === 'dashboard' && 'Institutional Dashboard & Heatmap'}
                {activeTab === 'faculty' && 'Faculty Directory (123 CSE Profiles)'}
                {activeTab === 'students' && 'Students List & Institutional Cohort'}
                {activeTab === 'lookup' && 'Profile Lookup (Faculty & Student)'}
                {activeTab === 'weights' && 'Score Weight Tuning & Recomputation'}
                {activeTab === 'csv' && 'CSV Import Engine & Validation Report'}
                {activeTab === 'users' && 'User Management & Role Access'}
                {activeTab === 'content' && 'Announcements & Placements CRUD'}
                {activeTab === 'audit' && 'Audit Trail & Compliance Ledger'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[var(--clay-muted)]">
              <Calendar className="h-3.5 w-3.5 text-[#2EC4B6]" />
              <span>Academic Year 2025–26</span>
            </div>
          </div>
        </header>

        {/* 3. Sub-View Modules */}
        <section className="flex-1 w-full space-y-6">
          {activeTab === 'dashboard' && <InstitutionalDashboard />}
          {activeTab === 'faculty' && <FacultyDirectory />}
          {activeTab === 'students' && (
            <StudentsDirectory
              onSelectStudent={(reg) => {
                setSelectedLookupId(reg);
                setActiveTab('lookup');
              }}
            />
          )}
          {activeTab === 'lookup' && <ProfileLookup initialId={selectedLookupId} />}
          {activeTab === 'weights' && <WeightTuner />}
          {activeTab === 'csv' && <CSVImporter />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'content' && <ContentManager />}
          {activeTab === 'audit' && <AuditLogViewer />}
        </section>
      </main>

      {/* 4. Mobile Bottom Navigation */}
      <AdminMobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 5. Add Student & Faculty Modal */}
      <AddEntityModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
}
