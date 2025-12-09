import { useState, useCallback } from 'react';
import { database } from '@/lib/firebase';
import { ref, set, get, onValue, off } from 'firebase/database';

export interface GeofenceArea {
  id: string;
  name: string;
  type: 'allowed' | 'forbidden' | 'station';
  coordinates: {
    lat: number;
    lng: number;
  } | Array<{lat: number; lng: number}>; // Support both single point and polygon
  radius?: number; // Optional for polygon-based geofences
  isActive: boolean;
  createdAt: string;
  operator: string;
  isPolygon?: boolean; // Flag to indicate if this is a polygon geofence
}

export interface GeofenceViolation {
  id: string;
  bikeId: string;
  userId: string;
  areaId: string;
  areaName: string;
  violationType: 'exit_allowed' | 'enter_forbidden' | 'outside_boundary';
  location: {
    lat: number;
    lng: number;
  };
  timestamp: number;
  isResolved: boolean;
}

export interface GeofenceAlert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: number;
  bikeId?: string;
  userId?: string;
}

export const useGeofencing = () => {
  const [geofences, setGeofences] = useState<GeofenceArea[]>([]);
  const [violations, setViolations] = useState<GeofenceViolation[]>([]);
  const [alerts] = useState<GeofenceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }, []);

  // Check if a point is inside a geofence (supports both circular and polygon geofences)
  const isInsideGeofence = useCallback((
    pointLat: number,
    pointLng: number,
    geofence: GeofenceArea
  ): boolean => {
    if (geofence.isPolygon && Array.isArray(geofence.coordinates)) {
      // Point-in-polygon algorithm for polygon geofences
      return isPointInPolygon(pointLat, pointLng, geofence.coordinates);
    } else if (!Array.isArray(geofence.coordinates) && geofence.radius) {
      // Circular geofence
      const distance = calculateDistance(
        pointLat,
        pointLng,
        geofence.coordinates.lat,
        geofence.coordinates.lng
      );
      return distance <= geofence.radius;
    }
    return false;
  }, [calculateDistance]);

  // Point-in-polygon algorithm (Ray casting algorithm)
  const isPointInPolygon = useCallback((
    pointLat: number,
    pointLng: number,
    polygon: Array<{lat: number; lng: number}>
  ): boolean => {
    let isInside = false;
    const x = pointLng;
    const y = pointLat;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng;
      const yi = polygon[i].lat;
      const xj = polygon[j].lng;
      const yj = polygon[j].lat;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        isInside = !isInside;
      }
    }

    return isInside;
  }, []);

  // Check geofence violations for a location
  const checkGeofenceViolations = useCallback((
    bikeId: string,
    userId: string,
    lat: number,
    lng: number,
    operator: string
  ): GeofenceViolation[] => {
    const newViolations: GeofenceViolation[] = [];

    geofences.forEach(geofence => {
      if (!geofence.isActive || geofence.operator !== operator) return;

      const isInside = isInsideGeofence(lat, lng, geofence);

      // Check for violations based on geofence type
      if (geofence.type === 'forbidden' && isInside) {
        newViolations.push({
          id: `${bikeId}-${geofence.id}-${Date.now()}`,
          bikeId,
          userId,
          areaId: geofence.id,
          areaName: geofence.name,
          violationType: 'enter_forbidden',
          location: { lat, lng },
          timestamp: Date.now(),
          isResolved: false
        });
      } else if (geofence.type === 'allowed' && !isInside) {
        newViolations.push({
          id: `${bikeId}-${geofence.id}-${Date.now()}`,
          bikeId,
          userId,
          areaId: geofence.id,
          areaName: geofence.name,
          violationType: 'exit_allowed',
          location: { lat, lng },
          timestamp: Date.now(),
          isResolved: false
        });
      }
    });

    return newViolations;
  }, [geofences, isInsideGeofence]);

  // Create a new geofence
  const createGeofence = useCallback(async (
    operator: string,
    geofence: Omit<GeofenceArea, 'id' | 'createdAt' | 'operator'>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const id = `marker-${Date.now()}`;
      
      // Convert GeofenceArea format to marker format for Firebase
      const markerData: Record<string, unknown> = {
        name: geofence.name,
        type: geofence.type,
        isActive: geofence.isActive,
        createdAt: new Date().toISOString()
      };

      // Handle both single coordinates and polygon coordinates
      if (Array.isArray(geofence.coordinates)) {
        // For polygon geofences, store as coordinate array
        markerData.coordinates = geofence.coordinates;
        markerData.isPolygon = true;
      } else {
        // For circular geofences, store as lat/lng with radius
        markerData.latitude = geofence.coordinates.lat;
        markerData.longitude = geofence.coordinates.lng;
        markerData.radius = geofence.radius || 100;
        markerData.isPolygon = false;
      }

      // Save to PubbsTesting/Area/Area_1/markerList/{id}
      await set(ref(database, `PubbsTesting/Area/Area_1/markerList/${id}`), markerData);
      return true;
    } catch (error) {
      console.error('Error creating geofence:', error);
      setError('Failed to create geofence');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a geofence
  const updateGeofence = useCallback(async (
    operator: string,
    geofenceId: string,
    updates: Partial<GeofenceArea>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const geofenceRef = ref(database, `${operator}/Geofences/${geofenceId}`);
      const snapshot = await get(geofenceRef);
      
      if (snapshot.exists()) {
        const updatedGeofence = { ...snapshot.val(), ...updates };
        await set(geofenceRef, updatedGeofence);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating geofence:', error);
      setError('Failed to update geofence');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a geofence
  const deleteGeofence = useCallback(async (
    operator: string,
    geofenceId: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      await set(ref(database, `${operator}/Geofences/${geofenceId}`), null);
      return true;
    } catch (error) {
      console.error('Error deleting geofence:', error);
      setError('Failed to delete geofence');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to geofences - reads from PubbsTesting/Area/Area_1/markerList
  const subscribeToGeofences = useCallback((operator: string) => {
    // Use the actual Firebase structure: PubbsTesting/Area/Area_1
    const areaRef = ref(database, `PubbsTesting/Area/Area_1`);
    
    const unsubscribe = onValue(areaRef, (snapshot) => {
      if (snapshot.exists()) {
        const areaData = snapshot.val();
        const geofencesList: GeofenceArea[] = [];
        
        // Check if markerList exists and create a polygon geofence from it
        if (areaData.markerList && Array.isArray(areaData.markerList)) {
          const polygonCoordinates = areaData.markerList.map((marker: unknown) => {
            const markerObj = marker as Record<string, unknown>;
            return {
              lat: markerObj.latitude as number,
              lng: markerObj.longitude as number
            };
          });

          // Create the main campus boundary geofence from polygon coordinates
          const mainGeofence: GeofenceArea = {
            id: 'campus-boundary',
            name: areaData.areaName || 'Campus Area',
            type: 'allowed',
            coordinates: polygonCoordinates,
            operator: operator,
            isActive: areaData.areaStatus !== false,
            createdAt: areaData.createDate || new Date().toISOString(),
            isPolygon: true
          };
          geofencesList.push(mainGeofence);
        }

        // Also check for any additional individual markers (if stored separately)
        if (areaData.additionalMarkers) {
          Object.entries(areaData.additionalMarkers).forEach(([key, markerData]: [string, unknown]) => {
            const marker = markerData as Record<string, unknown>;
            if (marker.latitude && marker.longitude) {
              const geofence: GeofenceArea = {
                id: key,
                name: (marker.name as string) || `Area ${key}`,
                type: (marker.type as GeofenceArea['type']) || 'station',
                coordinates: {
                  lat: marker.latitude as number,
                  lng: marker.longitude as number
                },
                radius: (marker.radius as number) || 50,
                operator: operator,
                isActive: (marker.isActive as boolean) !== false,
                createdAt: (marker.createdAt as string) || new Date().toISOString(),
                isPolygon: false
              };
              geofencesList.push(geofence);
            }
          });
        }
        
        setGeofences(geofencesList);
      } else {
        setGeofences([]);
      }
    });

    return () => off(areaRef, 'value', unsubscribe);
  }, []);

  // Subscribe to violations
  const subscribeToViolations = useCallback((operator: string) => {
    const violationsRef = ref(database, `${operator}/GeofenceViolations`);
    
    const unsubscribe = onValue(violationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const violationsData = snapshot.val();
        const violationsList: GeofenceViolation[] = Object.values(violationsData);
        setViolations(violationsList.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setViolations([]);
      }
    });

    return () => off(violationsRef, 'value', unsubscribe);
  }, []);

  // Record a violation
  const recordViolation = useCallback(async (
    operator: string,
    violation: GeofenceViolation
  ): Promise<boolean> => {
    try {
      await set(ref(database, `${operator}/GeofenceViolations/${violation.id}`), violation);
      
      // Create an alert
      const alert: GeofenceAlert = {
        id: `alert-${Date.now()}`,
        message: `Bike ${violation.bikeId} ${violation.violationType.replace('_', ' ')} ${violation.areaName}`,
        severity: violation.violationType === 'enter_forbidden' ? 'error' : 'warning',
        timestamp: Date.now(),
        bikeId: violation.bikeId,
        userId: violation.userId
      };

      await set(ref(database, `${operator}/GeofenceAlerts/${alert.id}`), alert);
      return true;
    } catch (error) {
      console.error('Error recording violation:', error);
      return false;
    }
  }, []);

  // Resolve a violation
  const resolveViolation = useCallback(async (
    operator: string,
    violationId: string
  ): Promise<boolean> => {
    try {
      await set(ref(database, `${operator}/GeofenceViolations/${violationId}/isResolved`), true);
      return true;
    } catch (error) {
      console.error('Error resolving violation:', error);
      return false;
    }
  }, []);

  // Monitor location for geofence violations
  const monitorLocation = useCallback(async (
    operator: string,
    bikeId: string,
    userId: string,
    lat: number,
    lng: number
  ) => {
    const violations = checkGeofenceViolations(bikeId, userId, lat, lng, operator);
    
    for (const violation of violations) {
      await recordViolation(operator, violation);
    }

    return violations;
  }, [checkGeofenceViolations, recordViolation]);

  // Get active geofences by type
  const getGeofencesByType = useCallback((type: GeofenceArea['type']) => {
    return geofences.filter(g => g.type === type && g.isActive);
  }, [geofences]);

  // Get unresolved violations
  const getUnresolvedViolations = useCallback(() => {
    return violations.filter(v => !v.isResolved);
  }, [violations]);

  return {
    geofences,
    violations,
    alerts,
    loading,
    error,
    createGeofence,
    updateGeofence,
    deleteGeofence,
    subscribeToGeofences,
    subscribeToViolations,
    recordViolation,
    resolveViolation,
    monitorLocation,
    checkGeofenceViolations,
    isInsideGeofence,
    calculateDistance,
    getGeofencesByType,
    getUnresolvedViolations
  };
};