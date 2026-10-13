'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Briefcase,
  Plus,
  Trash2,
  Calendar,
  Building2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ClayCard } from '../ui/ClayCard';
import { ClayBadge } from '../ui/ClayBadge';
import { ClayButton } from '../ui/ClayButton';
import { ClayInput } from '../ui/ClayInput';
import {
  getAdminAnnouncements,
  createAdminAnnouncement,
  deleteAdminAnnouncement,
  getAdminPlacements,
  createAdminPlacement,
  deleteAdminPlacement,
} from '@/lib/data/admin';
import { Announcement, PlacementRecord } from '@/lib/data/types';

export function ContentManager() {
  const [activeSubTab, setActiveSubTab] = useState<'announcements' | 'placements'>('announcements');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [placements, setPlacements] = useState<PlacementRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // New Announcement Form State
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnBody, setNewAnnBody] = useState('');
  const [newAnnType, setNewAnnType] = useState('exam');
  const [newAnnAudience, setNewAnnAudience] = useState('All B.Tech CSE Cohorts');

  // New Placement Form State
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [newPlaceCompany, setNewPlaceCompany] = useState('');
  const [newPlaceYear, setNewPlaceYear] = useState(2026);
  const [newPlacePlaced, setNewPlacePlaced] = useState(12);
  const [newPlaceEligible, setNewPlaceEligible] = useState(15);
  const [newPlacePackage, setNewPlacePackage] = useState(14.5);
  const [newPlaceRoles, setNewPlaceRoles] = useState('SDE-1, Cloud Engineer');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [annData, placeData] = await Promise.all([
        getAdminAnnouncements(),
        getAdminPlacements(),
      ]);
      setAnnouncements(annData);
      setPlacements(placeData);
      setLoading(false);
    }
    load();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim()) return;

    const created = await createAdminAnnouncement({
      title: newAnnTitle,
      body: newAnnBody,
      type: newAnnType,
      audience: newAnnAudience,
    });

    setAnnouncements([created, ...announcements]);
    setShowAnnModal(false);
    setNewAnnTitle('');
    setNewAnnBody('');
    setToastMsg('Announcement published successfully.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await deleteAdminAnnouncement(id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    setToastMsg('Announcement removed.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreatePlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceCompany.trim()) return;

    const created = await createAdminPlacement({
      company: newPlaceCompany,
      year: newPlaceYear,
      students_placed: newPlacePlaced,
      total_eligible: newPlaceEligible,
      package_lpa: newPlacePackage,
      roles: newPlaceRoles.split(',').map((r) => r.trim()),
    });

    setPlacements([created, ...placements]);
    setShowPlaceModal(false);
    setNewPlaceCompany('');
    setToastMsg('Placement record added successfully.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDeletePlacement = async (id: string) => {
    await deleteAdminPlacement(id);
    setPlacements((prev) => prev.filter((p) => p.id !== id));
    setToastMsg('Placement record removed.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ClayBadge variant="sun" icon={<Sparkles className="h-3.5 w-3.5" />}>
              Content & Records Governance
            </ClayBadge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Announcements & Placement Drives CRUD
          </h2>
          <p className="text-xs sm:text-sm text-white/95 font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            Create, update, and manage official campus notices and historical recruiter statistics.
          </p>
        </div>

        {/* Tab Selector & Create Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--clay-pressed)] border border-[var(--clay-border)]">
            <button
              onClick={() => setActiveSubTab('announcements')}
              className={`px-3.5 py-1.5 rounded-xl font-heading font-extrabold text-xs transition-all ${
                activeSubTab === 'announcements'
                  ? 'bg-[var(--clay-card)] text-[#FF7A59] shadow-sm'
                  : 'text-[var(--clay-muted)]'
              }`}
            >
              Announcements ({announcements.length})
            </button>
            <button
              onClick={() => setActiveSubTab('placements')}
              className={`px-3.5 py-1.5 rounded-xl font-heading font-extrabold text-xs transition-all ${
                activeSubTab === 'placements'
                  ? 'bg-[var(--clay-card)] text-[#5B6CFF] shadow-sm'
                  : 'text-[var(--clay-muted)]'
              }`}
            >
              Placements ({placements.length})
            </button>
          </div>

          {activeSubTab === 'announcements' ? (
            <ClayButton variant="coral" size="sm" onClick={() => setShowAnnModal(true)}>
              <Plus className="h-4 w-4" />
              <span>Post Notice</span>
            </ClayButton>
          ) : (
            <ClayButton variant="coral" size="sm" onClick={() => setShowPlaceModal(true)}>
              <Plus className="h-4 w-4" />
              <span>Add Drive</span>
            </ClayButton>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Announcements List */}
      {activeSubTab === 'announcements' ? (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <ClayCard key={ann.id} className="p-4 sm:p-5 flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <ClayBadge variant="coral" size="sm">{ann.type.replace('_', ' ').toUpperCase()}</ClayBadge>
                  <span className="font-heading font-extrabold text-base text-[var(--clay-text)]">
                    {ann.title}
                  </span>
                </div>
                <p className="text-xs text-[var(--clay-muted)] line-clamp-2">{ann.body}</p>
                <div className="flex items-center gap-3 text-[11px] text-[var(--clay-muted)] font-semibold pt-1">
                  <span>Audience: <strong>{ann.audience}</strong></span>
                  <span>•</span>
                  <span>Posted: {new Date(ann.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteAnnouncement(ann.id)}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                title="Delete Announcement"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </ClayCard>
          ))}
        </div>
      ) : (
        /* Placements Table */
        <ClayCard className="overflow-hidden p-0 border border-[var(--clay-border)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--clay-pressed)]/80 text-[var(--clay-muted)] font-heading font-extrabold uppercase border-b border-[var(--clay-border)]">
                <tr>
                  <th className="py-3.5 px-4">Recruiting Company</th>
                  <th className="py-3.5 px-4">Year</th>
                  <th className="py-3.5 px-4 text-center">Placed / Eligible</th>
                  <th className="py-3.5 px-4 text-center">Package (LPA)</th>
                  <th className="py-3.5 px-4">Roles Offered</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--clay-border)] font-semibold">
                {placements.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--clay-pressed)]/60">
                    <td className="py-3.5 px-4 font-heading font-extrabold text-sm text-[var(--clay-text)]">
                      {p.company}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">{p.year}</td>
                    <td className="py-3.5 px-4 text-center tabular-nums">
                      <span className="text-emerald-600 font-extrabold">{p.students_placed}</span> / {p.total_eligible}
                    </td>
                    <td className="py-3.5 px-4 text-center font-heading font-extrabold text-[#5B6CFF] tabular-nums">
                      {p.package_lpa} LPA
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-[var(--clay-muted)] truncate max-w-xs">
                      {p.roles?.join(', ') || 'Software Engineer'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeletePlacement(p.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ClayCard>
      )}

      {/* Modal: New Announcement */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAnnModal(false)} />
          <div className="relative w-full max-w-lg bg-[var(--clay-card)] border-2 border-[var(--clay-border)] rounded-[32px] shadow-2xl p-6 sm:p-8 space-y-4 z-10 animate-in zoom-in-95">
            <h3 className="font-heading font-extrabold text-xl text-[var(--clay-text)]">
              Publish New Campus Notice
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5">
              <ClayInput
                label="Notice Title"
                placeholder="e.g. Schedule Change: CS301 Remedial Clinic"
                value={newAnnTitle}
                onChange={(e) => setNewAnnTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-heading font-extrabold text-[var(--clay-text)] block mb-1">Type</label>
                  <select
                    value={newAnnType}
                    onChange={(e) => setNewAnnType(e.target.value)}
                    className="w-full rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] px-3 py-2 text-xs font-bold outline-none"
                  >
                    <option value="exam">Exam Schedule</option>
                    <option value="time_change">Time Change</option>
                    <option value="reschedule">Reschedule</option>
                    <option value="fest">College Fest</option>
                    <option value="extra_class">Extra Class</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>

                <ClayInput
                  label="Target Audience"
                  value={newAnnAudience}
                  onChange={(e) => setNewAnnAudience(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-heading font-extrabold text-[var(--clay-text)] block mb-1">Body Text</label>
                <textarea
                  rows={3}
                  value={newAnnBody}
                  onChange={(e) => setNewAnnBody(e.target.value)}
                  placeholder="Detailed announcement announcement..."
                  className="w-full rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] p-3 text-xs outline-none resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <ClayButton variant="default" size="sm" type="button" onClick={() => setShowAnnModal(false)}>
                  Cancel
                </ClayButton>
                <ClayButton variant="coral" size="sm" type="submit">
                  Publish Notice
                </ClayButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Placement */}
      {showPlaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPlaceModal(false)} />
          <div className="relative w-full max-w-lg bg-[var(--clay-card)] border-2 border-[var(--clay-border)] rounded-[32px] shadow-2xl p-6 sm:p-8 space-y-4 z-10 animate-in zoom-in-95">
            <h3 className="font-heading font-extrabold text-xl text-[var(--clay-text)]">
              Log Recruiter Placement Drive
            </h3>

            <form onSubmit={handleCreatePlacement} className="space-y-3.5">
              <ClayInput
                label="Recruiting Company"
                placeholder="e.g. Google India, Microsoft, Atlassian"
                value={newPlaceCompany}
                onChange={(e) => setNewPlaceCompany(e.target.value)}
                required
              />

              <div className="grid grid-cols-3 gap-3">
                <ClayInput
                  label="Drive Year"
                  type="number"
                  value={newPlaceYear}
                  onChange={(e) => setNewPlaceYear(Number(e.target.value))}
                />
                <ClayInput
                  label="Package (LPA)"
                  type="number"
                  step="0.1"
                  value={newPlacePackage}
                  onChange={(e) => setNewPlacePackage(Number(e.target.value))}
                />
                <ClayInput
                  label="Students Placed"
                  type="number"
                  value={newPlacePlaced}
                  onChange={(e) => setNewPlacePlaced(Number(e.target.value))}
                />
              </div>

              <ClayInput
                label="Roles Offered"
                placeholder="e.g. Software Engineer, Data Analyst"
                value={newPlaceRoles}
                onChange={(e) => setNewPlaceRoles(e.target.value)}
              />

              <div className="flex justify-end gap-2.5 pt-2">
                <ClayButton variant="default" size="sm" type="button" onClick={() => setShowPlaceModal(false)}>
                  Cancel
                </ClayButton>
                <ClayButton variant="coral" size="sm" type="submit">
                  Save Placement Record
                </ClayButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
