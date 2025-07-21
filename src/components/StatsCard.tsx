import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: 'emerald' | 'blue' | 'green' | 'red';
}

export default function StatsCard({ title, value, change, icon: Icon, color }: StatsCardProps) {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className={clsx(
            'text-sm font-medium',
            isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {change} from last month
          </p>
        </div>
        <div className={clsx(
          'p-3 rounded-full',
          color === 'emerald' && 'bg-emerald-100',
          color === 'blue' && 'bg-blue-100',
          color === 'green' && 'bg-green-100',
          color === 'red' && 'bg-red-100'
        )}>
          <Icon className={clsx(
            'w-6 h-6',
            color === 'emerald' && 'text-emerald-600',
            color === 'blue' && 'text-blue-600',
            color === 'green' && 'text-green-600',
            color === 'red' && 'text-red-600'
          )} />
        </div>
      </div>
    </div>
  );
}