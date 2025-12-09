import { NextResponse } from "next/server";
import { ref, set } from "firebase/database";
import { realtimeDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";
    const normalizedUrl = baseUrl.startsWith("http")
      ? baseUrl
      : `https://${baseUrl}`;

    const now = new Date();
    const services = {
      scheduler: {
        status: "unknown" as string,
        lastCheck: now.toISOString(),
        data: null as Record<string, unknown> | null,
      },
      autoHoldChecker: {
        status: "unknown" as string,
        lastCheck: now.toISOString(),
        data: null as Record<string, unknown> | null,
      },
    };

    try {
      const schedulerResponse = await fetch(
        `${normalizedUrl}/api/auto-hold-scheduler`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (schedulerResponse.ok) {
        const schedulerData = await schedulerResponse.json();
        services.scheduler = {
          status: schedulerData.isRunning ? "running" : "stopped",
          lastCheck: now.toISOString(),
          data: schedulerData,
        };
      } else {
        services.scheduler.status = "error";
      }
    } catch (error) {
      console.error("Failed to check scheduler:", error);
      services.scheduler.status = "error";
    }

    try {
      const checkerResponse = await fetch(
        `${normalizedUrl}/api/auto-hold-checker`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (checkerResponse.ok) {
        const checkerData = await checkerResponse.json();
        services.autoHoldChecker = {
          status: "healthy",
          lastCheck: now.toISOString(),
          data: checkerData,
        };
      } else {
        services.autoHoldChecker.status = "error";
      }
    } catch (error) {
      console.error("Failed to check auto-hold-checker:", error);
      services.autoHoldChecker.status = "error";
    }

    const statusRef = ref(realtimeDb, "ServiceStatus");
    await set(statusRef, {
      ...services,
      lastUpdate: now.toISOString(),
      environment: process.env.NODE_ENV || "development",
    });

    if (services.scheduler.status === "stopped") {
      try {
        const restartResponse = await fetch(
          `${normalizedUrl}/api/auto-hold-scheduler`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "start", intervalSeconds: 30 }),
          }
        );

        if (restartResponse.ok) {
          services.scheduler.status = "restarted";
        }
      } catch (error) {
        console.error("❌ Failed to restart scheduler:", error);
      }
    }

    return NextResponse.json({
      success: true,
      services,
      timestamp: now.toISOString(),
      message: "Service monitoring completed",
    });
  } catch (error: unknown) {
    console.error("❌ Service monitoring error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Service monitoring failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";
    const normalizedUrl = baseUrl.startsWith("http")
      ? baseUrl
      : `https://${baseUrl}`;

    const restartResponse = await fetch(`${normalizedUrl}/api/startup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const result = await restartResponse.json();

    return NextResponse.json({
      success: true,
      message: "Services restarted",
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("❌ Service restart error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Service restart failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
