import { NextRequest, NextResponse } from 'next/server';
import { ref, get } from 'firebase/database';
import { realtimeDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import crypto from 'crypto';

const forgotPasswordSchema = z.object({
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: validationResult.error.issues[0]?.message || 'Invalid phone number format'
        },
        { status: 400 }
      );
    }

    const { phoneNumber } = validationResult.data;

    // Find user by phone number in Users table (using phone number as key)
    const userRef = ref(realtimeDb, `Users/${phoneNumber}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'No account found with this phone number'
        },
        { status: 404 }
      );
    }

    const userData = userSnapshot.val();

    // Generate reset token for later use
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Send OTP using the dedicated send-otp endpoint (consistent with registration)
    try {
      const otpResponse = await fetch(`${request.nextUrl.origin}/api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          action: 'forgot-password'
        }),
      });

      const otpResult = await otpResponse.json();

      if (otpResult.success) {
        return NextResponse.json({
          success: true,
          message: 'OTP sent successfully to your phone number',
          resetToken,
          phoneNumber: userData.mobile,
          email: userData.email,
          username: userData.username,
          otpSent: true
        });
      } else {
        console.error('Send OTP failed:', otpResult);
        return NextResponse.json(
          {
            success: false,
            error: 'OTP_SEND_FAILED',
            message: otpResult.message || 'Failed to send OTP. Please try again.'
          },
          { status: 500 }
        );
      }
    } catch (otpError) {
      console.error('OTP sending error:', otpError);
      return NextResponse.json(
        {
          success: false,
          error: 'OTP_SEND_FAILED',
          message: 'Failed to send OTP. Please try again.'
        },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Forgot password error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Something went wrong. Please try again.'
      },
      { status: 500 }
    );
  }
}