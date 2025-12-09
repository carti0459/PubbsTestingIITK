"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Calendar,
  Tag,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useOperator } from "@/contexts/OperatorContext";
import { useAuth } from "@/contexts/AuthContext";
import PaymentButton from "@/components/Payments/Payment-button";
import { PaymentVerificationResponse } from "@/types/razorpay.types";

interface PlanItem {
  id: string;
  subscriptionId: string;
  planName: string;
  price: number;
  description: string;
  validityTime: number;
  maxFreeRide: number;
  carryForward: number;
  areaId: string;
  areaName: string;
  status: string;
  createdBy?: string;
  createdDate?: string;
}

interface SubscriptionResponse {
  success: boolean;
  operator: string;
  totalSubscriptions: number;
  subscriptions: PlanItem[];
}

export default function CheckoutPage() {
  const router = useRouter();
  const { selectedOperator } = useOperator();
  const { userData } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type?: string;
    validityDays?: number;
    maxFreeRides?: number;
  } | null>(null);
  const [checkedCoupon, setCheckedCoupon] = useState<{
    code: string;
    discount: number;
    type?: string;
    validityDays?: number;
    maxFreeRides?: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refreshPlans = () => {
    fetchSubscriptionPlans();
  };

  const fetchSubscriptionPlans = async () => {
    try {
      setPlansLoading(true);
      setError(null);

      const operator = selectedOperator || "PubbsTesting";
      const response = await fetch(`/api/subscriptions?operator=${operator}`);

      if (!response.ok) {
        throw new Error("Failed to fetch subscription plans");
      }

      const data: SubscriptionResponse = await response.json();

      if (data.success) {
        setPlans(data.subscriptions);
      } else {
        throw new Error("No subscription plans found");
      }
    } catch (err) {
      console.error("Error fetching subscription plans:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load subscription plans"
      );

      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionPlans();
  }, [selectedOperator]);

  const handlePlanSelect = (planId: string) => {
    console.log("Plan selected:", planId);
    setSelectedPlan(planId);
  };

  const handlePaymentSuccess = (paymentData: PaymentVerificationResponse) => {
    const selectedPlanData = plans.find((plan) => plan.id === selectedPlan);

    const successData = {
      type: "razorpay",
      orderId: paymentData.orderId,
      paymentId: paymentData.paymentId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      method: paymentData.method,
      status: paymentData.status,
      planName: selectedPlanData?.planName || "Subscription Plan",
      validityDays: selectedPlanData?.validityTime || 30,
      couponDiscount: appliedCoupon?.discount || 0,
      couponCode: appliedCoupon?.code || null,
    };

    const encodedData = encodeURIComponent(JSON.stringify(successData));
    router.push(`/minDashboard/success?data=${encodedData}`);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment failed:", error);
  };

  const handleCouponRedeem = async (plan: PlanItem) => {
    if (!appliedCoupon || !userData || !selectedOperator) {
      return;
    }

    setLoading(true);

    try {
      const subscriptionData = {
        userId: userData.uid,
        phoneNumber: userData.phoneNumber || userData.mobile || "1234567890",
        subscriptionId: plan.subscriptionId,
        subscriptionName: plan.planName,
        validityDays: appliedCoupon.validityDays || plan.validityTime,
        maxFreeRides: appliedCoupon.maxFreeRides || plan.maxFreeRide,
        operator: selectedOperator,
      };

      const response = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: appliedCoupon.code,
          operatorId: selectedOperator,
          subscriptionData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Coupon redemption failed");
      }

      const result = await response.json();
      console.log("Coupon redeemed successfully:", result);

      // Redirect to success page with coupon data
      const successData = {
        type: 'coupon',
        couponCode: couponCode,
        discountAmount: appliedCoupon?.discount || 0,
        plan: plan.planName,
        duration: plan.validityTime,
        orderId: result.uniqueSubsId || `CPD-${Date.now()}`,
        date: new Date().toISOString()
      };
      
      const encodedData = encodeURIComponent(JSON.stringify(successData));
      router.push(`/minDashboard/success?data=${encodedData}`);
    } catch (error) {
      console.error("Coupon redemption error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Coupon redemption failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (!selectedOperator) {
      setCouponError("Please select an operator first");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCheckedCoupon(null);

    try {
      const response = await fetch(
        `/api/coupons/get?operator=${selectedOperator}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch coupons");
      }

      const coupon = data.coupons[couponCode.toUpperCase()];

      if (coupon) {
        setCheckedCoupon({
          code: coupon.code,
          discount: coupon.discount,
          type: coupon.type,
          validityDays: coupon.validityDays,
          maxFreeRides: coupon.maxFreeRides,
        });
        setCouponError("");
      } else {
        setCouponError("Invalid coupon code or coupon not available");
        setCheckedCoupon(null);
      }
    } catch (error) {
      console.error("Error checking coupon:", error);
      setCouponError("Failed to verify coupon. Please try again.");
      setCheckedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!checkedCoupon || !userData || !selectedOperator) {
      console.error("Missing required data for coupon redemption");
      return;
    }

    setLoading(true);

    try {
      // Use coupon's own plan details or default values
      const subscriptionData = {
        userId: userData.uid,
        phoneNumber: userData.phoneNumber || userData.mobile || "1234567890",
        subscriptionId: `coupon_${checkedCoupon.code}_${Date.now()}`,
        subscriptionName: "Coupon Subscription",
        validityDays: checkedCoupon.validityDays || 30,
        maxFreeRides: checkedCoupon.maxFreeRides || 10,
        operator: selectedOperator,
      };

      const response = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: checkedCoupon.code,
          operatorId: selectedOperator,
          subscriptionData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Coupon redemption failed");
      }

      const result = await response.json();
      console.log("Coupon redeemed successfully:", result);

      setAppliedCoupon(checkedCoupon);
      setCheckedCoupon(null);

      const successData = {
        type: "coupon",
        couponCode: checkedCoupon.code,
        orderId: result.uniqueSubsId || `coupon_${Date.now()}`,
        paymentId: `coupon_${checkedCoupon.code.toLowerCase()}_${Date.now()}`,
        amount: 0,
        currency: "INR",
        method: "Coupon",
        status: "completed",
        planName: "Coupon Subscription",
        validityDays: checkedCoupon.validityDays || 30,
        couponDiscount: checkedCoupon.discount || 0,
        maxFreeRides: checkedCoupon.maxFreeRides || 10,
      };

      const encodedData = encodeURIComponent(JSON.stringify(successData));
      router.push(`/minDashboard/success?data=${encodedData}`);
    } catch (error) {
      console.error("Coupon redemption error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Coupon redemption failed";
      alert(errorMessage);
      setCouponError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCheckedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="px-4 py-6 max-w-md mx-auto lg:max-w-7xl lg:px-8 lg:py-8">
        <div className="text-center lg:text-left mb-8 lg:mb-12">
          <h1 className="text-2xl lg:text-4xl font-bold text-black mb-2 lg:mb-4">
            Choose Your Plan
          </h1>
          <p className="text-slate-400 text-sm lg:text-lg lg:max-w-2xl">
            Please select plans from following list to continue using our app.
            {selectedOperator && (
              <span className="block mt-2 text-cyan-600 font-medium">
                Available for:{" "}
                {selectedOperator === "IITKgpCampus"
                  ? "IIT Kharagpur"
                  : "PUBBS Testing"}
              </span>
            )}
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-12 lg:items-start">
          <div className="lg:col-span-2">
            <h2 className="text-xl lg:text-2xl font-semibold text-black mb-6 lg:mb-8 hidden lg:block">
              Available Plans
            </h2>

            {plansLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-4" />
                  <p className="text-slate-600">
                    Loading subscription plans...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <X className="w-8 h-8 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button
                    onClick={refreshPlans}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    disabled={plansLoading}
                  >
                    {plansLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Try Again"
                    )}
                  </Button>
                </div>
              </div>
            ) : plans.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Tag className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">
                    No subscription plans available
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 lg:grid lg:grid-cols-1 xl:grid-cols-2 lg:gap-6 lg:space-y-0">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className="bg-white/20 border-slate-200 overflow-hidden relative hover:bg-gray-100 transition-colors cursor-pointer lg:h-auto"
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant="secondary"
                        className="bg-green-600 hover:bg-green-600 text-black text-xs px-2 py-1"
                      >
                        {plan.areaName}
                      </Badge>
                    </div>

                    {selectedPlan === plan.id && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-slate-900"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}

                    <CardContent className="p-4 lg:p-6 pt-12 lg:pt-14">
                      <div className="flex items-start justify-between mb-4 lg:mb-6">
                        <div>
                          <h3 className="text-black font-medium text-lg lg:text-xl">
                            {plan.planName}
                          </h3>
                          <p className="text-slate-600 text-sm mt-1">
                            {plan.description}
                          </p>
                        </div>
                        <div className="text-right">
                          {appliedCoupon ? (
                            <div className="flex flex-col items-end">
                              <span className="text-slate-400 text-sm lg:text-base line-through">
                                ₹{plan.price}
                              </span>
                              <span className="text-cyan-400 text-2xl lg:text-3xl font-bold">
                                ₹
                                {Math.max(
                                  0,
                                  plan.price - appliedCoupon.discount
                                )}
                              </span>
                            </div>
                          ) : (
                            <span className="text-cyan-400 text-2xl lg:text-3xl font-bold">
                              ₹{plan.price}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
                        <div className="flex items-center space-x-2 text-sm lg:text-base">
                          <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
                          <div>
                            <p className="text-slate-400">Validity</p>
                            <p className="text-black font-medium">
                              {plan.validityTime} Day
                              {plan.validityTime > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-sm lg:text-base">
                          <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
                          <div>
                            <p className="text-slate-400">Free Rides</p>
                            <p className="text-black font-medium">
                              {plan.maxFreeRide} free ride
                              {plan.maxFreeRide !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      {appliedCoupon &&
                      (appliedCoupon.discount >= plan.price ||
                        appliedCoupon.type === "full") ? (
                        <Button
                          onClick={() => handleCouponRedeem(plan)}
                          disabled={loading}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 lg:py-5 rounded-lg transition-colors text-sm lg:text-base"
                          size="lg"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Redeeming Coupon...
                            </>
                          ) : (
                            <>
                              <Tag className="w-4 h-4 mr-2" />
                              Redeem Coupon (Free)
                            </>
                          )}
                        </Button>
                      ) : (
                        <PaymentButton
                          amount={
                            appliedCoupon
                              ? Math.max(0, plan.price - appliedCoupon.discount)
                              : plan.price
                          }
                          description={`${plan.planName} - ${plan.description}`}
                          userDetails={{
                            name: userData?.name || "User",
                            email: userData?.email || "user@example.com",
                            contact:
                              userData?.phoneNumber ||
                              userData?.mobile ||
                              "1234567890",
                          }}
                          subscriptionData={
                            userData
                              ? {
                                  userId: userData.uid,
                                  phoneNumber:
                                    userData.phoneNumber ||
                                    userData.mobile ||
                                    "1234567890",
                                  subscriptionId: plan.subscriptionId,
                                  subscriptionName: plan.planName,
                                  validityDays: plan.validityTime,
                                  maxFreeRides: plan.maxFreeRide,
                                  operator: selectedOperator || "default",
                                }
                              : undefined
                          }
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-3 lg:py-5 rounded-lg transition-colors text-sm lg:text-base"
                          size="lg"
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg border border-slate-200 p-4 lg:p-6 lg:sticky lg:top-24">
              <h3 className="text-black font-medium text-lg lg:text-xl mb-4 lg:mb-6 flex items-center">
                <Tag className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-cyan-400" />
                Have a Coupon?
              </h3>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3 lg:p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-green-700 font-medium text-sm lg:text-base">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-green-600 text-xs lg:text-sm">
                        ₹{appliedCoupon.discount} discount applied
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
                  </button>
                </div>
              ) : checkedCoupon ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-blue-700 font-medium text-sm lg:text-base">
                          {checkedCoupon.code}
                        </p>
                        <p className="text-blue-600 text-xs lg:text-sm">
                          ₹{checkedCoupon.discount} discount available
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setCheckedCoupon(null);
                        setCouponCode("");
                      }}
                      className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
                    </button>
                  </div>
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redeeming Coupon...
                      </>
                    ) : (
                      "Apply Coupon"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex space-x-3">
                    <Input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-white border-slate-600 text-black placeholder-slate-400 focus:border-cyan-500 lg:py-3"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleCheckCoupon()
                      }
                    />
                    <Button
                      onClick={handleCheckCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-medium px-6 lg:px-8 lg:py-3"
                    >
                      {couponLoading ? (
                        <div className="w-4 h-4 border-2 border-slate-900 text-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Check"
                      )}
                    </Button>
                  </div>

                  {couponError && (
                    <p className="text-red-400 text-sm flex items-center">
                      <X className="w-4 h-4 mr-1" />
                      {couponError}
                    </p>
                  )}

                  <div className="pt-2">
                    <p className="text-slate-400 text-xs lg:text-sm mb-2 lg:mb-3">
                      Try these codes:
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 lg:mt-8 flex items-center justify-center lg:justify-start">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 lg:px-6 lg:py-3 rounded-lg border border-blue">
                <svg
                  className="w-4 h-4 lg:w-5 lg:h-5 text-black"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm lg:text-base font-medium text-black">
                  Secure Payment
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-dashed border-slate-600"></div>
            <div className="px-4">
              <Tag className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 border-t border-dashed border-slate-600"></div>
          </div>

          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-dashed border-slate-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
