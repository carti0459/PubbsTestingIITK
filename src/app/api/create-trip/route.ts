import { NextRequest, NextResponse } from "next/server";
import { ref, get, update } from "firebase/database";
import { realtimeDb } from "@/lib/firebase-admin";


async function updateStationCycleCount(stationId: string, operator: string, increment: boolean) {
  try {
    if (!stationId || stationId === "Unknown" || stationId === "null") {
      return { success: true, skipped: true, reason: "Invalid station ID" };
    }

    const stationRef = ref(realtimeDb, `${operator}/Station/${stationId}`);
    const snapshot = await get(stationRef);
    
    if (snapshot.exists()) {
      const stationData = snapshot.val();
      const currentCount = parseInt(stationData.stationCycleCount || "0");
      const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
      
      await update(stationRef, {
        stationCycleCount: newCount.toString()
      });
      
      return { success: true, oldCount: currentCount, newCount };
    } else {
      const stationsRef = ref(realtimeDb, `${operator}/Station`);
      const stationsSnapshot = await get(stationsRef);
      
      if (stationsSnapshot.exists()) {
        const availableStations = Object.keys(stationsSnapshot.val()).slice(0, 5); // Show first 5
        console.warn(`⚠️ Station ${stationId} not found for cycle count update in operator ${operator}`);
        console.warn(`📋 Available stations (first 5): [${availableStations.join(', ')}]`);
      } 
      
      return { success: false, error: "Station not found" };
    }
  } catch (error) {
    console.error(`❌ Failed to update station cycle count for ${stationId}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

interface UpdateData {
  updatedAt?: string;
  currentBookingId?: string;
  rideId?: string;
  rideOnGoingStatus?: string;
  rideStartTime?: string;
  lastActivity?: string;
  [key: string]: unknown;
}

interface TripUpdates {
  destinationStationId?: string;
  destinationStationName?: string;
  fare?: string;
  holdTimer?: number;
  rideTimer?: number;
  totalTripTime?: number;
  tripEndTime?: string;
  [key: string]: unknown;
}

interface CreateTripRequest {
  userId: string;
  bookingId: string;
  bikeId: string;
  sourceStationId?: string;
  sourceStationName?: string;
  operator?: string;
  // Optional fields for updating existing trips
  destinationStationId?: string;
  destinationStationName?: string;
  fare?: string;
  holdTimer?: number;
  rideTimer?: number;
  totalTripTime?: number;
  endTrip?: boolean;
}

interface TripData {
  sourceStationId: string;
  sourceStationName: string;
  destinationStationId: string;
  destinationStationName: string;
  fare: string;
  holdTimer: number;
  rideTimer: number;
  totalTripTime: number;
  trackLocationTime: string;
  tripId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTripRequest = await request.json();
    const { 
      userId, 
      bookingId, 
      bikeId, 
      sourceStationId, 
      sourceStationName, 
      operator,
      destinationStationId,
      destinationStationName,
      fare,
      holdTimer,
      rideTimer,
      totalTripTime,
      endTrip = false
    } = body;

    if (!userId || !bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "userId and bookingId are required",
        },
        { status: 400 }
      );
    }

    // Get user data from Firebase
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
    const updateData: UpdateData = {
      updatedAt: new Date().toISOString(),
    };

    // Check if this is a new trip creation or update
    const isNewTrip = !userData.Trips || !userData.Trips[bookingId];

    if (isNewTrip) {
      // CREATE NEW TRIP
      if (!bikeId) {
        return NextResponse.json(
          {
            success: false,
            message: "bikeId is required for new trip creation",
          },
          { status: 400 }
        );
      }

      // Get bike information if not provided
      let bikeData = null;
      try {
        const bikeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/bikes?bikeId=${bikeId}&operator=${operator || 'PubbsTesting'}`);
        if (bikeResponse.ok) {
          const bikeResult = await bikeResponse.json();
          if (bikeResult.success) {
            bikeData = bikeResult.bike;
          }
        }
      } catch (error) {
        console.warn("Could not fetch bike data:", error);
      }

      // Create new trip data
      const newTripData: TripData = {
        sourceStationId: sourceStationId || bikeData?.inStationId || "Unknown",
        sourceStationName: sourceStationName || bikeData?.inStationName || "Unknown",
        destinationStationId: "Unknown",
        destinationStationName: "Unknown",
        fare: "0.00",
        holdTimer: 0,
        rideTimer: 0,
        totalTripTime: 0,
        trackLocationTime: new Date().toISOString().replace('T', ' ').slice(0, -5),
        tripId: bookingId,
      };

      // Update user with new trip
      updateData.bookingId = bookingId;
      updateData.rideOnGoingStatus = "true";
      updateData.rideId = bikeId;

      if (userData.Trips && typeof userData.Trips === 'object') {
        updateData[`Trips/${bookingId}`] = newTripData;
      } else {
        updateData.Trips = {
          [bookingId]: newTripData
        };
      }

      const sourceStation = newTripData.sourceStationId;
      if(sourceStation && sourceStation !== "Unknown") {
        await updateStationCycleCount(sourceStation, operator || 'PubbsTesting', false);
      }

      await update(userRef, updateData);

      return NextResponse.json(
        {
          success: true,
          message: "Trip created successfully",
          bookingId,
          tripData: newTripData,
          isNewTrip: true,
        },
        { status: 200 }
      );

    } else {
      // UPDATE EXISTING TRIP
      const tripUpdates: TripUpdates = {};
      
      if (destinationStationId !== undefined) {
        tripUpdates.destinationStationId = destinationStationId;
      }
      if (destinationStationName !== undefined) {
        tripUpdates.destinationStationName = destinationStationName;
      }
      if (fare !== undefined) {
        tripUpdates.fare = fare.toString();
      }
      if (holdTimer !== undefined) {
        tripUpdates.holdTimer = holdTimer;
      }
      if (rideTimer !== undefined) {
        tripUpdates.rideTimer = rideTimer;
      }
      if (totalTripTime !== undefined) {
        tripUpdates.totalTripTime = totalTripTime;
      }

      // Always update track location time
      tripUpdates.trackLocationTime = new Date().toISOString().replace('T', ' ').slice(0, -5);

      // Apply trip updates
      Object.keys(tripUpdates).forEach(key => {
        updateData[`Trips/${bookingId}/${key}`] = tripUpdates[key];
      });

      // If ending the trip, update user status
      if (endTrip) {
        updateData.rideOnGoingStatus = "false";
        updateData.bookingId = "null";
        updateData.rideId = "null";
        
        // Increment destination station cycle count when trip ends
        if (destinationStationId && destinationStationId !== "Unknown") {
          await updateStationCycleCount(destinationStationId, operator || 'PubbsTesting', true);
        }
      }

      await update(userRef, updateData);

      return NextResponse.json(
        {
          success: true,
          message: endTrip ? "Trip ended successfully" : "Trip updated successfully",
          bookingId,
          updatedFields: tripUpdates,
          tripEnded: endTrip,
          isNewTrip: false,
        },
        { status: 200 }
      );
    }

  } catch (error: unknown) {
    console.error("Trip operation error:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to process trip";

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
} 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.get('debug');
  const operator = searchParams.get('operator') || 'PubbsTesting';
  
  if (debug === 'stations') {
    try {
      const stationsRef = ref(realtimeDb, `${operator}/Station`);
      const snapshot = await get(stationsRef);
      
      if (snapshot.exists()) {
        const stations = snapshot.val();
        const stationList = Object.keys(stations).map(key => ({
          id: key,
          name: stations[key]?.stationName || 'Unknown',
          cycleCount: stations[key]?.stationcyclecount || '0'
        }));
        
        return NextResponse.json({
          success: true,
          operator,
          totalStations: stationList.length,
          stations: stationList
        });
      } else {
        return NextResponse.json({
          success: false,
          operator,
          message: "No stations found",
          totalStations: 0
        });
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch stations"
      });
    }
  }

  return NextResponse.json(
    {
      success: true,
      message: "Trip Management API is working",
      endpoint: "/api/create-trip",
      method: "POST",
      description: "Handles both trip creation and updates",
      newTripFields: ["userId", "bookingId", "bikeId", "sourceStationId?", "sourceStationName?", "operator?"],
      updateTripFields: ["userId", "bookingId", "destinationStationId?", "destinationStationName?", "fare?", "holdTimer?", "rideTimer?", "totalTripTime?", "endTrip?"],
      debugEndpoints: {
        "GET /api/create-trip?debug=stations": "List all available stations",
        "GET /api/create-trip?debug=stations&operator=IITKgpCampus": "List stations for specific operator"
      }
    },
    { status: 200 }
  );
}

