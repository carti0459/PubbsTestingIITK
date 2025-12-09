import React, { useState, useEffect } from "react";
import { useTouchGestures, vibrate } from "@/hooks/useTouchGestures";

interface Bike {
  id: string;
  latitude: number;
  longitude: number;
  battery: number;
  distance: number;
  isAvailable: boolean;
  type: "standard" | "electric";
}

interface MobileBikeFinderProps {
  userLocation: { latitude: number; longitude: number } | null;
  onBikeSelect: (bikeId: string) => void;
}

export const MobileBikeFinder: React.FC<MobileBikeFinderProps> = ({
  userLocation,
  onBikeSelect,
}) => {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState<string | null>(null);
  const [mapView, setMapView] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState<"distance" | "battery">("distance");
  const [filterType, setFilterType] = useState<"all" | "standard" | "electric">(
    "all"
  );

  const mapGestures = useTouchGestures({
    onPinch: () => {
      vibrate(20);
    },
    onDoubleTap: () => {
      vibrate(30);
    },
    threshold: 30,
  });

  useEffect(() => {
    const mockBikes: Bike[] = [
      {
        id: "bike-001",
        latitude: userLocation?.latitude
          ? userLocation.latitude + 0.001
          : 40.7128,
        longitude: userLocation?.longitude
          ? userLocation.longitude + 0.001
          : -74.006,
        battery: 85,
        distance: 120,
        isAvailable: true,
        type: "electric",
      },
      {
        id: "bike-002",
        latitude: userLocation?.latitude
          ? userLocation.latitude - 0.002
          : 40.7118,
        longitude: userLocation?.longitude
          ? userLocation.longitude + 0.002
          : -74.005,
        battery: 92,
        distance: 250,
        isAvailable: true,
        type: "standard",
      },
      {
        id: "bike-003",
        latitude: userLocation?.latitude
          ? userLocation.latitude + 0.003
          : 40.7138,
        longitude: userLocation?.longitude
          ? userLocation.longitude - 0.001
          : -74.007,
        battery: 67,
        distance: 340,
        isAvailable: false,
        type: "electric",
      },
      {
        id: "bike-004",
        latitude: userLocation?.latitude
          ? userLocation.latitude - 0.001
          : 40.7108,
        longitude: userLocation?.longitude
          ? userLocation.longitude - 0.003
          : -74.009,
        battery: 78,
        distance: 180,
        isAvailable: true,
        type: "standard",
      },
    ];

    setBikes(mockBikes);
  }, [userLocation]);

  const filteredAndSortedBikes = bikes
    .filter((bike) => bike.isAvailable)
    .filter((bike) => filterType === "all" || bike.type === filterType)
    .sort((a, b) => {
      if (sortBy === "distance") return a.distance - b.distance;
      return b.battery - a.battery;
    });

  const handleBikeSelect = (bikeId: string) => {
    setSelectedBike(bikeId);
    vibrate(50);
    onBikeSelect(bikeId);
  };

  const handleFilterChange = (type: "all" | "standard" | "electric") => {
    setFilterType(type);
    vibrate(30);
  };

  const toggleMapView = () => {
    setMapView((prev) => (prev === "list" ? "map" : "list"));
    vibrate(30);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Find Nearby Bikes
          </h2>
          <button
            onClick={toggleMapView}
            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            style={{ minHeight: "44px", minWidth: "44px" }}
          >
            {mapView === "list" ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterType === "all"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange("standard")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterType === "standard"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => handleFilterChange("electric")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterType === "electric"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Electric
            </button>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSortBy("distance")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                sortBy === "distance"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Distance
            </button>
            <button
              onClick={() => setSortBy("battery")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                sortBy === "battery"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Battery
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          {filteredAndSortedBikes.length} available bikes nearby
        </p>
      </div>

      {/* Content */}
      {mapView === "list" ? (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {filteredAndSortedBikes.map((bike) => (
              <div
                key={bike.id}
                className={`bg-white rounded-lg border-2 p-4 transition-all ${
                  selectedBike === bike.id
                    ? "border-blue-500 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleBikeSelect(bike.id)}
                style={{ minHeight: "120px" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          bike.type === "electric"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                      ></div>
                      <h3 className="font-semibold text-gray-900">
                        {bike.type === "electric"
                          ? "Electric Bike"
                          : "Standard Bike"}
                      </h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {bike.id}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{bike.distance}m away</span>
                      </div>

                      {bike.type === "electric" && (
                        <div className="flex items-center space-x-1">
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
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          <span>{bike.battery}% battery</span>
                        </div>
                      )}
                    </div>

                    {bike.type === "electric" && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Battery Level</span>
                          <span>{bike.battery}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              bike.battery > 60
                                ? "bg-green-500"
                                : bike.battery > 30
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${bike.battery}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBikeSelect(bike.id);
                    }}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    style={{ minHeight: "40px" }}
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}

            {filteredAndSortedBikes.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Bikes Available
                </h3>
                <p className="text-gray-600">
                  No bikes match your current filters. Try adjusting your search
                  criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 relative bg-gray-200" {...mapGestures}>
          {/* Simplified Map View */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
              <p className="text-sm px-4">
                Map view with pinch-to-zoom and touch gestures
              </p>
              <p className="text-xs text-gray-500 mt-2 px-4">
                Use touch gestures to navigate and find bikes on the map
              </p>
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <button
              className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              onClick={() => vibrate(30)}
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
            <button
              className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              onClick={() => vibrate(30)}
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
          </div>

          {/* Bike Markers Preview */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">
                    {filteredAndSortedBikes.length} bikes shown
                  </span>
                </div>
                <button
                  onClick={() => setMapView("list")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
