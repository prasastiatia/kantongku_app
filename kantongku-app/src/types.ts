export type TransactionType = 'income' | 'expense';
export type PeriodType = 'daily' | 'monthly' | 'yearly';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string; // ISO string
  category: string;
  type: TransactionType;
}

export interface CashflowState {
  transactions: Transaction[];
  period: PeriodType;
  nextPayday: string; // ISO string
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  setPeriod: (period: PeriodType) => void;
  setNextPayday: (date: string) => void;
}
