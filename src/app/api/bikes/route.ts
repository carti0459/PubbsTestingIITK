import { NextRequest, NextResponse } from "next/server";
import { realtimeDb } from "@/lib/firebase-admin";
import { ref, get } from "firebase/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bikeId = searchParams.get("bikeId");
    const operator = searchParams.get("operator") || "PubbsTesting";

    if (!bikeId) {
      return NextResponse.json(
        { error: "Bike ID is required" },
        { status: 400 }
      );
    }

    // Fetch bike data from Firebase
    const bikeRef = ref(realtimeDb, `${operator}/Bicycle/${bikeId}`);

    const snapshot = await get(bikeRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        {
          error: "Bike not found",
          bikeId,
          operator,
          path: `${operator}/Bicycle/${bikeId}`,
        },
        { status: 404 }
      );
    }

    const bikeData = snapshot.val();

    // Return the bike data
    return NextResponse.json({
      success: true,
      bike: {
        id: bikeId,
        operator,
        ...bikeData,
      },
    });
  } catch (error) {
    console.error("💥 API: Error fetching bike data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch bike data",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
