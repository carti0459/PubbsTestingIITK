import React, { useState } from 'react';
import { useGeofencing } from '@/hooks/useGeofencing';
import { GeofenceArea } from '@/hooks/useGeofencing';

interface GeofenceManagerProps {
  operator: string;
  onGeofenceSelect?: (geofence: GeofenceArea) => void;
}

const GeofenceManager: React.FC<GeofenceManagerProps> = ({
  operator,
  onGeofenceSelect
}) => {
  const {
    geofences,
    loading,
    error,
    createGeofence,
    updateGeofence,
    deleteGeofence
  } = useGeofencing();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState<GeofenceArea | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    type: 'allowed' | 'forbidden' | 'station';
    lat: number;
    lng: number;
    radius: number;
    isActive: boolean;
  }>({
    name: '',
    type: 'allowed',
    lat: 22.3149,
    lng: 87.3105,
    radius: 100,
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGeofence) {
      // Update existing geofence
      const success = await updateGeofence(operator, editingGeofence.id, {
        name: formData.name,
        type: formData.type,
        coordinates: { lat: formData.lat, lng: formData.lng },
        radius: formData.radius,
        isActive: formData.isActive
      });
      
      if (success) {
        setEditingGeofence(null);
        resetForm();
      }
    } else {
      // Create new geofence
      const success = await createGeofence(operator, {
        name: formData.name,
        type: formData.type,
        coordinates: { lat: formData.lat, lng: formData.lng },
        radius: formData.radius,
        isActive: formData.isActive
      });
      
      if (success) {
        setShowCreateForm(false);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'allowed',
      lat: 22.3149,
      lng: 87.3105,
      radius: 100,
      isActive: true
    });
  };

  const handleEdit = (geofence: GeofenceArea) => {
    setEditingGeofence(geofence);
    
    // Handle both single coordinates and polygon coordinates
    const coordinates = Array.isArray(geofence.coordinates) 
      ? { lat: 0, lng: 0 } // Default for polygon (editing individual points not supported yet)
      : geofence.coordinates;
      
    setFormData({
      name: geofence.name,
      type: geofence.type,
      lat: coordinates.lat,
      lng: coordinates.lng,
      radius: geofence.radius || 100,
      isActive: geofence.isActive
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (geofenceId: string) => {
    if (confirm('Are you sure you want to delete this geofence?')) {
      await deleteGeofence(operator, geofenceId);
    }
  };

  const handleToggleActive = async (geofence: GeofenceArea) => {
    await updateGeofence(operator, geofence.id, {
      isActive: !geofence.isActive
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'allowed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'forbidden':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'station':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Geofences</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Geofence
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded">
          <h4 className="font-medium mb-3">
            {editingGeofence ? 'Edit Geofence' : 'Create New Geofence'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'allowed' | 'forbidden' | 'station' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="allowed">Allowed Area</option>
                <option value="forbidden">Forbidden Area</option>
                <option value="station">Station Area</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radius (meters)
              </label>
              <input
                type="number"
                value={formData.radius}
                onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="10"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingGeofence ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingGeofence(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Geofences List */}
      <div className="space-y-2">
        {geofences.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No geofences created yet
          </div>
        ) : (
          geofences.map((geofence) => (
            <div
              key={geofence.id}
              className="p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
              onClick={() => onGeofenceSelect?.(geofence)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{geofence.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(geofence.type)}`}>
                      {geofence.type}
                    </span>
                    {!geofence.isActive && (
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {Array.isArray(geofence.coordinates) ? (
                      `Polygon (${geofence.coordinates.length} points) • ${geofence.radius || 'N/A'}m`
                    ) : (
                      `${geofence.coordinates.lat.toFixed(4)}, ${geofence.coordinates.lng.toFixed(4)} • ${geofence.radius || 100}m`
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(geofence);
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      geofence.isActive 
                        ? 'bg-orange-600 text-white hover:bg-orange-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {geofence.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(geofence);
                    }}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(geofence.id);
                    }}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GeofenceManager;