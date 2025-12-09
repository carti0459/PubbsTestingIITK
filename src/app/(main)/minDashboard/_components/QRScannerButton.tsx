"use client";

import React from "react";

interface QRScannerButtonProps {
  onScanClick: () => void;
  className?: string;
}

export const QRScannerButton: React.FC<QRScannerButtonProps> = ({
  onScanClick,
  // className = "",
}) => {
  return (
    <>
      <div className="md:hidden absolute bottom-18 left-4 right-4 z-20">
        <button
          onClick={onScanClick}
          className="w-full bg-cyan-400 text-white py-4 rounded-lg font-medium text-center flex items-center justify-center space-x-2 hover:bg-cyan-500 transition-colors shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" 
            />
          </svg>
          <span>Scan QR to Unlock Bike</span>
        </button>
      </div>
      
      <div className="hidden md:block absolute bottom-4 right-4 z-20">
        <button
          onClick={onScanClick}
          className="bg-cyan-400 text-white px-4 py-3 rounded-lg font-medium text-sm flex items-center space-x-2 hover:bg-cyan-500 transition-colors shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" 
            />
          </svg>
          <span>Scan QR</span>
        </button>
      </div>
    </>
  );
};