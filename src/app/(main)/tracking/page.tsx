"use client";

import React, { useState, useEffect } from 'react';
import { useRealTimeTracking } from '@/hooks/useRealTimeTracking';
import LiveTrackingMap from '@/components/tracking/LiveTrackingMap';

const TrackingPage = () => {
  const [selectedOperator, setSelectedOperator] = useState('IITKgpCampus');
  const {
    trackingState,
    activeTracks,
    subscribeToActiveTracks,
    startBikeRideTracking,
    stopBikeRideTracking
  } = useRealTimeTracking();

  useEffect(() => {
    const unsubscribe = subscribeToActiveTracks(selectedOperator);
    return unsubscribe;
  }, [selectedOperator, subscribeToActiveTracks]);

  const handleStartRide = async (bikeId: string) => {
    const userId = 'current-user';
    const success = await startBikeRideTracking(selectedOperator, bikeId, userId);
    if (success) {
      alert('Ride tracking started!');
    } else {
      alert('Failed to start ride tracking');
    }
  };

  const handleStopRide = async (bikeId: string) => {
    const success = await stopBikeRideTracking(selectedOperator, bikeId);
    if (success) {
      alert('Ride tracking stopped!');
    } else {
      alert('Failed to stop ride tracking');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Real-time Tracking</h1>
              <p className="text-sm text-gray-600">Monitor live bike locations and active rides</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="IITKgpCampus">IIT Kharagpur Campus</option>
                <option value="TestOperator">Test Operator</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Map - Takes 2/3 of space */}
          <div className="lg:col-span-2">
            <LiveTrackingMap 
              operator={selectedOperator}
              height="600px"
            />
          </div>

          {/* Sidebar - Active Rides */}
          <div className="space-y-6">
            {/* Active Rides List */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">Active Rides</h3>
              
              {activeTracks.filter(track => track.isActive).length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <p>No active rides</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeTracks.filter(track => track.isActive).map((track) => (
                    <div key={track.bikeId} className="p-3 bg-gray-50 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">Bike {track.bikeId}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(track.startTime).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>User: {track.userId}</div>
                        <div>
                          Location: {track.currentLocation.latitude.toFixed(4)}, {track.currentLocation.longitude.toFixed(4)}
                        </div>
                        <div>Updates: {track.path.length}</div>
                      </div>
                      
                      <button
                        onClick={() => handleStopRide(track.bikeId)}
                        className="mt-2 w-full px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        End Ride
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleStartRide('TEST001')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Start Test Ride (Bike TEST001)
                </button>
                
                <button
                  onClick={() => handleStartRide('TEST002')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Start Test Ride (Bike TEST002)
                </button>
              </div>
            </div>

            {/* User Location Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">Your Location</h3>
              
              {trackingState.isTracking ? (
                <div className="space-y-2">
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm">Tracking active</span>
                  </div>
                  
                  {trackingState.currentPosition && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        Lat: {trackingState.currentPosition.coords.latitude.toFixed(6)}
                      </div>
                      <div>
                        Lng: {trackingState.currentPosition.coords.longitude.toFixed(6)}
                      </div>
                      <div>
                        Accuracy: {trackingState.currentPosition.coords.accuracy?.toFixed(0)}m
                      </div>
                      <div>
                        Updates: {trackingState.trackingHistory.length}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm">Location tracking disabled</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;