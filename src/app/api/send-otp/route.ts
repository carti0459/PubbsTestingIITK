import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { msg91Service } from "@/lib/msg91";

const sendOTPSchema = z.object({
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  action: z
    .enum(["registration", "forgot-password"])
    .optional()
    .default("registration"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = sendOTPSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: validationResult.error.issues[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const { phoneNumber } = validationResult.data;

    if (!msg91Service.isValidMobile(phoneNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_PHONE",
          message: "Please enter a valid Indian mobile number",
        },
        { status: 400 }
      );
    }

    try {
      const msg91Response = await msg91Service.sendOTP({
        mobile: phoneNumber,
      });

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
        requestId: msg91Response.request_id,
        expiresIn: 300,
      });
    } catch (msg91Error) {
      console.error("MSG91 Error Details:", msg91Error);

      return NextResponse.json(
        {
          success: false,
          error: "MSG91_ERROR",
          message: `Failed to send OTP: ${
            msg91Error instanceof Error
              ? msg91Error.message
              : "Unknown MSG91 error"
          }`,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Send OTP error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Failed to send OTP. Please try again.",
      },
      { status: 500 }
    );
  }
}
