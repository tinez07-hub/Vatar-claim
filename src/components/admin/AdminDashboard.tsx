import { RefreshCw } from 'lucide-react';
import { useAdminRequest } from '@/hooks/useAdminRequest';
import type { DashboardStats } from '@/lib/api';
import { formatAmount, formatDateTime, MAX_CLAIM_AMOUNT } from '@/lib/format';
import { cardClass, errorTextClass } from '@/lib/styles';

interface AdminDashboardProps {
  password: string;
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={`p-5 ${cardClass}`}>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export default function AdminDashboard({ password }: AdminDashboardProps) {
  const { data, loading, error, reload } = useAdminRequest<DashboardStats>(password, 'dashboard');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Users and claims at a glance.</p>
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && <p className={errorTextClass}>{error}</p>}

      {!data && loading && <p className="text-sm text-slate-600 dark:text-slate-400">Loading dashboard...</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard label="Total users" value={formatAmount(data.totalUsers)} />
            <StatCard label="Total claims" value={formatAmount(data.totalClaims)} />
            <StatCard label="Total claimed" value={formatAmount(data.totalClaimed)} />
            <StatCard
              label="Claimed today"
              value={formatAmount(data.claimedToday)}
              hint={`Daily limit ${formatAmount(MAX_CLAIM_AMOUNT)} per user`}
            />
          </div>

          <div className={`overflow-hidden ${cardClass}`}>
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">Recent claims</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">The latest 50 claims, newest first.</p>
            </div>
            {data.recentClaims.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-600 dark:text-slate-400">No claims yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-semibold">User</th>
                      <th className="px-5 py-3 text-right font-semibold">Amount</th>
                      <th className="px-5 py-3 font-semibold">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {data.recentClaims.map((claim) => (
                      <tr key={claim.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-slate-100">{claim.username}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-slate-900 dark:text-slate-100">
                          {formatAmount(claim.amount)}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                          {formatDateTime(claim.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
