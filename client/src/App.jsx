import { useExpenses } from './hooks/useExpenses.js';
import { ExpenseForm } from './components/ExpenseForm.jsx';
import { ExpenseList } from './components/ExpenseList.jsx';
import { Summary } from './components/Summary.jsx';
import './App.css';

function App() {
  const {
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
  } = useExpenses();

  return (
    <div className="app">
      <h1>Registro de gastos</h1>

      {error && <p className="error">{error}</p>}

      <div className="app-grid">
        <ExpenseForm onAdd={addExpense} />
        <Summary summary={summary} month={month} onMonthChange={setMonth} />
      </div>

      <ExpenseList
        expenses={expenses}
        category={category}
        onCategoryChange={setCategory}
        onDelete={removeExpense}
        loading={loading}
      />
    </div>
  );
}

export default App;
