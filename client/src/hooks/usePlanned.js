import { useCallback, useEffect, useState } from 'react';
import * as api from '../api/expenses.js';
import { readCache, writeCache } from '../api/cache.js';
import { todayLocal } from '../money.js';

export function usePlanned() {
  const [planned, setPlanned] = useState(() => readCache('planned') ?? []);
  const [loading, setLoading] = useState(() => readCache('planned') === undefined);
  const [error, setError] = useState(null);

  const store = (list) => {
    setPlanned(list);
    writeCache('planned', list);
  };

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getPlanned();
      setPlanned(data);
      writeCache('planned', data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = async (item) => {
    await api.createPlanned(item);
    await refresh();
  };

  // El tilde responde al toque; si la API falla, vuelve como estaba
  const toggle = async (id, included) => {
    const before = planned;
    store(planned.map((p) => (p._id === id ? { ...p, included } : p)));
    try {
      await api.updatePlanned(id, { included });
    } catch (err) {
      store(before);
      setError(err.message);
    }
  };

  const remove = async (id) => {
    await api.deletePlanned(id);
    await refresh();
  };

  const pay = async (id) => {
    await api.payPlanned(id, todayLocal());
    await refresh();
  };

  const fromExpense = async (expenseId) => {
    try {
      await api.plannedFromExpense(expenseId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
    await refresh();
  };

  return { planned, loading, error, add, toggle, remove, pay, fromExpense };
}
