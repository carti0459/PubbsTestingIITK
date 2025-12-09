import { NextRequest, NextResponse } from "next/server";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ref, set, get, push } from "firebase/database";
import { serverAuth, realtimeDb } from "@/lib/firebase-admin";

interface CompleteRegistrationRequest {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CompleteRegistrationRequest = await request.json();

    if (!body.phoneNumber || !body.email || !body.username || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: "All registration fields are required",
        },
        { status: 400 }
      );
    }

    const existingUserRef = ref(realtimeDb, `Users/${body.phoneNumber}`);
    const existingUserSnapshot = await get(existingUserRef);

    if (existingUserSnapshot.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: "USER_ALREADY_EXISTS",
          message: "User already exists with this phone number",
        },
        { status: 409 }
      );
    }

    try {
      //let firebaseUser;

      try {
        await createUserWithEmailAndPassword(
          serverAuth,
          body.email,
          body.password
        );
      } catch (authError: unknown) {
        const error = authError as { code?: string };
        if (error.code === "auth/email-already-in-use") {
          try {
            await signInWithEmailAndPassword(
              serverAuth,
              body.email,
              body.password
            );
          } catch (_signInError: unknown) {
            console.error(_signInError);
            return NextResponse.json(
              {
                success: false,
                error: "EMAIL_ALREADY_EXISTS_DIFFERENT_PASSWORD",
                message:
                  "An account with this email already exists with a different password. Please try logging in or use forgot password.",
              },
              { status: 409 }
            );
          }
        } else {
          throw authError;
        }
      }

      const generatePubbsUserId = async (): Promise<string> => {
        const usersRef = ref(realtimeDb, "Users");
        const newUserRef = push(usersRef);
        const uniqueKey = newUserRef.key;

        if (!uniqueKey) {
          throw new Error("Failed to generate unique key");
        }

        return `PUBBS${uniqueKey}`;
      };

      let pubbsUserId: string = "";
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 5;

      while (!isUnique && attempts < maxAttempts) {
        pubbsUserId = await generatePubbsUserId();

        const usersSnapshot = await get(ref(realtimeDb, "Users"));
        let idExists = false;

        if (usersSnapshot.exists()) {
          const users = usersSnapshot.val();

          for (const userKey in users) {
            if (users[userKey].id === pubbsUserId) {
              idExists = true;
              break;
            }
          }
        }

        if (!idExists) {
          isUnique = true;
        }

        attempts++;
      }

      if (!isUnique) {
        throw new Error("Failed to generate unique user ID");
      }

      const userData = {
        id: pubbsUserId,
        mobile: body.phoneNumber,
        email: body.email,
        password: body.password,
        imei: "web_device",
        name: "Name",
        gender: "Gender",
        age: 0,
        address: "address",
        active: "true",
        deviceId: "web_device",
        username: body.username,

        // uid: firebaseUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await set(ref(realtimeDb, `Users/${body.phoneNumber}`), userData);

      const emailKey = body.email
        .toLowerCase()
        .replaceAll("@", "")
        .replaceAll(".", "");
      await set(ref(realtimeDb, `mailRef/${emailKey}`), true);
      await set(ref(realtimeDb, `userNameRef/${body.username}`), true);

      return NextResponse.json({
        success: true,
        message: "Registration completed successfully",
        user: {
          id: userData.id,
          //   uid: userData.uid,
          email: userData.email,
          mobile: userData.mobile,
          username: userData.username,
          active: userData.active,
        },
      });
    } catch (firebaseError) {
      console.error("Firebase user creation error:", firebaseError);

      return NextResponse.json(
        {
          success: false,
          error: "USER_CREATION_FAILED",
          message: "Failed to create user account. Please try again.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Complete registration error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Failed to complete registration. Please try again.",
      },
      { status: 500 }
    );
  }
}
