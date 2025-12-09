import { NextRequest, NextResponse } from 'next/server';
import { ref, get, update } from 'firebase/database';
import { realtimeDb } from '@/lib/firebase-admin';
import { registerSchema, phoneUpdateSchema } from '@/lib/validations/auth.validation';


interface RegisterRequest {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}


interface PhoneUpdateRequest {
  id: string;
  phoneNumber: string;
}

export async function POST(request: NextRequest) {
  try {
    
    const body: RegisterRequest = await request.json();
    
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'VALIDATION_ERROR',
          message: validationResult.error.issues[0]?.message || 'Invalid input data'
        },
        { status: 400 }
      );
    }
    
    // Check 1: Mobile number exists in Users/ (corrected case)
    const usersRef = ref(realtimeDb, `Users/${body.phoneNumber}`);
    const mobileSnapshot = await get(usersRef);
    
    if (mobileSnapshot.exists()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'PHONE_ALREADY_EXISTS',
          message: 'User already exists. Please Login' 
        },
        { status: 409 }
      );
    }
    
    // Check 2: Email exists in mailRef (Flutter format)
    const emailKey = body.email.toLowerCase().replaceAll('@', '').replaceAll('.', '');
    const mailRef = ref(realtimeDb, `mailRef/${emailKey}`);
    const mailSnapshot = await get(mailRef);
    
    if (mailSnapshot.exists()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'Mail already exists. Please Login' 
        },
        { status: 409 }
      );
    }
    
    // Check 3: Username exists in userNameRef (Flutter format)
    const usernameRef = ref(realtimeDb, `userNameRef/${body.username}`);
    const usernameSnapshot = await get(usernameRef);
    
    if (usernameSnapshot.exists()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'USERNAME_ALREADY_EXISTS',
          message: 'UserName already exists. Please take another username' 
        },
        { status: 409 }
      );
    }

    try {
      const otpResponse = await fetch(`${request.nextUrl.origin}/api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: body.phoneNumber,
          action: 'registration'
        }),
      });

      const otpResult = await otpResponse.json();

      if (otpResult.success) {
        return NextResponse.json({
          success: true,
          message: 'OTP sent successfully. Please verify to complete registration.',
          phoneNumber: body.phoneNumber,
          requestId: otpResult.requestId,
          expiresIn: otpResult.expiresIn
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'OTP_FAILED',
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
          error: 'OTP_FAILED',
          message: 'Failed to send OTP. Please try again.'
        },
        { status: 500 }
      );
    }  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    const firebaseError = error as { code?: string };
    
    if (firebaseError.code === 'auth/email-already-in-use') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email already exists. Please try logging in instead.' 
        },
        { status: 409 }
      );
    }
    
    if (firebaseError.code === 'auth/weak-password') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password is too weak' 
        },
        { status: 400 }
      );
    }
    
    if (firebaseError.code === 'auth/invalid-email') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email address' 
        },
        { status: 400 }
      );
    }

    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Registration failed. Please try again.' 
      },
      { status: 500 }
    );
  }
}


export async function PATCH(request: NextRequest) {
  try {
    const body: PhoneUpdateRequest = await request.json();
    
    const validationResult = phoneUpdateSchema.safeParse(body);
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

    const userRef = ref(realtimeDb, `Users/${body.id}`);
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

    const usersRef = ref(realtimeDb, 'Users');
    const usersSnapshot = await get(usersRef);
    
    let otherUsersWithPhone = [];
    if (usersSnapshot.exists()) {
      const usersData = usersSnapshot.val() as Record<string, { phoneNumber?: string; [key: string]: unknown }>;
      otherUsersWithPhone = Object.entries(usersData)
        .filter(([userId, userData]) => 
          userId !== body.id && userData.phoneNumber === body.phoneNumber
        );
    }
    
    if (otherUsersWithPhone.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'PHONE_ALREADY_EXISTS',
          message: 'This phone number is already registered with another account' 
        },
        { status: 409 }
      );
    }

    await update(userRef, {
      phoneNumber: body.phoneNumber,
      phoneVerified: false, 
      updatedAt: new Date().toISOString()
    });

    
    const updatedUserSnapshot = await get(userRef);
    const updatedUserData = updatedUserSnapshot.val();

    
    return NextResponse.json(
      {
        success: true,
        message: 'Phone number updated successfully',
        user: {
          uid: updatedUserData?.uid,
          email: updatedUserData?.email,
          fullName: updatedUserData?.fullName,
          phoneNumber: updatedUserData?.phoneNumber,
          phoneVerified: updatedUserData?.phoneVerified,
          pubbsId: updatedUserData?.pubbsId
        }
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Phone update error:', error);

    
    return NextResponse.json(
      { 
        success: false, 
        error: 'PHONE_UPDATE_FAILED',
        message: 'Failed to update phone number. Please try again.' 
      },
      { status: 500 }
    );
  }
}


export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'Registration API is working',
      endpoints: {
        'POST /api/register': 'Create new user account',
        'PATCH /api/register': 'Update user phone number'
      }
    },
    { status: 200 }
  );
}
