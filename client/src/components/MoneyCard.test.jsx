import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MoneyCard } from './MoneyCard.jsx';

const empty = { latest: null, spentSince: 0, estimated: null, history: [] };
const withBalance = {
  latest: { date: '2026-11-21', amount: 50000 },
  spentSince: 5000,
  estimated: 45000,
  history: [
    { date: '2026-11-20', amount: 60000 },
    { date: '2026-11-21', amount: 50000 },
  ],
};

describe('MoneyCard', () => {
  it('asks for today money when there is no balance yet', () => {
    render(<MoneyCard balance={empty} loading={false} onSave={vi.fn()} spentThisMonth={0} />);
    expect(screen.getByText(/te digo cuánto podés gastar por día/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/me lo puedo gastar/i)).not.toBeInTheDocument();
  });

  it('saves the amount typed', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(<MoneyCard balance={empty} loading={false} onSave={onSave} spentThisMonth={0} />);
    await userEvent.type(screen.getByLabelText(/cuánto tenés hoy/i), '42000');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onSave).toHaveBeenCalledWith(42000);
  });

  it('shows what is left and answers "can I spend it?"', async () => {
    render(<MoneyCard balance={withBalance} loading={false} onSave={vi.fn()} spentThisMonth={10000} />);
    expect(screen.getByText(/45\.000/)).toBeInTheDocument();
    expect(screen.getByText(/desde ahí gastaste/i)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/me lo puedo gastar/i), '50000');
    expect(screen.getByText(/no te alcanza/i)).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(/me lo puedo gastar/i));
    await userEvent.type(screen.getByLabelText(/me lo puedo gastar/i), '5000');
    expect(screen.getByText(/te quedarían/i)).toBeInTheDocument();
  });
});
