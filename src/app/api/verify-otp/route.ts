import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { msg91Service } from '@/lib/msg91';

const verifyOTPSchema = z.object({
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  action: z.enum(['registration', 'forgot-password']).optional().default('registration')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = verifyOTPSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: validationResult.error.issues[0]?.message || 'Invalid input'
        },
        { status: 400 }
      );
    }

    const { phoneNumber, otp, action } = validationResult.data;

    // Validate OTP format
    if (!msg91Service.isValidOTP(otp)) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_OTP_FORMAT',
          message: 'OTP must be 6 digits'
        },
        { status: 400 }
      );
    }

    // Verify OTP with MSG91 directly (no local database checks)
    const isValidOTP = await msg91Service.verifyOTP(phoneNumber, otp);
    
    if (!isValidOTP) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_OTP',
          message: 'Invalid OTP. Please check and try again.',
        },
        { status: 400 }
      );
    }

    // OTP is valid
    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      action: action,
      phoneNumber: phoneNumber
    });

  } catch (error: unknown) {
    console.error('Verify OTP error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Failed to verify OTP. Please try again.'
      },
      { status: 500 }
    );
  }
}
