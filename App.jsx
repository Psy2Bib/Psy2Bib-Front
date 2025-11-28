import React from 'react';
import { CryptoProvider } from './contexts/CryptoContext';
import useAuth from './hooks/useAuth';
import LoginPage from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';

const App = () => {
  const { user, isAuthenticated, isLoading, login, logout, updateUser } = useAuth();

  // Afficher un loader pendant la vérification de l'auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <CryptoProvider>
      <div className="App">
        {!isAuthenticated ? (
          <LoginPage onLogin={login} />
        ) : (
          <Dashboard 
            user={user} 
            onLogout={logout}
            onUpdateUser={updateUser}
          />
        )}
      </div>
    </CryptoProvider>
  );
};

export default App;