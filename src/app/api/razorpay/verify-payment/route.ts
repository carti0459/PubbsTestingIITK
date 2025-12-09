import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { realtimeDb } from "@/lib/firebase-admin";
import { ref, set } from "firebase/database";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      subscriptionData,
    } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification parameters" },
        { status: 400 }
      );
    }

    // Validate subscription data
    if (!subscriptionData || typeof subscriptionData !== 'object') {
      return NextResponse.json(
        { error: "Missing or invalid subscription data" },
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
      operator = "PubbsTesting",
    } = subscriptionData;

    if (!userId || !phoneNumber || !subscriptionId || !subscriptionName || !validityDays) {
      return NextResponse.json(
        { error: "Missing required subscription fields" },
        { status: 400 }
      );
    }

    // ACID Properties: Atomicity - Either all operations succeed or all fail
    let payment;
    let firebaseWriteSuccess = false;
    
    try {
      // Step 1: Verify payment signature (no rollback needed)
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        return NextResponse.json(
          { error: "Payment verification failed - Invalid signature" },
          { status: 400 }
        );
      }

      // Step 2: Fetch payment details from Razorpay
      payment = await razorpay.payments.fetch(razorpay_payment_id);
      
      if (!payment || payment.status !== 'captured') {
        return NextResponse.json(
          { error: "Payment not captured or invalid" },
          { status: 400 }
        );
      }

      // Step 3: Prepare subscription data
      const currentTimestamp = Date.now();
      const uniqueSubsId = `${subscriptionId}PUBBS_OD_${currentTimestamp}`;
      
      const subscriptionDate = new Date().toISOString().replace("T", " ").slice(0, 23);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(validityDays));
      const subscriptionExpiry = expiryDate.toISOString().replace("T", " ").slice(0, 23);

      // Step 4: Create subscription record for Firebase
      const firebaseSubscriptionData = {
        maxFreeRide: maxFreeRides || "0",
        paymentId: razorpay_payment_id,
        subscriptionAmt: Number(payment.amount) / 100,
        subscriptionDate: subscriptionDate,
        subscriptionExpiry: subscriptionExpiry,
        subscriptionId: subscriptionId,
        uniqueSubsId: uniqueSubsId,
        validityTime: validityDays.toString(),
        orderId: razorpay_order_id,
        paymentMethod: payment.method,
        paymentStatus: payment.status,
        operator: operator,
      };

      // Step 4: Save to Firebase 
      const userSubscriptionRef = ref(
        realtimeDb,
        `Users/${phoneNumber}/MySubscriptions/${uniqueSubsId}`
      );
      
      await set(userSubscriptionRef, firebaseSubscriptionData);
      firebaseWriteSuccess = true;

      console.log(`Subscription saved for phone ${phoneNumber}:`, firebaseSubscriptionData);

      return NextResponse.json({
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        uniqueSubsId: uniqueSubsId,
        subscriptionData: firebaseSubscriptionData,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        createdAt: payment.created_at,
      });

    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      
      
      if (payment && !firebaseWriteSuccess) {
        console.error(`CRITICAL: Payment ${razorpay_payment_id} verified but subscription save failed for phone ${phoneNumber}`, {
          paymentId: razorpay_payment_id,
          phoneNumber,
          userId,
          subscriptionId,
          error: dbError
        });
      }
      
      return NextResponse.json(
        { error: "Subscription creation failed. Payment verified but not recorded. Please contact support." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
