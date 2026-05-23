import React from 'react';
import { format, parseISO } from 'date-fns';
import { Trash2 } from 'lucide-react';
import type { Transaction } from '../../types';
import { cn } from '../../lib/utils';
import { useCashflowStore } from '../../store/useCashflowStore';
import { formatRupiah } from '../../utils/currencyUtils';

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const deleteTransaction = useCashflowStore((state) => state.deleteTransaction);

  if (transactions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-slate-300 text-2xl">📝</span>
        </div>
        <h4 className="text-slate-700 font-medium mb-1">No transactions found</h4>
        <p className="text-slate-500 text-sm">Add a transaction to see it here.</p>
      </div>
    );
  }

  // Sort by date descending
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full max-h-[500px]">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Transactions</h3>
      
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
        {sortedTransactions.map((transaction) => (
          <div 
            key={transaction.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                transaction.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                <span className="text-lg font-bold">
                  {transaction.title.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{transaction.title}</p>
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span>{transaction.category}</span>
                  <span>•</span>
                  <span>{format(parseISO(transaction.date), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <p className={cn(
                "text-sm font-bold",
                transaction.type === 'income' ? "text-emerald-600" : "text-rose-600"
              )}>
                {transaction.type === 'income' ? '+' : '-'}{formatRupiah(transaction.amount)}
              </p>
              
              <button
                onClick={() => deleteTransaction(transaction.id)}
                className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete transaction"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
