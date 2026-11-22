import { useExpenses } from './hooks/useExpenses.js';
import { useBalance } from './hooks/useBalance.js';
import { ExpenseForm } from './components/ExpenseForm.jsx';
import { ExpenseList } from './components/ExpenseList.jsx';
import { Summary } from './components/Summary.jsx';
import { MoneyCard } from './components/MoneyCard.jsx';
import { PlannedCard } from './components/PlannedCard.jsx';
import { usePlanned } from './hooks/usePlanned.js';
import { DeviceLink } from './components/DeviceLink.jsx';
import { currentMonth } from './constants.js';
import './App.css';

const TODAY_FMT = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

function App({ justLinked = false }) {
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
    refresh,
  } = useExpenses();
  const money = useBalance();
  const plan = usePlanned();

  // Un gasto nuevo o borrado cambia también cuánto te queda
  const add = async (expense) => {
    await addExpense(expense);
    money.refresh();
  };
  const remove = async (id) => {
    await removeExpense(id);
    money.refresh();
  };
  // Supuesto pagado → aparece en "Gastos del mes" y se descuenta
  const pay = async (id) => {
    await plan.pay(id);
    refresh();
    money.refresh();
  };
  // Gasto que todavía no pagaste → vuelve a supuestos
  const moveToPlanned = async (id) => {
    await plan.fromExpense(id);
    refresh();
    money.refresh();
  };
  const relink = () => {
    refresh();
    money.refresh();
    plan.refresh();
  };

  return (
    <div className="app">
      <header className="app-header">
        <p className="app-date">{TODAY_FMT.format(new Date())}</p>
        <h1>Mis gastos</h1>
      </header>

      {(error || money.error || plan.error) && <p className="error">{error || money.error || plan.error}</p>}

      <MoneyCard
        balance={money.balance}
        loading={money.loading}
        onSave={money.save}
        spentThisMonth={month === currentMonth() ? summary.total : null}
      />

      <PlannedCard
        available={money.balance.estimated}
        planned={plan.planned}
        loading={plan.loading}
        onAdd={plan.add}
        onToggle={plan.toggle}
        onPay={pay}
        onRemove={plan.remove}
      />

      <div className="app-grid">
        <ExpenseForm onAdd={add} />
        <Summary summary={summary} month={month} onMonthChange={setMonth} />
      </div>

      <ExpenseList
        expenses={expenses}
        category={category}
        onCategoryChange={setCategory}
        onDelete={remove}
        onMoveToPlanned={(id) => moveToPlanned(id).catch(() => {})}
        loading={loading}
      />

      <DeviceLink onLinked={relink} justLinked={justLinked} />
    </div>
  );
}

export default App;
