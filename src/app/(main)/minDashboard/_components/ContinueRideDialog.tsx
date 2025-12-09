'use client'

import React from 'react'

interface ContinueRideDialogProps {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
  rideData: {
    bookingId?: string
    rideId?: string
    tripData?: {
      sourceStationName?: string
      [key: string]: unknown
    }
  } | null
}

const ContinueRideDialog: React.FC<ContinueRideDialogProps> = ({
  isOpen,
  onClose,
  onContinue,
  rideData
}) => {
  if (!isOpen || !rideData) return null

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome Back!
          </h3>
          <p className="text-gray-600 text-sm">
            You have an unfinished ride from your previous session. Your bike has been safely put on hold.
          </p>
        </div>

        {/* Ride Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Booking ID</span>
            <span className="text-gray-900 font-mono text-sm">{rideData.bookingId || "N/A"}</span>
          </div>
          {rideData.tripData?.sourceStationName && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Station</span>
              <span className="text-gray-900 text-sm">{rideData.tripData.sourceStationName}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Status</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              🔸 On Hold
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Start New Ride
          </button>
          <button
            onClick={onContinue}
            className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Continue Ride
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContinueRideDialog