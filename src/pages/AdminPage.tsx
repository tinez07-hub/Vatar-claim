import { ArrowLeft, LayoutGrid, RefreshCw, Unlock, Users } from 'lucide-react';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import BrandHeader from '@/components/BrandHeader';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminGate from '@/components/admin/AdminGate';
import AdminUsers from '@/components/admin/AdminUsers';
import { navigate } from '@/lib/navigation';
import { cardClass } from '@/lib/styles';

type AdminSection = 'dashboard' | 'users';

const SECTIONS: { id: AdminSection; label: string; icon: typeof Users }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'users', label: 'User details', icon: Users },
];

const iconButtonClass =
  'flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100';

export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  if (!password) return <AdminGate onUnlock={setPassword} />;

  const handleLock = () => {
    setPassword(null);
    navigate('/');
  };

  return (
    <AppShell>
      <BrandHeader subtitle="Live your Lagos story with real people." />

      <div className={`mt-10 p-6 sm:p-8 ${cardClass}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Admin</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Manage users and claims.</p>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setRefreshKey((count) => count + 1)}
              aria-label="Refresh"
              className={iconButtonClass}
            >
              <RefreshCw size={20} />
            </button>
            <button type="button" onClick={handleLock} aria-label="Lock admin" className={iconButtonClass}>
              <Unlock size={20} />
            </button>
          </div>
        </div>

        <div
          role="tablist"
          className="mt-8 grid grid-cols-2 gap-2 rounded-[1.5rem] border border-slate-200 bg-slate-100 p-1.5 dark:border-slate-700 dark:bg-slate-950/60"
        >
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const active = section === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSection(id)}
                className={`flex items-center justify-center gap-2.5 rounded-2xl px-4 py-3.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40 ${
                  active
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </div>

        <div key={`${section}-${refreshKey}`} className="mt-6 animate-fade-in">
          {section === 'dashboard' ? <AdminDashboard password={password} /> : <AdminUsers password={password} />}
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/claim')}
        className="mx-auto mt-8 flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft size={16} />
        Back to claim
      </button>
    </AppShell>
  );
}
