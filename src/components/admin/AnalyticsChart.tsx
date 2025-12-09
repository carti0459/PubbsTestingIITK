import React from 'react';
import { AnalyticsData } from '@/types/admin.type';

interface AnalyticsChartProps {
  analytics: AnalyticsData;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ analytics }) => {
  const maxRides = Math.max(...analytics.rideTrends.map(d => d.rides));
  const maxRevenue = Math.max(...analytics.rideTrends.map(d => d.revenue));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Analytics Overview</h3>
      
      {/* Ride Trends Chart */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-700 mb-4">Ride Trends (Last 7 Days)</h4>
        <div className="space-y-3">
          {analytics.rideTrends.map((day) => (
            <div key={day.date} className="flex items-center space-x-4">
              <div className="w-16 text-sm text-gray-600">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(day.rides / maxRides) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">{day.rides}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">${day.revenue.toFixed(0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span className="text-gray-600">Rides</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-gray-600">Revenue</span>
          </div>
        </div>
      </div>

      {/* Popular Routes */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-700 mb-4">Popular Routes</h4>
        <div className="space-y-3">
          {analytics.popularRoutes.map((route, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {route.startArea} → {route.endArea}
                </div>
                <div className="text-sm text-gray-600">
                  {route.averageDistance.toFixed(1)}km average
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">{route.count}</div>
                <div className="text-xs text-gray-500">rides</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bike Utilization */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-700 mb-4">Top Performing Bikes</h4>
        <div className="space-y-3">
          {analytics.bikeUtilization.slice(0, 5).map((bike) => (
            <div key={bike.bikeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{bike.bikeId}</div>
                <div className="text-sm text-gray-600">{bike.totalRides} rides</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">${bike.revenue.toFixed(2)}</div>
                <div className="text-xs text-gray-500">{bike.utilization}% utilization</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Segments */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-4">User Segments</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics.userSegments.map((segment) => (
            <div key={segment.segment} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{segment.count}</div>
              <div className="text-sm font-medium text-gray-900 mb-1">{segment.segment}</div>
              <div className="text-xs text-gray-600">
                ${segment.revenue.toFixed(2)} revenue
              </div>
              <div className="text-xs text-gray-600">
                {segment.averageRides.toFixed(1)} avg rides
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};