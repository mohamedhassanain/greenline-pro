import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Bot,
  CalendarDays,
  Home,
  Leaf,
  Settings,
  Shield,
  LogOut,
  User
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthContext } from './AuthProvider';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Suppliers', href: '/suppliers', icon: Users },
  { name: 'Tasks', href: '/communication', icon: MessageSquare },
  { name: 'Agent AI', href: '/reports', icon: Bot },
  { name: 'Agenda', href: '/agenda', icon: CalendarDays },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuthContext();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      alert('Erreur lors de la déconnexion. Veuillez réessayer.');
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">GreenLine Pro</h1>
            <p className="text-sm text-gray-500">Production Management</p>
          </div>
        </div>
      </div>
      
      <nav className="px-3 flex-1">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
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
      <div className="px-3 py-4 border-t border-gray-200 mt-auto">
        
        {/* User Profile */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-3">
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
        </div>
        
        {/* Profile Link */}
        <Link 
          to="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full mb-2"
        >
          <User className="w-5 h-5" />
          Mon Profil
        </Link>
        
        {/* Logout Button */}
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Se Déconnecter
        </button>
      </div>
    </div>
  );
}