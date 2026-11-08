import type { ReactNode } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-100 via-sky-50 to-slate-100 text-slate-900 transition-colors duration-300 dark:from-[#0b2233] dark:via-[#102c40] dark:to-[#081923] dark:text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-300/40 blur-3xl dark:bg-sky-500/10"
      />
      <div className="absolute right-6 top-6 z-10">
        <ThemeToggle />
      </div>
      <main className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-5 py-24 sm:px-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
