import { DashboardLayout } from './components/layout/DashboardLayout';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { TransactionForm } from './components/dashboard/TransactionForm';
import { TransactionList } from './components/dashboard/TransactionList';
import { CashflowChart } from './components/dashboard/CashflowChart';
import { SmartAdvisorCard } from './components/dashboard/SmartAdvisorCard';
import { BudgetAssistant } from './components/dashboard/BudgetAssistant';
import { SplitBillModal } from './components/split-bill/SplitBillModal';
import { LoginPage } from './components/auth/LoginPage';
import { useCashflowStore } from './store/useCashflowStore';
import { useAuthStore } from './store/useAuthStore';
import { filterTransactionsByPeriod, calculateSummary } from './utils/dateUtils';
import type { PeriodType } from './types';
import { cn } from './lib/utils';
import { Receipt } from 'lucide-react';
import { useState } from 'react';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);
  const { transactions, period, setPeriod } = useCashflowStore();

  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  // Filter transactions based on selected period
  const filteredTransactions = filterTransactionsByPeriod(transactions, period);
  const { income, expense, net } = calculateSummary(filteredTransactions);

  return (
    <DashboardLayout>
      {/* Header and Period Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Track your income and expenses seamlessly.</p>
        </div>
        
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm w-max">
          {(['daily', 'monthly', 'yearly'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md capitalize transition-all",
                period === p
                  ? "bg-emerald-50 text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setIsSplitBillOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Receipt className="w-5 h-5" />
          <span>Split Bill</span>
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards income={income} expense={expense} net={net} />

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column (Chart and List) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <CashflowChart transactions={filteredTransactions} />
          <TransactionList transactions={filteredTransactions} />
        </div>

        {/* Right Column (Form and Advisor) */}
        <div className="space-y-6 flex flex-col">
          <BudgetAssistant />
          <SmartAdvisorCard transactions={filteredTransactions} />
          <TransactionForm />
        </div>
      </div>

      <SplitBillModal 
        isOpen={isSplitBillOpen} 
        onClose={() => setIsSplitBillOpen(false)} 
      />
    </DashboardLayout>
  );
}

export default App;
