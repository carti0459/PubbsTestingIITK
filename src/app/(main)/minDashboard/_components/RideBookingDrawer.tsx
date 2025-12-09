"use client";

import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// Hook to detect screen size
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return isMobile;
};

interface BikeData {
  id?: string;
  battery?: string | number;
  bleaddress?: string;
  inAreaId?: string;
  inStationId?: string;
  inStationName?: string;
  latitude?: number;
  longitude?: number;
  operation?: string;
  ridetime?: string | number;
  status?: string;
  theft?: string;
  type?: string;
  userMobile?: string;
  [key: string]: unknown;
}

interface RideBookingDrawerProps {
  isOpen: boolean;
  bikeData: BikeData | null;
  bookingId?: string;
  isHolding?: boolean;
  holdStartTime?: Date | null;
  isHoldProcessing?: boolean;
  isEndProcessing?: boolean;
  totalHoldTime?: number;
  onClose: () => void;
  onHold: () => void;
  onContinue: () => void;
  onEnd: () => void;
}

const RideBookingDrawer: React.FC<RideBookingDrawerProps> = ({
  isOpen,
  bikeData,
  bookingId: providedBookingId,
  isHolding = false,
  holdStartTime,
  isHoldProcessing = false,
  isEndProcessing = false,
  onClose,
  onHold,
  onContinue,
  onEnd,
}) => {
  const isMobile = useIsMobile();
  const [bookingId, setBookingId] = useState<string>("");
  const [rideStartTime, setRideStartTime] = useState<Date>(new Date());
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRiding, setIsRiding] = useState<boolean>(false);
  const [currentHoldTime, setCurrentHoldTime] = useState<number>(0);

  useEffect(() => {
    if (isOpen && bikeData) {
      setBookingId(providedBookingId || "");
      setRideStartTime(new Date());
      setIsRiding(true);

      const ridetimeInSeconds = Number(bikeData.ridetime) || 480;
      setTimeLeft(ridetimeInSeconds);
    }
  }, [isOpen, bikeData, providedBookingId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isHolding && holdStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const holdDuration = Math.floor((now.getTime() - holdStartTime.getTime()) / 1000);
        setCurrentHoldTime(holdDuration);
      }, 1000);
    } else {
      setCurrentHoldTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHolding, holdStartTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Timer should only run when riding AND not on hold
    if (isRiding && !isHolding && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRiding, isHolding, timeLeft]);

  if (!bikeData) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} Min ${remainingSeconds}s`;
  };

  const getProgressPercentage = () => {
    const totalTime = Number(bikeData.ridetime) || 480;
    const elapsed = totalTime - timeLeft;
    return Math.min((elapsed / totalTime) * 100, 100);
  };

  const getBatteryColor = (battery: string | number) => {
    const batteryNum = Number(battery);
    if (batteryNum >= 80) return "text-green-500";
    if (batteryNum >= 50) return "text-yellow-500";
    if (batteryNum >= 20) return "text-orange-500";
    return "text-red-500";
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "ongoing":
        return "text-green-500 bg-green-100";
      case "busy":
        return "text-yellow-500 bg-yellow-100";
      default:
        return "text-blue-500 bg-blue-100";
    }
  };

  // Shared content component
  const RideContent = () => (
    <div className="bg-slate-800 text-white h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold">PUBBS Ride</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="px-4 py-3 space-y-3 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">Booking ID</span>
          <span className="text-cyan-400 font-mono font-bold text-sm">
            {bookingId || "No Booking ID"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-gray-300 text-sm">Battery</span>
          </div>
          <span
            className={`font-semibold text-sm ${getBatteryColor(
              bikeData.battery || "87"
            )}`}
          >
            {bikeData.battery || "87"}%
          </span>
        </div>

        <div className="bg-slate-700 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Ride Time</span>
            <span className="text-white font-medium text-sm">
              {formatDuration(Number(bikeData.ridetime) || 480 - timeLeft)}
            </span>
          </div>

          <div className="w-full bg-slate-600 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Started: {formatTime(rideStartTime)}</span>
            <span>Time Left: {formatDuration(timeLeft)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-700 rounded-md p-4">
            <span className="text-gray-400 block mb-3">Bike ID</span>
            <span className="text-white font-mono">{bikeData.id || "N/A"}</span>
          </div>
          <div className="bg-slate-700 rounded-md p-4">
            <span className="text-gray-400 block mb-3">Status</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                bikeData.status || "active"
              )}`}
            >
              {isRiding
                ? "Ongoing"
                : (bikeData.status || "Active").toUpperCase()}
            </span>
          </div>
        </div>

        {/* <details className="mt-2"> */}
          {/* <summary className="cursor-pointer text-cyan-400 text-xs hover:text-cyan-300 flex items-center space-x-1">
            <span>▼ View Bike Details</span>
          </summary> */}
          
          <div className="mt-2 p-2 bg-slate-700 rounded-md text-xs space-y-1">
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div>
                <span className="text-gray-400">Type:</span>
                <span className="text-white ml-1">
                  {bikeData.type || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Station:</span>
                <span className="text-white ml-1">
                  {bikeData.inStationName || "N/A"}
                </span>
              </div>
            </div>
          </div>
        {/* </details> */}

        {/* Hold Timer Display */}
        {isHolding && (
          <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-400 text-sm font-medium">
                🔸 Ride On Hold
              </span>
              <span className="text-orange-300 text-xs">
                {currentHoldTime}s / 180s
              </span>
            </div>
            <div className="w-full bg-orange-900/30 rounded-full h-1.5">
              <div 
                className="bg-orange-400 h-1.5 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min((currentHoldTime / 180) * 100, 100)}%` 
                }}
              ></div>
            </div>
            {currentHoldTime >= 150 && (
              <p className="text-orange-300 text-xs mt-2 text-center">
                ⚠️ Hold time ending soon! Continue ride or it will auto-end.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex space-x-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isHolding) {
                onContinue();
              } else {
                onHold();
              }
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            disabled={isHoldProcessing}
            className={`flex-1 bg-transparent border ${
              isHolding 
                ? 'border-green-400 text-green-400 hover:bg-green-400' 
                : 'border-cyan-400 text-cyan-400 hover:bg-cyan-400'
            } py-2.5 rounded-lg font-medium hover:text-slate-800 transition-colors flex items-center justify-center space-x-2 text-sm ${
              isHoldProcessing ? 'opacity-50 cursor-not-allowed' : ''
            } select-none`}
            style={{ touchAction: 'manipulation' }}
          >
            {isHoldProcessing ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isHolding ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 16h6m-7 4h8a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6"
                  />
                )}
              </svg>
            )}
            <span>{isHolding ? 'Continue' : 'Hold'}</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEnd();
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            disabled={isEndProcessing}
            className={`flex-1 bg-transparent border border-red-400 text-red-400 py-2.5 rounded-lg font-medium hover:bg-red-400 hover:text-white transition-colors flex items-center justify-center space-x-2 text-sm ${
              isEndProcessing ? 'opacity-50 cursor-not-allowed' : ''
            } select-none`}
            style={{ touchAction: 'manipulation' }}
          >
            {isEndProcessing ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span>{isEndProcessing ? 'Ending...' : 'End'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        // Mobile - Drawer from bottom
        <Drawer
          open={isOpen}
          onOpenChange={onClose}
          dismissible={false}
          shouldScaleBackground={false}
        >
          <DrawerContent className="max-h-[50vh]">
            <DrawerHeader className="sr-only">
              <DrawerTitle>PUBBS Ride Booking</DrawerTitle>
            </DrawerHeader>
            <RideContent />
          </DrawerContent>
        </Drawer>
      ) : (
        // Desktop - Sheet from right
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent side="right" className="w-96 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>PUBBS Ride Booking</SheetTitle>
            </SheetHeader>
            <RideContent />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default RideBookingDrawer;
