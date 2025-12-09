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
  [key: string]: unknown;
}

interface UpdateData {
  isHold?: boolean;
  holdUpdatedAt?: string;
  rideTimer?: number;
  totalTripTime?: number;
  holdTimer?: number;
  [key: string]: unknown;
}

interface UserTripsResponse {
  success: boolean;
  hasTrips: boolean;
  tripCount?: number;
  trips?: Record<string, TripData>;
  tripNumbers?: number[];
  message: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          hasTrips: false,
          message: "userId parameter is required",
        } as UserTripsResponse,
        { status: 400 }
      );
    }

    // Get user data from Firebase Realtime Database
    const userRef = ref(realtimeDb, `Users/${userId}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      return NextResponse.json(
        {
          success: false,
          hasTrips: false,
          message: "User not found",
        } as UserTripsResponse,
        { status: 404 }
      );
    }

    const userData = userSnapshot.val();
    
    const hasTrips = userData.Trips && Object.keys(userData.Trips).length > 0;
    const tripCount = hasTrips ? Object.keys(userData.Trips).length : 0;

    // Extract numbers after underscore from trip IDs
    let tripNumbers: number[] = [];
    if (hasTrips) {
      tripNumbers = Object.keys(userData.Trips)
        .map(tripId => {
          const parts = tripId.split('_');
          if (parts.length > 1) {
            const number = parseInt(parts[parts.length - 1], 10);
            return isNaN(number) ? null : number;
          }
          return null;
        })
        .filter(num => num !== null) as number[];
    }

    if (hasTrips) {
      return NextResponse.json(
        {
          success: true,
          hasTrips: true,
          tripCount,
          trips: userData.Trips,
          tripNumbers,
          message: `User has ${tripCount} trip(s)`,
        } as UserTripsResponse,
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: true,
          hasTrips: false,
          tripCount: 0,
          tripNumbers: [],
          message: "User has no trips",
        } as UserTripsResponse,
        { status: 200 }
      );
    }

  } catch (error: unknown) {
    console.error("Check user trips error:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to check user trips";

    return NextResponse.json(
      {
        success: false,
        hasTrips: false,
        message: errorMessage,
      } as UserTripsResponse,
      { status: 500 }
    );
  }
}

// Optional: Add a POST method for more complex queries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, includeDetails = false } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          hasTrips: false,
          message: "userId is required in request body",
        } as UserTripsResponse,
        { status: 400 }
      );
    }

    // Get user data from Firebase Realtime Database
    const userRef = ref(realtimeDb, `Users/${userId}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      return NextResponse.json(
        {
          success: false,
          hasTrips: false,
          message: "User not found",
        } as UserTripsResponse,
        { status: 404 }
      );
    }

    const userData = userSnapshot.val();
    
    // Check if user has Trips field
    const hasTrips = userData.Trips && Object.keys(userData.Trips).length > 0;
    const tripCount = hasTrips ? Object.keys(userData.Trips).length : 0;

    // Extract numbers after underscore from trip IDs
    let tripNumbers: number[] = [];
    if (hasTrips) {
      tripNumbers = Object.keys(userData.Trips)
        .map(tripId => {
          const parts = tripId.split('_');
          if (parts.length > 1) {
            const number = parseInt(parts[parts.length - 1], 10);
            return isNaN(number) ? null : number;
          }
          return null;
        })
        .filter(num => num !== null) as number[];
    }

    const response: UserTripsResponse = {
      success: true,
      hasTrips,
      tripCount,
      tripNumbers,
      message: hasTrips ? `User has ${tripCount} trip(s)` : "User has no trips",
    };

    // Include trip details if requested
    if (includeDetails && hasTrips) {
      response.trips = userData.Trips;
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error: unknown) {
    console.error("Check user trips error:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to check user trips";

    return NextResponse.json(
      {
        success: false,
        hasTrips: false,
        message: errorMessage,
      } as UserTripsResponse,
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, bookingId, rideId, rideOnGoingStatus, action, isHold, rideTimer, totalTripTime } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "userId is required",
        },
        { status: 400 }
      );
    }

    // Get user data from Firebase Realtime Database
    const userRef = ref(realtimeDb, `Users/${userId}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const userData = userSnapshot.val();

    // Handle different actions
    if (action === "check-active-ride") {
      // Check if user has active ride
      const hasActiveRide = userData.rideId && userData.rideId !== "null" && userData.rideOnGoingStatus === "true";
      
      if (hasActiveRide) {
        const currentBookingId = userData.bookingId;
        const trips = userData.Trips || {};
        const currentTrip = trips[currentBookingId];
        
        return NextResponse.json(
          {
            success: true,
            hasActiveRide: true,
            rideData: {
              rideId: userData.rideId,
              bookingId: currentBookingId,
              isHold: currentTrip?.isHold || false,
              tripData: currentTrip
            },
            message: "Active ride found",
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          {
            success: true,
            hasActiveRide: false,
            message: "No active ride found",
          },
          { status: 200 }
        );
      }
    }

    if (action === "set-hold-status") {
      // Update hold status in trip data
      if (!bookingId) {
        return NextResponse.json(
          {
            success: false,
            message: "bookingId is required for hold status update",
          },
          { status: 400 }
        );
      }

      const tripRef = ref(realtimeDb, `Users/${userId}/Trips/${bookingId}`);
      const { update } = await import("firebase/database");
      
      const updateData: UpdateData = {
        isHold: isHold,
        holdUpdatedAt: new Date().toISOString(),
      };

      // If setting hold and timer values provided, update them
      if (isHold && rideTimer !== undefined) {
        updateData.rideTimer = rideTimer;
      }
      
      if (isHold && totalTripTime !== undefined) {
        updateData.totalTripTime = totalTripTime;
      }
      
      await update(tripRef, updateData);

      return NextResponse.json(
        {
          success: true,
          message: `Hold status set to ${isHold}`,
          updatedData: updateData,
        },
        { status: 200 }
      );
    }

    if (action === "update-ride-timer") {
      // Update ride timer in trip data
      if (!bookingId) {
        return NextResponse.json(
          {
            success: false,
            message: "bookingId is required for timer update",
          },
          { status: 400 }
        );
      }

      const tripRef = ref(realtimeDb, `Users/${userId}/Trips/${bookingId}`);
      const { update } = await import("firebase/database");
      
      const updateData: UpdateData = {
        timerUpdatedAt: new Date().toISOString(),
      };

      if (rideTimer !== undefined) {
        updateData.rideTimer = rideTimer;
      }
      
      if (totalTripTime !== undefined) {
        updateData.totalTripTime = totalTripTime;
      }
      
      await update(tripRef, updateData);

      return NextResponse.json(
        {
          success: true,
          message: "Ride timer updated successfully",
          updatedData: updateData,
        },
        { status: 200 }
      );
    }

    // Original functionality - Update user ride status
    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "userId and bookingId are required",
        },
        { status: 400 }
      );
    }

    // Update user data
    const updateData: UpdateData = {
      updatedAt: new Date().toISOString(),
    };

    if (rideId !== undefined) {
      updateData.rideId = rideId;
    }
    
    if (rideOnGoingStatus !== undefined) {
      updateData.rideOnGoingStatus = rideOnGoingStatus;
    }

    // If ending a ride, also update bookingId
    if (rideOnGoingStatus === "false") {
      updateData.bookingId = "null";
    }

    const { update } = await import("firebase/database");
    await update(userRef, updateData);

    return NextResponse.json(
      {
        success: true,
        message: "User data updated successfully",
        updatedFields: updateData,
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error("Update user data error:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to update user data";

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}