"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  phoneVerificationSchema,
  type PhoneVerificationFormData,
} from "@/lib/validations/auth.validation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<PhoneVerificationFormData>({
    resolver: zodResolver(phoneVerificationSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: PhoneVerificationFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Store the reset data for OTP verification flow
        sessionStorage.setItem(
          "passwordResetVerified",
          JSON.stringify({
            phoneNumber: data.phoneNumber,
            resetToken: result.resetToken,
            email: result.email,
            username: result.username,
            phoneVerified: true,  // Set to true since user was found and OTP sent
            otpVerified: false,   // Will be set to true after OTP verification
            verified: false,      // Will be set to true after OTP verification
            timestamp: new Date().toISOString(),
          })
        );

        toast.success("OTP sent!", {
          description: "Please enter the OTP sent to your phone number",
          duration: 3000,
        });

        setTimeout(() => {
          router.push("/register/otp-verification?action=forgot-password");
        }, 1500);
      } else {
        if (result.error === "USER_NOT_FOUND") {
          form.setError("phoneNumber", {
            type: "manual",
            message: "No account found with this phone number",
          });
        } else {
          form.setError("root", {
            type: "manual",
            message:
              result.message || "Something went wrong. Please try again.",
          });
        }

        toast.error("Failed to process request", {
          description:
            result.message || "Please check your email and try again",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      form.setError("root", {
        type: "manual",
        message: "Something went wrong. Please try again.",
      });

      toast.error("Something went wrong", {
        description: "Please try again later",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full text-center space-y-8 bg-dark">
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto max-h-[900px] flex flex-col justify-center space-y-6">
          {/* Header */}
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Forgot Password</h2>
            <p className="text-label text-lg">
              Please enter your phone number to continue.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="text-left">
                    <FormLabel className="text-white text-base font-medium">
                      Please enter your phone number.
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="tel"
                          placeholder="Your Phone Number"
                          className="pl-12 py-6 text-lg bg-dark border-label/30 text-white placeholder:text-label/60 focus:border-blue focus:ring-blue"
                          disabled={isLoading}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <svg
                            className="w-5 h-5 text-label/60"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* Root Error */}
              {form.formState.errors.root && (
                <div className="text-red-400 text-sm text-center">
                  {form.formState.errors.root.message}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue hover:bg-blue/90 text-white font-semibold py-6 px-8 text-lg rounded-lg transition-colors duration-200"
              >
                {isLoading ? "Processing..." : "Continue"}
              </Button>
            </form>
          </Form>

          {/* Footer */}
          <div className="text-center">
            <Link
              href="/login"
              className="text-blue hover:text-blue/80 font-medium transition-colors duration-200"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
