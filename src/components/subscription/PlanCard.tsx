import React from 'react';
import { SubscriptionPlan } from '@/types/subscription.type';

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSelect: (planId: string) => void;
  loading?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({ 
  plan, 
  isCurrentPlan = false, 
  onSelect, 
  loading = false 
}) => {
  const formatFeature = (key: string, value: unknown) => {
    switch (key) {
      case 'dailyRideLimit':
        return typeof value === 'number' && value === -1 ? 'Unlimited daily rides' : `${value} rides per day`;
      case 'maxRideTimeMinutes':
        return typeof value === 'number' && value === -1 ? 'Unlimited ride time' : `${value} minutes max per ride`;
      case 'unlimitedUnlocks':
        return value ? 'Unlimited bike unlocks' : 'Standard unlocks';
      case 'premiumBikes':
        return value ? 'Access to premium bikes' : 'Standard bikes only';
      case 'prioritySupport':
        return value ? '24/7 priority support' : 'Standard support';
      case 'discountRate':
        return typeof value === 'number' && value > 0 ? `${value}% discount on extra time` : 'No extra discounts';
      default:
        return String(value);
    }
  };

  return (
    <div className={`relative bg-white rounded-lg shadow-lg p-6 border-2 transition-all duration-200 ${
      isCurrentPlan 
        ? 'border-green-500 bg-green-50' 
        : plan.isPopular 
        ? 'border-cyan-500' 
        : 'border-gray-200 hover:border-cyan-300'
    }`}>
      {plan.isPopular && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-cyan-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Current Plan
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="text-4xl font-bold text-cyan-600 mb-1">
          ${plan.price}
        </div>
        <div className="text-gray-600 text-sm">per month</div>
      </div>

      <div className="space-y-3 mb-6">
        {Object.entries(plan.features).map(([key, value]) => (
          <div key={key} className="flex items-center text-sm">
            <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">{formatFeature(key, value)}</span>
          </div>
        ))}
      </div>

      <p className="text-gray-600 text-sm text-center mb-6">{plan.description}</p>

      <button
        onClick={() => onSelect(plan.id)}
        disabled={isCurrentPlan || loading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isCurrentPlan
            ? 'bg-green-100 text-green-700 cursor-not-allowed'
            : 'bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-50'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Processing...
          </div>
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : (
          'Select Plan'
        )}
      </button>
    </div>
  );
};