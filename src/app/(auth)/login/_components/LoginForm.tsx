"use client";

import { useState } from "react";
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
  loginSchema,
  type LoginFormData,
} from "@/lib/validations/auth.validation";
import { useAuth } from "@/contexts/AuthContext";

interface LoginFormProps {
  onExitStart?: () => void;
}

export default function LoginForm({ onExitStart }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    let loadingToast: string | number | undefined;

    try {
      setError("");

      loadingToast = toast.loading("Signing you in...", {
        description: "Please wait while we verify your credentials",
      });

      const result = await login(data.email, data.password);

      if (loadingToast) {
        toast.dismiss(loadingToast);
      }

      if (!result.success) {
        let errorMessage = "Login failed";
        let errorDescription = "";

        switch (result.errorCode) {
          case "auth/user-not-found":
            errorMessage = "Account not found";
            errorDescription = "No account found with this email address";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect password";
            errorDescription = "Please check your password and try again";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email";
            errorDescription = "Please enter a valid email address";
            break;
          case "auth/user-disabled":
            errorMessage = "Account disabled";
            errorDescription =
              "This account has been disabled. Contact support for help";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many attempts";
            errorDescription = "Please wait a moment before trying again";
            break;
          case "auth/invalid-credential":
            errorMessage = "Invalid credentials";
            errorDescription = "Email or password is incorrect";
            break;
          case "network-error":
            errorMessage = "Connection error";
            errorDescription =
              "Please check your internet connection and try again";
            break;
          default:
            errorMessage = "Login failed";
            errorDescription = result.error || "Please try again";
        }

        toast.error(errorMessage, {
          description: errorDescription,
          duration: 4000,
        });

        setError(errorMessage);
        return;
      }

      toast.success("Welcome back!", {
        description: `Successfully signed in as ${data.email}`,
        duration: 2000,
      });

      onExitStart?.();

      setTimeout(() => {
        router.push("/welcome");
      }, 600);
    } catch (error: unknown) {
      console.error("Unexpected error:", error);

      // Dismiss loading toast if it exists
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }

      // Show generic error
      toast.error("Something went wrong", {
        description: "Please try again later",
        duration: 4000,
      });

      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

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

        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem className="text-left space-y-2">
              <FormLabel className="text-label text-sm font-medium">
                Please enter your password
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

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-blue hover:text-[#16a5c8] text-sm font-medium transition-colors duration-200"
          >
            Forgot your password?
          </Link>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full bg-blue hover:bg-[#16a5c8] text-white font-semibold py-6 px-8 text-lg rounded-lg transition-colors duration-200"
        >
          {form.formState.isSubmitting ? "Logging in..." : "Log In"}
        </Button>
      </form>
    </Form>
  );
}
