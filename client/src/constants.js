// Debe coincidir con el enum de categorías del backend (server/src/models/Expense.js)
export const CATEGORIES = [
  'food',
  'transport',
  'housing',
  'health',
  'entertainment',
  'education',
  'other',
];

export const CATEGORY_LABELS = {
  food: 'Comida',
  transport: 'Transporte',
  housing: 'Vivienda',
  health: 'Salud',
  entertainment: 'Entretenimiento',
  education: 'Educación',
  other: 'Otro',
};

export const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
