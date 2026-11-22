import { useCallback, useEffect, useState } from 'react';
import * as api from '../api/expenses.js';
import { readCache, writeCache } from '../api/cache.js';
import { currentMonth } from '../constants.js';

const EMPTY_SUMMARY = { total: 0, byCategory: [] };

export function useExpenses() {
  const [month, setMonth] = useState(currentMonth());
  const [category, setCategory] = useState('');
  const [expenses, setExpenses] = useState(() => readCache(`exp:${currentMonth()}:`) ?? []);
  const [summary, setSummary] = useState(() => readCache(`sum:${currentMonth()}`) ?? EMPTY_SUMMARY);
  const [loading, setLoading] = useState(() => readCache(`exp:${currentMonth()}:`) === undefined);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const expKey = `exp:${month}:${category}`;
    const sumKey = `sum:${month}`;
    const cachedExp = readCache(expKey);
    const cachedSum = readCache(sumKey);
    if (cachedExp) setExpenses(cachedExp);
    if (cachedSum) setSummary(cachedSum);
    setLoading(cachedExp === undefined);
    setError(null);
    try {
      const [expensesData, summaryData] = await Promise.all([
        api.getExpenses({ month, category }),
        api.getSummary(month),
      ]);
      setExpenses(expensesData);
      setSummary(summaryData);
      writeCache(expKey, expensesData);
      writeCache(sumKey, summaryData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, category]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addExpense = async (expense) => {
    await api.createExpense(expense);
    await refresh();
  };

  const removeExpense = async (id) => {
    await api.deleteExpense(id);
    await refresh();
  };

  return {
    month,
    setMonth,
    category,
    setCategory,
    expenses,
    summary,
    loading,
    error,
    addExpense,
    removeExpense,
    refresh,
  };
}
