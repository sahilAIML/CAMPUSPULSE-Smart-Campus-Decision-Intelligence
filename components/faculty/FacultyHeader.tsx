'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, User, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { ClayInput } from '../ui/ClayInput';
import { ClayBadge } from '../ui/ClayBadge';
import { ThemeToggle } from '../ui/ThemeToggle';
import { StudentListItem } from '@/lib/data/students';
import { getSessionUser } from '@/lib/data/auth';

interface FacultyHeaderProps {
  currentSection: 'A' | 'B' | 'C' | 'all';
  onSectionChange: (sec: 'A' | 'B' | 'C' | 'all') => void;
  students: StudentListItem[];
  onSelectStudent: (student: StudentListItem) => void;
}

export function FacultyHeader({
  currentSection,
  onSectionChange,
  students,
  onSelectStudent,
}: FacultyHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [greeting, setGreeting] = useState('Good morning');
  const [sessionUser, setSessionUser] = useState<any>(null);

  useEffect(() => {
    setSessionUser(getSessionUser());
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const displayName = sessionUser?.full_name || 'Prof. Ananya Sharma';
  const displayId = sessionUser?.reg_no || 'FAC210';

  // Filter students for instant autocomplete
  const suggestions = searchQuery.trim().length > 0
    ? students.filter((s) =>
        s.reg_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
      {/* Left: Greeting & Section Tabs */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span suppressHydrationWarning className="text-xs font-heading font-extrabold text-white/95 uppercase tracking-wider drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {greeting},
          </span>
          <ClayBadge variant="teal" size="sm">Active Term: Sem V</ClayBadge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
          {displayName} <span className="text-xs font-bold text-white/85 font-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">({displayId})</span>
        </h1>

        {/* Section Tabs (Clay Pill Toggles, Active = Pressed) */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-heading font-extrabold text-white uppercase mr-1 hidden sm:inline drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Section:
          </span>
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/35 backdrop-blur-md border border-white/20 shadow-sm">
            {(['A', 'B', 'C', 'all'] as const).map((sec) => {
              const isActive = currentSection === sec;
              return (
                <button
                  key={sec}
                  onClick={() => onSectionChange(sec)}
                  className={`px-3.5 py-1.5 rounded-xl font-heading text-xs select-none transition-all min-h-[38px] ${
                    isActive
                      ? 'bg-white text-[#FF7A59] shadow-[var(--shadow-clay-btn-pressed)] scale-[0.97] border border-white font-extrabold'
                      : 'text-white/90 hover:text-white hover:bg-white/10 font-bold'
                  }`}
                >
                  {sec === 'all' ? 'All Sections' : `Section ${sec}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Theme Selector & Instant Student Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <ThemeToggle size="sm" />
        <div ref={searchContainerRef} className="relative w-full md:w-80 lg:w-96">
          <ClayInput
          placeholder="Search name or reg no (e.g. 241FA18067)..."
          icon={<Search className="h-4 w-4" />}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          rightElement={
            searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[var(--clay-muted)] hover:text-[var(--clay-text)] p-1"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null
          }
        />

        {/* Instant Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-3xl bg-[var(--clay-card)] border-2 border-[var(--clay-border)] shadow-[var(--shadow-clay-card-hover)] p-2 space-y-1 animate-in fade-in-50 duration-150">
            <div className="px-3 py-1.5 text-[10px] font-heading font-extrabold uppercase tracking-wider text-[var(--clay-muted)] border-b border-[var(--clay-border)]">
              Instant Student Matching ({suggestions.length})
            </div>
            {suggestions.map((student) => (
              <button
                key={student.student_id}
                onClick={() => {
                  onSelectStudent(student);
                  setShowDropdown(false);
                  setSearchQuery('');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-[var(--clay-pressed)] text-left transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-[var(--clay-card)] shadow-[var(--shadow-clay-btn)] flex items-center justify-center font-bold text-xs flex-shrink-0 text-[var(--clay-text)]">
                    {student.full_name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <span className="font-heading font-bold text-xs text-[var(--clay-text)] block truncate group-hover:text-[#FF7A59]">
                      {student.full_name}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--clay-muted)] block tabular-nums">
                      {student.reg_no} • {student.section_name} • CGPA {student.cgpa}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <ClayBadge
                    variant={
                      student.risk_level === 'critical'
                        ? 'risk-critical'
                        : student.risk_level === 'high'
                        ? 'risk-high'
                        : student.risk_level === 'medium'
                        ? 'risk-medium'
                        : 'risk-low'
                    }
                    size="sm"
                  >
                    {student.risk_probability}
                  </ClayBadge>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--clay-muted)] group-hover:text-[#FF7A59]" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
