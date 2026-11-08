import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import AppShell from '@/components/AppShell';
import BrandHeader from '@/components/BrandHeader';
import { adminRequest } from '@/lib/api';
import { errorTextClass, inputClass, labelClass, primaryButtonClass, cardClass } from '@/lib/styles';

interface AdminGateProps {
  onUnlock: (password: string) => void;
}

export default function AdminGate({ onUnlock }: AdminGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = password.length > 0 && !submitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await adminRequest<{ ok: boolean }>(password, 'verify');
      onUnlock(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify the admin password.');
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <BrandHeader subtitle="Admin access only." />

      <div className={`mt-10 p-7 sm:p-8 ${cardClass}`}>
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
          <ShieldCheck size={22} />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="admin-password" className={labelClass}>
              Admin password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="off"
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputClass} pr-12`}
                placeholder="Enter admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className={errorTextClass}>{error}</p>}

          <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
            {submitting ? 'Checking...' : 'Open admin'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
