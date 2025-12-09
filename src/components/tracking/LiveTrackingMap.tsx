import React, { useEffect, useState } from 'react';
import { useRealTimeTracking } from '@/hooks/useRealTimeTracking';
import VisGoogleMap from '@/components/common/VisGoogleMap';

interface LiveTrackingMapProps {
  operator: string;
  height?: string;
  showControls?: boolean;
}

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  operator,
  height = "400px",
  showControls = true
}) => {
  const {
    trackingState,
    activeTracks,
    subscribeToActiveTracks,
    startTracking,
    stopTracking
  } = useRealTimeTracking();

  const [mapCenter, setMapCenter] = useState({ lat: 22.3149, lng: 87.3105 });
  const [showUserLocation, setShowUserLocation] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToActiveTracks(operator);
    return unsubscribe;
  }, [operator, subscribeToActiveTracks]);

  // Handle user location tracking
  const handleStartUserTracking = async () => {
    const userId = 'current-user';
    const success = await startTracking(userId);
    if (success) {
      setShowUserLocation(true);
    }
  };

  const handleStopUserTracking = () => {
    stopTracking();
    setShowUserLocation(false);
  };

  // Update map center when user location is available
  useEffect(() => {
    if (trackingState.currentPosition) {
      setMapCenter({
        lat: trackingState.currentPosition.coords.latitude,
        lng: trackingState.currentPosition.coords.longitude
      });
    }
  }, [trackingState.currentPosition]);

  // Prepare map locations including active bike tracks and user location
  const mapLocations = [
    // Active bike tracks
    ...activeTracks.filter(track => track.isActive).map(track => ({
      key: `bike-${track.bikeId}`,
      location: {
        lat: track.currentLocation.latitude,
        lng: track.currentLocation.longitude
      },
      title: `Bike ${track.bikeId}`,
      description: `Active ride by user ${track.userId}`,
      icon: 'bike',
      color: '#10B981' // Green for active bikes
    })),
    
    // User location if tracking
    ...(showUserLocation && trackingState.currentPosition ? [{
      key: 'user-location',
      location: {
        lat: trackingState.currentPosition.coords.latitude,
        lng: trackingState.currentPosition.coords.longitude
      },
      title: 'Your Location',
      description: `Accuracy: ${trackingState.currentPosition.coords.accuracy?.toFixed(0)}m`,
      icon: 'user',
      color: '#3B82F6'
    }] : [])
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Controls Header */}
      {showControls && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Live Tracking</h3>
              <p className="text-sm text-gray-600">
                {activeTracks.filter(t => t.isActive).length} active rides
                {trackingState.isTracking && ' • Your location is being tracked'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {!trackingState.isTracking ? (
                <button
                  onClick={handleStartUserTracking}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Track My Location
                </button>
              ) : (
                <button
                  onClick={handleStopUserTracking}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Stop Tracking
                </button>
              )}
              
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Active Bikes</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Your Location</span>
              </div>
            </div>
          </div>
          
          {trackingState.error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              {trackingState.error}
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div style={{ height }}>
        <VisGoogleMap
          center={mapCenter}
          zoom={15}
          height="100%"
          locations={mapLocations}
          className="w-full h-full"
        />
      </div>

      {/* Statistics */}
      {showControls && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {activeTracks.filter(t => t.isActive).length}
              </div>
              <div className="text-xs text-gray-600">Active Rides</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {trackingState.trackingHistory.length}
              </div>
              <div className="text-xs text-gray-600">Location Updates</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {trackingState.currentPosition?.coords.accuracy?.toFixed(0) || '0'}m
              </div>
              <div className="text-xs text-gray-600">GPS Accuracy</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {trackingState.isTracking ? 'ON' : 'OFF'}
              </div>
              <div className="text-xs text-gray-600">Tracking Status</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingMap;