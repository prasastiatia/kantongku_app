import { isToday, isThisMonth, isThisYear, parseISO } from 'date-fns';
import type { Transaction, PeriodType } from '../types';

export const filterTransactionsByPeriod = (
  transactions: Transaction[],
  period: PeriodType
): Transaction[] => {
  return transactions.filter((t) => {
    const date = parseISO(t.date);
    switch (period) {
      case 'daily':
        return isToday(date);
      case 'monthly':
        return isThisMonth(date);
      case 'yearly':
        return isThisYear(date);
      default:
        return true;
    }
  });
};

export const calculateSummary = (transactions: Transaction[]) => {
  return transactions.reduce(
    (acc, curr) => {
      if (curr.type === 'income') {
        acc.income += curr.amount;
      } else {
        acc.expense += curr.amount;
      }
      acc.net = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, net: 0 }
  );
};
