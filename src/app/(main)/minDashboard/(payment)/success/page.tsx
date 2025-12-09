"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Download,
  Home,
  MessageCircle,
  Gift,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface PaymentData {
  type: "razorpay" | "coupon";
  orderId: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
  method?: string;
  status?: string;
  planName?: string;
  validityDays?: number;
  couponCode?: string;
  couponDiscount?: number;
  maxFreeRides?: number;
  date?: string;
  plan?: string;
  duration?: number;
  discountAmount?: number;
}


const LoadingPage = () => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-md mx-auto">
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
              <CheckCircle className="w-6 h-6 text-gray-400" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Loading...
            </h1>
            <p className="text-sm text-gray-600">
              Please wait while we load your receipt
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const SuccessPageContent: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);

    const dataParam = searchParams.get("data");
    if (dataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataParam));
        setPaymentData(parsedData);
      } catch (error) {
        console.error("Error parsing payment data:", error);
      }
    }
  }, [searchParams]);

  const handleDownloadReceipt = async () => {
    if (!paymentData) return;
    
    setIsDownloading(true);
    
    try {
      // Import jsPDF
      const { default: jsPDF } = await import('jspdf');
      
      const isCouponRedemption = paymentData.type === 'coupon';
      const currentDate = paymentData.date ? new Date(paymentData.date) : new Date();
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      
      let yPosition = 25;
      
      // Simple header - just text, no colors
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PUBBS BIKE SHARING', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('support@pubbs.com | Customer Service', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      
      // Simple divider line
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      
      yPosition += 10;
      
      // Receipt type and date
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const receiptTitle = isCouponRedemption ? 'COUPON RECEIPT' : 'PAYMENT RECEIPT';
      pdf.text(receiptTitle, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 6;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date: ${currentDate.toLocaleDateString('en-IN')} ${currentDate.toLocaleTimeString('en-IN', { hour12: false })}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 12;
      
      // Another divider
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      // Transaction details - simple left aligned format
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const details = [
        { label: 'Order ID:', value: paymentData.orderId },
        { label: 'Plan:', value: paymentData.planName || paymentData.plan || 'Ride Subscription' },
        { label: 'Duration:', value: `${paymentData.validityDays || paymentData.duration || 30} Days` },
        { label: 'Payment Method:', value: isCouponRedemption ? 'Coupon Code' : paymentData.method || 'Online Payment' },
        { label: 'Status:', value: 'COMPLETED' }
      ];
      
      details.forEach(detail => {
        pdf.setFont('helvetica', 'normal');
        pdf.text(detail.label, margin, yPosition);
        
        pdf.setFont('helvetica', 'bold');
        // Handle long order IDs
        let displayValue = detail.value;
        if (detail.label === 'Order ID:' && detail.value.length > 25) {
          displayValue = detail.value.substring(detail.value.length - 25);
        }
        pdf.text(displayValue, margin + 35, yPosition);
        
        yPosition += 6;
      });
      
      // Coupon code section (if applicable)
      if (isCouponRedemption && paymentData.couponCode) {
        yPosition += 5;
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text('Coupon Code:', margin, yPosition);
        pdf.setFont('helvetica', 'bold');
        pdf.text(paymentData.couponCode, margin + 35, yPosition);
        yPosition += 6;
      }
      
      yPosition += 5;
      
      // Amount section
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      const amountLabel = isCouponRedemption ? 'TOTAL SAVED:' : 'AMOUNT PAID:';
      const amount = isCouponRedemption ? 
        (paymentData.couponDiscount || paymentData.discountAmount || 99) : 
        (paymentData.amount || 99);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(amountLabel, margin, yPosition);
      pdf.text(`₹${amount}.00`, pageWidth - margin, yPosition, { align: 'right' });
      
      yPosition += 10;
      pdf.setLineWidth(1);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      
      yPosition += 15;
      
      // What's included section
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SUBSCRIPTION INCLUDES:', margin, yPosition);
      
      yPosition += 8;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      
      const benefits = [
        `• ${paymentData.validityDays || paymentData.duration || 30} days bike access`,
        '• All PUBBS station locations',
        '• QR code bike unlock',
        '• 24/7 customer support'
      ];
      
      benefits.forEach(benefit => {
        pdf.text(benefit, margin, yPosition);
        yPosition += 5;
      });
      
      yPosition += 10;
      
      // Footer section
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Thank you for choosing PUBBS!', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 5;
      pdf.text('Keep this receipt for your records', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 8;
      pdf.text('Questions? Contact: support@pubbs.com', pageWidth / 2, yPosition, { align: 'center' });
      
      // Save PDF with simple filename
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const receiptType = isCouponRedemption ? 'Coupon' : 'Payment';
      const fileName = `PUBBS_${receiptType}_${paymentData.orderId.slice(-8)}_${dateStr}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF receipt. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const isCouponRedemption = paymentData?.type === "coupon";

  const displayTitle = isCouponRedemption
    ? "Coupon Applied Successfully!"
    : "Payment Successful";
  const displaySubtitle = isCouponRedemption
    ? "Your free subscription is now active"
    : "Your subscription is now active";
  const displayIcon = isCouponRedemption ? Gift : CheckCircle;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto ">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            
            <div className="text-center mb-6">
              <div className={`w-12 h-12 ${isCouponRedemption ? 'bg-purple-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                {React.createElement(displayIcon, {
                  className: `w-6 h-6 ${isCouponRedemption ? 'text-purple-600' : 'text-green-600'}`
                })}
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">
                {displayTitle}
              </h1>
              <p className="text-sm text-gray-600">
                {displaySubtitle}
              </p>
            </div>

            
            <div className="border-t border-b border-gray-100 py-4 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order ID</span>
                  <div className="text-right">
                    <span className="font-mono text-gray-900 text-xs block">
                      {paymentData?.orderId ? 
                        `#${paymentData.orderId.slice(-12)}` : 
                        `#PUB-${mounted ? Date.now().toString().slice(-8) : "--------"}`
                      }
                    </span>
                    {paymentData?.orderId && paymentData.orderId.length > 12 && (
                      <span className="text-gray-400 text-xs">
                        (Full ID available in receipt)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium text-gray-900">
                    {paymentData?.planName || paymentData?.plan || "Ride Subscription"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="text-gray-900">
                    {paymentData?.validityDays || paymentData?.duration || 30} Days
                  </span>
                </div>
                
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="text-gray-900">
                    {isCouponRedemption ? (
                      <span className="flex items-center">
                        <Gift className="w-3 h-3 mr-1 text-purple-600" />
                        Coupon Code
                      </span>
                    ) : (
                      paymentData?.method || "•••• 4242"
                    )}
                  </span>
                </div>
                
                {isCouponRedemption && paymentData?.couponCode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Coupon Code</span>
                    <span className="text-gray-900 font-mono">
                      {paymentData.couponCode}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date</span>
                  <span className="text-gray-900">
                    {paymentData?.date ? 
                      new Date(paymentData.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }) :
                      (mounted ? new Date().toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }) : "--")
                    }
                  </span>
                </div>
                
                
                <div className="flex justify-between font-semibold pt-2 border-t border-gray-100">
                  <span className="text-gray-900">
                    {isCouponRedemption ? "Amount Saved" : "Amount Paid"}
                  </span>
                  <span className={isCouponRedemption ? "text-purple-600" : "text-green-600"}>
                    ₹{isCouponRedemption ? 
                      (paymentData?.couponDiscount || paymentData?.discountAmount || 99) : 
                      (paymentData?.amount || 99)
                    }.00
                  </span>
                </div>
                
                
                {isCouponRedemption && (
                  <div className="text-center pt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      🎉 FREE SUBSCRIPTION
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                What&apos;s included:
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                  30 days of bike access
                </div>
                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                  All PUBBS stations
                </div>
                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                  QR code unlock
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/minDashboard" className="block">
                <Button className="w-full bg-[#18B8DB] hover:bg-[#18B8DB]/90 text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={handleDownloadReceipt}
                  disabled={isDownloading || !paymentData}
                >
                  <Download className="w-3 h-3 mr-1" />
                  {isDownloading ? 'Generating...' : 'Receipt'}
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Support
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                Questions? Email{" "}
                <a
                  href="mailto:support@pubbs.com"
                  className="text-[#18B8DB] hover:underline"
                >
                  support@pubbs.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


const SuccessPage: React.FC = () => {
  return (
    <Suspense fallback={<LoadingPage />}>
      <SuccessPageContent />
    </Suspense>
  );
};

export default SuccessPage;
