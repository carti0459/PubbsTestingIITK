"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRides } from "@/hooks/useRides";
import { RideCard, RideStatsCard, ActiveRideDisplay } from "@/components/rides";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Bike, Clock } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Ride } from "@/types/ride.type";

export default function RidesPage() {
  const {
    rides,
    activeRide,
    rideStats,
    loading,
    error,
    endRide,
    cancelRide,
    PRICING,
  } = useRides();
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [filter, setFilter] = useState<
    "all" | "active" | "completed" | "cancelled"
  >("all");

  const filteredRides = rides.filter((ride) => {
    if (filter === "all") return true;
    return ride.status === filter;
  });

  const handleEndRide = async () => {
    if (activeRide) {
      const currentLocation = {
        lat: activeRide.currentLocation.lat + (Math.random() - 0.5) * 0.01,
        lng: activeRide.currentLocation.lng + (Math.random() - 0.5) * 0.01,
        timestamp: Date.now(),
      };

      await endRide(activeRide.rideId, currentLocation);
    }
  };

  const handleCancelRide = async () => {
    if (activeRide) {
      await cancelRide(activeRide.rideId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-6 w-32" />

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-80" />
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center space-y-2">
                    <Skeleton className="h-8 w-12 mx-auto" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:flex sm:space-x-1 gap-2 sm:gap-0 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full sm:w-24" />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="border-0 shadow-sm">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                      <div className="border-t pt-3 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-cyan-100 mb-2">
            Error Loading Rides
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/minDashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Rides</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl lg:text-3xl font-bold text-cyan-100">
              My Rides
            </CardTitle>
            <p className="text-gray-600 text-sm lg:text-base">
              Track your bike rental history and active rides
            </p>
          </CardHeader>
        </Card>

        {activeRide && (
          <ActiveRideDisplay
            activeRide={activeRide}
            onEndRide={handleEndRide}
            onCancelRide={handleCancelRide}
            pricing={PRICING}
          />
        )}

        <RideStatsCard stats={rideStats} loading={loading} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 lg:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:space-x-2 gap-2 lg:gap-0 mb-6">
                  {(["all", "active", "completed", "cancelled"] as const).map(
                    (status) => {
                      const count =
                        status === "all"
                          ? rides.length
                          : rides.filter((r) => r.status === status).length;
                      const isActive = filter === status;

                      return (
                        <Button
                          key={status}
                          onClick={() => setFilter(status)}
                          variant={isActive ? "default" : "outline"}
                          className={`relative h-auto py-3 px-4 text-sm font-medium transition-all ${
                            isActive
                              ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-md"
                              : "text-gray-600 hover:bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <span className="capitalize">{status}</span>
                            <Badge
                              variant={isActive ? "secondary" : "outline"}
                              className={`text-xs ${
                                isActive
                                  ? "bg-white/20 text-white border-white/30"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {count}
                            </Badge>
                          </div>
                        </Button>
                      );
                    }
                  )}
                </div>

                {filteredRides.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2  gap-4 lg:gap-6">
                    {filteredRides.map((ride) => (
                      <RideCard
                        key={ride.id}
                        ride={ride}
                        onViewDetails={setSelectedRide}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <Bike className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-cyan-100 mb-2">
                      No rides found
                    </h3>
                    <p className="text-gray-600 max-w-sm mx-auto mb-6">
                      {filter === "all"
                        ? "You haven't taken any rides yet. Start your first ride from the dashboard!"
                        : `No ${filter} rides found. Try adjusting your filter or take a new ride.`}
                    </p>
                    {filter === "all" && (
                      <Button
                        onClick={() => (window.location.href = "/minDashboard")}
                        className="bg-cyan-500 hover:bg-cyan-600"
                      >
                        Start Your First Ride
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="hidden xl:block xl:col-span-4">
            <div className="sticky top-6 space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Rides</span>
                    <span className="font-semibold text-cyan-600">
                      {rides.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold text-cyan-600">
                      {
                        rides.filter((ride) => {
                          const rideDate = new Date(ride.startTime);
                          const now = new Date();
                          return (
                            rideDate.getMonth() === now.getMonth() &&
                            rideDate.getFullYear() === now.getFullYear()
                          );
                        }).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-semibold text-cyan-600">
                      ₹{rideStats.totalFare.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rides.slice(0, 3).map((ride) => (
                    <div
                      key={ride.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedRide(ride)}
                    >
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Ride {ride.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(ride.startTime).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          ride.status === "completed" ? "default" : "outline"
                        }
                        className="text-xs"
                      >
                        {ride.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Sheet
          open={!!selectedRide}
          onOpenChange={(open) => !open && setSelectedRide(null)}
        >
          <SheetContent
            side="right"
            className="w-[90vw] sm:w-[400px] h-full overflow-y-auto bg-[#0E171E] border-slate-700 p-0"
          >
            <SheetHeader className="p-4 border-b border-slate-700">
              <SheetTitle className="text-lg font-semibold text-white flex items-center justify-between">
                <span>Ride Details</span>
              </SheetTitle>
            </SheetHeader>

            {selectedRide && (
              <div className="p-6 space-y-6">
                <div className="bg-[#0E171E] border border-slate-700 rounded-lg">
                  <div className="px-4 py-3 border-b border-slate-700">
                    <h4 className="font-semibold text-white flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-[#18B8DB]" />
                      Ride Information
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#BEBEBE]">Start Time</span>
                      <span className="text-white font-medium">
                        {new Date(selectedRide.startTime).toLocaleString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    {selectedRide.endTime && (
                      <div className="flex justify-between items-center">
                        <span className="text-[#BEBEBE]">End Time</span>
                        <span className="text-white font-medium">
                          {new Date(selectedRide.endTime).toLocaleString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    )}
                    {selectedRide.duration && (
                      <div className="flex justify-between items-center">
                        <span className="text-[#BEBEBE]">Duration</span>
                        <span className="text-[#18B8DB] font-medium">
                          {selectedRide.duration} minutes
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-[#BEBEBE]">Ride Status</span>
                      <span className="text-[#18B8DB] font-medium capitalize">
                        {selectedRide.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0E171E] border border-slate-700 rounded-lg">
                  <div className="px-4 py-3 border-b border-slate-700">
                    <h4 className="font-semibold text-white flex items-center">
                      <span className="mr-2">💰</span>
                      Fare Breakdown
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#BEBEBE]">Base Fare</span>
                      <span className="text-white font-medium">
                        ₹{selectedRide.fare.baseFare.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#BEBEBE]">Time Charge</span>
                      <span className="text-white font-medium">
                        ₹{selectedRide.fare.timeCharge.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#BEBEBE]">Distance Charge</span>
                      <span className="text-white font-medium">
                        ₹{selectedRide.fare.distanceCharge.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-slate-700 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold text-lg">
                          Total Fare
                        </span>
                        <span className="text-[#18B8DB] font-bold text-xl">
                          ₹{selectedRide.fare.totalFare.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#BEBEBE]">Payment Status</span>
                      <span
                        className={`font-medium capitalize ${
                          selectedRide.paymentStatus === "paid"
                            ? "text-green-400"
                            : "text-orange-400"
                        }`}
                      >
                        {selectedRide.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedRide.unlockCode && (
                  <div className="bg-[#0E171E] border border-slate-700 rounded-lg">
                    <div className="px-4 py-3 border-b border-slate-700">
                      <h4 className="font-semibold text-white flex items-center">
                        <span className="mr-2">🔓</span>
                        Unlock Code
                      </h4>
                    </div>
                    <div className="p-4">
                      <div className="bg-slate-800 rounded-lg p-6 text-center border border-slate-600">
                        <span className="font-mono text-3xl font-bold text-[#18B8DB] tracking-wider block mb-2">
                          {selectedRide.unlockCode}
                        </span>
                        <p className="text-[#BEBEBE] text-sm">
                          Use this code to unlock the bike
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
