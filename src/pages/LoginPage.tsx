import { Eye, EyeOff } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import AppShell from '@/components/AppShell';
import BrandHeader from '@/components/BrandHeader';
import { loginUser } from '@/lib/api';
import { navigate } from '@/lib/navigation';
import { setSessionUsername } from '@/lib/session';
import { cardClass, errorTextClass, inputClass, labelClass, primaryButtonClass } from '@/lib/styles';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = identifier.trim().length > 0 && password.length > 0 && !submitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await loginUser(identifier.trim(), password);
      setSessionUsername(result.username);
      navigate('/claim');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <BrandHeader subtitle="Live your Lagos story with real people." />

      <div className={`mt-10 p-7 sm:p-8 ${cardClass}`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className={labelClass}>
              Username or email
            </label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className={inputClass}
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputClass} pr-12`}
                placeholder="Enter your password"
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
            {submitting ? 'Logging in...' : 'Log in'}
          </button>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">Welcome back to Lagos.</p>
        </form>
      </div>
    </AppShell>
  );
}
