import React from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { getFinancialAdvice } from '../../utils/financialAdvisor';
import type { Transaction } from '../../types';
import { cn } from '../../lib/utils';

interface SmartAdvisorCardProps {
  transactions: Transaction[];
}

export const SmartAdvisorCard: React.FC<SmartAdvisorCardProps> = ({ transactions }) => {
  const advice = getFinancialAdvice(transactions);

  const getIcon = () => {
    switch (advice.type) {
      case 'success':
        return <TrendingUp className="w-6 h-6 text-emerald-600" />;
      case 'warning':
        return <Lightbulb className="w-6 h-6 text-amber-600" />;
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-rose-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (advice.type) {
      case 'success':
        return "bg-emerald-50 border-emerald-100";
      case 'warning':
        return "bg-amber-50 border-amber-100";
      case 'danger':
        return "bg-rose-50 border-rose-100";
      default:
        return "bg-blue-50 border-blue-100";
    }
  };

  return (
    <div className={cn("p-6 rounded-2xl shadow-sm border flex flex-col space-y-4", getBgColor())}>
      <div className="flex items-center space-x-3">
        <div className="bg-white p-2 rounded-xl shadow-sm">
          {getIcon()}
        </div>
        <h3 className="text-lg font-bold text-slate-800">Smart Advisor</h3>
      </div>
      
      <p className="text-slate-700 leading-relaxed font-medium">
        {advice.message}
      </p>
    </div>
  );
};
