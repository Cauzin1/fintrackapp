
import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Transaction } from '../types';

interface ExpensesChartProps {
  transactions: Transaction[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF42A1', '#42A1FF', '#A1FF42'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
        <p className="label text-gray-800 dark:text-gray-200">{`${payload[0].name} : ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}`}</p>
        <p className="intro text-gray-500 dark:text-gray-400">{`(${(payload[0].percent * 100).toFixed(2)}%)`}</p>
      </div>
    );
  }
  return null;
};

const ExpensesChart: React.FC<ExpensesChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    const expenseData = transactions.filter(t => t.type === 'expense');
    if (expenseData.length === 0) return [];
    
    const categoryTotals = expenseData.reduce((acc, curr) => {
      const category = curr.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + curr.amount;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    })).sort((a,b) => b.value - a.value);
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <p className="text-gray-500 dark:text-gray-400">No expense data to display.<br/>Add an expense to see the chart.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius="80%"
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          stroke="none"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpensesChart;
