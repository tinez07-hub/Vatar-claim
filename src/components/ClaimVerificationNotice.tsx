import { Clock, LogOut, MailCheck } from 'lucide-react';
import AppShell from '@/components/AppShell';
import BrandHeader from '@/components/BrandHeader';
import { cardClass, primaryButtonClass } from '@/lib/styles';

interface ClaimVerificationNoticeProps {
  onLogout: () => void;
}

export default function ClaimVerificationNotice({ onLogout }: ClaimVerificationNoticeProps) {
  return (
    <AppShell>
      <BrandHeader subtitle="Live your Lagos story with real people." />

      <div className={`mt-10 p-7 text-center sm:p-8 ${cardClass}`}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300">
          <MailCheck size={26} />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-slate-950 dark:text-slate-50">Your claim is being verified</h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
          Log in again in 3 minutes. A 6-digit code will be sent to your email, and you will enter it to see your
          payment confirmation.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">
          <Clock size={16} />
          Wait 3 minutes before logging in
        </div>
        <button type="button" onClick={onLogout} className={`mt-8 flex items-center justify-center gap-2 ${primaryButtonClass}`}>
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </AppShell>
  );
}
