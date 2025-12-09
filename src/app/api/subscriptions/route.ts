import { NextRequest, NextResponse } from "next/server";
import { ref, get, update } from "firebase/database";
import { realtimeDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operator = searchParams.get("operator");
    const areaId = searchParams.get("areaId");

    if (!operator) {
      return NextResponse.json(
        { error: "Operator parameter is required" },
        { status: 400 }
      );
    }

    const operatorRef = ref(realtimeDb, `${operator}/Subscription`);
    const snapshot = await get(operatorRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: "No subscriptions found for this operator" },
        { status: 404 }
      );
    }

    const subscriptions = snapshot.val() || {};

    let filteredSubscriptions = subscriptions;
    if (areaId) {
      filteredSubscriptions = Object.fromEntries(
        Object.entries(subscriptions).filter(
          ([, subscription]: [string, any]) => subscription.areaId === areaId
        )
      );
    }

    const activeSubscriptions = Object.fromEntries(
      Object.entries(filteredSubscriptions).filter(
        ([, subscription]: [string, any]) =>
          subscription.subscriptionStatus === "true" ||
          subscription.subscriptionStatus === true
      )
    );

    const subscriptionArray = Object.entries(activeSubscriptions).map(
      ([key, subscription]: [string, any]) => ({
        id: key,
        subscriptionId: subscription.subscriptionId,
        planName: subscription.subscriptionPlanName,
        price: parseInt(subscription.subscriptionPlanPrice) || 0,
        description:
          subscription.subscriptionDescription ||
          subscription.subscriptionDescriptionp,
        validityTime: parseInt(subscription.subscriptionValidityTime) || 1,
        maxFreeRide: parseInt(subscription.subscriptionMaxFreeRide) || 0,
        carryForward: parseInt(subscription.subscriptionCarryForward) || 0,
        areaId: subscription.areaId,
        areaName: subscription.areaName,
        status: subscription.subscriptionStatus,
        createdBy: subscription.createdBy,
        createdDate: subscription.createdDate,
      })
    );

    return NextResponse.json({
      success: true,
      operator,
      totalSubscriptions: subscriptionArray.length,
      subscriptions: subscriptionArray,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch subscriptions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operator, subscription } = body;

    if (!operator || !subscription) {
      return NextResponse.json(
        { error: "Operator and subscription data are required" },
        { status: 400 }
      );
    }

    const requiredFields = [
      "subscriptionId",
      "subscriptionPlanName",
      "subscriptionPlanPrice",
      "areaId",
    ];
    for (const field of requiredFields) {
      if (!subscription[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const subscriptionData = {
      ...subscription,
      subscriptionStatus: "true",
      createdDate: new Date().toLocaleDateString("en-GB"),
      subscriptionCarryForward: subscription.subscriptionCarryForward || 0,
      subscriptionMaxFreeRide: subscription.subscriptionMaxFreeRide || 0,
      subscriptionValidityTime: subscription.subscriptionValidityTime || 1,
    };

    const subscriptionKey =
      subscription.subscriptionId || `${operator}_SP_${Date.now()}`;

    const operatorRef = ref(
      realtimeDb,
      `${operator}/Subscription/${subscriptionKey}`
    );
    await update(operatorRef, subscriptionData);

    return NextResponse.json({
      success: true,
      message: "Subscription created successfully",
      subscriptionKey,
      subscription: subscriptionData,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      {
        error: "Failed to create subscription",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
