import { useState, useCallback, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, set, onValue, off } from 'firebase/database';

interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

interface BikeTracking {
  bikeId: string;
  userId: string;
  startTime: number;
  currentLocation: UserLocation;
  path: UserLocation[];
  isActive: boolean;
}

interface TrackingState {
  isTracking: boolean;
  currentPosition: GeolocationPosition | null;
  trackingHistory: UserLocation[];
  error: string | null;
}

export const useRealTimeTracking = () => {
  const [trackingState, setTrackingState] = useState<TrackingState>({
    isTracking: false,
    currentPosition: null,
    trackingHistory: [],
    error: null
  });

  const [activeTracks, setActiveTracks] = useState<BikeTracking[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Get current position once
  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }, []);

  // Start real-time location tracking
  const startTracking = useCallback(async (userId: string, bikeId?: string) => {
    if (!navigator.geolocation) {
      setTrackingState(prev => ({ ...prev, error: 'Geolocation not supported' }));
      return false;
    }

    try {
      // Get initial position
      const position = await getCurrentPosition();
      
      setTrackingState(prev => ({
        ...prev,
        isTracking: true,
        currentPosition: position,
        error: null,
        trackingHistory: [{
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
          accuracy: position.coords.accuracy
        }]
      }));

      // Start watching position
      const id = navigator.geolocation.watchPosition(
        (newPosition) => {
          const userLocation: UserLocation = {
            latitude: newPosition.coords.latitude,
            longitude: newPosition.coords.longitude,
            timestamp: Date.now(),
            accuracy: newPosition.coords.accuracy
          };

          setTrackingState(prev => ({
            ...prev,
            currentPosition: newPosition,
            trackingHistory: [...prev.trackingHistory, userLocation]
          }));

          // Update Firebase with current location
          if (bikeId) {
            updateBikeLocation(bikeId, userLocation);
          }

          // Update user location in Firebase
          updateUserLocation(userId, userLocation);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setTrackingState(prev => ({ ...prev, error: error.message }));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );

      setWatchId(id);
      return true;
    } catch (error) {
      console.error('Failed to start tracking:', error);
      setTrackingState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start tracking' 
      }));
      return false;
    }
  }, [getCurrentPosition]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    setTrackingState(prev => ({
      ...prev,
      isTracking: false,
      currentPosition: null
    }));
  }, [watchId]);

  // Update bike location in Firebase
  const updateBikeLocation = useCallback(async (bikeId: string, location: UserLocation) => {
    try {
      const updates = {
        [`IITKgpCampus/Bicycle/${bikeId}/bicycleLatitude`]: location.latitude.toString(),
        [`IITKgpCampus/Bicycle/${bikeId}/bicycleLongitude`]: location.longitude.toString(),
        [`IITKgpCampus/Bicycle/${bikeId}/lastUpdated`]: new Date().toISOString(),
        [`IITKgpCampus/Bicycle/${bikeId}/tracking/latitude`]: location.latitude,
        [`IITKgpCampus/Bicycle/${bikeId}/tracking/longitude`]: location.longitude,
        [`IITKgpCampus/Bicycle/${bikeId}/tracking/timestamp`]: location.timestamp,
        [`IITKgpCampus/Bicycle/${bikeId}/tracking/accuracy`]: location.accuracy || 0
      };

      const promises = Object.entries(updates).map(([path, value]) => 
        set(ref(database, path), value)
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Error updating bike location:', error);
    }
  }, []);

  // Update user location in Firebase
  const updateUserLocation = useCallback(async (userId: string, location: UserLocation) => {
    try {
      await set(ref(database, `IITKgpCampus/Users/${userId}/location`), {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp,
        accuracy: location.accuracy || 0
      });
    } catch (error) {
      console.error('Error updating user location:', error);
    }
  }, []);

  // Subscribe to active bike tracks
  const subscribeToActiveTracks = useCallback((operator: string = 'IITKgpCampus') => {
    const tracksRef = ref(database, `${operator}/ActiveTracks`);
    
    const unsubscribe = onValue(tracksRef, (snapshot) => {
      if (snapshot.exists()) {
        const tracksData = snapshot.val();
        const tracks: BikeTracking[] = Object.entries(tracksData).map(([key, value]: [string, unknown]) => {
          const trackValue = value as Record<string, unknown>;
          return {
            bikeId: (trackValue.bikeId as string) || key,
            userId: (trackValue.userId as string) || '',
            startTime: (trackValue.startTime as number) || Date.now(),
            currentLocation: (trackValue.currentLocation as UserLocation) || { latitude: 0, longitude: 0, timestamp: Date.now() },
            path: (trackValue.path as UserLocation[]) || [],
            isActive: (trackValue.isActive as boolean) !== false
          };
        });
        
        setActiveTracks(tracks);
      } else {
        setActiveTracks([]);
      }
    });

    return () => off(tracksRef, 'value', unsubscribe);
  }, []);

  // Start tracking a bike ride
  const startBikeRideTracking = useCallback(async (
    operator: string,
    bikeId: string,
    userId: string
  ) => {
    try {
      const startTime = Date.now();
      const position = await getCurrentPosition();
      
      const trackingData: BikeTracking = {
        bikeId,
        userId,
        startTime,
        currentLocation: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: startTime,
          accuracy: position.coords.accuracy
        },
        path: [{
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: startTime,
          accuracy: position.coords.accuracy
        }],
        isActive: true
      };

      await set(ref(database, `${operator}/ActiveTracks/${bikeId}`), trackingData);
      
      // Start location tracking
      await startTracking(userId, bikeId);
      
      return true;
    } catch (error) {
      console.error('Error starting bike ride tracking:', error);
      return false;
    }
  }, [getCurrentPosition, startTracking]);

  // Stop tracking a bike ride
  const stopBikeRideTracking = useCallback(async (
    operator: string,
    bikeId: string
  ) => {
    try {
      // Mark as inactive
      await set(ref(database, `${operator}/ActiveTracks/${bikeId}/isActive`), false);
      await set(ref(database, `${operator}/ActiveTracks/${bikeId}/endTime`), Date.now());
      
      // Stop location tracking
      stopTracking();
      
      return true;
    } catch (error) {
      console.error('Error stopping bike ride tracking:', error);
      return false;
    }
  }, [stopTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    trackingState,
    activeTracks,
    startTracking,
    stopTracking,
    getCurrentPosition,
    updateBikeLocation,
    updateUserLocation,
    subscribeToActiveTracks,
    startBikeRideTracking,
    stopBikeRideTracking
  };
};