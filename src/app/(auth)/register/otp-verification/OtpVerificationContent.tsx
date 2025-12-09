"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Header from "./_components/Header";
import OtpVerificationForm from "./_components/OtpVerificationForm";

export default function OtpVerificationContent() {
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const action = searchParams.get("action");

    if (action === "forgot-password") {
      const resetData = sessionStorage.getItem("passwordResetVerified");

      if (!resetData) {
        router.replace("/forgot-password");
        return;
      }

      try {
        const parsedData = JSON.parse(resetData);
        if (
          !parsedData.phoneVerified ||
          !parsedData.resetToken ||
          !parsedData.phoneNumber
        ) {
          sessionStorage.removeItem("passwordResetVerified");
          router.replace("/forgot-password");
          return;
        }
      } catch {
        sessionStorage.removeItem("passwordResetVerified");
        router.replace("/forgot-password");
        return;
      }
    }
  }, [router, searchParams]);

  return (
    <motion.div
      className="min-h-screen bg-dark overflow-hidden w-full"
      animate={
        isExiting ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }
      }
      transition={{ duration: 0.6 }}
    >
      <main className="min-h-screen flex items-center flex-col justify-center">
        <div className="w-full max-w-md mx-auto max-h-[800px] flex flex-col justify-center space-y-8">
          <Header />
          <div className="w-full flex-shrink-0">
            <OtpVerificationForm onExitStart={() => setIsExiting(true)} />
          </div>
        </div>
      </main>
    </motion.div>
  );
}
