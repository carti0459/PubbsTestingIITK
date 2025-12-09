import React from 'react';
import { Bike } from '@/hooks/useBikes';

interface BikeCardProps {
  bike: Bike;
  onStatusChange: (bikeId: string, status: string) => void;
  onLocationUpdate: (bikeId: string, lat: number, lng: number) => void;
}

const BikeCard: React.FC<BikeCardProps> = ({
  bike,
  onStatusChange,
  onLocationUpdate
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(bike.id, newStatus);
  };

  const handleLocationSync = () => {
    // Simulate getting current location (in real app would use GPS)
    const lat = bike.coordinates.lat + (Math.random() - 0.5) * 0.001;
    const lng = bike.coordinates.lng + (Math.random() - 0.5) * 0.001;
    onLocationUpdate(bike.id, lat, lng);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-gray-900">{bike.deviceName || bike.id}</h3>
          <p className="text-sm text-gray-500">Type: {bike.type}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bike.status)}`}>
          {bike.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Station:</span>
          <span className="text-sm font-medium">{bike.inStationId || 'Not assigned'}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Battery:</span>
          <span className={`text-sm font-medium ${getBatteryColor(bike.batteryLevel || 0)}`}>
            {bike.batteryLevel || 0}%
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Location:</span>
          <span className="text-xs text-gray-500">
            {bike.coordinates.lat.toFixed(4)}, {bike.coordinates.lng.toFixed(4)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Last Updated:</span>
          <span className="text-xs text-gray-500">
            {new Date(bike.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <select
            value={bike.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="busy">Busy</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button
            onClick={handleLocationSync}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sync Location
          </button>
        </div>

        {bike.status === 'maintenance' && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            ⚠️ Bike requires maintenance attention
          </div>
        )}

        {bike.status === 'busy' && (
          <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
            🚴 Bike is currently in use
          </div>
        )}
      </div>
    </div>
  );
};

export default BikeCard;