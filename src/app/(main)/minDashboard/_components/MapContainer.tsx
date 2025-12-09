"use client";

import React, { useState } from "react";
import VisGoogleMap from "@/components/common/VisGoogleMap";
import StationDetailsDrawer from "@/components/common/StationDetailsDrawer";

interface MapLocation {
  key: string;
  location: { lat: number; lng: number };
  title: string;
  description: string;
  radius?: number;
  status?: boolean;
  color?: string;
  opacity?: number;
  isPolygon?: boolean;
  coordinates?: Array<{ lat: number; lng: number }>;
  stationData?: any; // Station data for drawer display
}

interface MapContainerProps {
  center: { lat: number; lng: number };
  zoom: number;
  locations: MapLocation[];
  className?: string;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  center,
  zoom,
  locations,
  className = "w-full h-full",
}) => {
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Ensure locations is always an array to prevent map errors
  const safeLocations = Array.isArray(locations) ? locations : [];

  const handleMarkerClick = (stationData: any) => {
    setSelectedStation(stationData);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedStation(null);
  };

  return (
    <>
      <div className="w-full h-full absolute inset-0">
        <VisGoogleMap
          center={center}
          zoom={zoom}
          height="100%"
          locations={safeLocations}
          className={className}
          onMarkerClick={handleMarkerClick}
        />
      </div>
      
      <StationDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        stationData={selectedStation}
      />
    </>
  );
};

export default MapContainer;