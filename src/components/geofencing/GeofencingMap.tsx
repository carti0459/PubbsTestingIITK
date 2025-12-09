import React, { useEffect, useState } from 'react';
import { useGeofencing, GeofenceArea } from '@/hooks/useGeofencing';
import VisGoogleMap from '@/components/common/VisGoogleMap';

interface GeofencingMapProps {
  operator: string;
  height?: string;
  showControls?: boolean;
  onGeofenceClick?: (geofence: GeofenceArea) => void;
}

type FilterType = 'all' | 'allowed' | 'forbidden' | 'station';

interface MapMarker {
  key: string;
  location: {
    lat: number;
    lng: number;
  };
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  isPolygon?: boolean;
  onClick?: () => void;
}

const GeofencingMap: React.FC<GeofencingMapProps> = ({
  operator,
  height = "400px",
  showControls = true,
  onGeofenceClick
}) => {
  const {
    geofences,
    subscribeToGeofences,
    subscribeToViolations,
    getGeofencesByType,
    getUnresolvedViolations
  } = useGeofencing();

  const [mapCenter] = useState({ lat: 22.3149, lng: 87.3105 });
  const [showViolations, setShowViolations] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'allowed' | 'forbidden' | 'station'>('all');

  // Helper functions defined at the top to avoid hoisting issues
  const calculatePolygonCenter = (coordinates: Array<{lat: number; lng: number}>) => {
    const totalCoords = coordinates.length;
    const centerLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0) / totalCoords;
    const centerLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0) / totalCoords;
    return { lat: centerLat, lng: centerLng };
  };

  const getGeofenceDescription = (geofence: GeofenceArea) => {
    if (geofence.isPolygon && Array.isArray(geofence.coordinates)) {
      return `${geofence.type} area (polygon boundary)`;
    }
    return `${geofence.type} area • ${geofence.radius || 100}m radius`;
  };

  useEffect(() => {
    const unsubscribeGeofences = subscribeToGeofences(operator);
    const unsubscribeViolations = subscribeToViolations(operator);
    
    return () => {
      unsubscribeGeofences();
      unsubscribeViolations();
    };
  }, [operator, subscribeToGeofences, subscribeToViolations]);

  // Prepare map locations
  const mapLocations = [
    // Geofences as circles or polygons
    ...geofences
      .filter(geofence => 
        geofence.isActive && 
        (filterType === 'all' || geofence.type === filterType)
      )
      .map(geofence => {
        const getColor = (type: string) => {
          switch (type) {
            case 'allowed': return '#10B981'; // Green
            case 'forbidden': return '#EF4444'; // Red
            case 'station': return '#3B82F6'; // Blue
            default: return '#6B7280'; // Gray
          }
        };

        // Handle polygon geofences
        if (geofence.isPolygon && Array.isArray(geofence.coordinates)) {
          const center = calculatePolygonCenter(geofence.coordinates);
          return {
            key: `geofence-${geofence.id}`,
            location: center,
            title: geofence.name,
            description: getGeofenceDescription(geofence),
            color: getColor(geofence.type),
            opacity: geofence.type === 'allowed' ? 0.2 : 0.3,
            isPolygon: true,
            coordinates: geofence.coordinates,
            onClick: () => onGeofenceClick?.(geofence)
          };
        } else if (!Array.isArray(geofence.coordinates)) {
          // Handle circular geofences
          return {
            key: `geofence-${geofence.id}`,
            location: geofence.coordinates,
            title: geofence.name,
            description: getGeofenceDescription(geofence),
            radius: geofence.radius || 100,
            color: getColor(geofence.type),
            opacity: 0.3,
            isPolygon: false,
            onClick: () => onGeofenceClick?.(geofence)
          };
        }
        return null;
      })
      .filter(Boolean) as MapMarker[],
    
    // Recent violations as markers
    ...(showViolations ? getUnresolvedViolations().slice(0, 10).map(violation => ({
      key: `violation-${violation.id}`,
      location: violation.location,
      title: `Violation: ${violation.violationType.replace('_', ' ')}`,
      description: `Bike ${violation.bikeId} • ${violation.areaName} • ${new Date(violation.timestamp).toLocaleTimeString()}`,
      icon: 'warning',
      color: violation.violationType === 'enter_forbidden' ? '#EF4444' : '#F59E0B',
      radius: 20,
      isPolygon: false
    })) : [])
  ];

  const stats = {
    totalGeofences: geofences.length,
    activeGeofences: geofences.filter(g => g.isActive).length,
    allowedAreas: getGeofencesByType('allowed').length,
    forbiddenAreas: getGeofencesByType('forbidden').length,
    stationAreas: getGeofencesByType('station').length,
    unresolvedViolations: getUnresolvedViolations().length
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Controls Header */}
      {showControls && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium text-gray-900">Geofencing Map</h3>
              <p className="text-sm text-gray-600">
                {stats.activeGeofences} active geofences • {stats.unresolvedViolations} violations
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="allowed">Allowed Areas</option>
                <option value="forbidden">Forbidden Areas</option>
                <option value="station">Station Areas</option>
              </select>
              
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={showViolations}
                  onChange={(e) => setShowViolations(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                />
                Show Violations
              </label>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full opacity-50"></div>
              <span className="text-gray-600">Allowed Areas</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full opacity-50"></div>
              <span className="text-gray-600">Forbidden Areas</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full opacity-50"></div>
              <span className="text-gray-600">Station Areas</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600">Violations</span>
            </div>
          </div>
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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.totalGeofences}
              </div>
              <div className="text-xs text-gray-600">Total Geofences</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-green-600">
                {stats.allowedAreas}
              </div>
              <div className="text-xs text-gray-600">Allowed Areas</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-red-600">
                {stats.forbiddenAreas}
              </div>
              <div className="text-xs text-gray-600">Forbidden Areas</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {stats.stationAreas}
              </div>
              <div className="text-xs text-gray-600">Station Areas</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.activeGeofences}
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            
            <div>
              <div className={`text-lg font-semibold ${
                stats.unresolvedViolations > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {stats.unresolvedViolations}
              </div>
              <div className="text-xs text-gray-600">Violations</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeofencingMap;