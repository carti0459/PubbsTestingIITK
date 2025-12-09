import React, { useState, useMemo } from 'react';
import { Bike } from '@/hooks/useBikes';
import BikeCard from './BikeCard';

interface BikesGridProps {
  bikes: Bike[];
  onStatusChange: (bikeId: string, status: string) => void;
  onLocationUpdate: (bikeId: string, lat: number, lng: number) => void;
  loading?: boolean;
}

const BikesGrid: React.FC<BikesGridProps> = ({
  bikes,
  onStatusChange,
  onLocationUpdate,
  loading = false
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStation, setFilterStation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deviceName' | 'status' | 'lastUpdated' | 'batteryLevel'>('deviceName');

  const stations = useMemo(() => {
    const stationSet = new Set(bikes.map(bike => bike.inStationId).filter(Boolean));
    return Array.from(stationSet).sort();
  }, [bikes]);

  const filteredAndSortedBikes = useMemo(() => {
    let filtered = bikes;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(bike => bike.status === filterStatus);
    }

    // Filter by station
    if (filterStation !== 'all') {
      filtered = filtered.filter(bike => bike.inStationId === filterStation);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deviceName':
          return (a.deviceName || a.id).localeCompare(b.deviceName || b.id);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'lastUpdated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'batteryLevel':
          return (b.batteryLevel || 0) - (a.batteryLevel || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [bikes, filterStatus, filterStation, sortBy]);

  const statusCounts = useMemo(() => {
    return bikes.reduce((acc, bike) => {
      acc[bike.status] = (acc[bike.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [bikes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading bikes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-3">Bike Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts.active || 0}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.busy || 0}</div>
            <div className="text-sm text-gray-600">Busy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{statusCounts.maintenance || 0}</div>
            <div className="text-sm text-gray-600">Maintenance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{statusCounts.inactive || 0}</div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="busy">Busy</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Station
            </label>
            <select
              value={filterStation}
              onChange={(e) => setFilterStation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stations</option>
              {stations.map(station => (
                <option key={station} value={station}>{station}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'deviceName' | 'status' | 'lastUpdated' | 'batteryLevel')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="deviceName">Device Name</option>
              <option value="status">Status</option>
              <option value="lastUpdated">Last Updated</option>
              <option value="batteryLevel">Battery Level</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredAndSortedBikes.length} of {bikes.length} bikes
            </div>
          </div>
        </div>
      </div>

      {/* Bikes Grid */}
      {filteredAndSortedBikes.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">No bikes found matching the current filters.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedBikes.map((bike) => (
            <BikeCard
              key={bike.id}
              bike={bike}
              onStatusChange={onStatusChange}
              onLocationUpdate={onLocationUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BikesGrid;