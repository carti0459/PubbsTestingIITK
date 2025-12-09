"use client";

import React, { useEffect, useState } from 'react';
import { useBikes } from '@/hooks';
import { BikesGrid } from '@/components/bikes';

const BikesPage = () => {
  const [selectedOperator, setSelectedOperator] = useState('IITKgpCampus');
  const {
    bikes,
    loading,
    error,
    subscribeToBikes,
    updateBikeStatus,
    updateBikeLocation
  } = useBikes();

  useEffect(() => {
    const unsubscribe = subscribeToBikes(selectedOperator);
    return unsubscribe;
  }, [selectedOperator, subscribeToBikes]);

  const handleStatusChange = async (bikeId: string, status: string) => {
    const success = await updateBikeStatus(selectedOperator, bikeId, status);
    if (!success) {
      alert('Failed to update bike status');
    }
  };

  const handleLocationUpdate = async (bikeId: string, lat: number, lng: number) => {
    const success = await updateBikeLocation(selectedOperator, bikeId, lat, lng);
    if (!success) {
      alert('Failed to update bike location');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Bike Management</h1>
              <p className="text-sm text-gray-600">Monitor and manage all bikes in the system</p>
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
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <BikesGrid
          bikes={bikes}
          onStatusChange={handleStatusChange}
          onLocationUpdate={handleLocationUpdate}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default BikesPage;