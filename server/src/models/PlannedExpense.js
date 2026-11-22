import mongoose from 'mongoose';
import { CATEGORIES } from './Expense.js';

// "Supuestos gastos": lo que pensás gastar. No se descuenta de tu plata
// hasta que lo marcás como pagado (ahí se convierte en un gasto real).
const plannedSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true, immutable: true },
    description: {
      type: String,
      trim: true,
      required: [true, 'description is required'],
      maxlength: [100, 'description must be at most 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'amount is required'],
      min: [0.01, 'amount must be greater than 0'],
      max: [1e12, 'amount is too high'],
    },
    category: {
      type: String,
      enum: { values: CATEGORIES, message: '{VALUE} is not a valid category' },
      default: 'other',
    },
    // Destildado = queda anotado pero no entra en la cuenta de "tendría"
    included: { type: Boolean, default: true },
  },
  { timestamps: true }
);

plannedSchema.index({ owner: 1, amount: -1 });

export const PlannedExpense = mongoose.model('PlannedExpense', plannedSchema);
