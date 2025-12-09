"use client";

import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Bike, Navigation } from "lucide-react";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return mounted ? matches : false;
};

interface StationData {
  stationId: string;
  stationName: string;
  areaId: string;
  areaName: string;
  stationLatitude: string;
  stationLongitude: string;
  stationCycleCount: string;
  stationCycleDemand: number;
  stationRadius: string;
  stationStatus: boolean;
  stationType: string;
  stationcyclecount: string;
  lastUpdated: string;
}

interface StationDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stationData: StationData | null;
}

const StationDetailsDrawer: React.FC<StationDetailsDrawerProps> = ({
  isOpen,
  onClose,
  stationData,
}) => {
  const [mounted, setMounted] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!stationData || !mounted) return null;

  const totalBikes = parseInt(stationData.stationCycleCount) || 0;

  const getBikeColor = (count: number) => {
    if (count >= 5) return "text-green-400";
    if (count >= 2) return "text-yellow-400";
    return "text-red-400";
  };

  const StationContent = ({ className = "" }: { className?: string }) => (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div>
          <h2 className="text-lg font-semibold text-white">Station Details</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors lg:hidden"
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

      <div className="p-6 space-y-6">
        {/* Station Name */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
              <span className="text-white font-semibold text-sm">P</span>
            </div>
            <span className="text-gray-300">Station Name</span>
          </div>
          <span className="text-cyan-400 font-semibold">
            {stationData.stationName}
          </span>
        </div>

        {/* Bicycles Available */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bike className="w-8 h-8 text-gray-600" />
            <span className="text-gray-300">Bicycles Available</span>
          </div>
          <span
            className={`font-semibold text-2xl ${getBikeColor(totalBikes)}`}
          >
            {totalBikes.toString().padStart(2, "0")}
          </span>
        </div>

        {/* Station Radius */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-600 rounded-full"></div>
            </div>
            <span className="text-gray-300">Station Radius</span>
          </div>
          <span className="text-cyan-400 font-semibold">100 M</span>
        </div>
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-transparent border border-gray-400 text-gray-400 py-2.5 rounded-lg font-medium hover:bg-gray-400 hover:text-slate-800 transition-colors flex items-center justify-center space-x-2 text-sm"
          >
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
            <span>Close</span>
          </button>
          <button className="flex-1 bg-transparent border border-cyan-400 text-cyan-400 py-2.5 rounded-lg font-medium hover:bg-cyan-400 hover:text-slate-800 transition-colors flex items-center justify-center space-x-2 text-sm">
            <Navigation className="w-4 h-4" />
            <span>Navigate</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!isDesktop && (
        <Drawer open={isOpen} onOpenChange={onClose}>
          <DrawerContent className="max-h-[85vh] bg-slate-800 border-slate-700">
            <DrawerHeader className="sr-only">
              <DrawerTitle>Station Details</DrawerTitle>
              <DrawerDescription>
                Station information and availability
              </DrawerDescription>
            </DrawerHeader>
            <StationContent className="mx-auto max-w-md" />
          </DrawerContent>
        </Drawer>
      )}

      {isDesktop && (
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent
            side="right"
            className="w-[400px] sm:w-[500px] bg-slate-800 border-slate-700 p-0"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Station Details</SheetTitle>
              <SheetDescription>
                Station information and availability
              </SheetDescription>
            </SheetHeader>
            <StationContent />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default StationDetailsDrawer;
