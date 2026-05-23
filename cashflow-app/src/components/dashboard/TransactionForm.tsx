import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCashflowStore } from '../../store/useCashflowStore';
import type { TransactionType } from '../../types';
import { cn } from '../../lib/utils';

export const TransactionForm: React.FC = () => {
  const addTransaction = useCashflowStore((state) => state.addTransaction);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [type, setType] = useState<TransactionType>('expense');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !date || !category) return;

    addTransaction({
      title,
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
      category,
      type,
    });

    // Reset form
    setTitle('');
    setAmount('');
    setCategory('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Add Transaction</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-all",
              type === 'expense' ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-all",
              type === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Income
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Grocery Shopping"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
            <input
              type="number"
              required
              min="100"
              step="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-white"
            >
              <option value="" disabled>Select...</option>
              {type === 'income' ? (
                <>
                  <option value="Salary">Salary</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Investments">Investments</option>
                  <option value="Other">Other</option>
                </>
              ) : (
                <>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Housing">Housing</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </>
              )}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg transition-colors font-medium mt-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </form>
    </div>
  );
};
