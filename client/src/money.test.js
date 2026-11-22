import { daysLeftInMonth, monthPlan, simulate, todayLocal } from './money.js';

const nov22 = new Date(2026, 10, 22, 21, 30); // 21:30 en Argentina = ya es 23/11 en UTC

describe('money helpers', () => {
  it('uses the local calendar day, not UTC', () => {
    expect(todayLocal(nov22)).toBe('2026-11-22');
  });

  it('counts the days left including today', () => {
    expect(daysLeftInMonth(nov22)).toBe(9);
    expect(daysLeftInMonth(new Date(2026, 10, 30))).toBe(1);
    expect(daysLeftInMonth(new Date(2027, 1, 1))).toBe(28);
  });

  it('splits what is left across the remaining days', () => {
    const plan = monthPlan({ available: 90000, spentThisMonth: 0, now: nov22 });
    expect(plan.perDay).toBe(10000);
    expect(plan.runsOutOn).toBeNull();
  });

  it('warns the day the money runs out at the current pace', () => {
    // 22 días, 44.000 gastados → 2.000 por día; con 10.000 alcanza 5 días
    const plan = monthPlan({ available: 10000, spentThisMonth: 44000, now: nov22 });
    expect(plan.avgPerDay).toBe(2000);
    expect(plan.runsOutOn.getDate()).toBe(27);
  });

  it('simulates a purchase', () => {
    expect(simulate({ available: 30000, amount: 12000, daysLeft: 9 })).toEqual({ after: 18000, perDay: 2000, fits: true });
    expect(simulate({ available: 5000, amount: 8000, daysLeft: 9 }).fits).toBe(false);
  });
});
