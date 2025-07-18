import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';


import MainLayout from './components/shared/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import SendMailPage from './pages/SendEmailPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import Modals from './components/modals';
import { useAuthStore } from './stores/authStore';
import { LayoutDashboard } from 'lucide-react';

export default function App() {
  const { isAuthLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = checkAuth();
    return () => unsubscribe();
  }, [checkAuth]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <LayoutDashboard size={40} className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: '',
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      
      <Modals />

      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/send-mail" element={<SendMailPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}