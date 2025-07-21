import React, { useState } from 'react';
import { Bell, X, Clock, Package, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, removeNotification } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    if (notification.type === 'urgent' && notification.message.includes('Commande')) {
      navigate('/orders');
    } else if (notification.type === 'warning' && notification.message.includes('stock')) {
      navigate('/inventory');
    }
    removeNotification(notification.id);
  };

  // Choix de l'icône selon le type
  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  // Couleur selon le type
  const getColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-600';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-600';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg"
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucune notification</div>
            ) : notifications.map((notification) => (
              <div 
                key={notification.id} 
                className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${getColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {notification.timestamp ? new Date(notification.timestamp).toLocaleString() : ''}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="text-xs text-emerald-600 hover:text-emerald-800 mt-1"
                    >
                      Marquer comme lue
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}