'use client';

import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  setTheme: (mode: 'light' | 'dark') => void;
}

export default function ThemeToggle({ theme, setTheme }: ThemeToggleProps) {
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition hover:border-slate-300 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
