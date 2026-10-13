'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  Clock,
  RefreshCw,
  Sparkles,
  BookOpen,
  Trophy,
  FileText,
  Calendar,
  Search,
  Filter,
} from 'lucide-react';
import { ClayCard } from '../ui/ClayCard';
import { ClayBadge } from '../ui/ClayBadge';
import { ClayInput } from '../ui/ClayInput';
import { Announcement, AnnouncementType } from '@/lib/data/types';

interface AnnouncementsSectionProps {
  initialAnnouncements: Announcement[];
}

export function AnnouncementsSection({
  initialAnnouncements,
}: AnnouncementsSectionProps) {
  const [selectedType, setSelectedType] = useState<AnnouncementType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterChips: { type: AnnouncementType | 'all'; label: string; icon: React.ReactNode }[] = [
    { type: 'all', label: 'All Notices', icon: <Megaphone className="h-3.5 w-3.5" /> },
    { type: 'exam', label: 'Exams', icon: <FileText className="h-3.5 w-3.5" /> },
    { type: 'extra_class', label: 'Extra Classes', icon: <BookOpen className="h-3.5 w-3.5" /> },
    { type: 'time_change', label: 'Time Change', icon: <Clock className="h-3.5 w-3.5" /> },
    { type: 'reschedule', label: 'Reschedule', icon: <RefreshCw className="h-3.5 w-3.5" /> },
    { type: 'fest', label: 'Fests & Tech', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { type: 'sports', label: 'Sports', icon: <Trophy className="h-3.5 w-3.5" /> },
  ];

  const getTypeMeta = (type: AnnouncementType) => {
    switch (type) {
      case 'exam':
        return {
          label: 'Exam Notice',
          badgeVariant: 'coral' as const,
          icon: <FileText className="h-3.5 w-3.5" />,
        };
      case 'extra_class':
        return {
          label: 'Special Class',
          badgeVariant: 'teal' as const,
          icon: <BookOpen className="h-3.5 w-3.5" />,
        };
      case 'time_change':
        return {
          label: 'Timing Update',
          badgeVariant: 'sun' as const,
          icon: <Clock className="h-3.5 w-3.5" />,
        };
      case 'reschedule':
        return {
          label: 'Rescheduled',
          badgeVariant: 'risk-medium' as const,
          icon: <RefreshCw className="h-3.5 w-3.5" />,
        };
      case 'fest':
        return {
          label: 'Campus Fest',
          badgeVariant: 'teal' as const,
          icon: <Sparkles className="h-3.5 w-3.5" />,
        };
      case 'sports':
        return {
          label: 'Sports Tournament',
          badgeVariant: 'sun' as const,
          icon: <Trophy className="h-3.5 w-3.5" />,
        };
      default:
        return {
          label: 'General Notice',
          badgeVariant: 'default' as const,
          icon: <Megaphone className="h-3.5 w-3.5" />,
        };
    }
  };

  const filteredAnnouncements = initialAnnouncements.filter((item) => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <section id="announcements" className="w-full py-12 sm:py-16 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ClayBadge variant="teal" icon={<Megaphone className="h-3.5 w-3.5" />}>
                Official Bulletins
              </ClayBadge>
              <span className="text-xs font-bold text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">Verified Faculty Desk</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              Campus Announcements
            </h2>
            <p className="text-sm sm:text-base text-white/95 mt-1 max-w-xl font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
              Real-time schedule adjustments, examinations, remedial sessions, and academic circulars.
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-72">
            <ClayInput
              placeholder="Search circulars..."
              icon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <div className="flex items-center gap-2 text-xs font-heading font-extrabold text-white uppercase pl-1 pr-2 flex-shrink-0 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
            <Filter className="h-3.5 w-3.5" />
            <span>Category:</span>
          </div>
          {filterChips.map((chip) => {
            const isActive = selectedType === chip.type;
            return (
              <button
                key={chip.type}
                onClick={() => setSelectedType(chip.type)}
                className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-heading font-bold text-xs select-none transition-all duration-200 min-h-[44px] ${
                  isActive
                    ? 'bg-[#FF7A59] text-white border border-white/40 shadow-[var(--shadow-clay-coral)] scale-[1.02]'
                    : 'bg-[var(--clay-card)] text-[var(--clay-text)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-btn)] hover:-translate-y-[1px]'
                }`}
              >
                {chip.icon}
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Announcements Card Grid */}
        {filteredAnnouncements.length === 0 ? (
          <ClayCard className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-14 w-14 rounded-2xl bg-[var(--clay-pressed)] flex items-center justify-center text-[var(--clay-muted)] mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[var(--clay-text)]">
              No circulars found
            </h3>
            <p className="text-xs text-[var(--clay-muted)] max-w-sm mt-1">
              No notices match the filter &ldquo;{selectedType}&rdquo; or query &ldquo;{searchQuery}&rdquo;.
            </p>
          </ClayCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAnnouncements.map((item) => {
              const meta = getTypeMeta(item.type);
              const dateStr = new Date(item.created_at).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <ClayCard
                  key={item.id}
                  hoverable
                  className="p-5 sm:p-6 flex flex-col justify-between h-full group"
                >
                  <div>
                    {/* Header: Date + Type Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <ClayBadge variant={meta.badgeVariant} icon={meta.icon} size="sm">
                        {meta.label}
                      </ClayBadge>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--clay-muted)]">
                        <Calendar className="h-3 w-3" />
                        <span className="tabular-nums">{dateStr}</span>
                      </div>
                    </div>

                    {/* Notice Title */}
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-[var(--clay-text)] leading-snug group-hover:text-[#FF7A59] transition-colors mb-2.5">
                      {item.title}
                    </h3>

                    {/* Notice Body */}
                    <p className="text-xs sm:text-sm text-[var(--clay-muted)] leading-relaxed line-clamp-4">
                      {item.body}
                    </p>
                  </div>

                  {/* Footer Author & Audience Info */}
                  <div className="mt-5 pt-3.5 border-t border-[var(--clay-border)] flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--clay-text)] truncate max-w-[170px]">
                      {item.created_by_name}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--clay-muted)] bg-[var(--clay-pressed)] px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      Audience: {item.audience}
                    </span>
                  </div>
                </ClayCard>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
