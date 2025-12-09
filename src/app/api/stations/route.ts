import { NextRequest, NextResponse } from "next/server";
import { ref, get } from "firebase/database";
import { realtimeDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    // Get the area parameter from the URL search params
    const { searchParams } = new URL(request.url);
    const operator = searchParams.get('area') || 'IITKgpCampus'; // This is actually the operator now

    const stationsRef = ref(realtimeDb, `${operator}/Station`);
    const snapshot = await get(stationsRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: `No stations found for operator: ${operator}`,
          data: []
        },
        { status: 404 }
      );
    }

    const stationsData = snapshot.val();
    
    // Transform the data into a more usable format
    const stations = Object.keys(stationsData).map(stationKey => {
      const station = stationsData[stationKey];
      
      return {
        id: station.stationId || stationKey,
        name: station.stationName || stationKey,
        latitude: parseFloat(station.stationLatitude) || 0,
        longitude: parseFloat(station.stationLongitude) || 0,
        areaId: station.areaId || '',
        areaName: station.areaName || operator,
        radius: parseInt(station.stationRadius) || 50,
        status: station.stationStatus || false,
        type: station.stationType || 'primary',
        markerList: Array.isArray(station.markerList) 
          ? station.markerList.map((marker: unknown) => {
              const markerObj = marker as Record<string, unknown>;
              return {
                id: markerObj.id as string,
                latitude: markerObj.latitude as number,
                longitude: markerObj.longitude as number,
                ...markerObj
              };
            })
          : [],
        
        coordinates: {
          lat: parseFloat(station.stationLatitude) || 0,
          lng: parseFloat(station.stationLongitude) || 0
        }
      };
    });

    // Filter out stations with invalid coordinates
    const validStations = stations.filter(station => 
      station.latitude !== 0 && station.longitude !== 0
    );

    return NextResponse.json(
      {
        success: true,
        message: `Successfully fetched stations for ${operator}`,
        operator: operator,
        count: validStations.length,
        data: validStations
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error("Error fetching stations:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch stations from database",
        details: errorMessage,
        data: []
      },
      { status: 500 }
    );
  }
}

// Optional: Handle other HTTP methods
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "POST method not supported for this endpoint",
      supportedMethods: ["GET"]
    },
    { status: 405 }
  );
}