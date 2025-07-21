import React, { useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export default function PWAInstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Smartphone className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">
            Install GreenLine Pro
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Get the full app experience with offline access and notifications
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={installApp}
              className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-emerald-600 transition-colors"
            >
              <Download className="w-3 h-3" />
              Install
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}