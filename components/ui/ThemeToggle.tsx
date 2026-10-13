'use client';

import React from 'react';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
  showLabels?: boolean;
}

// Since the portal is locked to Clean White Theme only, theme toggles are removed.
export function ThemeToggle({
  className: _className = '',
  size: _size = 'md',
  showLabels: _showLabels = true,
}: ThemeToggleProps) {
  return null;
}
