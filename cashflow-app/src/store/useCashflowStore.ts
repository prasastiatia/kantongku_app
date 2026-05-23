import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CashflowState } from '../types';

export const useCashflowStore = create<CashflowState>()(
  persist(
    (set) => ({
      transactions: [],
      period: 'monthly',
      nextPayday: '',
      
      addTransaction: (transaction) => set((state) => ({
        transactions: [
          ...state.transactions,
          { ...transaction, id: crypto.randomUUID() }
        ]
      })),
      
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),
      
      setPeriod: (period) => set({ period }),
      setNextPayday: (nextPayday) => set({ nextPayday }),
    }),
    {
      name: 'cashflow-storage', // name of the item in the storage (must be unique)
    }
  )
);
