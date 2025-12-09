import { NextRequest, NextResponse } from 'next/server';
import { ref, get, update } from 'firebase/database';
import { realtimeDb } from '@/lib/firebase-admin';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  phoneNumber: z.string().min(10, 'Phone number is required'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validationResult = resetPasswordSchema.safeParse(body);
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

    const { phoneNumber, newPassword } = body;

    const userRef = ref(realtimeDb, `Users/${phoneNumber}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        },
        { status: 404 }
      );
    }

    try {
      await update(userRef, {
        password: newPassword,
        lastPasswordChange: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully'
      });

    } catch (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'UPDATE_ERROR',
          message: 'Failed to update password. Please try again.'
        },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Reset password error:', error);
    
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
