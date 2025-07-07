
import React, { useState, useEffect, useCallback } from 'react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('finTrackCurrentUser');
      if (storedUser) {
        setCurrentUser(storedUser);
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = useCallback((username: string) => {
    try {
      localStorage.setItem('finTrackCurrentUser', username);
      setCurrentUser(username);
    } catch (error) {
      console.error("Failed to write to localStorage", error);
    }
  }, []);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('finTrackCurrentUser');
      setCurrentUser(null);
    } catch (error) {
      console.error("Failed to remove from localStorage", error);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-800 dark:text-gray-200">
      {currentUser ? (
        <Dashboard username={currentUser} onLogout={handleLogout} />
      ) : (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default App;
