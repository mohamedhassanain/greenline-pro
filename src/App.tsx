import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './components/AuthProvider';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import Sidebar from './components/Sidebar';
import MobileSidebar from './components/MobileSidebar';
import MobileNavigation from './components/MobileNavigation';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Agenda from './pages/Agenda';
import { NotificationProvider } from './contexts/NotificationContext';

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

function AuthenticatedApp() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar */}
      <MobileSidebar />
      
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/communication" element={<Tasks />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}

function AuthWrapper() {
  console.log('AuthWrapper: Component rendering');
  const { user, loading, error } = useAuthContext();
  const [isSignUp, setIsSignUp] = React.useState(false);

  React.useEffect(() => {
    console.log('AuthWrapper: Auth state changed', { 
      loading, 
      hasUser: !!user, 
      userEmail: user?.email,
      error: error?.message 
    });
  }, [user, loading, error]);

  if (loading) {
    console.log('AuthWrapper: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading GreenLine Pro...</p>
          {error && (
            <p className="text-red-500 text-sm mt-2">
              Error: {error.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return isSignUp ? (
      <SignUpForm onToggleMode={() => setIsSignUp(false)} />
    ) : (
      <LoginForm onToggleMode={() => setIsSignUp(true)} />
    );
  }

  return <AuthenticatedApp />;
}

function App() {
  console.log('App: Rendering App component');
  
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <div className="debug-app">
            <p>App component is rendering</p>
            <AuthWrapper />
          </div>
          <PWAInstallPrompt />
          <OfflineIndicator />
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;