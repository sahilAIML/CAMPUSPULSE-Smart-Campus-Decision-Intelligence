'use client';

import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  FileCheck2,
  GraduationCap,
  LogOut,
} from 'lucide-react';
import { logoutUser } from '@/lib/data/auth';
import { useRouter } from 'next/navigation';

interface FacultyBottomBarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function FacultyBottomBar({
  activeTab = 'home',
  onTabChange,
}: FacultyBottomBarProps) {
  const router = useRouter();

  const tabs = [
    { id: 'home', label: 'Home', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="h-5 w-5" /> },
    { id: 'exams', label: 'Exams', icon: <FileCheck2 className="h-5 w-5" /> },
    { id: 'results', label: 'Results', icon: <GraduationCap className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  return (
    <nav
      className="fixed bottom-3 left-3 right-3 z-40 lg:hidden rounded-3xl bg-[var(--clay-card)] border-2 border-[var(--clay-border)] shadow-[var(--shadow-clay-card-hover)] p-2 backdrop-blur-md flex items-center justify-around"
      aria-label="Mobile Navigation"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all min-h-[48px] min-w-[54px] ${
              isActive
                ? 'bg-[var(--clay-card)] text-[#FF7A59] shadow-[var(--shadow-clay-btn-pressed)] scale-95'
                : 'text-[var(--clay-muted)] hover:text-[var(--clay-text)]'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-heading font-extrabold mt-1">
              {tab.label}
            </span>
          </button>
        );
      })}

      <button
        onClick={handleLogout}
        className="flex flex-col items-center justify-center p-2 rounded-2xl text-rose-500 hover:text-rose-600 transition-all min-h-[48px] min-w-[54px]"
        aria-label="Log out"
      >
        <LogOut className="h-5 w-5" />
        <span className="text-[10px] font-heading font-extrabold mt-1">Exit</span>
      </button>
    </nav>
  );
}
