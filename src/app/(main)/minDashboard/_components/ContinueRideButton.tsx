'use client'

import React from 'react'

interface ContinueRideButtonProps {
  onContinueClick: () => void
}

const ContinueRideButton: React.FC<ContinueRideButtonProps> = ({ onContinueClick }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onContinueClick}
        className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
        aria-label="Continue your ride"
      >
        <div className="flex items-center space-x-2">
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 16h6m-7 4h8a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <span className="font-medium">Continue Ride</span>
        </div>
        
        {/* Pulsing indicator */}
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </button>
    </div>
  )
}

export default ContinueRideButton