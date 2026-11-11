import { Eye, EyeOff, LogOut, LockKeyhole } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import AppShell from '@/components/AppShell';
import BrandHeader from '@/components/BrandHeader';
import { claimAmount } from '@/lib/api';
import { formatAmount, MAX_CLAIM_AMOUNT } from '@/lib/format';
import { navigate } from '@/lib/navigation';
import { clearSessionUsername, getSessionUsername } from '@/lib/session';
import { errorTextClass, inputClass, labelClass, primaryButtonClass } from '@/lib/styles';

const MAX_DIGITS = String(MAX_CLAIM_AMOUNT).length;
const QUICK_AMOUNTS = [
  1_000,
  10_000,
  100_000,
  1_000_000,
  10_000_000,
  100_000_000,
  1_000_000_000,
  1_000_000_000_000,
];

function formatQuickAmount(value: number) {
  if (value >= 1_000_000_000_000) return `${value / 1_000_000_000_000}T`;
  if (value >= 1_000_000_000) return `${value / 1_000_000_000}B`;
  if (value >= 1_000_000) return `${value / 1_000_000}M`;
  return `${value / 1_000}k`;
}

export default function ClaimPage() {
  const [username] = useState(getSessionUsername);
  const [digits, setDigits] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!username) navigate('/');
  }, [username]);

  if (!username) return null;

  const amount = digits ? Number(digits) : 0;
  const overLimit = amount > MAX_CLAIM_AMOUNT;
  const canClaim = amount > 0 && !overLimit && pin.length === 4 && !submitting;

  const handleAmountChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, MAX_DIGITS);
    setDigits(cleaned);
    setError(null);
  };

  const handleQuickAmount = (value: number) => {
    setDigits(String(value));
    setError(null);
  };

  const handleMax = () => {
    setDigits(String(MAX_CLAIM_AMOUNT));
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canClaim) return;

    setSubmitting(true);
    setError(null);
    try {
      const claimed = await claimAmount(username, amount, pin);
      if (!claimed.verificationRequired) throw new Error('Could not start verification. Please try again.');
      setPin('');
      setDigits('');
      navigate('/verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete this claim. Please try again.');
      setSubmitting(false);
    }
  };

  const handleSwitchAccount = () => {
    clearSessionUsername();
    navigate('/');
  };

  return (
    <AppShell>
      <BrandHeader subtitle="Live your Lagos story with real people." />

      <p className="mt-8 text-sm font-semibold leading-relaxed text-red-600 dark:text-red-400">
        Warning: You can only claim 5 trillion per day. Your daily limit resets at midnight, Lagos time.
      </p>

      <div className="mt-4 rounded-[2rem] border-2 border-[#efd27b] bg-[#fff8df] p-5 text-slate-700 dark:border-[#8c7740] dark:bg-[#2d2a20] dark:text-slate-200 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="amount" className="sr-only">
              Amount
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-semibold text-slate-700 dark:text-slate-300">
                ₦
              </span>
              <input
                id="amount"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                value={digits ? formatAmount(digits) : ''}
                onChange={(event) => handleAmountChange(event.target.value)}
                className={`${inputClass} border-[#eee7d2] bg-white pl-12 pr-24 text-2xl font-semibold shadow-[0_1px_3px_rgba(73,60,25,0.08)] dark:border-[#514a35] dark:bg-[#423d2d] ${overLimit ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
              />
              <button
                type="button"
                onClick={handleMax}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 px-5 py-2.5 text-base font-semibold text-slate-800 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 dark:bg-[#2b4352] dark:text-slate-100 dark:hover:bg-[#365265]"
              >
                Max
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {QUICK_AMOUNTS.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => handleQuickAmount(quickAmount)}
                className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-[#fffdf5] focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/30 dark:bg-[#423d2d] dark:text-slate-100 dark:hover:bg-[#514a35]"
              >
                ₦{formatQuickAmount(quickAmount)}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="transaction-pin" className={`${labelClass} flex items-center gap-2`}>
              <LockKeyhole size={18} />
              Your transaction PIN
            </label>
            <div className="relative">
              <input
                id="transaction-pin"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={pin}
                onChange={(event) => {
                  setPin(event.target.value.replace(/\D/g, '').slice(0, 4));
                  setError(null);
                }}
                placeholder="••••"
                className={`${inputClass} border-[#eee7d2] bg-white pr-14 text-center text-xl tracking-[0.7em] placeholder:text-slate-400/70 dark:border-[#514a35] dark:bg-[#423d2d] dark:placeholder:text-slate-400/60`}
              />
              <button
                type="button"
                onClick={() => setShowPin((value) => !value)}
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
              >
                {showPin ? <EyeOff size={21} /> : <Eye size={21} />}
              </button>
            </div>
          </div>

          {error && <p className={errorTextClass}>{error}</p>}

          <button type="submit" disabled={!canClaim} className={primaryButtonClass}>
            {submitting ? 'Claiming...' : 'Claim'}
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
    </AppShell>
  );
}
