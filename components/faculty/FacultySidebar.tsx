'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  CalendarCheck,
  FileCheck2,
  GraduationCap,
  Briefcase,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react';
import { logoutUser, getSessionUser } from '@/lib/data/auth';
import { ThemeToggle } from '../ui/ThemeToggle';

interface FacultySidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function FacultySidebar({
  activeTab = 'home',
  onTabChange,
}: FacultySidebarProps) {
  const router = useRouter();
  const [sessionUser, setSessionUser] = React.useState<any>(null);

  React.useEffect(() => {
    setSessionUser(getSessionUser());
  }, []);

  const fullName = sessionUser?.full_name || 'Prof. Ananya Sharma';
  const regNo = sessionUser?.reg_no || 'FAC210';
  const avatarUrl = sessionUser?.avatar_url || 'https://vignan.ac.in/Facultyprofiles/uploads/163/profilepic163.png';

  const navItems = [
    { id: 'home', label: 'Home', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="h-5 w-5" /> },
    { id: 'exams', label: 'Exams', icon: <FileCheck2 className="h-5 w-5" /> },
    { id: 'results', label: 'Results', icon: <GraduationCap className="h-5 w-5" /> },
    { id: 'placements', label: 'Placements', icon: <Briefcase className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  return (
    <aside className="hidden lg:flex flex-col justify-between w-64 h-[calc(100vh-2rem)] sticky top-4 rounded-[36px] bg-[var(--clay-card)] border-2 border-[var(--clay-border)] shadow-[var(--shadow-clay-card)] p-5 select-none z-30 flex-shrink-0">
      <div>
        {/* Brand Logo Header */}
        <Link href="/" className="flex items-center gap-3 px-2 mb-8 group">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#FF7A59] to-[#E05F3F] flex items-center justify-center text-white shadow-[var(--shadow-clay-coral)] group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-lg text-[var(--clay-text)] tracking-tight block">
              Campus<span className="text-[#FF7A59]">Pulse</span>
            </span>
            <span className="text-[10px] font-extrabold text-[var(--clay-muted)] uppercase tracking-wider block">
              Faculty Intelligence
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-heading font-bold text-sm transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-[var(--clay-card)] text-[#FF7A59] shadow-[var(--shadow-clay-btn-pressed)] scale-[0.98] border border-[var(--clay-border)]'
                    : 'text-[var(--clay-muted)] hover:text-[var(--clay-text)] hover:-translate-y-0.5'
                }`}
              >
                <span className={isActive ? 'text-[#FF7A59]' : 'text-[var(--clay-muted)]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Logout Bottom Card */}
      <div className="pt-4 border-t border-[var(--clay-border)] space-y-3">

        {/* Faculty Profile Card */}
        <div className="p-3.5 rounded-2xl bg-[var(--clay-pressed)]/70 border border-[var(--clay-border)] flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-[#2EC4B6] border border-[var(--clay-border)] flex items-center justify-center font-heading font-extrabold shadow-[var(--shadow-clay-teal)] flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={fullName}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="h-full w-full flex items-center justify-center text-white font-bold bg-[#2EC4B6]">
              {fullName.charAt(0)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-heading font-extrabold text-xs text-[var(--clay-text)] block truncate">
              {fullName}
            </span>
            <span className="text-[11px] font-semibold text-[#2EC4B6] block truncate">
              {regNo} • Sec A Mentor
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-btn)] text-xs font-heading font-bold text-rose-600 hover:bg-rose-500/10 active:scale-95 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
