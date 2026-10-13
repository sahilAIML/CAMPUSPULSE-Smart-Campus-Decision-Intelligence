'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Users,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { ClayCard } from '../ui/ClayCard';
import { ClayBadge } from '../ui/ClayBadge';
import { ClayButton } from '../ui/ClayButton';
import {
  ScoreWeightsConfig,
  DEFAULT_SCORE_WEIGHTS,
} from '@/lib/analytics/types';
import {
  getActiveScoreWeights,
  saveScoreWeights,
  previewWeightTuning,
} from '@/lib/data/admin';

export function WeightTuner() {
  const [weights, setWeights] = useState<ScoreWeightsConfig>({ ...DEFAULT_SCORE_WEIGHTS });
  const [preview, setPreview] = useState<{
    baseline_avg: number;
    tuned_avg: number;
    delta_avg: number;
    baseline_at_risk_count: number;
    tuned_at_risk_count: number;
    delta_at_risk: number;
    affected_students: {
      reg_no: string;
      name: string;
      old_score: number;
      new_score: number;
      risk_direction: 'elevated' | 'reduced' | 'neutral';
    }[];
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load active weights
  useEffect(() => {
    async function init() {
      const active = await getActiveScoreWeights();
      setWeights(active);
    }
    init();
  }, []);

  // Live preview recompute when weights change
  useEffect(() => {
    async function updatePreview() {
      const prev = await previewWeightTuning(weights);
      setPreview(prev);
    }
    updatePreview();
  }, [weights]);

  // Handle slider update
  const handleSliderChange = (field: keyof ScoreWeightsConfig, val: number) => {
    setWeights((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const totalSum =
    weights.academic_weight +
    weights.attendance_weight +
    weights.lms_weight +
    weights.engagement_weight +
    weights.placement_weight +
    weights.skills_weight +
    weights.feedback_weight;

  const isBalanced = Math.abs(totalSum - 100) < 0.1;

  const handleReset = () => {
    setWeights({ ...DEFAULT_SCORE_WEIGHTS });
  };

  const handleSave = async () => {
    if (!isBalanced) return;
    setSaving(true);
    await saveScoreWeights(weights);
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const indicators = [
    { key: 'academic_weight', label: 'Academic Performance (CGPA, CIE Assessments, Backlogs)', color: '#FF7A59', max: 50 },
    { key: 'attendance_weight', label: 'RFID Attendance Tracking (Every 10% = 1pt, Condonation Cutoff)', color: '#2EC4B6', max: 40 },
    { key: 'placement_weight', label: 'Placement Readiness (Coding, Aptitude, Mock Interviews)', color: '#5B6CFF', max: 30 },
    { key: 'skills_weight', label: 'Holistic Skills (Programming, Leadership, Communication)', color: '#FFC857', max: 20 },
    { key: 'lms_weight', label: 'LMS Activity (Login Frequency & Assignment Submissions)', color: '#8B5CF6', max: 20 },
    { key: 'engagement_weight', label: 'Campus Engagement (Clubs, Hackathons, Certifications)', color: '#EC4899', max: 20 },
    { key: 'feedback_weight', label: 'Faculty & Student Feedback Rating', color: '#10B981', max: 15 },
  ] as const;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ClayBadge variant="coral" icon={<Sliders className="h-3.5 w-3.5" />}>
              Analytics Engine Configuration
            </ClayBadge>
            <ClayBadge variant={isBalanced ? 'teal' : 'risk-critical'} size="sm">
              Sum: {Math.round(totalSum)}% / 100%
            </ClayBadge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Score Weight Tuning & Live Recompute
          </h2>
          <p className="text-xs sm:text-sm text-white/95 font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            Adjust multi-source telemetry weights. Live algorithms simulate campus-wide impact across all 120 students in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ClayButton variant="default" size="sm" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5 text-[var(--clay-muted)]" />
            <span>Reset Baseline</span>
          </ClayButton>
          <ClayButton
            variant="coral"
            size="sm"
            onClick={handleSave}
            disabled={!isBalanced || saving}
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? 'Applying...' : 'Save & Apply Campus-Wide'}</span>
          </ClayButton>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>
            New indicator weights successfully applied! Institutional database updated and all student success scores recomputed.
          </span>
        </div>
      )}

      {!isBalanced && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>
            Total weights must sum to exactly 100%. Current sum: {Math.round(totalSum)}% (Difference: {100 - Math.round(totalSum)}%).
          </span>
        </div>
      )}

      {/* Main Grid: Sliders on Left, Live Recompute Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Indicator Sliders (7 Columns) */}
        <ClayCard className="lg:col-span-7 p-6 space-y-5">
          <h3 className="font-heading font-extrabold text-base text-[var(--clay-text)] mb-2 flex items-center justify-between">
            <span>Configurable Indicator Weights</span>
            <span className="text-xs font-bold text-[var(--clay-muted)]">Total = 100 pts</span>
          </h3>

          <div className="space-y-4">
            {indicators.map((ind) => {
              const currentVal = weights[ind.key as keyof ScoreWeightsConfig];

              return (
                <div key={ind.key} className="space-y-1.5 p-3 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)]">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[var(--clay-text)]">{ind.label}</span>
                    <span className="tabular-nums font-heading font-extrabold text-sm" style={{ color: ind.color }}>
                      {currentVal} pts ({currentVal}%)
                    </span>
                  </div>

                  {/* Slider Control */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={ind.max}
                      step={1}
                      value={currentVal}
                      onChange={(e) => handleSliderChange(ind.key as keyof ScoreWeightsConfig, Number(e.target.value))}
                      className="w-full accent-[#FF7A59] h-2 bg-[var(--clay-pressed)] rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min={0}
                      max={ind.max}
                      value={currentVal}
                      onChange={(e) => handleSliderChange(ind.key as keyof ScoreWeightsConfig, Number(e.target.value))}
                      className="w-14 text-center rounded-xl bg-[var(--clay-pressed)] border border-[var(--clay-border)] py-1 text-xs font-bold outline-none tabular-nums"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ClayCard>

        {/* Right Column: Live Recompute Simulation Preview (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <ClayCard className="p-6 space-y-5 bg-gradient-to-br from-[var(--clay-card)] to-[var(--clay-pressed)]/50 border-2 border-[var(--clay-border)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--clay-border)]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#5B6CFF]" />
                <h3 className="font-heading font-extrabold text-base text-[var(--clay-text)]">
                  Live Cohort Recompute Preview
                </h3>
              </div>
              <ClayBadge variant="indigo" size="sm">Real-Time Twin</ClayBadge>
            </div>

            {preview ? (
              <div className="space-y-4">
                {/* Cohort Delta Summary */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)]">
                    <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">Average Score</span>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                      <span className="font-heading font-black text-xl tabular-nums text-[var(--clay-text)]">
                        {preview.tuned_avg}
                      </span>
                      <span
                        className={`text-xs font-extrabold ${
                          preview.delta_avg >= 0 ? 'text-emerald-600' : 'text-rose-500'
                        }`}
                      >
                        ({preview.delta_avg >= 0 ? '+' : ''}{preview.delta_avg})
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)]">
                    <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase block">At-Risk Count</span>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                      <span className="font-heading font-black text-xl tabular-nums text-[var(--clay-text)]">
                        {preview.tuned_at_risk_count}
                      </span>
                      <span
                        className={`text-xs font-extrabold ${
                          preview.delta_at_risk <= 0 ? 'text-emerald-600' : 'text-rose-500'
                        }`}
                      >
                        ({preview.delta_at_risk <= 0 ? '' : '+'}{preview.delta_at_risk})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Student Sensitivity Breakdown */}
                <div className="space-y-2">
                  <span className="text-xs font-heading font-extrabold text-[var(--clay-muted)] uppercase tracking-wider block">
                    Key Persona Sensitivity Impact
                  </span>

                  <div className="space-y-2">
                    {preview.affected_students.map((stu) => (
                      <div
                        key={stu.reg_no}
                        className="p-3 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)] text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-heading font-extrabold text-[var(--clay-text)] block">
                            {stu.name}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--clay-muted)]">{stu.reg_no}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="tabular-nums font-semibold text-[var(--clay-muted)]">{stu.old_score}</span>
                          <ArrowRight className="h-3 w-3 text-[var(--clay-muted)]" />
                          <span className="tabular-nums font-black text-[#5B6CFF]">{stu.new_score}</span>
                          {stu.risk_direction === 'elevated' && (
                            <ClayBadge variant="risk-critical" size="sm">Elevated</ClayBadge>
                          )}
                          {stu.risk_direction === 'reduced' && (
                            <ClayBadge variant="risk-low" size="sm">De-risked</ClayBadge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs font-bold text-[var(--clay-muted)]">
                Computing mathematical preview...
              </div>
            )}
          </ClayCard>
        </div>
      </div>
    </div>
  );
}
