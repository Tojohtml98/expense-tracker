import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlannedCard } from './PlannedCard.jsx';
import { comparePlanned } from '../money.js';

const planned = [
  { _id: 'a', description: 'Regalo', amount: 142500, category: 'other', included: true },
  { _id: 'b', description: 'Dentista', amount: 65000, category: 'health', included: true },
  { _id: 'c', description: 'Viaje', amount: 300000, category: 'other', included: false },
];

const setup = (props = {}) => {
  const handlers = {
    onAdd: vi.fn().mockResolvedValue(),
    onToggle: vi.fn(),
    onPay: vi.fn().mockResolvedValue(),
    onRemove: vi.fn().mockResolvedValue(),
  };
  render(<PlannedCard available={578568} planned={planned} loading={false} {...handlers} {...props} />);
  return handlers;
};

describe('comparePlanned', () => {
  it('only counts the checked ones', () => {
    expect(comparePlanned({ available: 578568, planned, daysLeft: 9 })).toMatchObject({
      total: 207500,
      count: 2,
      after: 371068,
    });
  });

  it('has no "tendría" without a balance', () => {
    expect(comparePlanned({ available: null, planned, daysLeft: 9 }).after).toBeNull();
  });
});

describe('PlannedCard', () => {
  it('shows tengo − supuestos = tendría', () => {
    setup();
    const result = screen.getByText('Tendría').closest('.planned-box');
    expect(within(result).getByText(/371\.068/)).toBeInTheDocument();
    expect(screen.getByText('2 gastos')).toBeInTheDocument();
  });

  it('warns when the money is not enough', () => {
    setup({ available: 100000 });
    expect(screen.getByText(/te faltarían/i)).toBeInTheDocument();
  });

  it('adds a planned expense', async () => {
    const { onAdd } = setup();
    await userEvent.type(screen.getByLabelText('Qué'), 'Zapatillas');
    await userEvent.type(screen.getByLabelText('Monto'), '80000');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    expect(onAdd).toHaveBeenCalledWith({ description: 'Zapatillas', amount: 80000, category: 'other' });
  });

  it('toggles, pays and removes', async () => {
    const { onToggle, onPay, onRemove } = setup();
    await userEvent.click(screen.getByLabelText(/contar «Viaje»/i));
    expect(onToggle).toHaveBeenCalledWith('c', true);

    const row = screen.getByText('Dentista').closest('li');
    await userEvent.click(within(row).getByRole('button', { name: 'Pagado' }));
    expect(onPay).toHaveBeenCalledWith('b');

    await userEvent.click(screen.getByRole('button', { name: /borrar «Regalo»/i }));
    expect(onRemove).toHaveBeenCalledWith('a');
  });
});
