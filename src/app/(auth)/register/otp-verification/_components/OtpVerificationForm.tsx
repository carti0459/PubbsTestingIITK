"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  otpVerificationSchema,
  type OtpVerificationFormData,
} from "@/lib/validations/auth.validation";

interface OtpVerificationFormProps {
  onExitStart?: () => void;
}

export default function OtpVerificationForm({
  onExitStart,
}: OtpVerificationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<OtpVerificationFormData>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: OtpVerificationFormData) => {
    try {
      setIsLoading(true);

      const action = searchParams.get("action");
      const isForgotPassword = action === "forgot-password";

      let phoneNumber = "";
      if (isForgotPassword) {
        const resetData = sessionStorage.getItem("passwordResetVerified");
        if (resetData) {
          const parsedData = JSON.parse(resetData);
          phoneNumber = parsedData.phoneNumber;
        }
      } else {
        const phoneData = sessionStorage.getItem("phoneVerificationData");
        if (phoneData) {
          const parsedData = JSON.parse(phoneData);
          phoneNumber = parsedData.phoneNumber;
        }
      }

      if (!phoneNumber) {
        toast.error("Session expired", {
          description: isForgotPassword
            ? "Phone number not found. Please start forgot password process again."
            : "Phone number not found. Please start registration again.",
        });
        router.push(isForgotPassword ? "/forgot-password" : "/register");
        return;
      }

      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          otp: data.otp,
          action: isForgotPassword ? "forgot-password" : "registration",
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error("Invalid OTP", {
          description:
            result.message ||
            "The OTP you entered is incorrect. Please try again.",
        });
        form.setError("otp", {
          type: "manual",
          message: "Invalid OTP. Please try again.",
        });
        return;
      }

      if (isForgotPassword) {
        const resetData = sessionStorage.getItem("passwordResetVerified");
        if (resetData) {
          const parsedData = JSON.parse(resetData);

          sessionStorage.setItem(
            "passwordResetVerified",
            JSON.stringify({
              ...parsedData,
              otpVerified: true,
              verified: true,
              token: parsedData.resetToken,
            })
          );

          toast.success("OTP verified!", {
            description: "You can now reset your password.",
          });

          onExitStart?.();

          router.push(
            `/forgot-password/reset-password?token=${parsedData.resetToken}`
          );
        }
      } else {
        const tempData = localStorage.getItem("tempRegistrationData");
        if (!tempData) {
          toast.error("Session expired", {
            description:
              "Registration data not found. Please start registration again.",
          });
          router.push("/register");
          return;
        }

        const parsedTempData = JSON.parse(tempData);

        const completeResponse = await fetch("/api/complete-registration", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: parsedTempData.username,
            email: parsedTempData.email,
            phoneNumber: parsedTempData.phoneNumber,
            password: parsedTempData.password,
          }),
        });

        const completeResult = await completeResponse.json();

        if (!completeResult.success) {
          toast.error("Registration failed", {
            description:
              completeResult.message ||
              "Failed to complete registration. Please try again.",
          });
          return;
        }

        sessionStorage.removeItem("registrationUserId");
        sessionStorage.removeItem("registrationUserData");
        sessionStorage.removeItem("phoneVerificationData");
        sessionStorage.removeItem("registrationPhoneNumber");
        sessionStorage.removeItem("registrationTempData");

        localStorage.removeItem("tempRegistrationData");

        toast.success("Registration completed!", {
          description: "Your account has been created successfully.",
        });

        onExitStart?.();

        router.push("/login");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Something went wrong", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendTimer(30);
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // TODO: Replace this with actual resend API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("OTP sent!", {
        description: "A new verification code has been sent to your phone.",
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend OTP", {
        description:
          "Could not send a new verification code. Please try again.",
      });
      setResendTimer(0);
    }
  };

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-dark/80 flex items-center justify-center z-50">
          <div className="bg-dark border border-label/20 rounded-lg p-8 text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue mx-auto"></div>
            <p className="text-white text-lg font-medium">
              {searchParams.get("action") === "forgot-password"
                ? "Verifying OTP..."
                : "Completing Registration..."}
            </p>
            <p className="text-label text-sm">
              {searchParams.get("action") === "forgot-password"
                ? "Please wait while we verify your code"
                : "Please wait while we create your account"}
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* OTP Field */}
          <FormField
            control={form.control}
            name="otp"
            render={({ field, fieldState }) => (
              <FormItem className="space-y-6">
                <FormLabel className="text-label md:text-sm text-xs font-medium block text-center">
                  <p>Please enter 6 digit OTP sent on your registered </p>
                  <span className="font-semibold">mobile number</span>
                </FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      {...field}
                      className={fieldState.error ? "aria-invalid" : ""}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={0}
                          className="md:w-12 md:h-12 text-lg"
                        />
                        <InputOTPSlot
                          index={1}
                          className="md:w-12 md:h-12 text-lg"
                        />
                        <InputOTPSlot
                          index={2}
                          className="md:w-12 md:h-12 text-lg"
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator className="mx-2 hidden md:block" />
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={3}
                          className="md:w-12 md:h-12 text-lg"
                        />
                        <InputOTPSlot
                          index={4}
                          className="md:w-12 md:h-12 text-lg"
                        />
                        <InputOTPSlot
                          index={5}
                          className="md:w-12 md:h-12 text-lg"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-sm text-center" />
              </FormItem>
            )}
          />

          {/* Verify Button */}
          <Button
            type="submit"
            disabled={
              form.formState.isSubmitting ||
              isLoading ||
              form.watch("otp").length !== 6
            }
            className="w-full bg-blue hover:bg-[#16a5c8] text-white font-semibold py-4 px-8 text-base rounded-lg transition-colors duration-200"
          >
            {form.formState.isSubmitting || isLoading
              ? "Verifying..."
              : "Verify OTP"}
          </Button>
        </form>
      </Form>

      {/* Resend OTP */}
      <div className="flex justify-center items-center gap-3 text-center">
        <p className="text-label text-sm">Didn&apos;t receive the code?</p>
        <button
          onClick={handleResendOtp}
          disabled={resendTimer > 0}
          className="text-blue hover:text-[#16a5c8] text-sm font-medium transition-colors duration-200 disabled:text-label/50 disabled:cursor-not-allowed"
        >
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
        </button>
      </div>

      {/* Back Link */}
      <div className="text-center">
        <button
          onClick={() => router.back()}
          className="text-blue hover:text-[#16a5c8] text-sm font-medium transition-colors duration-200"
        >
          ← Back to Phone Verification
        </button>
      </div>
    </div>
  );
}
