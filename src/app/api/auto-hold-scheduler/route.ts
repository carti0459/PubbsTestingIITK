import { NextRequest, NextResponse } from "next/server";

// Simple cron-like scheduler for auto-hold checker
let autoHoldInterval: NodeJS.Timeout | null = null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, intervalSeconds = 30 } = body;

    if (action === "start") {
      if (autoHoldInterval) {
        clearInterval(autoHoldInterval);
      }

      // Start the auto-hold checker interval
      autoHoldInterval = setInterval(async () => {
        try {
          
          const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
          const normalizedUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
          
          const response = await fetch(`${normalizedUrl}/api/auto-hold-checker`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          await response.json();
        } catch (error) {
          console.error("❌ Auto-hold check failed:", error);
        }
      }, intervalSeconds * 1000);

      return NextResponse.json({
        success: true,
        message: `Auto-hold scheduler started with ${intervalSeconds}s interval`,
        intervalSeconds,
      });
    }

    if (action === "stop") {
      if (autoHoldInterval) {
        clearInterval(autoHoldInterval);
        autoHoldInterval = null;
      }

      return NextResponse.json({
        success: true,
        message: "Auto-hold scheduler stopped",
      });
    }

    if (action === "status") {
      return NextResponse.json({
        success: true,
        isRunning: autoHoldInterval !== null,
        message: autoHoldInterval ? "Auto-hold scheduler is running" : "Auto-hold scheduler is stopped",
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid action. Use 'start', 'stop', or 'status'",
      },
      { status: 400 }
    );

  } catch (error: unknown) {
    console.error("❌ Auto-hold scheduler error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Auto-hold scheduler failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    isRunning: autoHoldInterval !== null,
    message: autoHoldInterval ? "Auto-hold scheduler is running" : "Auto-hold scheduler is stopped",
  });
}