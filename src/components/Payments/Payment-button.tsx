"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  RazorpayOrderResponse,
  RazorpayPaymentResponse,
  PaymentVerificationResponse,
  RazorpayOptions,
} from "@/types/razorpay.types";

interface PaymentButtonProps {
  amount: number;
  currency?: string;
  description?: string;
  userDetails?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  subscriptionData?: {
    userId: string;
    phoneNumber: string;
    subscriptionId: string;
    subscriptionName: string;
    validityDays: number;
    maxFreeRides?: number;
    operator?: string;
  };
  onSuccess?: (paymentData: PaymentVerificationResponse) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

export default function PaymentButton({
  amount,
  currency = "INR",
  description = "Payment for PUBBS Service",
  userDetails,
  subscriptionData,
  onSuccess,
  onError,
  className,
  disabled = false,
  size = "default",
  variant = "default",
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const orderData: RazorpayOrderResponse = await orderResponse.json();

      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PUBBS",
        description,
        image: "/assets/pubbs_logo.png",
        order_id: orderData.orderId,
        handler: async (response: RazorpayPaymentResponse) => {
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: userDetails?.name || "",
          email: userDetails?.email || "",
          contact: userDetails?.contact || "",
        },
        notes: {
          service: "PUBBS Bike Subscription",
        },
        theme: {
          color: "#18B8DB",
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response: any) => {
        setIsLoading(false);
        setIsProcessing(false);
        const errorMsg = response.error?.description || "Payment failed";
        toast.error(errorMsg);
        onError?.(errorMsg);
      });

      razorpay.open();
    } catch (error) {
      setIsLoading(false);
      setIsProcessing(false);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Payment initialization failed";
      toast.error(errorMsg);
      onError?.(errorMsg);
      console.error("Payment error:", error);
    }
  };

  const handlePaymentSuccess = async (response: RazorpayPaymentResponse) => {
    try {
      setIsProcessing(true);
      toast.loading("Verifying payment...");

      const verificationResponse = await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...response,
          ...(subscriptionData && { subscriptionData })
        }),
      });

      if (!verificationResponse.ok) {
        // Try to get specific error message from response
        let errorMessage = "Payment verification failed";
        try {
          const errorData = await verificationResponse.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.warn("Could not parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const verificationData: PaymentVerificationResponse =
        await verificationResponse.json();

      toast.dismiss();
      toast.success("Payment successful!");

      onSuccess?.(verificationData);

      router.push("/minDashboard/success");
    } catch (error) {
      toast.dismiss();
      
      let errorMsg = "Payment verification failed";
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      // Show user-friendly error messages based on error type
      if (errorMsg.includes("signature")) {
        errorMsg = "Payment security verification failed. Please try again.";
      } else if (errorMsg.includes("captured")) {
        errorMsg = "Payment processing incomplete. Please check your payment status.";
      } else if (errorMsg.includes("subscription")) {
        errorMsg = "Payment successful but subscription setup failed. Please contact support.";
      } else if (errorMsg.includes("Missing")) {
        errorMsg = "Payment information incomplete. Please try again.";
      }
      
      toast.error(errorMsg);
      onError?.(errorMsg);
      console.error("Payment verification error:", error);
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const isButtonDisabled = disabled || isLoading || isProcessing;
  const buttonText = isProcessing
    ? "Verifying..."
    : isLoading
    ? "Processing..."
    : `Pay ₹${amount}`;

  return (
    <Button
      onClick={handlePayment}
      disabled={isButtonDisabled}
      className={className}
      size={size}
      variant={variant}
    >
      {isLoading || isProcessing ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4 mr-2" />
      )}
      {buttonText}
    </Button>
  );
}
