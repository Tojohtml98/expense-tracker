import mongoose from 'mongoose';

// "Cuánto tengo hoy": una foto del saldo por día y por visitante.
// date es la fecha de calendario (medianoche UTC), igual que los gastos.
const balanceSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true, immutable: true },
    date: { type: Date, required: [true, 'date is required'] },
    amount: {
      type: Number,
      required: [true, 'amount is required'],
      min: [-1e12, 'amount is too low'],
      max: [1e12, 'amount is too high'],
    },
  },
  { timestamps: true }
);

// Un saldo por día: volver a cargarlo el mismo día lo pisa
balanceSchema.index({ owner: 1, date: -1 }, { unique: true });

export const Balance = mongoose.model('Balance', balanceSchema);
