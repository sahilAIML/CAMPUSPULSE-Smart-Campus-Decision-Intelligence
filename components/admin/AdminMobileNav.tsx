'use client';

import React from 'react';
import {
  Building2,
  GraduationCap,
  Search,
  Sliders,
  UploadCloud,
  Users,
  Megaphone,
  ShieldAlert,
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';

interface AdminMobileNavProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export function AdminMobileNav({
  activeTab,
  onTabChange,
}: AdminMobileNavProps) {
  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Overview', icon: <Building2 className="h-4 w-4" /> },
    { id: 'faculty', label: 'Faculty', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'students', label: 'Students', icon: <Users className="h-4 w-4" /> },
    { id: 'lookup', label: 'Lookup', icon: <Search className="h-4 w-4" /> },
    { id: 'weights', label: 'Weights', icon: <Sliders className="h-4 w-4" /> },
    { id: 'csv', label: 'CSV', icon: <UploadCloud className="h-4 w-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
    { id: 'content', label: 'Content', icon: <Megaphone className="h-4 w-4" /> },
    { id: 'audit', label: 'Audit', icon: <ShieldAlert className="h-4 w-4" /> },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-[var(--clay-card)] border-2 border-[var(--clay-border)] rounded-3xl p-2 shadow-[var(--shadow-clay-card-hover)] flex items-center justify-around overflow-x-auto gap-1"
      aria-label="Mobile Admin Navigation"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl min-w-[50px] transition-all ${
              isActive
                ? 'bg-gradient-to-r from-[#FF7A59] to-[#E05F3F] text-white shadow-[var(--shadow-clay-coral)]'
                : 'text-[var(--clay-muted)] hover:text-[var(--clay-text)]'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-heading font-extrabold mt-1 whitespace-nowrap">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
