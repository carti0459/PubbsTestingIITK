import { NextRequest, NextResponse } from "next/server";
import { ref, get, update, remove } from "firebase/database";
import { realtimeDb } from "@/lib/firebase-admin";

interface UpdateProfileRequest {
  name: string;
  email: string;
  gender: string;
  mobile: string;
  operator: string;
  area: string;
  area_id: string;
  age: number;
  address: string;
}

export async function PUT(request: NextRequest) {
  try {
    const body: UpdateProfileRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.mobile) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email, and mobile are required fields",
        },
        { status: 400 }
      );
    }

    // Validate email format
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

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(body.mobile)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone number format",
        },
        { status: 400 }
      );
    }

    let userData = null;
    let userKey = null;

    // Find user in database by mobile number (assuming mobile is the key)
    try {
      const usersSnapshot = await get(ref(realtimeDb, 'Users'));
      if (usersSnapshot.exists()) {
        const users = usersSnapshot.val();
        
        // Find user by mobile number
        for (const phoneNumber in users) {
          const user = users[phoneNumber];
          if (user.mobile === body.mobile) {
            userData = user;
            userKey = phoneNumber;
            break;
          }
        }
      }
    } catch (dbError) {
      console.error("Could not fetch user data from Realtime Database:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Database connection error",
        },
        { status: 500 }
      );
    }

    // If user not found in database, return error
    if (!userData || !userKey) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      name: body.name,
      email: body.email,
      gender: body.gender || userData.gender || '',
      mobile: body.mobile,
      operator: body.operator || userData.operator || '',
      area: body.area || userData.area || '',
      area_id: body.area_id || userData.area_id || '',
      age: body.age || userData.age || 0,
      address: body.address || userData.address || '',
      updatedAt: new Date().toISOString(),
    };

    // Update user data in database
    try {
      await update(ref(realtimeDb, `Users/${userKey}`), updateData);
      
      // Also update email reference if email changed
      if (userData.email !== body.email) {
        const oldEmailKey = userData.email.toLowerCase().replaceAll('@', '').replaceAll('.', '');
        const newEmailKey = body.email.toLowerCase().replaceAll('@', '').replaceAll('.', '');
        
        // Remove old email reference
        await remove(ref(realtimeDb, `mailRef/${oldEmailKey}`));
        
        // Add new email reference
        await update(ref(realtimeDb, `mailRef/${newEmailKey}`), {
          mobile: body.mobile,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (updateError) {
      console.error("Could not update user data:", updateError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update user data",
        },
        { status: 500 }
      );
    }

    // Return updated user data
    const updatedUserData = {
      ...userData,
      ...updateData,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: updatedUserData,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Profile update error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: "Profile API is working",
      endpoint: "/api/profile",
      method: "PUT",
      expectedFields: [
        "name",
        "email", 
        "gender",
        "mobile",
        "operator",
        "area",
        "area_id", 
        "age",
        "address"
      ],
    },
    { status: 200 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "POST method is not supported on this endpoint. Use PUT to update profile.",
    },
    { status: 405 }
  );
}