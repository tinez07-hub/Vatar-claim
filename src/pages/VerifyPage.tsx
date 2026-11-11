import { KeyRound, LogOut, TriangleAlert } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import AppShell from '@/components/AppShell';
import BrandHeader from '@/components/BrandHeader';
import ClaimSuccessModal from '@/components/ClaimSuccessModal';
import { verifyClaimCode } from '@/lib/api';
import { navigate } from '@/lib/navigation';
import { clearSessionUsername, getSessionUsername } from '@/lib/session';
import { cardClass, errorTextClass, inputClass, labelClass, primaryButtonClass } from '@/lib/styles';

interface VerifiedClaim {
  amount: number;
  remaining: number;
}

export default function VerifyPage() {
  const [username] = useState(getSessionUsername);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState<VerifiedClaim | null>(null);

  useEffect(() => {
    if (!username) navigate('/');
  }, [username]);

  if (!username) return null;

  const canSubmit = code.length === 6 && !submitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      const result = await verifyClaimCode(username, code);
      setCode('');
      setVerified({ amount: result.amount, remaining: result.remaining });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify the code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitchAccount = () => {
    clearSessionUsername();
    navigate('/');
  };

  return (
    <AppShell>
      <BrandHeader subtitle="Enter the code sent to your email to confirm your payment." />

      <div className={`mt-10 p-7 sm:p-8 ${cardClass}`}>
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300">
          <KeyRound size={22} />
        </div>
        <div
          role="alert"
          className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium leading-relaxed text-red-800 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200"
        >
          <TriangleAlert size={20} className="mt-0.5 shrink-0" />
          <p>
            Make sure the code is correct from the code sent to your email, else funds won't be added.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="verification-code" className={labelClass}>
              6-digit code
            </label>
            <input
              id="verification-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                setError(null);
              }}
              placeholder="000000"
              className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
            />
          </div>

          {error && <p className={errorTextClass}>{error}</p>}

          <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
            {submitting ? 'Confirming...' : 'Confirm payment'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>
            Signed in as <span className="font-semibold text-slate-800 dark:text-slate-200">{username}</span>
          </span>
          <span aria-hidden>·</span>
          <button
            type="button"
            onClick={handleSwitchAccount}
            className="inline-flex items-center gap-1 font-medium text-emerald-700 transition hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </div>

      {verified && (
        <ClaimSuccessModal
          amount={verified.amount}
          remaining={verified.remaining}
          onClose={() => navigate('/claim')}
        />
      )}
    </AppShell>
  );
}
