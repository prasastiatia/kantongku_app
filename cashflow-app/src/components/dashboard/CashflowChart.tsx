import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import type { Transaction } from '../../types';


interface CashflowChartProps {
  transactions: Transaction[];
}

export const CashflowChart: React.FC<CashflowChartProps> = ({ transactions }) => {
  // Group transactions by date for the chart
  const groupedData = transactions.reduce((acc, curr) => {
    const dateStr = format(parseISO(curr.date), 'MMM dd');
    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, income: 0, expense: 0 };
    }
    if (curr.type === 'income') {
      acc[dateStr].income += curr.amount;
    } else {
      acc[dateStr].expense += curr.amount;
    }
    return acc;
  }, {} as Record<string, { date: string; income: number; expense: number }>);

  const data = Object.values(groupedData).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[350px] flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Cashflow Overview</h3>
      
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Not enough data to display chart
        </div>
      ) : (
        <div className="flex-1 min-h-0 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(val) => `Rp ${val / 1000}k`}
                width={80}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                labelStyle={{ color: '#64748b', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                name="Income"
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                stroke="#f43f5e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorExpense)" 
                name="Expense"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
