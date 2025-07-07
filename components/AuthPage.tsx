
import React, { useState, FormEvent } from 'react';
import { User } from '../types';
import { WalletIcon } from './Icons';

interface AuthPageProps {
  onLoginSuccess: (username: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getUsers = (): User[] => {
    try {
      const usersJson = localStorage.getItem('finTrackUsers');
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (e) {
      console.error("Failed to parse users from localStorage", e);
      return [];
    }
  };

  const saveUsers = (users: User[]) => {
    try {
      localStorage.setItem('finTrackUsers', JSON.stringify(users));
    } catch (e) {
      console.error("Failed to save users to localStorage", e);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('Username and password cannot be empty.');
      return;
    }

    const users = getUsers();
    if (users.find(user => user.username.toLowerCase() === username.toLowerCase())) {
      setError('Username already exists. Please choose another one.');
      return;
    }

    const newUser: User = {
      username,
      passwordHash: password, // In a real app, hash this password!
      transactions: []
    };

    saveUsers([...users, newUser]);
    onLoginSuccess(username);
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }

    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (user && user.passwordHash === password) {
      onLoginSuccess(user.username);
    } else {
      setError('Invalid username or password.');
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError(null);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <WalletIcon className="w-16 h-16 mx-auto text-primary-600" />
          <h1 className="mt-4 text-4xl font-bold text-gray-800 dark:text-white">FinTrack</h1>
          <p className="text-gray-600 dark:text-gray-400">Your personal finance journey starts here.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
            {isLoginView ? 'Welcome Back!' : 'Create Your Account'}
          </h2>

          {error && <p className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-center">{error}</p>}

          <form onSubmit={isLoginView ? handleLogin : handleRegister}>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLoginView ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-transform transform hover:scale-105"
              >
                {isLoginView ? 'Sign In' : 'Register'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button onClick={toggleView} className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              {isLoginView ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
