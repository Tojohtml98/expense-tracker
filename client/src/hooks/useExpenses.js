import { useCallback, useEffect, useState } from 'react';
import * as api from '../api/expenses.js';
import { currentMonth } from '../constants.js';

export function useExpenses() {
  const [month, setMonth] = useState(currentMonth());
  const [category, setCategory] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ total: 0, byCategory: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expensesData, summaryData] = await Promise.all([
        api.getExpenses({ month, category }),
        api.getSummary(month),
      ]);
      setExpenses(expensesData);
      setSummary(summaryData);
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
  };
}
