import { NextRequest, NextResponse } from 'next/server';
import { realtimeDb } from '@/lib/firebase-admin';
import { ref, get } from 'firebase/database';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const operatorId = searchParams.get('operator');

    if (!operatorId) {
      return NextResponse.json(
        { error: 'Operator ID is required' },
        { status: 400 }
      );
    }

    // Fetch coupons for the specific operator
    const couponsRef = ref(realtimeDb, `${operatorId}/Coupon`);
    const snapshot = await get(couponsRef);

    if (!snapshot.exists()) {
      return NextResponse.json({
        success: true,
        coupons: {},
        message: 'No coupons found for this operator'
      });
    }

    const couponsData = snapshot.val();
    // Handle both string values and object values for coupons
    const availableCoupons: Record<string, any> = {};
    
    for (const [couponCode, couponValue] of Object.entries(couponsData)) {
      
      // If couponValue is a string (like "0", "1", "2")
      if (typeof couponValue === 'string' || typeof couponValue === 'number') {
        // Only include coupons with status "1" (available)
        if (couponValue === "1" || couponValue === 1) {
          availableCoupons[couponCode] = {
            code: couponCode,
            discount: 0, // Default values since we only have status
            type: "percentage",
            description: `Coupon ${couponCode}`,
            status: couponValue,
            validityDays: 30,
            maxFreeRides: 0,
          };
        }
      } 
      // If couponValue is an object with properties
      else if (typeof couponValue === 'object' && couponValue !== null) {
        const coupon = couponValue as any;
        // Only include coupons with status "1" (available)
        if (coupon.status === "1" || coupon.status === 1) {
          availableCoupons[couponCode] = {
            code: couponCode,
            discount: coupon.discount || 0,
            type: coupon.type || "percentage",
            description: coupon.description || `Coupon ${couponCode}`,
            status: coupon.status,
            validityDays: coupon.validityDays || 30,
            maxFreeRides: coupon.maxFreeRides || 0,
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      operator: operatorId,
      coupons: availableCoupons,
      totalAvailable: Object.keys(availableCoupons).length
    });

  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}