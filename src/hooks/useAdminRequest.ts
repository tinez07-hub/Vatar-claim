import { useEffect, useState } from 'react';
import { adminRequest } from '@/lib/api';

export function useAdminRequest<T>(password: string, adminAction: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminRequest<T>(password, adminAction)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [password, adminAction]);

  return { data, setData, loading, error };
}
