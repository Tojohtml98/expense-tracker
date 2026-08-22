import mongoose from 'mongoose';

const CATEGORIES = [
  'food',
  'transport',
  'housing',
  'health',
  'entertainment',
  'education',
  'other',
];

const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'amount is required'],
      min: [0.01, 'amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'category is required'],
      enum: { values: CATEGORIES, message: '{VALUE} is not a valid category' },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'description must be at most 200 characters'],
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'date is required'],
      default: Date.now,
    },
  },
  { timestamps: true }
);

expenseSchema.index({ date: 1 });
expenseSchema.index({ category: 1 });

export const Expense = mongoose.model('Expense', expenseSchema);
export { CATEGORIES };
