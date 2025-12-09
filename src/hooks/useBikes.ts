import { useState, useCallback } from 'react';
import { database } from '@/lib/firebase';
import { ref, get, set, update, onValue, off } from 'firebase/database';

export interface Bike {
  id: string;
  deviceName: string;
  bicycleLatitude: string;
  bicycleLongitude: string;
  inStationId: string;
  status: 'active' | 'busy' | 'maintenance' | 'inactive';
  type: string; // NRBLE, QTGSM, etc.
  batteryLevel?: number;
  lastUpdated: string;
  operation?: string;
  macAddress?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  [key: string]: unknown;
}

export const useBikes = () => {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBikes = useCallback(async (operator: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const bikesRef = ref(database, `${operator}/Bicycle`);
      const snapshot = await get(bikesRef);
      
      if (snapshot.exists()) {
        const bikesData = snapshot.val();
        const bikesList: Bike[] = Object.entries(bikesData).map(([key, value]: [string, unknown]) => {
          const bikeValue = value as Record<string, unknown>;
          return {
            id: key,
            deviceName: (bikeValue.deviceName as string) || '',
            bicycleLatitude: (bikeValue.bicycleLatitude as string) || '0',
            bicycleLongitude: (bikeValue.bicycleLongitude as string) || '0',
            inStationId: (bikeValue.inStationId as string) || '',
            status: (bikeValue.status as Bike['status']) || 'inactive',
            type: (bikeValue.type as string) || 'NRBLE',
            batteryLevel: (bikeValue.batteryLevel as number) || 0,
            lastUpdated: (bikeValue.lastUpdated as string) || new Date().toISOString(),
            operation: (bikeValue.operation as string) || '0',
            macAddress: (bikeValue.macAddress as string) || '',
            coordinates: {
              lat: parseFloat((bikeValue.bicycleLatitude as string) || '0'),
              lng: parseFloat((bikeValue.bicycleLongitude as string) || '0')
            }
          };
        });
        
        setBikes(bikesList);
      } else {
        setBikes([]);
      }
    } catch (err) {
      console.error('Error fetching bikes:', err);
      setError('Failed to fetch bikes');
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribeToBikes = useCallback((operator: string, callback?: (bikes: Bike[]) => void) => {
    const bikesRef = ref(database, `${operator}/Bicycle`);
    
    const unsubscribe = onValue(bikesRef, (snapshot) => {
      if (snapshot.exists()) {
        const bikesData = snapshot.val();
        const bikesList: Bike[] = Object.entries(bikesData).map(([key, value]: [string, unknown]) => {
          const bikeValue = value as Record<string, unknown>;
          return {
            id: key,
            deviceName: (bikeValue.deviceName as string) || '',
            bicycleLatitude: (bikeValue.bicycleLatitude as string) || '0',
            bicycleLongitude: (bikeValue.bicycleLongitude as string) || '0',
            inStationId: (bikeValue.inStationId as string) || '',
            status: (bikeValue.status as Bike['status']) || 'inactive',
            type: (bikeValue.type as string) || 'NRBLE',
            batteryLevel: (bikeValue.batteryLevel as number) || 0,
            lastUpdated: (bikeValue.lastUpdated as string) || new Date().toISOString(),
            operation: (bikeValue.operation as string) || '0',
            macAddress: (bikeValue.macAddress as string) || '',
            coordinates: {
              lat: parseFloat((bikeValue.bicycleLatitude as string) || '0'),
              lng: parseFloat((bikeValue.bicycleLongitude as string) || '0')
            }
          };
        });
        
        setBikes(bikesList);
        if (callback) callback(bikesList);
      } else {
        setBikes([]);
        if (callback) callback([]);
      }
    });

    return () => off(bikesRef, 'value', unsubscribe);
  }, []);

  const updateBikeStatus = useCallback(async (operator: string, bikeId: string, status: string) => {
    try {
      const bikeRef = ref(database, `${operator}/Bicycle/${bikeId}/status`);
      await set(bikeRef, status);
      return true;
    } catch (err) {
      console.error('Error updating bike status:', err);
      setError('Failed to update bike status');
      return false;
    }
  }, []);

  const updateBikeLocation = useCallback(async (
    operator: string, 
    bikeId: string, 
    latitude: number, 
    longitude: number
  ) => {
    try {
      const updates = {
        [`${operator}/Bicycle/${bikeId}/bicycleLatitude`]: latitude.toString(),
        [`${operator}/Bicycle/${bikeId}/bicycleLongitude`]: longitude.toString(),
        [`${operator}/Bicycle/${bikeId}/lastUpdated`]: new Date().toISOString()
      };
      
      await update(ref(database), updates);
      return true;
    } catch (err) {
      console.error('Error updating bike location:', err);
      setError('Failed to update bike location');
      return false;
    }
  }, []);

  const assignBikeToStation = useCallback(async (
    operator: string, 
    bikeId: string, 
    stationId: string
  ) => {
    try {
      const bikeRef = ref(database, `${operator}/Bicycle/${bikeId}/inStationId`);
      await set(bikeRef, stationId);
      return true;
    } catch (err) {
      console.error('Error assigning bike to station:', err);
      setError('Failed to assign bike to station');
      return false;
    }
  }, []);

  const getBikesByStation = useCallback((stationId: string) => {
    return bikes.filter(bike => bike.inStationId === stationId);
  }, [bikes]);

  const getActiveBikes = useCallback(() => {
    return bikes.filter(bike => bike.status === 'active');
  }, [bikes]);

  const getBusyBikes = useCallback(() => {
    return bikes.filter(bike => bike.status === 'busy');
  }, [bikes]);

  return {
    bikes,
    loading,
    error,
    fetchBikes,
    subscribeToBikes,
    updateBikeStatus,
    updateBikeLocation,
    assignBikeToStation,
    getBikesByStation,
    getActiveBikes,
    getBusyBikes
  };
};