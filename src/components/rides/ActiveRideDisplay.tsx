import React, { useState } from 'react';
import { ActiveRideSession } from '@/types/ride.type';

interface ActiveRideDisplayProps {
  activeRide: ActiveRideSession;
  onEndRide: () => void;
  onCancelRide: () => void;
  pricing: {
    baseFare: number;
    timeChargePerMinute: number;
    distanceChargePerKm: number;
    currency: string;
  };
}

export const ActiveRideDisplay: React.FC<ActiveRideDisplayProps> = ({
  activeRide,
  onEndRide,
  onCancelRide,
  pricing
}) => {
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const formatDuration = (startTime: number) => {
    const durationMs = Date.now() - startTime;
    const minutes = Math.floor(durationMs / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold">Active Ride</h3>
        </div>
        <div className="text-sm opacity-90">{getCurrentTime()}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/20 rounded-lg p-3">
          <div className="text-sm opacity-90">Duration</div>
          <div className="text-xl font-bold">{formatDuration(activeRide.startTime)}</div>
        </div>
        
        <div className="bg-white/20 rounded-lg p-3">
          <div className="text-sm opacity-90">Distance</div>
          <div className="text-xl font-bold">{formatDistance(activeRide.distanceTraveled)}</div>
        </div>
        
        <div className="bg-white/20 rounded-lg p-3">
          <div className="text-sm opacity-90">Current Fare</div>
          <div className="text-xl font-bold">${activeRide.currentFare.toFixed(2)}</div>
        </div>
        
        <div className="bg-white/20 rounded-lg p-3">
          <div className="text-sm opacity-90">Est. Final</div>
          <div className="text-xl font-bold">${activeRide.estimatedEndFare.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <h4 className="font-medium mb-2">Pricing Breakdown</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Base fare:</span>
            <span>${pricing.baseFare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Time charge:</span>
            <span>${pricing.timeChargePerMinute.toFixed(2)}/min</span>
          </div>
          <div className="flex justify-between">
            <span>Distance charge:</span>
            <span>${pricing.distanceChargePerKm.toFixed(2)}/km</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setShowConfirmEnd(true)}
          className="flex-1 bg-white text-green-600 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          End Ride
        </button>
        
        <button
          onClick={() => setShowConfirmCancel(true)}
          className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          Cancel Ride
        </button>
      </div>

      {/* End Ride Confirmation */}
      {showConfirmEnd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">End Ride?</h3>
            <p className="text-gray-600 mb-4">
              Final fare will be ${activeRide.estimatedEndFare.toFixed(2)}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmEnd(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onEndRide();
                  setShowConfirmEnd(false);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                End Ride
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Ride Confirmation */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Ride?</h3>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. You may still be charged for the time used.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Keep Riding
              </button>
              <button
                onClick={() => {
                  onCancelRide();
                  setShowConfirmCancel(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Cancel Ride
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};