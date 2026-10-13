'use client';

import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'white';

const STORAGE_KEY = 'campuspulse_theme';
const THEME_EVENT = 'campuspulse-theme-change';

export function getSavedTheme(): ThemeMode {
  return 'white';
}

export function applyTheme(_mode?: ThemeMode) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;

  // Strictly White Theme only: remove dark and theme-bw
  root.classList.remove('dark', 'theme-bw');
  root.classList.add('theme-white');

  try {
    localStorage.setItem(STORAGE_KEY, 'white');
  } catch {}

  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: 'white' }));
}

export function useTheme() {
  const [theme] = useState<ThemeMode>('white');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    applyTheme('white');
  }, []);

  const setTheme = useCallback((_newTheme: ThemeMode) => {
    applyTheme('white');
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme('white');
  }, []);

  return {
    theme: 'white' as ThemeMode,
    setTheme,
    toggleTheme,
    mounted,
  };
}
