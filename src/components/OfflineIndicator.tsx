import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export default function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 text-center text-sm font-medium z-50">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>You're offline. Some features may be limited.</span>
      </div>
    </div>
  );
}