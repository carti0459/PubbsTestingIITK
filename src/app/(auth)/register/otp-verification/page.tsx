"use client";

import { Suspense } from "react";
import OtpVerificationContent from "./OtpVerificationContent";

export default function OtpVerificationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtpVerificationContent />
    </Suspense>
  );
}
