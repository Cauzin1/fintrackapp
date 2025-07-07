
import React, { useState, useEffect, useMemo, useCallback, FormEvent } from 'react';
import { User, Transaction } from '../types';
import ExpensesChart from './ExpensesChart';
import { 
  ArrowDownCircleIcon, ArrowUpCircleIcon, CalendarIcon, ChartPieIcon, CurrencyDollarIcon, 
  LogoutIcon, PlusIcon, TagIcon, TrashIcon, WalletIcon 
} from './Icons';

// Sub-component interfaces
interface DashboardProps {
  username: string;
  onLogout: () => void;
}

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  colorClass: string;
}

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Sub-components defined in the same module, outside the main component
const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, icon, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex items-center space-x-4 transition-transform transform hover:scale-105">
    <div className={`p-3 rounded-full ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(amount)}</p>
    </div>
  </div>
);

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onDelete }) => {
  const isIncome = transaction.type === 'income';
  return (
    <li className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl mb-3 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-full ${isIncome ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-rose-100 dark:bg-rose-900'}`}>
          {isIncome ? <ArrowUpCircleIcon className="w-6 h-6 text-emerald-500" /> : <ArrowDownCircleIcon className="w-6 h-6 text-rose-500" />}
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{transaction.description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(transaction.date).toLocaleDateString()} &bull; {transaction.category}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <p className={`font-bold ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isIncome ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
        </p>
        <button onClick={() => onDelete(transaction.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </li>
  );
};


const Dashboard: React.FC<DashboardProps> = ({ username, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const defaultCategories = ['Food', 'Transport', 'Salary', 'Shopping', 'Bills', 'Entertainment', 'Health'];

  const loadUserData = useCallback(() => {
    setIsLoading(true);
    try {
      const usersJson = localStorage.getItem('finTrackUsers');
      if (usersJson) {
        const users: User[] = JSON.parse(usersJson);
        const currentUser = users.find(u => u.username === username);
        if (currentUser) {
          setTransactions(currentUser.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
      }
    } catch (e) {
      console.error("Failed to load user data", e);
    }
    setIsLoading(false);
  }, [username]);

  const saveTransactions = useCallback((updatedTransactions: Transaction[]) => {
    try {
      const usersJson = localStorage.getItem('finTrackUsers');
      if (usersJson) {
        let users: User[] = JSON.parse(usersJson);
        users = users.map(u => u.username === username ? { ...u, transactions: updatedTransactions } : u);
        localStorage.setItem('finTrackUsers', JSON.stringify(users));
      }
    } catch (e) {
      console.error("Failed to save transactions", e);
    }
  }, [username]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const { totalBalance, totalIncome, totalExpenses } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expenses += t.amount;
      }
    });
    return {
      totalBalance: income - expenses,
      totalIncome: income,
      totalExpenses: expenses,
    };
  }, [transactions]);
  
  const handleAddTransaction = (e: FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) {
        alert("Please fill all fields.");
        return;
    }
    const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        description,
        amount: parseFloat(amount),
        type,
        category,
        date,
    };
    const updatedTransactions = [newTransaction, ...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);

    // Reset form
    setDescription('');
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setType('expense');
  };

  const handleDeleteTransaction = (id: string) => {
    if(window.confirm("Are you sure you want to delete this transaction?")) {
        const updatedTransactions = transactions.filter(t => t.id !== id);
        setTransactions(updatedTransactions);
        saveTransactions(updatedTransactions);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <WalletIcon className="w-8 h-8 text-primary-600"/>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">FinTrack</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 dark:text-gray-300 hidden sm:block">Welcome, <span className="font-semibold">{username}</span>!</span>
          <button onClick={onLogout} className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <LogoutIcon className="w-5 h-5"/>
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard title="Total Balance" amount={totalBalance} icon={<WalletIcon className="w-6 h-6 text-white"/>} colorClass="bg-primary-500" />
          <SummaryCard title="Total Income" amount={totalIncome} icon={<ArrowUpCircleIcon className="w-6 h-6 text-white"/>} colorClass="bg-emerald-500" />
          <SummaryCard title="Total Expenses" amount={totalExpenses} icon={<ArrowDownCircleIcon className="w-6 h-6 text-white"/>} colorClass="bg-rose-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form and Chart */}
          <div className="lg:col-span-1 space-y-8">
            {/* Transaction Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center"><PlusIcon className="w-6 h-6 mr-2"/>Add Transaction</h2>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                 <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setType('income')} className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 ${type === 'income' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-gray-300 dark:border-gray-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'}`}>Income</button>
                        <button type="button" onClick={() => setType('expense')} className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 ${type === 'expense' ? 'bg-rose-500 border-rose-500 text-white' : 'bg-transparent border-gray-300 dark:border-gray-600 hover:bg-rose-100 dark:hover:bg-rose-900/50'}`}>Expense</button>
                    </div>
                 </div>
                 <div className="relative">
                    <label htmlFor="description" className="sr-only">Description</label>
                    <input id="description" value={description} onChange={e => setDescription(e.target.value)} type="text" placeholder="Description" className="pl-10 w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg py-2 focus:ring-primary-500 focus:border-primary-500"/>
                    <TagIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                </div>
                <div className="relative">
                    <label htmlFor="amount" className="sr-only">Amount</label>
                    <input id="amount" value={amount} onChange={e => setAmount(e.target.value)} type="number" step="0.01" placeholder="0.00" className="pl-10 w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg py-2 focus:ring-primary-500 focus:border-primary-500"/>
                    <CurrencyDollarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                </div>
                 <div className="relative">
                    <label htmlFor="category" className="sr-only">Category</label>
                    <input id="category" list="categories" value={category} onChange={e => setCategory(e.target.value)} type="text" placeholder="Category" className="pl-10 w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg py-2 focus:ring-primary-500 focus:border-primary-500"/>
                     <datalist id="categories">
                        {defaultCategories.map(cat => <option key={cat} value={cat} />)}
                    </datalist>
                    <ChartPieIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                </div>
                <div className="relative">
                     <label htmlFor="date" className="sr-only">Date</label>
                    <input id="date" value={date} onChange={e => setDate(e.target.value)} type="date" className="pl-10 w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg py-2 focus:ring-primary-500 focus:border-primary-500"/>
                    <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                </div>
                <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-all transform hover:scale-105 shadow-md">Add Transaction</button>
              </form>
            </div>
            {/* Expense Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center"><ChartPieIcon className="w-6 h-6 mr-2"/>Expense Breakdown</h2>
                <div className="h-64">
                    <ExpensesChart transactions={transactions} />
                </div>
            </div>
          </div>
          {/* Right Column: Transaction List */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
             <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Recent Transactions</h2>
             {transactions.length > 0 ? (
                <ul className="max-h-[80vh] overflow-y-auto pr-2">
                    {transactions.map(t => <TransactionItem key={t.id} transaction={t} onDelete={handleDeleteTransaction}/>)}
                </ul>
             ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500 dark:text-gray-400">No transactions yet.</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">Add one to get started!</p>
                </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
