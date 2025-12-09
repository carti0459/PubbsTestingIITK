'use client'

import React from 'react'

interface SubscriptionWarningProps {
  isOpen: boolean
  onClose: () => void
  onBuyPlan: () => void
}

const SubscriptionWarning: React.FC<SubscriptionWarningProps> = ({
  isOpen,
  onClose,
  onBuyPlan
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-sm w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        {/* Warning Message */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Active Subscription
          </h3>
          <p className="text-gray-600 text-sm">
            You don&apos;t have an active subscription. Please subscribe to continue.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onBuyPlan}
            className="w-full bg-cyan-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors"
          >
            Buy Plan
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionWarning