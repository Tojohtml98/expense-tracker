import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ExpenseForm } from './ExpenseForm.jsx';

describe('ExpenseForm', () => {
  it('envía los datos ingresados y convierte el monto a número', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockResolvedValue();
    render(<ExpenseForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText(/monto/i), '150.5');
    await user.selectOptions(screen.getByLabelText(/categoría/i), 'transport');
    await user.type(screen.getByLabelText(/descripción/i), 'Colectivo');
    await user.click(screen.getByRole('button', { name: /agregar/i }));

    await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(1));
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 150.5,
        category: 'transport',
        description: 'Colectivo',
      }),
    );
  });

  it('limpia el formulario después de un envío exitoso', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockResolvedValue();
    render(<ExpenseForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText(/monto/i), '20');
    await user.click(screen.getByRole('button', { name: /agregar/i }));

    await waitFor(() => expect(screen.getByLabelText(/monto/i)).toHaveValue(null));
  });

  it('muestra el mensaje de error si onAdd falla y no limpia el formulario', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockRejectedValue(new Error('El servidor rechazó el gasto'));
    render(<ExpenseForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText(/monto/i), '20');
    await user.click(screen.getByRole('button', { name: /agregar/i }));

    expect(await screen.findByText('El servidor rechazó el gasto')).toBeInTheDocument();
    expect(screen.getByLabelText(/monto/i)).toHaveValue(20);
  });

  it('deshabilita el botón mientras se está enviando', async () => {
    const user = userEvent.setup();
    let resolveAdd;
    const onAdd = vi.fn(() => new Promise((resolve) => { resolveAdd = resolve; }));
    render(<ExpenseForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText(/monto/i), '20');
    await user.click(screen.getByRole('button', { name: /agregar/i }));

    expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled();
    resolveAdd();
    await waitFor(() => expect(screen.getByRole('button', { name: /agregar/i })).toBeEnabled());
  });
});
