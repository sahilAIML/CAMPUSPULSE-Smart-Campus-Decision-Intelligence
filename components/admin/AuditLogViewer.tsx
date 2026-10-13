'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Clock,
  User,
  Activity,
  Filter,
} from 'lucide-react';
import { ClayCard } from '../ui/ClayCard';
import { ClayBadge } from '../ui/ClayBadge';
import { ClayInput } from '../ui/ClayInput';
import { AuditLogEntry, getAuditLogs } from '@/lib/data/admin';

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical' | 'success'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = logs.filter((log) => {
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
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
            <ClayBadge variant="indigo" icon={<Activity className="h-3.5 w-3.5" />}>
              Compliance & Security Ledger
            </ClayBadge>
            <ClayBadge variant="teal" size="sm">Immutable Activity Trail</ClayBadge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Institutional Audit Trail
          </h2>
          <p className="text-xs sm:text-sm text-white/95 font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            Chronological forensic tracking of weight recalibrations, exam publications, CSV imports, and intervention dispatches.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(['all', 'info', 'warning', 'critical', 'success'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl font-heading font-extrabold text-xs capitalize transition-all ${
                severityFilter === s
                  ? 'bg-[#5B6CFF] text-white shadow-md'
                  : 'bg-[var(--clay-card)] text-[var(--clay-text)] shadow-[var(--shadow-clay-btn)]'
              }`}
            >
              {s === 'all' ? `All Events (${logs.length})` : s}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <ClayInput
            placeholder="Search audit trail..."
            icon={<Search className="h-3.5 w-3.5" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Logs Table */}
      <ClayCard className="overflow-hidden p-0 border border-[var(--clay-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Audit Log Table">
            <thead className="bg-[var(--clay-pressed)]/80 text-[var(--clay-muted)] font-heading font-extrabold uppercase tracking-wider border-b border-[var(--clay-border)]">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Event Action</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Target Resource</th>
                <th className="py-3.5 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--clay-border)] font-medium">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--clay-pressed)]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--clay-muted)] whitespace-nowrap tabular-nums">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4">
                    <ClayBadge
                      variant={
                        log.severity === 'critical'
                          ? 'risk-critical'
                          : log.severity === 'warning'
                          ? 'risk-medium'
                          : log.severity === 'success'
                          ? 'risk-low'
                          : 'default'
                      }
                      size="sm"
                    >
                      {log.action}
                    </ClayBadge>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-[var(--clay-text)] whitespace-nowrap">
                    {log.actor}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-[#5B6CFF] whitespace-nowrap">
                    {log.target}
                  </td>

                  <td className="py-3.5 px-4 text-xs text-[var(--clay-muted)] max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ClayCard>
    </div>
  );
}
