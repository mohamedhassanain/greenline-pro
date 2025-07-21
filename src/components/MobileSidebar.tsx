import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  FileText,
  Plane,
  Home,
  Leaf,
  Menu,
  X,
  Settings,
  Bell,
  LogOut,
  User,
  Shield
} from 'lucide-react';
import clsx from 'clsx';
import { usePWA } from '../hooks/usePWA';
import { useAuthContext } from './AuthProvider';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Suppliers', href: '/suppliers', icon: Users },
  { name: 'Tasks', href: '/communication', icon: MessageSquare },
  { name: 'Agent AI', href: '/reports', icon: FileText },
  { name: 'Export', href: '/export', icon: Plane },
];

export default function MobileSidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { requestNotificationPermission, showNotification } = usePWA();
  const { user, signOut } = useAuthContext();

  const handleNotificationTest = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      showNotification('GreenLine Pro', {
        body: 'Notifications are now enabled!',
        tag: 'test-notification'
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };
  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">GreenLine Pro</h1>
          </div>
        </div>

        <button
          onClick={handleNotificationTest}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GreenLine Pro</h1>
                <p className="text-sm text-gray-500">Production Management</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className="px-3 py-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-500'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.user_metadata?.full_name || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <Link 
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full"
          >
            <User className="w-5 h-5" />
            Mon Profil
          </Link>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Se Déconnecter
          </button>
        </div>
      </div>
    </>
  );
}