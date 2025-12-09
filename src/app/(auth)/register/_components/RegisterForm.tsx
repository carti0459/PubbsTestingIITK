"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
  registerSchema,
  type RegisterFormData,
} from "@/lib/validations/auth.validation";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  useEffect(() => {
    sessionStorage.removeItem("registrationUserId");
    sessionStorage.removeItem("registrationUserData");
    sessionStorage.removeItem("phoneVerificationData");
    sessionStorage.removeItem("registrationPhoneNumber");
  }, []);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    let loadingToast: string | number | undefined;

    try {
      loadingToast = toast.loading("Creating your account...", {
        description: "Please wait while we validate your information",
      });

      const result = await register(
        data.username,
        data.email,
        data.phoneNumber,
        data.password,
        data.confirmPassword
      );

      if (loadingToast) {
        toast.dismiss(loadingToast);
      }

      if (result.success) {
        toast.success("Validation successful!", {
          description:
            "OTP sent to your phone number. Please verify to complete registration.",
          duration: 3000,
        });

        router.push("/register/otp-verification");
      } else {
        if (result.error === "EMAIL_ALREADY_EXISTS") {
          form.setError("email", {
            type: "manual",
            message: "Mail already exists. Please Login",
          });
        } else if (result.error === "USERNAME_ALREADY_EXISTS") {
          form.setError("username", {
            type: "manual",
            message: "UserName already exists. Please take another username",
          });
        } else if (result.error === "PHONE_ALREADY_EXISTS") {
          form.setError("phoneNumber", {
            type: "manual",
            message: "User already exists. Please Login",
          });
        } else if (result.error === "VALIDATION_ERROR") {
          form.setError("root", {
            type: "manual",
            message:
              result.message || "Please check your information and try again",
          });
        } else {
          form.setError("root", {
            type: "manual",
            message: result.message || "Registration failed. Please try again.",
          });
        }

        toast.error("Registration failed", {
          description:
            result.message || "Please check your information and try again",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);

      if (loadingToast) {
        toast.dismiss(loadingToast);
      }

      form.setError("root", {
        type: "manual",
        message: "Network error. Please check your connection and try again.",
      });

      toast.error("Something went wrong", {
        description: "Please check your connection and try again",
        duration: 4000,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Username Field */}
          <FormField
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <FormItem className="text-left">
                <FormLabel className="text-label text-sm font-medium">
                  Please enter your username.
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Your Username"
                      {...field}
                      className={`w-full pl-12 pr-4 py-6 bg-transparent border rounded-lg text-white placeholder-label/80 transition-all duration-200 ${
                        fieldState.error
                          ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
                          : "border-label/40 focus-visible:border-blue focus-visible:ring-blue/50"
                      }`}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-label">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="12"
                          cy="7"
                          r="4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />

          {/* Phone Number Field */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field, fieldState }) => (
              <FormItem className="text-left">
                <FormLabel className="text-label text-sm font-medium">
                  Please enter your phone number.
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="tel"
                      placeholder="Your Phone Number"
                      {...field}
                      className={`w-full pl-12 pr-4 py-6 bg-transparent border rounded-lg text-white placeholder-label/80 transition-all duration-200 ${
                        fieldState.error
                          ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
                          : "border-label/40 focus-visible:border-blue focus-visible:ring-blue/50"
                      }`}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-label">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem className="text-left">
                <FormLabel className="text-label text-sm font-medium">
                  Please enter your email.
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Your Email"
                      {...field}
                      className={`w-full pl-12 pr-4 py-6 bg-transparent border rounded-lg text-white placeholder-label/80 transition-all duration-200 ${
                        fieldState.error
                          ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
                          : "border-label/40 focus-visible:border-blue focus-visible:ring-blue/50"
                      }`}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-label">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          width="20"
                          height="16"
                          x="2"
                          y="4"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="m2 7 10 5 10-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem className="text-left space-y-2">
                <FormLabel className="text-label text-sm font-medium">
                  Create Your Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Your Password"
                      {...field}
                      className={`w-full pl-12 pr-14 py-6 bg-transparent border rounded-lg text-white placeholder-label/80 transition-all duration-200 ${
                        fieldState.error
                          ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
                          : "border-label/40 focus-visible:border-blue focus-visible:ring-blue/50"
                      }`}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-label">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          width="18"
                          height="11"
                          x="3"
                          y="11"
                          rx="2"
                          ry="2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7 11V7a5 5 0 0 1 10 0v4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-label hover:text-white transition-colors duration-200"
                    >
                      {showPassword ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M1 1l22 22"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-xs font-light" />
              </FormItem>
            )}
          />

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem className="text-left space-y-2">
                <FormLabel className="text-label text-sm font-medium">
                  Confirm Your Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Your Password"
                      {...field}
                      className={`w-full pl-12 pr-14 py-6 bg-transparent border rounded-lg text-white placeholder-label/80 transition-all duration-200 ${
                        fieldState.error
                          ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
                          : "border-label/40 focus-visible:border-blue focus-visible:ring-blue/50"
                      }`}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-label">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          width="18"
                          height="11"
                          x="3"
                          y="11"
                          rx="2"
                          ry="2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7 11V7a5 5 0 0 1 10 0v4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-label hover:text-white transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M1 1l22 22"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-xs font-light" />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <div className="text-red-500 text-sm text-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              {form.formState.errors.root.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full bg-blue hover:bg-[#16a5c8] text-white font-semibold py-6 px-8 text-lg rounded-lg transition-colors duration-200"
          >
            {form.formState.isSubmitting ? "Creating Account..." : "Register"}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-label/30" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-dark text-label">Already Have Account?</span>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <Link href="/login">
          <Button
            variant="outline"
            className="w-full border-blue bg-dark text-blue hover:bg-blue hover:text-white font-semibold py-6 px-8 text-lg rounded-lg transition-colors duration-200"
          >
            Log In
          </Button>
        </Link>
      </div>
    </div>
  );
}
