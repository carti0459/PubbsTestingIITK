import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email"),
  password: z
    .string()
    .min(1, "Please enter your password")
})

export const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Please enter your username")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z
    .string()
    .min(1, "Please enter your email")
    .email("You have entered wrong email ID"),
  phoneNumber: z
    .string()
    .min(1, "Please enter your phone number")
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9"),
  password: z
    .string()
    .min(1, "Please enter your password")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const phoneVerificationSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Please enter your phone number")
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9")
})

export const phoneUpdateSchema = z.object({
  id: z
    .string()
    .min(1, "User ID is required"),
  phoneNumber: z
    .string()
    .min(1, "Please enter your phone number")
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9")
})

export const otpVerificationSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers")
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type PhoneVerificationFormData = z.infer<typeof phoneVerificationSchema>
export type PhoneUpdateFormData = z.infer<typeof phoneUpdateSchema>
export type OtpVerificationFormData = z.infer<typeof otpVerificationSchema>