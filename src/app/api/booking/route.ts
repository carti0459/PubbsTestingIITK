import { NextRequest, NextResponse } from "next/server";
import { ref, get } from "firebase/database";
import { realtimeDb } from "@/lib/firebase-admin";

interface BookingTripsResponse {
  success: boolean;
  hasTrips: boolean;
  tripCount?: number;
  tripNumbers?: number[];
  activeBooking?: string;
  rideOnGoingStatus?: boolean;
  message: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const mobile = searchParams.get('mobile');

    // Accept either userId or mobile number
    const identifier = userId || mobile;

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          hasTrips: false,
          message: "userId or mobile parameter is required",
        } as BookingTripsResponse,
        { status: 400 }
      );
    }

    // Get user data from Firebase Realtime Database
    const userRef = ref(realtimeDb, `Users/${identifier}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      return NextResponse.json(
        {
          success: false,
          hasTrips: false,
          message: "User not found",
        } as BookingTripsResponse,
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
    
    // Additional booking-related information
    const activeBooking = userData.bookingId;
    const rideOnGoingStatus = userData.rideOnGoingStatus === "true";

    return NextResponse.json(
      {
        success: true,
        hasTrips,
        tripCount,
        tripNumbers,
        activeBooking: activeBooking !== "null" ? activeBooking : undefined,
        rideOnGoingStatus,
        message: hasTrips 
          ? `User has ${tripCount} trip(s)${rideOnGoingStatus ? ' and has an ongoing ride' : ''}` 
          : "User has no trips",
      } as BookingTripsResponse,
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error("Check booking trips error:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to check booking trips";

    return NextResponse.json(
      {
        success: false,
        hasTrips: false,
        message: errorMessage,
      } as BookingTripsResponse,
      { status: 500 }
    );
  }
}