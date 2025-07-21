import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  MessageSquare,
  FileText,
  Plane,
  MoreHorizontal
} from 'lucide-react';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Suppliers', href: '/suppliers', icon: Users },
];

export default function MobileNavigation() {
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-40">
      <div className="flex items-center justify-around">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-w-0',
                isActive
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}