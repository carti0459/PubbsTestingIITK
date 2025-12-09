import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Ride,
  RideStats,
  ActiveRideSession,
  Location,
  RideFare,
} from "@/types/ride.type";

// API Response interfaces
interface ApiRideData {
  id: string;
  bikeId: string;
  bookingId: string;
  operator: string;
  status: "active" | "completed" | "cancelled" | "paused";
  startTime: number;
  endTime?: number;
  duration?: number;
  currentLocation: {
    lat: number;
    lng: number;
    timestamp: number;
  };
  route: {
    startPoint: {
      lat: number;
      lng: number;
      address?: string;
    };
    endPoint?: {
      lat: number;
      lng: number;
      address?: string;
    };
    totalDistance: number;
    waypoints: Array<{
      lat: number;
      lng: number;
      timestamp: number;
    }>;
  };
  fare: {
    baseFare: number;
    timeCharge: number;
    distanceCharge: number;
    totalFare: number;
    currency: string;
  };
  paymentStatus: "paid" | "pending" | "failed";
  unlockCode?: string;
  isHold: boolean;
  holdDuration?: number;
  rideTimer: number;
  totalTripTime: number;
}

interface ApiRideStats {
  totalRides: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
  totalDistance: number;
  totalTime: number;
  totalSpent: number;
  averageRideTime: number;
  averageDistance: number;
  longestRide: number;
}

interface UserRideApiResponse {
  success: boolean;
  rides: ApiRideData[];
  activeRide?: ApiRideData;
  stats: ApiRideStats;
  message: string;
}

export const useRides = () => {
  const { userData } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [activeRide, setActiveRide] = useState<ActiveRideSession | null>(null);
  const [rideStats, setRideStats] = useState<RideStats>({
    totalRides: 0,
    totalDistance: 0,
    totalDuration: 0,
    totalFare: 0,
    averageRideTime: 0,
    averageDistance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const PRICING = {
    baseFare: 2.5,
    timeChargePerMinute: 0.15,
    distanceChargePerKm: 1.2,
    currency: "INR",
  };

  const convertApiRideToRide = (apiRide: ApiRideData): Ride => {

    const durationInMinutes = apiRide.status === 'completed' 
      ? Math.round((apiRide.totalTripTime || apiRide.rideTimer) / 60)
      : apiRide.duration;

    return {
      id: apiRide.id,
      bikeId: apiRide.bikeId,
      userId: userData?.phoneNumber || "",
      status: apiRide.status,
      startTime: apiRide.startTime,
      endTime: apiRide.endTime,
      duration: durationInMinutes,
      route: {
        startLocation: {
          lat: apiRide.route.startPoint.lat,
          lng: apiRide.route.startPoint.lng,
          timestamp: apiRide.startTime,
        },
        endLocation: apiRide.route.endPoint
          ? {
              lat: apiRide.route.endPoint.lat,
              lng: apiRide.route.endPoint.lng,
              timestamp: apiRide.endTime || Date.now(),
            }
          : undefined,
        waypoints: apiRide.route.waypoints,
        totalDistance: apiRide.route.totalDistance,
      },
      fare: apiRide.fare,
      paymentStatus: apiRide.paymentStatus,
      unlockCode: apiRide.unlockCode,
      createdAt: apiRide.startTime,
      updatedAt: Date.now(),
    };
  };

  const convertApiStatsToRideStats = (apiStats: ApiRideStats): RideStats => {
    return {
      totalRides: apiStats.totalRides,
      totalDistance: apiStats.totalDistance,
      totalDuration: apiStats.totalTime,
      totalFare: apiStats.totalSpent,
      averageRideTime: apiStats.averageRideTime,
      averageDistance: apiStats.averageDistance,
    };
  };

  const convertApiActiveRideToSession = (
    apiRide: ApiRideData
  ): ActiveRideSession => {
    return {
      rideId: apiRide.id,
      startTime: apiRide.startTime,
      currentLocation: apiRide.currentLocation,
      distanceTraveled: apiRide.route.totalDistance / 1000,
      currentFare: apiRide.fare.totalFare,
      estimatedEndFare: apiRide.fare.totalFare,
    };
  };

  const fetchUserRides = async () => {
    if (!userData?.phoneNumber) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/user-ride?userId=${userData.phoneNumber}`);
      const data: UserRideApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      const convertedRides = data.rides.map(convertApiRideToRide);
      const convertedStats = convertApiStatsToRideStats(data.stats);
      const convertedActiveRide = data.activeRide
        ? convertApiActiveRideToSession(data.activeRide)
        : null;

      setRides(convertedRides);
      setRideStats(convertedStats);
      setActiveRide(convertedActiveRide);
    } catch (err) {
      console.error("Error fetching user rides:", err);
      setError(err instanceof Error ? err.message : "Failed to load rides");
    } finally {
      setLoading(false);
    }
  };

  const startRide = async (
    bikeId: string,
    userId: string,
    startLocation: Location
  ): Promise<string | null> => {
    try {
      const response = await fetch("/api/create-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bikeId,
          userId,
          startLocation,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchUserRides();
        return data.rideId || data.bookingId;
      } else {
        throw new Error(data.message || "Failed to start ride");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start ride");
      return null;
    }
  };

  const updateRideLocation = async (rideId: string, newLocation: Location) => {
    try {
      const response = await fetch("/api/update-ride-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideId,
          location: newLocation,
          userId: userData?.phoneNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchUserRides();
      } else {
        throw new Error(data.message || "Failed to update ride location");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update ride location"
      );
    }
  };

  const endRide = async (
    rideId: string,
    endLocation: Location
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/end-ride", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideId,
          endLocation,
          userId: userData?.phoneNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setActiveRide(null);
        await fetchUserRides();
        return true;
      } else {
        throw new Error(data.message || "Failed to end ride");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end ride");
      return false;
    }
  };

  const cancelRide = async (rideId: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/cancel-ride", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideId,
          userId: userData?.phoneNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setActiveRide(null);
        await fetchUserRides();
        return true;
      } else {
        throw new Error(data.message || "Failed to cancel ride");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel ride");
      return false;
    }
  };

  const calculateStats = (ridesData: Ride[]): RideStats => {
    const completedRides = ridesData.filter(
      (ride) => ride.status === "completed"
    );

    if (completedRides.length === 0) {
      return {
        totalRides: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalFare: 0,
        averageRideTime: 0,
        averageDistance: 0,
      };
    }

    const totalDistance = completedRides.reduce(
      (sum, ride) => sum + ride.route.totalDistance / 1000,
      0
    );
    const totalDuration = completedRides.reduce(
      (sum, ride) => sum + (ride.duration || 0),
      0
    );
    const totalFare = completedRides.reduce(
      (sum, ride) => sum + ride.fare.totalFare,
      0
    );

    return {
      totalRides: completedRides.length,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalDuration,
      totalFare: Math.round(totalFare * 100) / 100,
      averageRideTime: Math.round(totalDuration / completedRides.length),
      averageDistance:
        Math.round((totalDistance / completedRides.length) * 100) / 100,
    };
  };

  useEffect(() => {
    if (userData?.phoneNumber) {
      fetchUserRides();
    } else {
      setRides([]);
      setActiveRide(null);
      setRideStats({
        totalRides: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalFare: 0,
        averageRideTime: 0,
        averageDistance: 0,
      });
      setLoading(false);
    }
  }, [userData?.phoneNumber]);

  return {
    rides,
    activeRide,
    rideStats,
    loading,
    error,
    startRide,
    endRide,
    cancelRide,
    updateRideLocation,
    PRICING,
  };
};
