import { useState, useEffect } from 'react';
import { ref, onValue, off, update, push, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { 
  SystemMetrics, 
  BikeMaintenanceRecord, 
  UserManagement, 
  SystemAlert,
  AnalyticsData,
  MaintenanceSchedule
} from '@/types/admin.type';
import { Bike } from './useBikes';
import { Ride } from '@/types/ride.type';
import { User } from '@/types/user.type';

export const useAdminDashboard = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<BikeMaintenanceRecord[]>([]);
  const [users] = useState<UserManagement[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [maintenanceSchedule] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate system metrics from raw data
  const calculateSystemMetrics = async (): Promise<SystemMetrics> => {
    try {
      // Get bikes data
      const bikesSnapshot = await get(ref(database, 'bikes'));
      const bikes = bikesSnapshot.exists() ? Object.values(bikesSnapshot.val()) : [];
      
      // Get rides data
      const ridesSnapshot = await get(ref(database, 'rides'));
      const rides = ridesSnapshot.exists() ? Object.values(ridesSnapshot.val()) : [];
      
      // Get users data
      const usersSnapshot = await get(ref(database, 'users'));
      const usersData = usersSnapshot.exists() ? Object.values(usersSnapshot.val()) : [];

      const totalBikes = bikes.length;
      const activeBikes = bikes.filter((bike: unknown) => 
        typeof bike === 'object' && bike !== null && (bike as Bike).status === 'active'
      ).length;
      const availableBikes = bikes.filter((bike: unknown) => 
        typeof bike === 'object' && bike !== null && (bike as Bike).status === 'inactive'
      ).length;
      const maintenanceBikes = bikes.filter((bike: unknown) => 
        typeof bike === 'object' && bike !== null && (bike as Bike).status === 'maintenance'
      ).length;

      const totalUsers = usersData.length;
      const activeUsers = usersData.filter((user: unknown) => {
        if (typeof user !== 'object' || user === null) return false;
        const userObj = user as User;
        return userObj.currentRide?.startTime && Date.now() - new Date(userObj.currentRide.startTime).getTime() < 30 * 24 * 60 * 60 * 1000;
      }).length;

      const totalRides = rides.length;
      const activeRides = rides.filter((ride: unknown) => 
        typeof ride === 'object' && ride !== null && (ride as Ride).status === 'active'
      ).length;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const completedRidesToday = rides.filter((ride: unknown) => {
        if (typeof ride !== 'object' || ride === null) return false;
        const rideObj = ride as Ride;
        return rideObj.status === 'completed' && rideObj.endTime && rideObj.endTime >= today.getTime();
      }).length;

      const completedRides = rides.filter((ride: unknown) => 
        typeof ride === 'object' && ride !== null && (ride as Ride).status === 'completed'
      );
      const totalRevenue = completedRides.reduce((sum: number, ride: unknown) => {
        if (typeof ride !== 'object' || ride === null) return sum;
        const rideObj = ride as Ride;
        return sum + (rideObj.fare?.totalFare || 0);
      }, 0);
      const revenueToday = rides
        .filter((ride: unknown) => {
          if (typeof ride !== 'object' || ride === null) return false;
          const rideObj = ride as Ride;
          return rideObj.status === 'completed' && rideObj.endTime && rideObj.endTime >= today.getTime();
        })
        .reduce((sum: number, ride: unknown) => {
          if (typeof ride !== 'object' || ride === null) return sum;
          const rideObj = ride as Ride;
          return sum + (rideObj.fare?.totalFare || 0);
        }, 0);

      const averageRideDuration = completedRides.length > 0 
        ? completedRides.reduce((sum: number, ride: unknown) => {
            if (typeof ride !== 'object' || ride === null) return sum;
            const rideObj = ride as Ride;
            return sum + (rideObj.duration || 0);
          }, 0) / completedRides.length
        : 0;

      return {
        totalBikes,
        activeBikes,
        availableBikes,
        maintenanceBikes,
        totalUsers,
        activeUsers,
        totalRides,
        activeRides,
        completedRidesToday,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        revenueToday: Math.round(revenueToday * 100) / 100,
        averageRideDuration: Math.round(averageRideDuration),
        systemUptime: 99.9, // Simulated
        lastUpdated: Date.now()
      };
    } catch (err) {
      console.error('Failed to calculate system metrics:', err);
      throw err;
    }
  };

  // Create maintenance record
  const createMaintenanceRecord = async (record: Omit<BikeMaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const maintenanceRef = ref(database, 'maintenance');
      await push(maintenanceRef, {
        ...record,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      return true;
    } catch (err) {
      console.error('Failed to create maintenance record:', err);
      return false;
    }
  };

  // Update maintenance record
  const updateMaintenanceRecord = async (id: string, updates: Partial<BikeMaintenanceRecord>): Promise<boolean> => {
    try {
      await update(ref(database, `maintenance/${id}`), {
        ...updates,
        updatedAt: Date.now()
      });
      return true;
    } catch (err) {
      console.error('Failed to update maintenance record:', err);
      return false;
    }
  };

  // Create system alert
  const createAlert = async (alert: Omit<SystemAlert, 'id' | 'createdAt' | 'acknowledged'>): Promise<boolean> => {
    try {
      const alertsRef = ref(database, 'alerts');
      await push(alertsRef, {
        ...alert,
        acknowledged: false,
        createdAt: Date.now()
      });
      return true;
    } catch (err) {
      console.error('Failed to create alert:', err);
      return false;
    }
  };

  // Acknowledge alert
  const acknowledgeAlert = async (alertId: string, acknowledgedBy: string): Promise<boolean> => {
    try {
      await update(ref(database, `alerts/${alertId}`), {
        acknowledged: true,
        acknowledgedAt: Date.now(),
        acknowledgedBy
      });
      return true;
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
      return false;
    }
  };

  // Suspend user
  const suspendUser = async (userId: string, reason: string): Promise<boolean> => {
    try {
      await update(ref(database, `users/${userId}`), {
        status: 'suspended',
        suspensionReason: reason,
        suspendedAt: Date.now()
      });
      
      // Create alert for suspension
      await createAlert({
        type: 'warning',
        category: 'user',
        title: 'User Suspended',
        message: `User ${userId} has been suspended. Reason: ${reason}`,
        userId
      });
      
      return true;
    } catch (err) {
      console.error('Failed to suspend user:', err);
      return false;
    }
  };

  // Generate analytics data
  const generateAnalytics = async (): Promise<AnalyticsData> => {
    try {
      const ridesSnapshot = await get(ref(database, 'rides'));
      const rides = ridesSnapshot.exists() ? Object.entries(ridesSnapshot.val()).map(([id, data]) => ({ 
        id, 
        ...(data as Record<string, unknown>) 
      } as Ride)) : [];
      
      const completedRides = rides.filter(ride => ride.status === 'completed');
      
      // Ride trends (last 7 days)
      const rideTrends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayRides = completedRides.filter(ride => 
          ride.endTime && ride.endTime >= date.getTime() && ride.endTime < nextDay.getTime()
        );
        
        rideTrends.push({
          date: date.toISOString().split('T')[0],
          rides: dayRides.length,
          revenue: dayRides.reduce((sum, ride) => sum + (ride.fare?.totalFare || 0), 0),
          duration: dayRides.reduce((sum, ride) => sum + (ride.duration || 0), 0)
        });
      }

      // Popular routes (simplified)
      const popularRoutes = [
        { startArea: 'Downtown', endArea: 'University', count: 45, averageDistance: 2.3 },
        { startArea: 'Park Ave', endArea: 'Shopping Mall', count: 38, averageDistance: 1.8 },
        { startArea: 'Residential', endArea: 'Business District', count: 32, averageDistance: 3.1 }
      ];

      // Bike utilization (simplified)
      const bikeUtilization = [
        { bikeId: 'bike-001', utilization: 85, totalRides: 156, revenue: 234.50 },
        { bikeId: 'bike-002', utilization: 78, totalRides: 142, revenue: 198.75 },
        { bikeId: 'bike-003', utilization: 92, totalRides: 178, revenue: 267.80 }
      ];

      // User segments
      const userSegments = [
        { segment: 'Premium Users', count: 245, revenue: 4890.50, averageRides: 12.3 },
        { segment: 'Basic Users', count: 567, revenue: 2834.25, averageRides: 6.8 },
        { segment: 'Trial Users', count: 123, revenue: 234.75, averageRides: 2.1 }
      ];

      // Peak hours
      const peakHours = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        rides: Math.floor(Math.random() * 50) + 5,
        utilization: Math.floor(Math.random() * 80) + 20
      }));

      return {
        rideTrends,
        popularRoutes,
        bikeUtilization,
        userSegments,
        peakHours
      };
    } catch (err) {
      console.error('Failed to generate analytics:', err);
      throw err;
    }
  };

  // Load all admin data
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        
        // Calculate system metrics
        const metrics = await calculateSystemMetrics();
        setSystemMetrics(metrics);
        
        // Generate analytics
        const analyticsData = await generateAnalytics();
        setAnalytics(analyticsData);
        
        // Load maintenance records
        const maintenanceRef = ref(database, 'maintenance');
        onValue(maintenanceRef, (snapshot) => {
          if (snapshot.exists()) {
            const records = Object.entries(snapshot.val()).map(([id, data]) => ({
              id,
              ...(data as Omit<BikeMaintenanceRecord, 'id'>)
            }));
            setMaintenanceRecords(records);
          }
        });
        
        // Load alerts
        const alertsRef = ref(database, 'alerts');
        onValue(alertsRef, (snapshot) => {
          if (snapshot.exists()) {
            const alertsData = Object.entries(snapshot.val()).map(([id, data]) => ({
              id,
              ...(data as Omit<SystemAlert, 'id'>)
            }));
            setAlerts(alertsData.sort((a, b) => b.createdAt - a.createdAt));
          }
        });
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin data');
        setLoading(false);
      }
    };

    loadAdminData();

    // Cleanup listeners
    return () => {
      off(ref(database, 'maintenance'));
      off(ref(database, 'alerts'));
    };
  }, []);

  // Refresh metrics periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const metrics = await calculateSystemMetrics();
        setSystemMetrics(metrics);
      } catch (err) {
        console.error('Failed to refresh metrics:', err);
      }
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  return {
    systemMetrics,
    maintenanceRecords,
    users,
    alerts,
    analytics,
    maintenanceSchedule,
    loading,
    error,
    createMaintenanceRecord,
    updateMaintenanceRecord,
    createAlert,
    acknowledgeAlert,
    suspendUser
  };
};