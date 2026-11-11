import { RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/components/Modal';
import { useAdminRequest } from '@/hooks/useAdminRequest';
import { adminRequest, type AppUser } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { cardClass, errorTextClass } from '@/lib/styles';

interface AdminUsersProps {
  password: string;
}

export default function AdminUsers({ password }: AdminUsersProps) {
  const { data, setData, loading, error, reload } = useAdminRequest<{ users: AppUser[] }>(password, 'users');
  const [pendingDelete, setPendingDelete] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const users = data?.users ?? [];

  const closeDeleteDialog = () => {
    if (deleting) return;
    setPendingDelete(null);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!pendingDelete || !data) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await adminRequest(password, 'delete-user', { id: pendingDelete.id });
      setData({ users: data.users.filter((user) => user.id !== pendingDelete.id) });
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete this user.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Saved users</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {users.length} saved {users.length === 1 ? 'user' : 'users'} with their password and PIN.
          </p>
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

      {!data && loading && <p className="text-sm text-slate-600 dark:text-slate-400">Loading users...</p>}

      {data && (
        <div className={`overflow-hidden ${cardClass}`}>
          {users.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-600 dark:text-slate-400">No saved users yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Username</th>
                    <th className="px-5 py-3 font-semibold">Password</th>
                    <th className="px-5 py-3 font-semibold">PIN</th>
                    <th className="px-5 py-3 font-semibold">Last updated</th>
                    <th className="px-5 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {users.map((user) => (
                    <tr key={user.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-slate-100">{user.username}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300">{user.password}</td>
                      <td className="px-5 py-3.5 font-mono tracking-widest text-slate-700 dark:text-slate-300">
                        {user.pin ?? <span className="font-sans tracking-normal text-slate-400">Not set</span>}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                        {formatDateTime(user.updated_at)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setPendingDelete(user)}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500/30 dark:text-red-400 dark:hover:bg-red-950/50"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {pendingDelete && (
        <Modal onClose={closeDeleteDialog}>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Delete this user?</h3>
            <p className="mx-auto mt-3 max-w-xs text-sm text-slate-600 dark:text-slate-400">
              This removes <span className="font-semibold text-slate-900 dark:text-slate-100">{pendingDelete.username}</span>
              {' '}and their saved password and PIN. Their past claims are kept.
            </p>
          </div>
          {deleteError && <p className={`mt-4 text-center ${errorTextClass}`}>{deleteError}</p>}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={closeDeleteDialog}
              disabled={deleting}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full rounded-2xl bg-red-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-500 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
