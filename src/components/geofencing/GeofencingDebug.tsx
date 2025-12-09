import React, { useEffect } from 'react';
import { useGeofencing } from '@/hooks/useGeofencing';

const GeofencingDebug: React.FC = () => {
  const { geofences, subscribeToGeofences } = useGeofencing();

  useEffect(() => {
    const unsubscribe = subscribeToGeofences('PubbsTesting');
    return unsubscribe;
  }, [subscribeToGeofences]);


  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-medium text-yellow-800 mb-2">Geofencing Debug Info</h3>
      <div className="text-sm text-yellow-700">
        <p><strong>Number of geofences loaded:</strong> {geofences.length}</p>
        <p><strong>Active geofences:</strong> {geofences.filter(g => g.isActive).length}</p>
        {geofences.length > 0 && (
          <div className="mt-2">
            <p><strong>First geofence details:</strong></p>
            <pre className="bg-white p-2 rounded text-xs overflow-auto">
              {JSON.stringify(geofences[0], null, 2)}
            </pre>
          </div>
        )}
        {geofences.length === 0 && (
          <p className="text-red-600 mt-2">No geofences found. Check Firebase connection and data structure.</p>
        )}
      </div>
    </div>
  );
};

export default GeofencingDebug;