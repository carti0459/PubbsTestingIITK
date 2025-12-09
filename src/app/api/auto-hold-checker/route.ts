import { NextResponse } from "next/server";
import { ref, get, update } from "firebase/database";
import { realtimeDb } from "@/lib/firebase-admin";

export async function POST() {
  try {
    const usersRef = ref(realtimeDb, "Users");
    const usersSnapshot = await get(usersRef);

    if (!usersSnapshot.exists()) {
      return NextResponse.json({
        success: true,
        message: "No users found",
        processedUsers: 0,
      });
    }

    const users = usersSnapshot.val();
    let processedUsers = 0;
    let usersSetOnHold = 0;

    const now = new Date();
    const inactivityThreshold = 30 * 1000;

    for (const [userId, userData] of Object.entries(
      users as Record<string, Record<string, unknown>>
    )) {
      if (
        !userData ||
        typeof userData !== "object" ||
        Array.isArray(userData)
      ) {
        continue;
      }

      const userRecord = userData as {
        rideId?: string;
        rideOnGoingStatus?: string;
        lastActivity?: string | number;
        bookingId?: string;
        rideStartTime?: string | number;
        Trips?: Record<
          string,
          {
            isHold?: boolean;
            rideStartTime?: string | number;
            holdTimer?: number;
          }
        >;
      };

      const hasActiveRide =
        userRecord.rideId &&
        userRecord.rideId !== "null" &&
        userRecord.rideOnGoingStatus === "true";

      if (hasActiveRide && userRecord.lastActivity) {
        const lastActivityValue = userRecord.lastActivity;
        if (!lastActivityValue) continue;

        const lastActivity = new Date(lastActivityValue);

        if (isNaN(lastActivity.getTime())) {
          continue;
        }

        const timeSinceLastActivity = now.getTime() - lastActivity.getTime();

        if (timeSinceLastActivity > inactivityThreshold) {
          const bookingId = userRecord.bookingId;

          const trips = userRecord.Trips || {};
          const currentTrip = bookingId ? trips[bookingId] : undefined;
          const isAlreadyOnHold = currentTrip?.isHold === true;

          if (!isAlreadyOnHold && bookingId && bookingId !== "null") {
            try {
              let rideStartTime = lastActivity;

              if (currentTrip?.rideStartTime) {
                const tripStartTime = new Date(currentTrip.rideStartTime);
                if (!isNaN(tripStartTime.getTime())) {
                  rideStartTime = tripStartTime;
                }
              } else if (userRecord.rideStartTime) {
                const userStartTime = new Date(userRecord.rideStartTime);
                if (!isNaN(userStartTime.getTime())) {
                  rideStartTime = userStartTime;
                }
              }

              const rideElapsed = Math.floor(
                lastActivity.getTime() - rideStartTime.getTime()
              );
              const existingHoldTime = currentTrip?.holdTimer || 0;
              const totalTripTime = rideElapsed + existingHoldTime;

              const tripRef = ref(
                realtimeDb,
                `Users/${userId}/Trips/${bookingId}`
              );
              await update(tripRef, {
                isHold: true,
                holdUpdatedAt: now.toISOString(),
                rideTimer: Math.max(rideElapsed, 0),
                totalTripTime: Math.max(totalTripTime, 0),
                rideStartTime: rideStartTime.toISOString(),
                autoHoldReason: "User inactive",
                autoHoldAt: now.toISOString(),
                lastActivityBeforeHold: lastActivity.toISOString(),
              });

              usersSetOnHold++;
            } catch (error) {
              console.error(`❌ Failed to set user ${userId} on hold:`, error);
            }
          }
        }

        processedUsers++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Auto-hold check completed",
      processedUsers,
      usersSetOnHold,
      timestamp: now.toISOString(),
    });
  } catch (error: unknown) {
    console.error("❌ Auto-hold checker error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Auto-hold checker failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Auto-hold checker is healthy",
    timestamp: new Date().toISOString(),
  });
}
