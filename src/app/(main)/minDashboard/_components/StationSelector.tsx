"use client";

import React from "react";
import {
  SelectItem,
} from "@/components/ui/select";
import { ClientOnlySelect } from "@/components/ui/client-only-select";
import type { Station } from "@/hooks/useStations";

interface BikeItem {
  id?: string;
  bikeId?: string;
  operator?: string;
  status?: string;
  battery?: string | number;
  [key: string]: unknown;
}

interface StationSelectorProps {
  stations: Station[];
  selectedStation: string;
  onStationSelect: (stationId: string) => void;
  loading: boolean;
  getBikesByStation: (stationId: string) => BikeItem[];
  variant?: "default" | "sidebar";
}

export const StationSelector: React.FC<StationSelectorProps> = ({
  stations,
  selectedStation,
  onStationSelect,
  loading,
  getBikesByStation,
  variant = "default",
}) => {
  // Get bike counts for a station
  const getStationBikeCounts = (stationId: string) => {
    const stationBikes = getBikesByStation(stationId);
    const activeBikes = stationBikes.filter(
      (bike) => bike.status === "active"
    ).length;
    const totalBikes = stationBikes.length;
    return { activeBikes, totalBikes };
  };

  // Get total bike counts across all stations
  const getAllStationsBikeCounts = () => {
    let totalActiveBikes = 0;
    let totalBikes = 0;

    stations.forEach((station) => {
      const stationBikes = getBikesByStation(station.id);
      totalActiveBikes += stationBikes.filter(
        (bike) => bike.status === "active"
      ).length;
      totalBikes += stationBikes.length;
    });

    return { activeBikes: totalActiveBikes, totalBikes };
  };

  if (variant === "sidebar") {
    return (
      <div className="w-full">
        <ClientOnlySelect
          value={selectedStation === "all" ? "" : selectedStation}
          onValueChange={(value: string) => onStationSelect(value === "all" ? "" : value)}
          disabled={loading}
          triggerProps={{
            className: "w-full py-3 px-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between shadow-sm hover:border-cyan-300 transition-colors",
            placeholder: "Select a station..."
          }}
          contentProps={{
            className: "max-h-60 overflow-y-auto"
          }}
        >
            {loading ? (
              <div className="p-2 text-center text-slate-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600 mx-auto mb-2"></div>
                Loading stations...
              </div>
            ) : stations.length === 0 ? (
              <div className="p-2 text-center text-slate-500">
                No stations available
              </div>
            ) : (
              <>
                <SelectItem value="all" className="py-2 px-3">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-slate-900 truncate">
                      🌍 All Stations
                    </span>
                    <span className="text-xs font-medium ml-4 text-blue-600">
                      {(() => {
                        const { activeBikes, totalBikes } =
                          getAllStationsBikeCounts();
                        return `${activeBikes}/${totalBikes}`;
                      })()}
                    </span>
                  </div>
                </SelectItem>

                {stations.map((station) => {
                  const { activeBikes, totalBikes } = getStationBikeCounts(
                    station.id
                  );
                  return (
                    <SelectItem
                      key={station.id}
                      value={station.id}
                      className="py-2 px-3"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-medium text-slate-900 truncate">
                          {station.name}
                        </span>
                        <span
                          className={`text-xs font-medium ml-4 ${
                            activeBikes > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {activeBikes}/{totalBikes}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </>
            )}
        </ClientOnlySelect>
      </div>
    );
  }

  // Default variant (existing styling)
  return (
    <div className="bg-gray-100 p-4 flex-shrink-0 z-10 md:bg-white md:shadow-xl md:rounded-lg md:p-6">
      <p className="text-gray-600 text-sm mb-3 md:text-base md:mb-4 md:font-medium">
        Please Select Station
      </p>
      <ClientOnlySelect
        value={selectedStation === "all" ? "" : selectedStation}
        onValueChange={(value: string) => onStationSelect(value === "all" ? "" : value)}
        disabled={loading}
        triggerProps={{
          className: "w-full py-5 px-5 bg-white border border-gray-200 rounded-lg flex items-center justify-between shadow-sm md:py-6 md:px-6 md:text-lg md:border-2 md:border-blue-200 md:hover:border-blue-400 md:transition-colors",
          placeholder: loading ? "Loading..." : "Select Location",
          children: (
            <div className="flex items-center space-x-3 md:space-x-4">
              <svg
                className="w-5 h-5 text-blue-500 md:w-6 md:h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span className="text-gray-700 text-base md:text-lg md:font-medium">
                {selectedStation === "all" || !selectedStation ? 
                  (loading ? "Loading..." : "Select Location") : 
                  stations.find(s => s.id === selectedStation)?.name || "Select Location"
                }
              </span>
            </div>
          )
        }}
        contentProps={{
          className: "w-full max-h-40 md:max-h-96 md:min-w-[400px] overflow-auto md:text-base",
          position: "popper"
        }}
      >
          <SelectItem value="all" className="py-2 px-3">
            <div className="flex items-center justify-between w-full">
              <span className="text-gray-800 font-medium truncate">
                🌍 All Stations
              </span>
              <span className="text-xs font-medium ml-4 text-blue-600">
                {(() => {
                  const { activeBikes, totalBikes } =
                    getAllStationsBikeCounts();
                  return `${activeBikes}/${totalBikes}`;
                })()}
              </span>
            </div>
          </SelectItem>

          {stations.map((station: Station) => {
            const { activeBikes, totalBikes } = getStationBikeCounts(
              station.id
            );
            return (
              <SelectItem
                key={station.id}
                value={station.id}
                className="py-2 px-3"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-gray-800 font-medium truncate">
                    {station.name}
                  </span>
                  <span
                    className={`text-xs font-medium ml-4 ${
                      activeBikes > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {activeBikes}/{totalBikes}
                  </span>
                </div>
              </SelectItem>
            );
          })}
      </ClientOnlySelect>
    </div>
  );
};

export default StationSelector;
