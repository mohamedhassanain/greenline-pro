import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface TouchOptimizedCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  color: 'emerald' | 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  onClick?: () => void;
  className?: string;
}

export default function TouchOptimizedCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
  onClick,
  className 
}: TouchOptimizedCardProps) {
  const isPositive = change?.startsWith('+');
  
  return (
    <div 
      className={clsx(
        'bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:border-emerald-200 active:scale-95 touch-manipulation select-none',
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 truncate">{title}</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={clsx(
              'text-sm font-medium mt-1',
              isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {change}
            </p>
          )}
        </div>
        <div className={clsx(
          'p-3 rounded-full ml-3 flex-shrink-0',
          color === 'emerald' && 'bg-emerald-100',
          color === 'blue' && 'bg-blue-100',
          color === 'green' && 'bg-green-100',
          color === 'red' && 'bg-red-100',
          color === 'yellow' && 'bg-yellow-100',
          color === 'purple' && 'bg-purple-100'
        )}>
          <Icon className={clsx(
            'w-6 h-6',
            color === 'emerald' && 'text-emerald-600',
            color === 'blue' && 'text-blue-600',
            color === 'green' && 'text-green-600',
            color === 'red' && 'text-red-600',
            color === 'yellow' && 'text-yellow-600',
            color === 'purple' && 'text-purple-600'
          )} />
        </div>
      </div>
    </div>
  );
}