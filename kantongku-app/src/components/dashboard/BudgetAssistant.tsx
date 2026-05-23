import React, { useState } from 'react';
import { Calendar, TrendingUp, AlertCircle, Edit2 } from 'lucide-react';
import { differenceInDays, isPast, isToday, parseISO } from 'date-fns';
import { useCashflowStore } from '../../store/useCashflowStore';
import { calculateSummary } from '../../utils/dateUtils';
import { formatRupiah } from '../../utils/currencyUtils';
import { cn } from '../../lib/utils';

export const BudgetAssistant: React.FC = () => {
  const { transactions, nextPayday, setNextPayday } = useCashflowStore();
  const [isEditing, setIsEditing] = useState(!nextPayday);
  const [tempDate, setTempDate] = useState(nextPayday || new Date().toISOString().split('T')[0]);

  const { income, expense } = calculateSummary(transactions);
  const netCashflow = income - expense;

  const calculateDaysRemaining = () => {
    if (!nextPayday) return 0;
    const targetDate = parseISO(nextPayday);
    if (isToday(targetDate)) return 0;
    if (isPast(targetDate)) return -1;
    return differenceInDays(targetDate, new Date());
  };

  const daysRemaining = calculateDaysRemaining();
  
  // Safe daily budget is net cashflow divided by remaining days
  const dailyBudget = daysRemaining > 0 && netCashflow > 0 
    ? Math.floor(netCashflow / daysRemaining)
    : 0;

  const handleSave = () => {
    if (tempDate) {
      setNextPayday(tempDate);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col space-y-4 h-full relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 p-2 rounded-xl">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">AI Budget Planner</h3>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center">
        {isEditing ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">When is your next payday?</label>
            <input 
              type="date"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
            <button 
              onClick={handleSave}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Save Date
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {daysRemaining < 0 ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 font-medium">Your payday has passed. Please update the date to plan your next budget.</p>
              </div>
            ) : daysRemaining === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800 font-medium">It's payday! Time to record your new income and set a fresh target.</p>
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Safe Daily Budget</p>
                    <h4 className={cn(
                      "text-3xl font-black tracking-tight",
                      dailyBudget > 50000 ? "text-blue-600" : "text-amber-600"
                    )}>
                      {formatRupiah(dailyBudget)}
                    </h4>
                  </div>
                  <div className="text-right pb-1">
                    <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      {daysRemaining} Days Left
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {netCashflow <= 0 ? (
                    <span className="text-rose-600">You are out of funds! Try to minimize any expenses until payday.</span>
                  ) : dailyBudget > 100000 ? (
                    <span>You're in a great position! You can comfortably spend <strong className="text-blue-600">{formatRupiah(dailyBudget)}</strong> per day.</span>
                  ) : dailyBudget > 0 ? (
                    <span>Your budget is tight. Try to keep daily expenses under <strong className="text-amber-600">{formatRupiah(dailyBudget)}</strong> to survive until payday.</span>
                  ) : null}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
