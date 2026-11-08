import { LayoutDashboard, LogOut, Users } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminGate from '@/components/admin/AdminGate';
import AdminUsers from '@/components/admin/AdminUsers';
import { navigate } from '@/lib/navigation';

type AdminSection = 'dashboard' | 'users';

const SECTIONS: { id: AdminSection; label: string; icon: typeof Users }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Saved users', icon: Users },
];

export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [section, setSection] = useState<AdminSection>('dashboard');

  if (!password) return <AdminGate onUnlock={setPassword} />;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-lg font-bold tracking-[0.3em] text-slate-900 dark:text-slate-50">VATAR</p>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Admin console
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => {
                setPassword(null);
                navigate('/');
              }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <LogOut size={16} />
              Exit
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 md:flex-row">
        <nav className="flex gap-2 overflow-x-auto md:w-56 md:shrink-0 md:flex-col">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const active = section === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40 ${
                  active
                    ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-900/20'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </nav>

        <main className="min-w-0 flex-1 animate-fade-in">
          {section === 'dashboard' ? (
            <AdminDashboard password={password} />
          ) : (
            <AdminUsers password={password} />
          )}
        </main>
      </div>
    </div>
  );
}
