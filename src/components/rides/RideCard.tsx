import React from "react";
import { Ride } from "@/types/ride.type";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CreditCard,
  Bike,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface RideCardProps {
  ride: Ride;
  onViewDetails?: (ride: Ride) => void;
}

export const RideCard: React.FC<RideCardProps> = ({ ride, onViewDetails }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
        };
      case "completed":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
        };
      case "cancelled":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
        };
      case "paused":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          border: "border-yellow-200",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
        };
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
        };
      case "pending":
        return {
          bg: "bg-orange-50",
          text: "text-orange-700",
          border: "border-orange-200",
        };
      default:
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
        };
    }
  };

  const statusColors = getStatusColor(ride.status);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:scale-[1.02] bg-white">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 text-white rounded-t-lg">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-white/20 backdrop-blur rounded-lg">
                <Bike className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Ride</h3>
                <p className="text-cyan-100 text-sm">Bike {ride.id}</p>
              </div>
            </div>
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}
            >
              {ride.status}
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 mb-5">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  Duration
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {ride.duration ? formatDuration(ride.duration) : "0m"}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Started</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(ride.startTime)}
                  </p>
                </div>
              </div>
              {ride.endTime && (
                <div className="flex items-center space-x-3 sm:text-right">
                  <div className="p-2 bg-green-100 rounded-lg sm:order-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="sm:order-1">
                    <p className="text-sm text-gray-600 font-medium">Ended</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatDate(ride.endTime)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-emerald-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        Total Fare
                      </p>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {ride.fare.totalFare.toFixed(2)}
                        </span>
                        <span className="text-lg font-semibold text-gray-600">
                          {ride.fare.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                 
                </div>

                {(ride.fare.baseFare ||
                  ride.fare.timeCharge ||
                  ride.fare.distanceCharge) && (
                  <div className="border-t border-emerald-200 pt-3 space-y-1">
                    <p className="text-xs text-gray-500 font-medium mb-2">
                      Fare Breakdown:
                    </p>
                    {ride.fare.baseFare > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Base fare:</span>
                        <span className="font-medium">
                          {ride.fare.currency} {ride.fare.baseFare.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {ride.fare.timeCharge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time charge:</span>
                        <span className="font-medium">
                          {ride.fare.currency} {ride.fare.timeCharge.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {ride.fare.distanceCharge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Distance charge:</span>
                        <span className="font-medium">
                          {ride.fare.currency}{" "}
                          {ride.fare.distanceCharge.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {onViewDetails && (
              <Button
                onClick={() => onViewDetails(ride)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group py-3 text-base font-semibold"
                size="lg"
              >
                <span className="mr-2">View Ride Details</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
