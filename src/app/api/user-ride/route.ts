import { NextRequest, NextResponse } from "next/server";
import { ref, get } from "firebase/database";
import { realtimeDb } from "@/lib/firebase-admin";

interface TripData {
  bookingId?: string;
  bikeId?: string;
  operator?: string;
  isActive?: boolean;
  isHold?: boolean;
  rideTimer?: number;
  totalTripTime?: number;
  holdTimer?: number;
  rideStartTime?: string | number;
  holdStartTime?: string | number;
  rideEndTime?: string | number;
  startLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  endLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  totalDistance?: number;
  baseFare?: number;
  timeCharge?: number;
  distanceCharge?: number;
  totalFare?: number;
  paymentStatus?: string;
  unlockCode?: string;
  [key: string]: unknown;
}

interface ProcessedRideData {
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

interface RideStats {
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

interface UserRideResponse {
  success: boolean;
  rides: ProcessedRideData[];
  activeRide?: ProcessedRideData;
  stats: RideStats;
  message: string;
}

const PRICING = {
  baseFare: 2.0,
  perMinuteRate: 0.15,
  perKmRate: 1.0,
  currency: "INR",
};

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateFare(
  duration: number,
  distance: number
): {
  baseFare: number;
  timeCharge: number;
  distanceCharge: number;
  totalFare: number;
} {
  const baseFare = PRICING.baseFare;
  const timeCharge =
    Math.round((duration / 60) * PRICING.perMinuteRate * 100) / 100;
  const distanceCharge =
    Math.round((distance / 1000) * PRICING.perKmRate * 100) / 100;
  const totalFare =
    Math.round((baseFare + timeCharge + distanceCharge) * 100) / 100;

  return {
    baseFare,
    timeCharge,
    distanceCharge,
    totalFare,
  };
}

function processRideData(
  tripId: string,
  tripData: TripData,
  isActive: boolean = false
): ProcessedRideData {
  const startTime =
    typeof tripData.rideStartTime === "string"
      ? new Date(tripData.rideStartTime).getTime()
      : tripData.rideStartTime || Date.now();

  const endTime = tripData.rideEndTime
    ? typeof tripData.rideEndTime === "string"
      ? new Date(tripData.rideEndTime).getTime()
      : tripData.rideEndTime
    : undefined;

  const currentTime = Date.now();
  const duration = endTime
    ? Math.round((endTime - startTime) / (1000 * 60))
    : Math.round((currentTime - startTime) / (1000 * 60));

  const startLat = tripData.startLocation?.lat || 0;
  const startLng = tripData.startLocation?.lng || 0;
  const endLat = tripData.endLocation?.lat || startLat;
  const endLng = tripData.endLocation?.lng || startLng;

  const totalDistance =
    tripData.totalDistance ||
    calculateDistance(startLat, startLng, endLat, endLng);

  const fareCalc = calculateFare(
    tripData.totalTripTime || duration * 60,
    totalDistance
  );

  let status: "active" | "completed" | "cancelled" | "paused" = "completed";
  if (isActive && !endTime) {
    status = tripData.isHold ? "paused" : "active";
  } else if (tripData.paymentStatus === "failed") {
    status = "cancelled";
  }

  return {
    id: tripId,
    bikeId: tripData.bikeId || "",
    bookingId: tripData.bookingId || tripId,
    operator: tripData.operator || "PUBBS",
    status,
    startTime,
    endTime,
    duration: endTime ? duration : undefined,
    currentLocation: {
      lat: endLat || startLat,
      lng: endLng || startLng,
      timestamp: endTime || currentTime,
    },
    route: {
      startPoint: {
        lat: startLat,
        lng: startLng,
        address: tripData.startLocation?.address,
      },
      endPoint: endTime
        ? {
            lat: endLat,
            lng: endLng,
            address: tripData.endLocation?.address,
          }
        : undefined,
      totalDistance,
      waypoints: [
        {
          lat: startLat,
          lng: startLng,
          timestamp: startTime,
        },
        ...(endTime
          ? [
              {
                lat: endLat,
                lng: endLng,
                timestamp: endTime,
              },
            ]
          : []),
      ],
    },
    fare: {
      baseFare: tripData.baseFare || fareCalc.baseFare,
      timeCharge: tripData.timeCharge || fareCalc.timeCharge,
      distanceCharge: tripData.distanceCharge || fareCalc.distanceCharge,
      totalFare: tripData.totalFare || fareCalc.totalFare,
      currency: PRICING.currency,
    },
    paymentStatus:
      (tripData.paymentStatus as "paid" | "pending" | "failed") || "pending",
    unlockCode: tripData.unlockCode,
    isHold: tripData.isHold || false,
    holdDuration: tripData.holdTimer ? Math.round(tripData.holdTimer / 60) : 0,
    rideTimer: tripData.rideTimer || 0,
    totalTripTime: tripData.totalTripTime || 0,
  };
}

function calculateStats(rides: ProcessedRideData[]): RideStats {
  const totalRides = rides.length;
  const activeRides = rides.filter(
    (r) => r.status === "active" || r.status === "paused"
  ).length;
  const completedRides = rides.filter((r) => r.status === "completed").length;
  const cancelledRides = rides.filter((r) => r.status === "cancelled").length;

  const totalDistance = rides.reduce(
    (sum, ride) => sum + ride.route.totalDistance / 1000,
    0
  );

  const totalTime = rides.reduce((sum, ride) => {
    const timeInMinutes = ride.totalTripTime
      ? Math.round(ride.totalTripTime / 60)
      : ride.duration || 0;
    return sum + timeInMinutes;
  }, 0);

  const totalSpent = rides
    .filter(
      (r) =>
        r.status === "completed" &&
        (r.paymentStatus === "paid" || r.paymentStatus === "pending")
    )
    .reduce((sum, ride) => sum + ride.fare.totalFare, 0);

  const completedRidesWithTime = rides.filter(
    (r) => r.status === "completed" && (r.totalTripTime || r.duration)
  );

  const averageRideTime =
    completedRidesWithTime.length > 0
      ? completedRidesWithTime.reduce((sum, ride) => {
          const timeInMinutes = ride.totalTripTime
            ? Math.round(ride.totalTripTime / 60)
            : ride.duration || 0;
          return sum + timeInMinutes;
        }, 0) / completedRidesWithTime.length
      : 0;

  const averageDistance =
    completedRides > 0 ? totalDistance / completedRides : 0;

  const longestRide = rides.reduce((max, ride) => {
    const timeInMinutes = ride.totalTripTime
      ? Math.round(ride.totalTripTime / 60)
      : ride.duration || 0;
    return Math.max(max, timeInMinutes);
  }, 0);

  return {
    totalRides,
    activeRides,
    completedRides,
    cancelledRides,
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalTime: Math.round(totalTime),
    totalSpent: Math.round(totalSpent * 100) / 100,
    averageRideTime: Math.round(averageRideTime * 100) / 100,
    averageDistance: Math.round(averageDistance * 100) / 100,
    longestRide,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          rides: [],
          stats: {
            totalRides: 0,
            activeRides: 0,
            completedRides: 0,
            cancelledRides: 0,
            totalDistance: 0,
            totalTime: 0,
            totalSpent: 0,
            averageRideTime: 0,
            averageDistance: 0,
            longestRide: 0,
          },
          message: "userId parameter is required",
        } as UserRideResponse,
        { status: 400 }
      );
    }

    const userRef = ref(realtimeDb, `Users/${userId}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      return NextResponse.json(
        {
          success: false,
          rides: [],
          stats: {
            totalRides: 0,
            activeRides: 0,
            completedRides: 0,
            cancelledRides: 0,
            totalDistance: 0,
            totalTime: 0,
            totalSpent: 0,
            averageRideTime: 0,
            averageDistance: 0,
            longestRide: 0,
          },
          message: "User not found",
        } as UserRideResponse,
        { status: 404 }
      );
    }

    const userData = userSnapshot.val();
    const trips = userData.Trips || {};
    const hasTrips = Object.keys(trips).length > 0;

    if (!hasTrips) {
      const emptyStats = {
        totalRides: 0,
        activeRides: 0,
        completedRides: 0,
        cancelledRides: 0,
        totalDistance: 0,
        totalTime: 0,
        totalSpent: 0,
        averageRideTime: 0,
        averageDistance: 0,
        longestRide: 0,
      };

      return NextResponse.json(
        {
          success: true,
          rides: [],
          stats: emptyStats,
          message: "User has no rides",
        } as UserRideResponse,
        { status: 200 }
      );
    }

    const hasActiveRide =
      userData.rideId &&
      userData.rideId !== "null" &&
      userData.rideOnGoingStatus === "true";
    const activeBookingId = hasActiveRide ? userData.bookingId : null;

    const processedRides: ProcessedRideData[] = [];
    let activeRide: ProcessedRideData | undefined;

    for (const [tripId, tripData] of Object.entries(trips)) {
      const isActive = activeBookingId === tripId;
      const processedRide = processRideData(
        tripId,
        tripData as TripData,
        isActive
      );

      processedRides.push(processedRide);

      if (isActive) {
        activeRide = processedRide;
      }
    }

    processedRides.sort((a, b) => b.startTime - a.startTime);

    const stats = calculateStats(processedRides);

    const response: UserRideResponse = {
      success: true,
      rides: processedRides,
      stats,
      message: `Found ${processedRides.length} ride(s) for user`,
    };

    if (activeRide) {
      response.activeRide = activeRide;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error("Get user rides error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to get user rides";

    return NextResponse.json(
      {
        success: false,
        rides: [],
        stats: {
          totalRides: 0,
          activeRides: 0,
          completedRides: 0,
          cancelledRides: 0,
          totalDistance: 0,
          totalTime: 0,
          totalSpent: 0,
          averageRideTime: 0,
          averageDistance: 0,
          longestRide: 0,
        },
        message: errorMessage,
      } as UserRideResponse,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      filters = {},
      sortBy = "startTime",
      sortOrder = "desc",
    } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          rides: [],
          stats: {
            totalRides: 0,
            activeRides: 0,
            completedRides: 0,
            cancelledRides: 0,
            totalDistance: 0,
            totalTime: 0,
            totalSpent: 0,
            averageRideTime: 0,
            averageDistance: 0,
            longestRide: 0,
          },
          message: "userId is required in request body",
        } as UserRideResponse,
        { status: 400 }
      );
    }

    const userRef = ref(realtimeDb, `Users/${userId}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      return NextResponse.json(
        {
          success: false,
          rides: [],
          stats: {
            totalRides: 0,
            activeRides: 0,
            completedRides: 0,
            cancelledRides: 0,
            totalDistance: 0,
            totalTime: 0,
            totalSpent: 0,
            averageRideTime: 0,
            averageDistance: 0,
            longestRide: 0,
          },
          message: "User not found",
        } as UserRideResponse,
        { status: 404 }
      );
    }

    const userData = userSnapshot.val();
    const trips = userData.Trips || {};
    const hasTrips = Object.keys(trips).length > 0;

    if (!hasTrips) {
      const emptyStats = {
        totalRides: 0,
        activeRides: 0,
        completedRides: 0,
        cancelledRides: 0,
        totalDistance: 0,
        totalTime: 0,
        totalSpent: 0,
        averageRideTime: 0,
        averageDistance: 0,
        longestRide: 0,
      };

      return NextResponse.json(
        {
          success: true,
          rides: [],
          stats: emptyStats,
          message: "User has no rides",
        } as UserRideResponse,
        { status: 200 }
      );
    }

    const hasActiveRide =
      userData.rideId &&
      userData.rideId !== "null" &&
      userData.rideOnGoingStatus === "true";
    const activeBookingId = hasActiveRide ? userData.bookingId : null;

    let processedRides: ProcessedRideData[] = [];
    let activeRide: ProcessedRideData | undefined;

    for (const [tripId, tripData] of Object.entries(trips)) {
      const isActive = activeBookingId === tripId;
      const processedRide = processRideData(
        tripId,
        tripData as TripData,
        isActive
      );

      processedRides.push(processedRide);

      if (isActive) {
        activeRide = processedRide;
      }
    }

    if (filters.status) {
      processedRides = processedRides.filter(
        (ride) => ride.status === filters.status
      );
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate).getTime();
      processedRides = processedRides.filter(
        (ride) => ride.startTime >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate).getTime();
      processedRides = processedRides.filter(
        (ride) => ride.startTime <= endDate
      );
    }

    if (filters.bikeId) {
      processedRides = processedRides.filter((ride) =>
        ride.bikeId.includes(filters.bikeId)
      );
    }

    processedRides.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "duration":
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case "distance":
          aValue = a.route.totalDistance;
          bValue = b.route.totalDistance;
          break;
        case "fare":
          aValue = a.fare.totalFare;
          bValue = b.fare.totalFare;
          break;
        case "startTime":
        default:
          aValue = a.startTime;
          bValue = b.startTime;
          break;
      }

      return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
    });

    const allRides: ProcessedRideData[] = [];
    for (const [tripId, tripData] of Object.entries(trips)) {
      const isActive = activeBookingId === tripId;
      const processedRide = processRideData(
        tripId,
        tripData as TripData,
        isActive
      );
      allRides.push(processedRide);
    }
    const stats = calculateStats(allRides);

    const response: UserRideResponse = {
      success: true,
      rides: processedRides,
      stats,
      message: `Found ${processedRides.length} ride(s) for user with applied filters`,
    };

    if (activeRide) {
      response.activeRide = activeRide;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error("Get user rides error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to get user rides";

    return NextResponse.json(
      {
        success: false,
        rides: [],
        stats: {
          totalRides: 0,
          activeRides: 0,
          completedRides: 0,
          cancelledRides: 0,
          totalDistance: 0,
          totalTime: 0,
          totalSpent: 0,
          averageRideTime: 0,
          averageDistance: 0,
          longestRide: 0,
        },
        message: errorMessage,
      } as UserRideResponse,
      { status: 500 }
    );
  }
}
