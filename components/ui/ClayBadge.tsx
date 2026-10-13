'use client';

import React from 'react';

interface ClayBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'coral' | 'teal' | 'sun' | 'indigo' | 'risk-low' | 'risk-medium' | 'risk-high' | 'risk-critical';
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export function ClayBadge({
  children,
  variant = 'default',
  icon,
  className = '',
  size = 'md',
}: ClayBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs gap-1.5' : 'px-3.5 py-1.5 text-xs gap-2';

  const variantStyles = {
    default: 'bg-white/95 text-slate-800 border-white/80 shadow-sm',
    coral: 'bg-white/95 text-[#E05F3F] border-[#FF7A59]/40 font-bold shadow-sm',
    teal: 'bg-white/95 text-[#0E7490] border-[#2EC4B6]/40 font-bold shadow-sm',
    sun: 'bg-white/95 text-[#B45309] border-[#FFC857]/50 font-bold shadow-sm',
    indigo: 'bg-white/95 text-[#3730A3] border-[#5B6CFF]/40 font-bold shadow-sm',
    'risk-low': 'bg-white/95 text-emerald-700 border-emerald-400/50 font-bold shadow-sm',
    'risk-medium': 'bg-white/95 text-amber-700 border-amber-400/50 font-bold shadow-sm',
    'risk-high': 'bg-white/95 text-orange-700 border-orange-400/50 font-bold shadow-sm',
    'risk-critical': 'bg-white/95 text-rose-700 border-rose-400/50 font-extrabold shadow-sm',
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-[var(--shadow-clay-badge)] font-heading font-semibold select-none ${sizeClasses} ${variantStyles} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
