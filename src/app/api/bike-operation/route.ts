import { NextRequest, NextResponse } from "next/server";
import { realtimeDb } from "@/lib/firebase-admin";
import { ref, update } from "firebase/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bikeId, operator, operation, status, battery, ridetime, action } =
      body;

    if (!bikeId || !operator) {
      return NextResponse.json(
        { error: "Missing required fields: bikeId, operator" },
        { status: 400 }
      );
    }

    if (action === "direct-update") {
      const dbPath = `${operator}/Bicycle/${bikeId}`;

      try {
        const bikeRef = ref(realtimeDb, dbPath);

        const updateData = {
          operation: operation !== undefined ? operation : "0",
          status: status !== undefined ? status : "active",
          battery: battery !== undefined ? battery.toString() : "87",
          ridetime: ridetime !== undefined ? ridetime.toString() : "480",
          userMobile: "null",
        };

        await update(bikeRef, updateData);

        const { get } = await import("firebase/database");
        const snapshot = await get(bikeRef);

        if (snapshot.exists()) {
          const updatedData = snapshot.val();

          return NextResponse.json({
            success: true,
            message: `Bike updated directly in database: operation=${updateData.operation}, status=${updateData.status}`,
            updateData,
            verifiedData: updatedData,
          });
        } else {
          throw new Error("Bike not found in database after update");
        }
      } catch (dbError) {
        console.error("❌ Database update failed:", dbError);
        return NextResponse.json(
          {
            success: false,
            error: "Database update failed",
            details:
              dbError instanceof Error
                ? dbError.message
                : "Unknown database error",
          },
          { status: 500 }
        );
      }
    }

    if (action === "reset") {
      const azureUrl = `https://pubbss.azurewebsites.net/lockOperation?lockId=${bikeId}&value=update&operation=0&status=active&battery=${
        battery || 87
      }&ridetime=${ridetime || 480}`;

      const response = await fetch(azureUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Azure API returned status: ${response.status}`);
      }

      const result = await response.text();

      return NextResponse.json({
        success: true,
        message: `Bike reset to idle state (operation=0, status=active)`,
        azureResponse: result,
      });
    }

    if (operation === undefined || !status) {
      return NextResponse.json(
        { error: "Missing required fields: operation, status" },
        { status: 400 }
      );
    }

    const azureUrl = `https://pubbss.azurewebsites.net/lockOperation?lockId=${bikeId}&value=update&operation=${operation}&status=${status}&battery=${
      battery || 87
    }&ridetime=${ridetime || 480}`;

    const response = await fetch(azureUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Azure API returned status: ${response.status}`);
    }

    const result = await response.text();

    return NextResponse.json({
      success: true,
      message: `Bike operation updated: operation=${operation}, status=${status}`,
      azureResponse: result,
    });
  } catch (error) {
    console.error("❌ Error updating bike operation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update bike operation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
