import { useCallback, useEffect, useState } from 'react';
import * as api from '../api/expenses.js';
import { readCache, writeCache } from '../api/cache.js';
import { todayLocal } from '../money.js';

const EMPTY = { latest: null, spentSince: 0, estimated: null, history: [] };

export function useBalance() {
  const [balance, setBalance] = useState(() => readCache('balance') ?? EMPTY);
  const [loading, setLoading] = useState(() => readCache('balance') === undefined);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getBalance();
      setBalance(data);
      writeCache('balance', data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async (amount) => {
    await api.saveBalance(todayLocal(), amount);
    await refresh();
  };

  return { balance, loading, error, save, refresh };
}
