import React from 'react';
import { EnhancedSubscriptionInfo, SubscriptionLimits } from '@/types/subscription.type';

interface SubscriptionStatusProps {
  subscriptionInfo: EnhancedSubscriptionInfo;
  subscriptionLimits: SubscriptionLimits | null;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  subscriptionInfo,
  subscriptionLimits
}) => {
  const formatTimeUntilReset = (resetTime: number) => {
    const now = Date.now();
    const diff = resetTime - now;
    
    if (diff <= 0) return 'Resetting now...';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getStatusColor = (isActive: boolean, remainingDays: number) => {
    if (!isActive) return 'text-red-600';
    if (remainingDays <= 3) return 'text-orange-600';
    return 'text-green-600';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  if (!subscriptionInfo.isActive) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">No Active Subscription</h3>
            <p className="text-gray-600">Subscribe to a plan to start riding bikes</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {subscriptionInfo.currentPlan?.name} Plan
          </h3>
          <p className={`text-sm font-medium ${getStatusColor(subscriptionInfo.isActive, subscriptionInfo.remainingDays)}`}>
            {subscriptionInfo.remainingDays > 0 
              ? `${subscriptionInfo.remainingDays} days remaining`
              : 'Expired'
            }
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            ${subscriptionInfo.currentPlan?.price}
          </div>
          <div className="text-xs text-gray-600">per month</div>
        </div>
      </div>

      {subscriptionLimits && (
        <div className="space-y-4">
          {/* Daily Rides Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Daily Rides</span>
              <span className="text-sm text-gray-600">
                {subscriptionInfo.usage.ridesUsedToday}
                {subscriptionLimits.dailyRideLimit === -1 
                  ? ' / Unlimited' 
                  : ` / ${subscriptionLimits.dailyRideLimit}`
                }
              </span>
            </div>
            {subscriptionLimits.dailyRideLimit !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getProgressBarColor(getUsagePercentage(subscriptionInfo.usage.ridesUsedToday, subscriptionLimits.dailyRideLimit))
                  }`}
                  style={{ 
                    width: `${getUsagePercentage(subscriptionInfo.usage.ridesUsedToday, subscriptionLimits.dailyRideLimit)}%` 
                  }}
                ></div>
              </div>
            )}
          </div>

          {/* Daily Time Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Daily Ride Time</span>
              <span className="text-sm text-gray-600">
                {subscriptionInfo.usage.totalRideTimeToday}m
                {subscriptionLimits.maxRideTimeMinutes === -1 
                  ? ' / Unlimited' 
                  : ` / ${subscriptionLimits.maxRideTimeMinutes}m`
                }
              </span>
            </div>
            {subscriptionLimits.maxRideTimeMinutes !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getProgressBarColor(getUsagePercentage(subscriptionInfo.usage.totalRideTimeToday, subscriptionLimits.maxRideTimeMinutes))
                  }`}
                  style={{ 
                    width: `${getUsagePercentage(subscriptionInfo.usage.totalRideTimeToday, subscriptionLimits.maxRideTimeMinutes)}%` 
                  }}
                ></div>
              </div>
            )}
          </div>

          {/* Reset Timer */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600">Usage resets in:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatTimeUntilReset(subscriptionInfo.nextResetTime)}
            </span>
          </div>

          {/* Ride Status */}
          <div className="flex items-center space-x-2 pt-2">
            <div className={`w-3 h-3 rounded-full ${
              subscriptionInfo.canRideNow ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              subscriptionInfo.canRideNow ? 'text-green-700' : 'text-red-700'
            }`}>
              {subscriptionInfo.canRideNow 
                ? 'Ready to ride' 
                : subscriptionLimits.isAtDailyLimit
                ? 'Daily ride limit reached'
                : 'Daily time limit reached'
              }
            </span>
          </div>
        </div>
      )}

      {/* Monthly Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">This Month</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-cyan-600">{subscriptionInfo.usage.totalRidesThisMonth}</div>
            <div className="text-xs text-gray-600">Total Rides</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">
              {Math.floor(subscriptionInfo.usage.totalRideTimeThisMonth / 60)}h {subscriptionInfo.usage.totalRideTimeThisMonth % 60}m
            </div>
            <div className="text-xs text-gray-600">Total Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};