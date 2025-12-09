import { NextRequest, NextResponse } from "next/server";
import { realtimeDb } from "@/lib/firebase-admin";
import { ref, get, set } from "firebase/database";

export async function POST(req: NextRequest) {
  let couponUpdateSuccess = false;
  let subscriptionCreateSuccess = false;
  let couponCode = "";
  let operatorId = "";

  try {
    const body = await req.json();
    const requestData = body;

    couponCode = requestData.couponCode;
    operatorId = requestData.operatorId;
    const { subscriptionData } = requestData;

    if (!couponCode || !operatorId || !subscriptionData) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: couponCode, operatorId, subscriptionData",
        },
        { status: 400 }
      );
    }

    const {
      userId,
      phoneNumber,
      subscriptionId,
      subscriptionName,
      validityDays,
      maxFreeRides,
      operator,
    } = subscriptionData;

    if (!userId || !phoneNumber || !subscriptionId || !subscriptionName) {
      return NextResponse.json(
        { error: "Missing required subscription fields" },
        { status: 400 }
      );
    }

    const couponRef = ref(
      realtimeDb,
      `${operatorId}/Coupon/${couponCode.toUpperCase()}`
    );
    const couponSnapshot = await get(couponRef);

    if (!couponSnapshot.exists()) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 400 });
    }

    const couponData = couponSnapshot.val();
    console.log(
      `Coupon data for ${couponCode}:`,
      couponData,
      typeof couponData
    );

    let couponStatus;

    if (typeof couponData === "string" || typeof couponData === "number") {
      couponStatus = couponData;
    } else if (typeof couponData === "object" && couponData !== null) {
      couponStatus = couponData.status;
    }

    if (couponStatus !== "1" && couponStatus !== 1) {
      const statusMessage =
        couponStatus === "0" ? "not available" : "already used or invalid";
      return NextResponse.json(
        { error: `Coupon is ${statusMessage}` },
        { status: 400 }
      );
    }

    const currentTimestamp = Date.now();
    const uniqueSubsId = `${subscriptionId}PUBBS_OD_${currentTimestamp}`;

    const subscriptionDate = new Date()
      .toISOString()
      .replace("T", " ")
      .slice(0, 23);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(validityDays));
    const subscriptionExpiry = expiryDate
      .toISOString()
      .replace("T", " ")
      .slice(0, 23);

    const firebaseSubscriptionData = {
      maxFreeRide: maxFreeRides || couponData.maxFreeRides || "0",
      paymentId: `coupon_${couponCode.toLowerCase()}_${currentTimestamp}`,
      subscriptionAmt: 0,
      subscriptionDate: subscriptionDate,
      subscriptionExpiry: subscriptionExpiry,
      subscriptionId: subscriptionId,
      uniqueSubsId: uniqueSubsId,
      validityTime: (validityDays || couponData.validityDays || 30).toString(),
      orderId: `coupon_order_${currentTimestamp}`,
      paymentMethod: "Coupon",
      paymentStatus: "completed",
      operator: operator || operatorId,
      couponCode: couponCode.toUpperCase(),
      couponDiscount: couponData.discount || 0,
    };

    const userSubscriptionRef = ref(
      realtimeDb,
      `Users/${phoneNumber}/MySubscriptions/${uniqueSubsId}`
    );

    await set(userSubscriptionRef, firebaseSubscriptionData);
    subscriptionCreateSuccess = true;

    const couponUpdateRef = ref(
      realtimeDb,
      `${operatorId}/Coupon/${couponCode.toUpperCase()}/status`
    );
    await set(couponUpdateRef, "0");
    couponUpdateSuccess = true;

    console.log(
      `Coupon ${couponCode} redeemed successfully for phone ${phoneNumber}:`,
      firebaseSubscriptionData
    );

    return NextResponse.json({
      success: true,
      message: "Coupon redeemed successfully",
      subscriptionData: firebaseSubscriptionData,
      uniqueSubsId: uniqueSubsId,
      couponCode: couponCode.toUpperCase(),
      discount: couponData.discount,
      paymentMethod: "Coupon",
    });
  } catch (error) {
    console.error("Coupon redemption error:", error);

    if (subscriptionCreateSuccess && !couponUpdateSuccess) {
      console.error(
        `WARNING: Subscription created but coupon ${couponCode} status not updated for operator ${operatorId}`
      );
    }

    return NextResponse.json(
      { error: "Coupon redemption failed" },
      { status: 500 }
    );
  }
}
