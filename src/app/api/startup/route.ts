import { NextResponse } from "next/server";

export async function POST() {
  try {
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";
    const normalizedUrl = baseUrl.startsWith("http")
      ? baseUrl
      : `https://${baseUrl}`;

    const schedulerResponse = await fetch(
      `${normalizedUrl}/api/auto-hold-scheduler`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "start",
          intervalSeconds: 30,
        }),
      }
    );

    const schedulerResult = await schedulerResponse.json();

    return NextResponse.json({
      success: true,
      message: "Background services started successfully",
      services: {
        scheduler: schedulerResult,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("❌ Failed to start background services:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to start background services",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";
    const normalizedUrl = baseUrl.startsWith("http")
      ? baseUrl
      : `https://${baseUrl}`;

    const schedulerResponse = await fetch(
      `${normalizedUrl}/api/auto-hold-scheduler`,
      {
        method: "GET",
      }
    );
    const schedulerStatus = await schedulerResponse.json();

    const checkerResponse = await fetch(
      `${normalizedUrl}/api/auto-hold-checker`,
      {
        method: "GET",
      }
    );
    const checkerStatus = await checkerResponse.json();

    return NextResponse.json({
      success: true,
      services: {
        scheduler: schedulerStatus,
        autoHoldChecker: checkerStatus,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("❌ Failed to check service status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check service status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
