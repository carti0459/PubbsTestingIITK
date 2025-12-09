"use client";

import React from "react";

interface SubscriptionOverlayProps {
  hasActiveSubscription: boolean;
  onBuyPlan: () => void;
}

export const SubscriptionOverlay: React.FC<SubscriptionOverlayProps> = ({
  hasActiveSubscription,
  onBuyPlan,
}) => {
  if (hasActiveSubscription) return null;

  return (
    <>
      {/* Mobile - Full width overlay */}
      <div className="md:hidden absolute top-4 left-4 right-4 z-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-red-700 text-sm mb-3">
                You don&apos;t have an active subscription. Please subscribe to continue.
              </p>
              <button
                onClick={onBuyPlan}
                className="bg-cyan-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-500 transition-colors"
              >
                Buy Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop - Position below station selector on left side */}
      <div className="hidden md:block absolute top-10 right-4 z-10 w-80">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-red-700 text-sm mb-3">
                You don&apos;t have an active subscription. Please subscribe to continue.
              </p>
              <button
                onClick={onBuyPlan}
                className="bg-cyan-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-500 transition-colors"
              >
                Buy Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionOverlay;