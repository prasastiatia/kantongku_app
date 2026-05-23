import { ArrowDownRight, ArrowUpRight, WalletCards } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatRupiah } from '../../utils/currencyUtils';

interface SummaryCardsProps {
  income: number;
  expense: number;
  net: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ income, expense, net }) => {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      {/* Total Income */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col space-y-2 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">Total Income</p>
          <div className="p-2 bg-emerald-50 rounded-full">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800">
          {formatRupiah(income)}
        </h3>
      </div>

      {/* Total Expense */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col space-y-2 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">Total Expense</p>
          <div className="p-2 bg-rose-50 rounded-full">
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800">
          {formatRupiah(expense)}
        </h3>
      </div>

      {/* Net Cashflow */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col space-y-2 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">Net Cashflow</p>
          <div className={cn(
            "p-2 rounded-full",
            net >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            <WalletCards className="w-4 h-4" />
          </div>
        </div>
        <h3 className={cn(
          "text-2xl font-bold",
          net >= 0 ? "text-emerald-600" : "text-rose-600"
        )}>
          {formatRupiah(net)}
        </h3>
      </div>
    </div>
  );
};
