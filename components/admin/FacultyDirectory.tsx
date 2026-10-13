'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  ExternalLink,
  BookOpen,
  Mail,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  Download,
  LayoutGrid,
  Table as TableIcon,
  X,
  Building2,
  CheckCircle2,
  Filter,
  Plus,
} from 'lucide-react';
import { ClayCard } from '../ui/ClayCard';
import { ClayBadge } from '../ui/ClayBadge';
import { ClayButton } from '../ui/ClayButton';
import { ClayInput } from '../ui/ClayInput';
import { FacultyProfile, getAllFacultyProfiles } from '@/lib/data/admin';
import { AddEntityModal } from './AddEntityModal';
import vignanFacultyData from '@/lib/data/vignan_faculty.json';

export function FacultyDirectory() {
  const [search, setSearch] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState<string>('all');
  const [selectedInterestTag, setSelectedInterestTag] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyProfile | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [facultyList, setFacultyList] = useState<FacultyProfile[]>(vignanFacultyData as FacultyProfile[]);

  const loadFaculty = async () => {
    const all = await getAllFacultyProfiles();
    setFacultyList(all);
  };

  useEffect(() => {
    loadFaculty();
    const handleUpdate = () => loadFaculty();
    window.addEventListener('campuspulse-data-updated', handleUpdate);
    return () => window.removeEventListener('campuspulse-data-updated', handleUpdate);
  }, []);

  // Designation breakdown
  const stats = useMemo(() => {
    let professors = 0;
    let associateProfessors = 0;
    let assistantProfessors = 0;

    facultyList.forEach((f) => {
      const d = f.designation.toLowerCase();
      if (d === 'professor') professors++;
      else if (d.includes('associate')) associateProfessors++;
      else if (d.includes('assistant')) assistantProfessors++;
    });

    return {
      total: facultyList.length,
      professors,
      associateProfessors,
      assistantProfessors,
    };
  }, [facultyList]);

  // Filtered faculty
  const filteredFaculty = useMemo(() => {
    return facultyList.filter((f) => {
      // Designation filter
      if (selectedDesignation !== 'all') {
        if (selectedDesignation === 'professor' && f.designation.toLowerCase() !== 'professor') return false;
        if (selectedDesignation === 'associate' && !f.designation.toLowerCase().includes('associate')) return false;
        if (selectedDesignation === 'assistant' && !f.designation.toLowerCase().includes('assistant')) return false;
      }

      // Quick interest tag filter
      if (selectedInterestTag) {
        if (!f.research_interests.toLowerCase().includes(selectedInterestTag.toLowerCase())) {
          return false;
        }
      }

      // Search query (matches ID, name, designation, research interests)
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesId = f.faculty_id.toLowerCase().includes(q) || f.reg_no.toLowerCase().includes(q);
        const matchesName = f.full_name.toLowerCase().includes(q);
        const matchesDesignation = f.designation.toLowerCase().includes(q);
        const matchesResearch = f.research_interests.toLowerCase().includes(q);
        const matchesEmail = f.email.toLowerCase().includes(q);
        return matchesId || matchesName || matchesDesignation || matchesResearch || matchesEmail;
      }

      return true;
    });
  }, [facultyList, selectedDesignation, selectedInterestTag, search]);

  const handleDownloadCSV = () => {
    window.open('/vignan_cse_faculty.csv', '_blank');
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Top Header Banner & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <ClayBadge variant="indigo" icon={<GraduationCap className="h-3.5 w-3.5" />}>
              Vignan University • CSE Faculty Roster
            </ClayBadge>
            <ClayBadge variant="teal" size="sm">
              123 Official Academic Profiles
            </ClayBadge>
            <ClayBadge variant="coral" size="sm">
              Department of Computer Science & Engineering
            </ClayBadge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Faculty Directory & Academic Dossiers
          </h2>
          <p className="text-xs sm:text-sm text-white/95 font-medium mt-1 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            Browse complete faculty records from the official Vignan CSE dataset. Inspect designations, research specializations, official institutional profile links, and workloads.
          </p>
        </div>

        {/* View Mode & CSV Download */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center p-1 rounded-2xl bg-[var(--clay-pressed)] border border-[var(--clay-border)]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-[var(--clay-card)] text-[#FF7A59] shadow-sm'
                  : 'text-[var(--clay-muted)] hover:text-[var(--clay-text)]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'table'
                  ? 'bg-[var(--clay-card)] text-[#FF7A59] shadow-sm'
                  : 'text-[var(--clay-muted)] hover:text-[var(--clay-text)]'
              }`}
              title="Table View"
            >
              <TableIcon className="h-4 w-4" />
            </button>
          </div>

          <a
            href="/vignan_cse_faculty.csv"
            download="vignan_cse_faculty.csv"
            className="px-3.5 py-2 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-btn)] text-xs font-heading font-extrabold text-[var(--clay-text)] hover:text-[#FF7A59] flex items-center gap-1.5 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </a>

          <ClayButton
            variant="coral"
            size="sm"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 shadow-[var(--shadow-clay-coral)]"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Faculty</span>
          </ClayButton>
        </div>
      </div>

      {/* 2. Statistical Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ClayCard className="p-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-[#5B6CFF]/15 text-[#5B6CFF] flex items-center justify-center font-bold shadow-[var(--shadow-clay-badge)]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Total CSE Faculty</span>
            <span className="font-heading font-black text-xl text-[var(--clay-text)] tabular-nums">
              {stats.total}
            </span>
          </div>
        </ClayCard>

        <ClayCard className="p-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-[#FF7A59]/15 text-[#FF7A59] flex items-center justify-center font-bold shadow-[var(--shadow-clay-badge)]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Professors</span>
            <span className="font-heading font-black text-xl text-[#FF7A59] tabular-nums">
              {stats.professors}
            </span>
          </div>
        </ClayCard>

        <ClayCard className="p-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-[#2EC4B6]/15 text-[#2EC4B6] flex items-center justify-center font-bold shadow-[var(--shadow-clay-badge)]">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Associate Profs</span>
            <span className="font-heading font-black text-xl text-[#2EC4B6] tabular-nums">
              {stats.associateProfessors}
            </span>
          </div>
        </ClayCard>

        <ClayCard className="p-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-[#FFA116]/15 text-[#FFA116] flex items-center justify-center font-bold shadow-[var(--shadow-clay-badge)]">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Assistant Profs</span>
            <span className="font-heading font-black text-xl text-[#FFA116] tabular-nums">
              {stats.assistantProfessors}
            </span>
          </div>
        </ClayCard>
      </div>

      {/* 3. Controls Bar: Search & Filter Pills */}
      <ClayCard className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full flex-1">
            <ClayInput
              placeholder="Search by Faculty ID (e.g. CSE_001), Name, or Research Domain..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Designation Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--clay-pressed)] border border-[var(--clay-border)] overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: 'All (123)' },
              { id: 'professor', label: `Professors (${stats.professors})` },
              { id: 'associate', label: `Associate (${stats.associateProfessors})` },
              { id: 'assistant', label: `Assistant (${stats.assistantProfessors})` },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDesignation(d.id)}
                className={`px-3 py-1.5 rounded-xl font-heading font-bold text-xs whitespace-nowrap transition-all ${
                  selectedDesignation === d.id
                    ? 'bg-[var(--clay-card)] text-[#FF7A59] shadow-sm'
                    : 'text-[var(--clay-muted)] hover:text-[var(--clay-text)]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Topic Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[var(--clay-border)] text-xs">
          <span className="font-bold text-[var(--clay-muted)] flex items-center gap-1">
            <Filter className="h-3 w-3 text-[#FF7A59]" />
            <span>Domain Topics:</span>
          </span>
          {[
            'Machine Learning',
            'Deep Learning',
            'Image Processing',
            'Cloud Computing',
            'Cyber Security',
            'Networks',
            'Artificial Intelligence',
          ].map((topic) => {
            const isSelected = selectedInterestTag === topic;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedInterestTag(isSelected ? '' : topic)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#FF7A59] text-white shadow-[var(--shadow-clay-coral)]'
                    : 'bg-[var(--clay-pressed)] hover:bg-[#FF7A59]/10 text-[var(--clay-text)] hover:text-[#FF7A59]'
                }`}
              >
                {topic} {isSelected && '✕'}
              </button>
            );
          })}
          {(search || selectedDesignation !== 'all' || selectedInterestTag) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedDesignation('all');
                setSelectedInterestTag('');
              }}
              className="px-2 py-1 text-xs text-rose-500 hover:underline font-bold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </ClayCard>

      {/* 4. Active Results Count Indicator */}
      <div className="flex items-center justify-between text-xs font-bold text-[var(--clay-muted)] px-1">
        <span>
          Showing <strong className="text-[var(--clay-text)]">{filteredFaculty.length}</strong> of {facultyList.length} faculty members
        </span>
        {search && <span>Filtered by &quot;{search}&quot;</span>}
      </div>

      {/* 5. View Mode Renders */}
      {viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFaculty.map((fac) => {
            const isProf = fac.designation.toLowerCase() === 'professor';
            const isAssoc = fac.designation.toLowerCase().includes('associate');
            const interests = fac.research_interests ? fac.research_interests.split(';').map((s) => s.trim()).filter(Boolean) : [];

            return (
              <ClayCard
                key={fac.faculty_id}
                className="p-5 flex flex-col justify-between space-y-4 hover:border-[#FF7A59]/40 hover:shadow-[var(--shadow-clay-card-hover)] transition-all group"
              >
                <div>
                  {/* Top Bar: Photo, Name, Badge */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-[var(--clay-pressed)] border border-[var(--clay-border)] flex-shrink-0 shadow-[var(--shadow-clay-badge)] group-hover:scale-105 transition-transform">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={fac.photo_url || fac.avatar_url}
                        alt={fac.full_name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback to initial avatar
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="h-full w-full flex items-center justify-center font-heading font-black text-lg text-white bg-gradient-to-br from-[#FF7A59] to-[#E05F3F]">
                        {fac.full_name.charAt(0)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded-lg bg-[var(--clay-pressed)] text-[#FF7A59] border border-[var(--clay-border)]">
                          {fac.faculty_id}
                        </span>
                        <ClayBadge
                          variant={isProf ? 'coral' : isAssoc ? 'teal' : 'indigo'}
                          size="sm"
                        >
                          {fac.designation}
                        </ClayBadge>
                      </div>

                      <h4 className="font-heading font-extrabold text-base text-[var(--clay-text)] leading-snug line-clamp-2">
                        {fac.full_name}
                      </h4>
                      <span className="text-[11px] font-semibold text-[var(--clay-muted)] block">
                        {fac.department}
                      </span>
                    </div>
                  </div>

                  {/* Research Interests Tags */}
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[10px] font-heading font-extrabold text-[var(--clay-muted)] uppercase tracking-wider block">
                      Research Interests:
                    </span>
                    {interests.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {interests.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--clay-pressed)] text-[var(--clay-text)] font-semibold border border-[var(--clay-border)] line-clamp-1"
                          >
                            {tag}
                          </span>
                        ))}
                        {interests.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md text-[var(--clay-muted)] font-bold">
                            +{interests.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-[var(--clay-muted)] italic">
                        General Computer Science & Engineering
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-[var(--clay-border)] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFaculty(fac)}
                    className="text-xs font-heading font-extrabold text-[#FF7A59] hover:underline flex items-center gap-1"
                  >
                    <span>View Dossier</span>
                    <Sparkles className="h-3 w-3" />
                  </button>

                  <a
                    href={fac.profile_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl bg-[var(--clay-card)] border border-[var(--clay-border)] text-[var(--clay-muted)] hover:text-[#FF7A59] hover:border-[#FF7A59] transition-all"
                    title="Open official Vignan University profile page"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </ClayCard>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <ClayCard className="p-0 overflow-hidden border-2 border-[var(--clay-border)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[var(--clay-pressed)]/70 border-b border-[var(--clay-border)] text-[var(--clay-muted)] font-heading font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Faculty ID</th>
                  <th className="py-3.5 px-4">Photo</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Research Specializations</th>
                  <th className="py-3.5 px-4 text-center">Official Portal</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--clay-border)]">
                {filteredFaculty.map((fac) => (
                  <tr
                    key={fac.faculty_id}
                    className="hover:bg-[var(--clay-pressed)]/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#FF7A59]">
                      {fac.faculty_id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-10 w-10 rounded-xl overflow-hidden bg-[var(--clay-pressed)] border border-[var(--clay-border)] flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={fac.photo_url || fac.avatar_url}
                          alt={fac.full_name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-heading font-extrabold text-[var(--clay-text)]">
                      {fac.full_name}
                    </td>
                    <td className="py-3 px-4">
                      <ClayBadge
                        variant={
                          fac.designation.toLowerCase() === 'professor'
                            ? 'coral'
                            : fac.designation.toLowerCase().includes('associate')
                            ? 'teal'
                            : 'indigo'
                        }
                        size="sm"
                      >
                        {fac.designation}
                      </ClayBadge>
                    </td>
                    <td className="py-3 px-4 text-[var(--clay-muted)] font-semibold">
                      {fac.department}
                    </td>
                    <td className="py-3 px-4 text-[var(--clay-text)] max-w-xs truncate" title={fac.research_interests}>
                      {fac.research_interests || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <a
                        href={fac.profile_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#5B6CFF] hover:underline font-bold"
                      >
                        <span>Vignan Page</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ClayButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFaculty(fac)}
                      >
                        Dossier
                      </ClayButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ClayCard>
      )}

      {/* 6. Detailed Faculty Dossier Modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <ClayCard className="max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border-2 border-[var(--clay-border)] shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedFaculty(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-[var(--clay-muted)] hover:text-[var(--clay-text)] hover:bg-[var(--clay-pressed)] transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Dossier Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-5 border-b border-[var(--clay-border)]">
              <div className="h-24 w-24 rounded-3xl overflow-hidden bg-[var(--clay-pressed)] border-2 border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)] flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedFaculty.photo_url || selectedFaculty.avatar_url}
                  alt={selectedFaculty.full_name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#FF7A59]/15 text-[#FF7A59] border border-[#FF7A59]/30">
                    {selectedFaculty.faculty_id}
                  </span>
                  <ClayBadge variant="coral" size="sm">
                    {selectedFaculty.designation}
                  </ClayBadge>
                  <ClayBadge variant="teal" size="sm">
                    Official Dataset Verified
                  </ClayBadge>
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-[var(--clay-text)]">
                  {selectedFaculty.full_name}
                </h3>
                <span className="text-xs font-semibold text-[var(--clay-muted)] block mt-0.5">
                  {selectedFaculty.department} • Vignan University
                </span>
              </div>
            </div>

            {/* Research Specializations Section */}
            <div className="space-y-2 p-4 rounded-2xl bg-[var(--clay-pressed)]/50 border border-[var(--clay-border)]">
              <span className="text-xs font-heading font-extrabold text-[#5B6CFF] uppercase tracking-wider block">
                Research Interests & Specializations
              </span>
              <p className="text-xs sm:text-sm text-[var(--clay-text)] font-semibold leading-relaxed">
                {selectedFaculty.research_interests || 'Computer Science Engineering research and applications.'}
              </p>
            </div>

            {/* Telemetry Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-sm">
                <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Assigned Sections</span>
                <span className="font-heading font-extrabold text-sm text-[var(--clay-text)] block mt-1">
                  {selectedFaculty.assigned_sections.join(', ')}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-sm">
                <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Lecture Attendance</span>
                <span className="font-heading font-black text-xl text-emerald-600 tabular-nums">
                  {selectedFaculty.attendance_pct}%
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-sm">
                <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Teaching Workload</span>
                <span className="font-heading font-black text-xl text-[#5B6CFF] tabular-nums">
                  {selectedFaculty.workload_hours_per_week} <span className="text-xs text-[var(--clay-muted)]">hrs/wk</span>
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-sm">
                <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Institutional Block</span>
                <span className="font-heading font-extrabold text-xs text-[#FF7A59] block mt-1 truncate">
                  {selectedFaculty.office_location.split(',')[0]}
                </span>
              </div>
            </div>

            {/* Contact & Cabin Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#FF7A59] flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Official Email</span>
                  <span className="font-mono font-bold text-[var(--clay-text)] truncate block">{selectedFaculty.email}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-[#5B6CFF] flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Office Hours</span>
                  <span className="font-bold text-[var(--clay-text)] block">{selectedFaculty.cabin_hours}</span>
                </div>
              </div>
            </div>

            {/* Courses Taught */}
            <div className="space-y-2">
              <span className="text-xs font-heading font-extrabold text-[var(--clay-muted)] uppercase tracking-wider block">
                Courses Taught / Academic Allocations
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedFaculty.courses_taught.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[var(--clay-pressed)]/50 border border-[var(--clay-border)] text-xs font-bold text-[var(--clay-text)] flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4 text-[#5B6CFF] flex-shrink-0" />
                    <span className="truncate">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--clay-border)]">
              <a
                href={selectedFaculty.profile_url}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#FF7A59] text-white text-xs font-heading font-extrabold shadow-[var(--shadow-clay-coral)] flex items-center justify-center gap-2 hover:opacity-95 transition-all"
              >
                <span>View Official Vignan Profile</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <ClayButton variant="ghost" size="md" onClick={() => setSelectedFaculty(null)}>
                Close Dossier
              </ClayButton>
            </div>
          </ClayCard>
        </div>
      )}

      {/* Add Faculty Member Modal */}
      <AddEntityModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        initialTab="faculty"
        onSuccess={loadFaculty}
      />
    </div>
  );
}
