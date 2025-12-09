import { NextRequest, NextResponse } from "next/server";
import { ref, get, update } from "firebase/database";
import { realtimeDb } from "@/lib/firebase-admin";

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 }
      );
    }

    let userData = null;

    // Find user in database by email (simple like Flutter)
    try {
      const emailKey = body.email.toLowerCase().replaceAll('@', '').replaceAll('.', '');
      const emailRefSnapshot = await get(ref(realtimeDb, `mailRef/${emailKey}`));
      
      if (emailRefSnapshot.exists()) {
        // Email reference exists, now find the actual user data
        const usersSnapshot = await get(ref(realtimeDb, 'Users'));
        if (usersSnapshot.exists()) {
          const users = usersSnapshot.val();
          
          // Find user by email
          for (const phoneNumber in users) {
            const user = users[phoneNumber];
            if (user.email && user.email.toLowerCase() === body.email.toLowerCase()) {
              userData = user;
              break;
            }
          }
        }
      }
    } catch (dbError) {
      console.warn("Could not fetch user data from Realtime Database:", dbError);
    }

    // If user not found in database, return error
    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Check password against database
    if (userData.password !== body.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Update last login time
    try {
      const phoneNumber = userData.mobile;
      await update(ref(realtimeDb, `Users/${phoneNumber}`), {
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (updateError) {
      console.warn("Could not update last login time:", updateError);
    }

    const responseData = {
      
      uid: userData.id,
      email: userData.email,
      emailVerified: false,
      displayName: userData.name,
      lastLoginAt: new Date().toISOString(),
      
      // Add user data from database
      id: userData.id,
      phoneNumber: userData.mobile,
      username: userData.username,
      active: userData.active,
      name: userData.name,
      // Include all other user data for completeness
      gender: userData.gender,
      age: userData.age,
      address: userData.address,
      deviceId: userData.deviceId,
      imei: userData.imei,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: responseData,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Login error:", error);

    let errorMessage = "Login failed";
    let statusCode = 500;

    const firebaseError = error as { code?: string; message?: string };

    if (firebaseError.code) {
      statusCode = 401;

      switch (firebaseError.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection";
          break;
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email/password login is not enabled";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak";
          break;
        default:
          errorMessage = firebaseError.message || "Authentication failed";
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorCode: firebaseError.code || "unknown",
      },
      { status: statusCode }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: "Login API is working",
      endpoint: "/api/login",
      method: "POST",
      expectedFields: ["email", "password"],
    },
    { status: 200 }
  );
}