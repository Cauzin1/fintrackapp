
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string; // ISO string format
  category: string;
}

export interface User {
  username: string;
  passwordHash: string; // For this demo, it's a plain password. In production, use a real hash.
  transactions: Transaction[];
}
