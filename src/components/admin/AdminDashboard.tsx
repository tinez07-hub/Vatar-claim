import { useAdminRequest } from '@/hooks/useAdminRequest';
import type { DashboardStats } from '@/lib/api';
import { formatAmount, formatDateTime, MAX_CLAIM_AMOUNT } from '@/lib/format';
import { errorTextClass } from '@/lib/styles';

interface AdminDashboardProps {
  password: string;
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export default function AdminDashboard({ password }: AdminDashboardProps) {
  const { data, loading, error } = useAdminRequest<DashboardStats>(password, 'dashboard');

  return (
    <div className="space-y-6">
      {error && <p className={errorTextClass}>{error}</p>}

      {!data && loading && <p className="text-sm text-slate-600 dark:text-slate-400">Loading dashboard...</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total users" value={formatAmount(data.totalUsers)} />
            <StatCard label="Total claims" value={formatAmount(data.totalClaims)} />
            <StatCard label="Total claimed" value={formatAmount(data.totalClaimed)} />
            <StatCard
              label="Claimed today"
              value={formatAmount(data.claimedToday)}
              hint={`Daily limit ${formatAmount(MAX_CLAIM_AMOUNT)} per user`}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
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
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
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
