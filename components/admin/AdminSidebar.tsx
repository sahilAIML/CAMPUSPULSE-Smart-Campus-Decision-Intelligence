'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Building2,
  Search,
  Sliders,
  UploadCloud,
  Users,
  Megaphone,
  ShieldAlert,
  LogOut,
  GraduationCap,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { logoutUser } from '@/lib/data/auth';
import { ThemeToggle } from '../ui/ThemeToggle';

export type AdminTab =
  | 'dashboard'
  | 'faculty'
  | 'students'
  | 'lookup'
  | 'weights'
  | 'csv'
  | 'users'
  | 'content'
  | 'audit';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export function AdminSidebar({
  activeTab,
  onTabChange,
}: AdminSidebarProps) {
  const router = useRouter();

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Institutional Overview',
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      id: 'faculty',
      label: 'Faculty Directory',
      icon: <GraduationCap className="h-5 w-5" />,
      badge: '123 Roster',
    },
    {
      id: 'students',
      label: 'Students List',
      icon: <Users className="h-5 w-5" />,
      badge: 'Cohort',
    },
    {
      id: 'lookup',
      label: 'Profile Lookup',
      icon: <Search className="h-5 w-5" />,
      badge: 'FAC / Roll',
    },
    {
      id: 'weights',
      label: 'Score Weight Tuning',
      icon: <Sliders className="h-5 w-5" />,
      badge: 'Live',
    },
    {
      id: 'csv',
      label: 'CSV Importer',
      icon: <UploadCloud className="h-5 w-5" />,
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: 'content',
      label: 'Content & Placements',
      icon: <Megaphone className="h-5 w-5" />,
      badge: 'CRUD',
    },
    {
      id: 'audit',
      label: 'Audit & Compliance',
      icon: <ShieldAlert className="h-5 w-5" />,
    },
  ];

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  return (
    <aside className="hidden lg:flex flex-col justify-between w-64 h-[calc(100vh-2rem)] sticky top-4 rounded-[36px] bg-[var(--clay-card)] border-2 border-[var(--clay-border)] shadow-[var(--shadow-clay-card)] p-5 select-none z-30 flex-shrink-0">
      <div>
        {/* Brand Logo Header */}
        <Link href="/" className="flex items-center gap-3 px-2 mb-6 group">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#FF7A59] to-[#E05F3F] flex items-center justify-center text-white shadow-[var(--shadow-clay-coral)] group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-lg text-[var(--clay-text)] tracking-tight block">
              Campus<span className="text-[#FF7A59]">Pulse</span>
            </span>
            <span className="text-[10px] font-extrabold text-[var(--clay-muted)] uppercase tracking-wider block">
              Admin Governance
            </span>
          </div>
        </Link>

        {/* Quick Portal Switcher Banner */}
        <div className="mb-4 px-3 py-2 rounded-2xl bg-[var(--clay-pressed)]/50 border border-[var(--clay-border)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-heading font-extrabold text-[var(--clay-text)]">Dean / Admin</span>
          </div>
          <Link
            href="/faculty"
            className="text-[10px] font-bold text-[#FF7A59] hover:underline"
            title="Switch to Faculty View"
          >
            Faculty →
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1.5" aria-label="Admin Navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-heading font-bold text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF7A59] to-[#E05F3F] text-white shadow-[var(--shadow-clay-coral)] translate-x-1'
                    : 'text-[var(--clay-muted)] hover:text-[var(--clay-text)] hover:bg-[var(--clay-pressed)]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-[var(--clay-muted)]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--clay-pressed)] text-[var(--clay-muted)] border border-[var(--clay-border)]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin User Profile & Sign Out Footer */}
      <div className="pt-4 border-t border-[var(--clay-border)] flex flex-col gap-3">

        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#5B6CFF] to-[#3B4CD8] flex items-center justify-center text-white font-heading font-extrabold shadow-[var(--shadow-clay-btn)]">
            SN
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-heading font-extrabold text-xs text-[var(--clay-text)] truncate">
              Dr. S. K. Narayanan
            </span>
            <span className="text-[10px] font-bold text-[var(--clay-muted)] truncate">
              Dean of Academics
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-heading font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Exit Admin Portal</span>
        </button>
      </div>
    </aside>
  );
}
