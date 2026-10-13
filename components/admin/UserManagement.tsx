'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Plus,
} from 'lucide-react';
import { ClayCard } from '../ui/ClayCard';
import { ClayBadge } from '../ui/ClayBadge';
import { ClayInput } from '../ui/ClayInput';
import { ClayButton } from '../ui/ClayButton';
import { AddEntityModal } from './AddEntityModal';
import {
  AdminUser,
  getAdminUsers,
  updateUserRole,
  toggleUserStatus,
} from '@/lib/data/admin';

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'faculty' | 'student'>('all');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'student' | 'faculty'>('student');

  const load = async () => {
    setLoading(true);
    const data = await getAdminUsers();
    setUsers([...data]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const handleUpdate = () => load();
    window.addEventListener('campuspulse-data-updated', handleUpdate);
    return () => window.removeEventListener('campuspulse-data-updated', handleUpdate);
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'faculty' | 'student') => {
    const updated = await updateUserRole(userId, newRole);
    if (updated) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setActionMessage(`Role updated to ${newRole.toUpperCase()} for ${updated.full_name}.`);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    const updated = await toggleUserStatus(userId);
    if (updated) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: updated.status } : u)));
      setActionMessage(`Account status changed to ${updated.status.toUpperCase()} for ${updated.full_name}.`);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.reg_no.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ClayBadge variant="indigo" icon={<Users className="h-3.5 w-3.5" />}>
              Access Governance
            </ClayBadge>
            <ClayBadge variant="teal" size="sm">
              Role-Based Access Control (RBAC)
            </ClayBadge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            User Management & Authorization
          </h2>
          <p className="text-xs sm:text-sm text-white/95 font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            Manage institutional identities, promote or reassign administrative privileges, and control platform access.
          </p>
        </div>

        {/* Action Buttons to Add Student or Faculty */}
        <div className="flex flex-wrap items-center gap-2.5">
          <ClayButton
            variant="coral"
            size="sm"
            onClick={() => {
              setModalTab('student');
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 shadow-[var(--shadow-clay-coral)]"
          >
            <GraduationCap className="h-4 w-4" />
            <span>+ Add Student</span>
          </ClayButton>

          <ClayButton
            variant="teal"
            size="sm"
            onClick={() => {
              setModalTab('faculty');
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 shadow-[var(--shadow-clay-teal)]"
          >
            <Users className="h-4 w-4" />
            <span>+ Add Faculty</span>
          </ClayButton>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(['all', 'admin', 'faculty', 'student'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-1.5 rounded-xl font-heading font-extrabold text-xs capitalize transition-all ${
                roleFilter === r
                  ? 'bg-[#5B6CFF] text-white shadow-md'
                  : 'bg-[var(--clay-card)] text-[var(--clay-text)] shadow-[var(--shadow-clay-btn)]'
              }`}
            >
              {r === 'all' ? `All (${users.length})` : r}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <ClayInput
            placeholder="Search users..."
            icon={<Search className="h-3.5 w-3.5" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <ClayCard className="overflow-hidden p-0 border border-[var(--clay-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Users Table">
            <thead className="bg-[var(--clay-pressed)]/80 text-[var(--clay-muted)] font-heading font-extrabold uppercase tracking-wider border-b border-[var(--clay-border)]">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Identifier</th>
                <th className="py-3.5 px-4">Current Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--clay-border)] font-medium">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--clay-pressed)]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-heading font-extrabold text-sm text-[var(--clay-text)] block">
                        {user.full_name}
                      </span>
                      <span className="text-[11px] text-[var(--clay-muted)] font-semibold">{user.email}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-[var(--clay-text)] tabular-nums">
                    {user.reg_no}
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                      className="rounded-xl bg-[var(--clay-card)] border border-[var(--clay-border)] text-[var(--clay-text)] shadow-sm px-2.5 py-1 text-xs font-bold outline-none capitalize cursor-pointer"
                    >
                      <option value="admin">Admin</option>
                      <option value="faculty">Faculty</option>
                      <option value="student">Student</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4">
                    <ClayBadge
                      variant={user.status === 'active' ? 'risk-low' : 'risk-critical'}
                      size="sm"
                    >
                      {user.status.toUpperCase()}
                    </ClayBadge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`px-3 py-1.5 rounded-xl border font-heading font-bold text-xs transition-all ${
                        user.status === 'active'
                          ? 'border-rose-500/30 text-rose-600 hover:bg-rose-500/10'
                          : 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10'
                      }`}
                    >
                      {user.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ClayCard>

      {/* Add Student / Faculty Modal */}
      <AddEntityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={modalTab}
        onSuccess={load}
      />
    </div>
  );
}
