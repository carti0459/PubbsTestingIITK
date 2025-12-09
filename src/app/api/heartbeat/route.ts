import { NextRequest, NextResponse } from "next/server";
import { ref, update } from "firebase/database";
import { realtimeDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, rideStartTime } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "userId is required",
        },
        { status: 400 }
      );
    }

    const now = new Date();

    // Update user's last activity timestamp
    const userRef = ref(realtimeDb, `Users/${userId}`);
    const updateData: Record<string, string> = {
      lastActivity: now.toISOString(),
      lastHeartbeat: now.toISOString(),
    };

    // If ride start time provided, store it for timer calculations
    if (rideStartTime) {
      updateData.rideStartTime = rideStartTime;
    }

    await update(userRef, updateData);

    return NextResponse.json({
      success: true,
      message: "Heartbeat recorded",
      timestamp: now.toISOString(),
    });

  } catch (error: unknown) {
    console.error("❌ Heartbeat error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to record heartbeat",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Heartbeat API is healthy",
    timestamp: new Date().toISOString(),
  });
}