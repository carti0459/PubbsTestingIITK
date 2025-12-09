import React from 'react';
import { SystemMetrics } from '@/types/admin.type';

interface MetricsGridProps {
  metrics: SystemMetrics;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  
  const formatUptime = (uptime: number) => `${uptime.toFixed(1)}%`;
  
  const getStatusColor = (current: number, total: number, type: 'bikes' | 'users' | 'revenue') => {
    const percentage = (current / total) * 100;
    
    switch (type) {
      case 'bikes':
        if (percentage > 80) return 'text-green-600';
        if (percentage > 60) return 'text-yellow-600';
        return 'text-red-600';
      case 'users':
        if (percentage > 20) return 'text-green-600';
        if (percentage > 10) return 'text-yellow-600';
        return 'text-red-600';
      case 'revenue':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const metricCards = [
    {
      title: 'Total Bikes',
      value: metrics.totalBikes,
      subtitle: `${metrics.availableBikes} available`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      color: 'bg-blue-500',
      textColor: getStatusColor(metrics.availableBikes, metrics.totalBikes, 'bikes')
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers,
      subtitle: `${metrics.totalUsers} total users`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'bg-green-500',
      textColor: getStatusColor(metrics.activeUsers, metrics.totalUsers, 'users')
    },
    {
      title: 'Active Rides',
      value: metrics.activeRides,
      subtitle: `${metrics.completedRidesToday} completed today`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      subtitle: `${formatCurrency(metrics.revenueToday)} today`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-500',
      textColor: getStatusColor(metrics.revenueToday, 100, 'revenue')
    },
    {
      title: 'Avg Ride Time',
      value: `${metrics.averageRideDuration}m`,
      subtitle: `${metrics.totalRides} total rides`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'System Uptime',
      value: formatUptime(metrics.systemUptime),
      subtitle: 'Last 30 days',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-indigo-500',
      textColor: metrics.systemUptime > 99 ? 'text-green-600' : 'text-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className={`${card.color} text-white p-3 rounded-lg mr-4`}>
              {card.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {card.title}
              </h3>
              <div className={`text-2xl font-bold ${card.textColor} mt-1`}>
                {card.value}
              </div>
              <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};