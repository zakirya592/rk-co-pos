
import React from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Layout /> : <Login />;
}

function App() {
  return (
    <NextUIProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NextUIProvider>
  );
}

export default App;
