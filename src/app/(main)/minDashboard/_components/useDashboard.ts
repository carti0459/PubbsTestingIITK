"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSubscription, useStations, useBikes } from "@/hooks";
import type { Station } from "@/hooks/useStations";
import { useGeofencing } from "@/hooks/useGeofencing";
import { useAuth } from "@/contexts/AuthContext";
import { useOperator } from "@/contexts/OperatorContext";
import { useBLEContext } from "@/contexts/BLEContext";

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
  stationData?: any;
}

interface BikeData {
  id?: string;
  bikeId?: string;
  operator?: string;
  latitude?: number;
  longitude?: number;
  battery?: string | number;
  ridetime?: string | number;
  status?: string;
  operation?: string;
  bike?: {
    bikeId?: string;
    id?: string;
    battery?: string | number;
    ridetime?: string | number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface ActiveRideData {
  bookingId?: string;
  rideId?: string;
  bikeId?: string;
  operator?: string;
  rideStartTime?: string | number;
  rideTimer?: number;
  totalTripTime?: number;
  isActive?: boolean;
  isHold?: boolean;
  holdStartTime?: string | number;
  tripData?: {
    sourceStationName?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const useDashboard = () => {
  const { userData } = useAuth();
  const { selectedOperator } = useOperator();
  const { disconnectBLE } = useBLEContext(); // Access BLE disconnect function

  const [selectedStation, setSelectedStation] = useState("");
  const [showSubscriptionWarning, setShowSubscriptionWarning] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrProcessing, setQrProcessing] = useState(false);
  const [bikeData, setBikeData] = useState<BikeData | null>(null);
  const [showRideBooking, setShowRideBooking] = useState(false);
  const [showReadyToRide, setShowReadyToRide] = useState(false);

  // Use selected operator or fallback to default
  const currentOperator = selectedOperator || "PubbsTesting";

  const [currentBookingId, setCurrentBookingId] = useState<string>("");

  // Active ride states
  const [hasActiveRide, setHasActiveRide] = useState(false);
  const [activeRideData, setActiveRideData] = useState<ActiveRideData | null>(
    null
  );
  const [showContinueRideDialog, setShowContinueRideDialog] = useState(false);

  // Hold/Continue functionality state
  const [isHolding, setIsHolding] = useState(false);
  const [holdStartTime, setHoldStartTime] = useState<Date | null>(null);
  const [isHoldProcessing, setIsHoldProcessing] = useState(false);
  const [isEndProcessing, setIsEndProcessing] = useState(false);
  const [rideStartTime, setRideStartTime] = useState<Date | null>(null);
  const [totalRideTime] = useState(0);
  const [totalHoldTime, setTotalHoldTime] = useState(0);

  // Timer states for saving on browser close
  const [currentRideTimer] = useState(0);
  const [currentTotalTripTime] = useState(0);

  const availableOperators = ["PubbsTesting", "IITKgpCampus"];

  const [showGeofencing] = useState(true);

  const { hasActiveSubscription } = useSubscription();
  const {
    stations,
    loading: stationsLoading,
    error: stationsError,
    fetchStations,
  } = useStations();
  const { subscribeToBikes, getBikesByStation } = useBikes();
  const { geofences, subscribeToGeofences } = useGeofencing();
  const router = useRouter();

  // Check for active rides on component mount
  const checkActiveRide = useCallback(async () => {
    if (!userData?.phoneNumber) return;

    try {
      const response = await fetch("/api/check-user-trips", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.phoneNumber,
          action: "check-active-ride",
        }),
      });

      const result = await response.json();

      if (result.success && result.hasActiveRide) {
        setHasActiveRide(true);
        setActiveRideData(result.rideData);
        setCurrentBookingId(result.rideData.bookingId);

        // If ride is on hold, show continue dialog
        if (result.rideData.isHold) {
          setIsHolding(true);
          setShowContinueRideDialog(true);
        }
      } else {
        setHasActiveRide(false);
        setActiveRideData(null);
      }
    } catch (error) {
      console.error("Failed to check active ride:", error);
    }
  }, [userData?.phoneNumber]);

  const handleContinueRideClick = useCallback(() => {
    if (activeRideData) {
      setShowContinueRideDialog(true);
    }
  }, [activeRideData]);

  const handleContinueRideConfirm = useCallback(async () => {
    if (!activeRideData || !userData?.phoneNumber) return;

    try {
      // Fetch bike data for the active ride
      const bikeResponse = await fetch(
        `/api/bikes?bikeId=${activeRideData.rideId}&operator=${currentOperator}`
      );

      if (bikeResponse.ok) {
        const fetchedBikeData = await bikeResponse.json();
        setBikeData(fetchedBikeData);
        setCurrentBookingId(activeRideData.bookingId || "");

        // Restore timer from database if available
        const tripData = activeRideData.tripData as
          | {
            rideTimer?: number;
            totalTripTime?: number;
            holdTimer?: number;
          }
          | undefined;

        if (tripData) {
          // Set ride start time based on saved data
          const savedRideTimer = tripData.rideTimer || 0;

          // Calculate when the ride actually started based on saved timer
          const now = new Date();
          const estimatedStartTime = new Date(
            now.getTime() - savedRideTimer * 1000
          );
          setRideStartTime(estimatedStartTime);

          // Set total hold time from saved data
          const savedHoldTimer = tripData.holdTimer || 0;
          setTotalHoldTime(savedHoldTimer);

          // Also update user's ride start time in database for heartbeat system
          try {
            await fetch("/api/heartbeat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: userData.phoneNumber,
                rideStartTime: estimatedStartTime.toISOString(),
                bookingId: activeRideData.bookingId,
              }),
            });
          } catch (error) {
            console.warn("Failed to update ride start time:", error);
          }
        }

        // Set hold state if applicable
        if (activeRideData.isHold) {
          setIsHolding(true);
          setHoldStartTime(new Date()); // Start counting hold from now
        }

        // Open ride booking drawer
        setShowRideBooking(true);
        setShowContinueRideDialog(false);

        toast.success("Ride resumed successfully!");
      } else {
        toast.error("Failed to fetch bike data for your active ride");
      }
    } catch (error) {
      console.error("Failed to continue ride:", error);
      toast.error("Failed to continue ride. Please try again.");
    }
  }, [activeRideData, userData?.phoneNumber, currentOperator]);

  const handleStartNewRide = useCallback(async () => {
    if (!userData?.phoneNumber || !activeRideData) return;

    try {
      // End the current active ride
      await fetch("/api/check-user-trips", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.phoneNumber,
          bookingId: activeRideData.bookingId,
          rideId: "null",
          rideOnGoingStatus: "false",
        }),
      });

      // Clear active ride state
      setHasActiveRide(false);
      setActiveRideData(null);
      setIsHolding(false);
      setShowContinueRideDialog(false);

      toast.success("Previous ride ended. You can now start a new ride.");
    } catch (error) {
      console.error("Failed to end previous ride:", error);
      toast.error("Failed to end previous ride. Please try again.");
    }
  }, [userData?.phoneNumber, activeRideData]);

  useEffect(() => {
    const fetchWithDebug = async () => {
      await fetchStations(currentOperator);
    };

    fetchWithDebug();
    subscribeToBikes(currentOperator);

    const unsubscribeGeofences = subscribeToGeofences(currentOperator);

    // Check for active rides when component mounts
    checkActiveRide();

    // Heartbeat system - send periodic "I'm alive" signals during active rides
    let heartbeatInterval: NodeJS.Timeout;

    if (showRideBooking && currentBookingId && userData?.phoneNumber) {
      // Send heartbeat every 10 seconds during active rides
      heartbeatInterval = setInterval(async () => {
        try {
          await fetch("/api/heartbeat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userData.phoneNumber,
              rideStartTime: rideStartTime?.toISOString(),
              bookingId: currentBookingId,
            }),
          });
        } catch (error) {
          console.error("Failed to send heartbeat:", error);
        }
      }, 10000); // Every 10 seconds
    }

    return () => {
      unsubscribeGeofences();
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    };
  }, [
    fetchStations,
    subscribeToBikes,
    subscribeToGeofences,
    currentOperator,
    showRideBooking,
    currentBookingId,
    isHolding,
    userData?.phoneNumber,
    checkActiveRide,
  ]);

  const getSelectedStationDetails = useCallback((): Station | null => {
    if (!selectedStation || !stations) return null;
    return (
      stations.find((station: Station) => station.id === selectedStation) ||
      null
    );
  }, [selectedStation, stations]);

  const handleStationSelect = useCallback(
    (stationId: string) => {
      setSelectedStation(stationId);

      if (!hasActiveSubscription) {
        setShowSubscriptionWarning(true);
      }
    },
    [hasActiveSubscription]
  );

  const handleBuyPlan = useCallback(() => {
    setShowSubscriptionWarning(false);
    router.push("/minDashboard/checkout");
  }, [router]);

  const getMapCenter = useCallback(() => {
    const selectedStationDetails = getSelectedStationDetails();
    if (selectedStationDetails) {
      return selectedStationDetails.coordinates;
    }
    return { lat: 22.3149, lng: 87.3105 };
  }, [getSelectedStationDetails]);

  const calculatePolygonCenter = useCallback(
    (coordinates: Array<{ lat: number; lng: number }>) => {
      const totalCoords = coordinates.length;
      const centerLat =
        coordinates.reduce((sum, coord) => sum + coord.lat, 0) / totalCoords;
      const centerLng =
        coordinates.reduce((sum, coord) => sum + coord.lng, 0) / totalCoords;
      return { lat: centerLat, lng: centerLng };
    },
    []
  );

  const getMapLocations = useCallback((): MapLocation[] => {
    const stationLocations = selectedStation
      ? stations
        .filter((station: Station) => station.id === selectedStation)
        .map((station: Station) => {
          const stationBikes = getBikesByStation(station.id);
          const activeBikes = stationBikes.filter(
            (bike) => bike.status === "active"
          ).length;
          const totalBikes = stationBikes.length;

          return {
            key: `station-${station.id}`,
            location: station.coordinates,
            title: station.name,
            description: `Station: ${station.name} | Status: ${station.status ? "Active" : "Inactive"
              } | Bikes: ${activeBikes}/${totalBikes} available`,
            radius: station.radius || 30,
            status: station.status,
            isPolygon: false,
            stationData: {
              stationId: station.id,
              stationName: station.name,
              areaId: station.areaId,
              areaName: station.areaName,
              stationLatitude: station.latitude.toString(),
              stationLongitude: station.longitude.toString(),
              stationCycleCount: totalBikes.toString(),
              stationCycleDemand: activeBikes,
              stationRadius: (station.radius || 30).toString(),
              stationStatus: station.status,
              stationType: station.type,
              stationcyclecount: activeBikes.toString(),
              lastUpdated: new Date().toISOString(),
            },
          };
        })
      : stations.map((station: Station) => {
        const stationBikes = getBikesByStation(station.id);
        const activeBikes = stationBikes.filter(
          (bike) => bike.status === "active"
        ).length;
        const totalBikes = stationBikes.length;

        return {
          key: `station-${station.id}`,
          location: station.coordinates,
          title: station.name,
          description: `Station: ${station.name} | Status: ${station.status ? "Active" : "Inactive"
            } | Bikes: ${activeBikes}/${totalBikes} available`,
          radius: station.radius || 30,
          status: station.status,
          isPolygon: false,
          stationData: {
            stationId: station.id,
            stationName: station.name,
            areaId: station.areaId,
            areaName: station.areaName,
            stationLatitude: station.latitude.toString(),
            stationLongitude: station.longitude.toString(),
            stationCycleCount: totalBikes.toString(),
            stationCycleDemand: activeBikes,
            stationRadius: (station.radius || 30).toString(),
            stationStatus: station.status,
            stationType: station.type,
            stationcyclecount: activeBikes.toString(),
            lastUpdated: new Date().toISOString(),
          },
        };
      });

    const geofenceLocations =
      showGeofencing && !selectedStation
        ? (geofences
          .filter((geofence) => geofence.isActive)
          .map((geofence) => {
            const getColor = (type: string) => {
              switch (type) {
                case "allowed":
                  return "#10B981";
                case "forbidden":
                  return "#EF4444";
                case "station":
                  return "#3B82F6";
                default:
                  return "#6B7280";
              }
            };

            if (geofence.isPolygon && Array.isArray(geofence.coordinates)) {
              const center = calculatePolygonCenter(geofence.coordinates);
              return {
                key: `geofence-${geofence.id}`,
                location: center,
                title: geofence.name,
                description: `${geofence.type} boundary area`,
                color: getColor(geofence.type),
                opacity: geofence.type === "allowed" ? 0.2 : 0.3,
                isPolygon: true,
                coordinates: geofence.coordinates,
              };
            } else if (!Array.isArray(geofence.coordinates)) {
              return {
                key: `geofence-${geofence.id}`,
                location: geofence.coordinates,
                title: geofence.name,
                description: `${geofence.type} area • ${geofence.radius || 100
                  }m radius`,
                radius: geofence.radius || 100,
                color: getColor(geofence.type),
                opacity: 0.3,
                isPolygon: false,
              };
            }
            return null;
          })
          .filter(Boolean) as MapLocation[])
        : [];

    return [...stationLocations, ...geofenceLocations];
  }, [
    stations,
    selectedStation,
    getBikesByStation,
    showGeofencing,
    geofences,
    calculatePolygonCenter,
  ]);

  const handleQRScanner = useCallback(() => {
    if (!hasActiveSubscription) {
      setShowSubscriptionWarning(true);
      return;
    }
    setShowQRScanner(true);
  }, [hasActiveSubscription]);

  const handleReadyToRideClose = useCallback(() => {
    setShowReadyToRide(false);
    setBikeData(null);
  }, []);

  const handleProceedToUnlock = useCallback(async () => {
    if (!bikeData?.bike) {
      toast.error("No bike data available");
      return;
    }

    setShowReadyToRide(false);
    setShowRideBooking(true);
  }, [bikeData]);

  const handleRideHold = useCallback(async () => {
    if (!bikeData?.bike || !currentBookingId) {
      toast.error("No bike data or booking ID available for hold operation");
      return;
    }

    try {
      setIsHoldProcessing(true);

      const bike = bikeData.bike as BikeData["bike"];
      if (!bike) {
        console.error("❌ No bike data available for hold operation");
        toast.error("No bike data available. Please scan the bike again.");
        setIsHoldProcessing(false);
        return;
      }

      const bikeId = bike.bikeId || bike.id;
      const battery = bike.battery || "87";
      const ridetime = bike.ridetime || "480";

      if (isHolding) {
        // CONTINUE from hold - set operation to "3" and wait for "30"
        const response = await fetch("/api/bike-operation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bikeId,
            operator: currentOperator,
            operation: "3", // Continue operation
            status: "busy",
            battery,
            ridetime,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          const errorMsg = result.error || "Failed to send continue command to bike";
          console.error("❌ Continue command failed:", errorMsg);
          toast.error(errorMsg);
          setIsHoldProcessing(false);
          return;
        }

        // Wait for bike to respond with operation="30" and status="busy"
        let attempts = 0;
        const maxAttempts = 30;
        let bikeConfirmed = false;

        while (attempts < maxAttempts && !bikeConfirmed) {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const checkResponse = await fetch(
            `/api/bikes?bikeId=${bikeId}&operator=${currentOperator}`
          );
          const checkResult = await checkResponse.json();

          if (checkResult.success) {
            const currentBike = checkResult.bike;
            if (
              currentBike.operation === "30" &&
              currentBike.status === "busy"
            ) {
              bikeConfirmed = true;
              break;
            }
          }

          attempts++;
        }

        if (!bikeConfirmed) {
          console.error("❌ Bike did not confirm continue operation within 30 seconds");
          toast.error(
            "Bike did not respond. Please try again or contact support."
          );
          setIsHoldProcessing(false);
          return;
        }

        // Calculate total hold time
        const holdEndTime = new Date();
        const holdDuration = holdStartTime
          ? Math.floor((holdEndTime.getTime() - holdStartTime.getTime()) / 1000)
          : 0;

        const newTotalHoldTime = totalHoldTime + holdDuration;

        // Update trip with hold timer
        await updateTripTimers(currentBookingId, {
          holdTimer: newTotalHoldTime,
          rideId: bikeId, // Set ride ID to bike ID
        });

        // Reset hold state
        setIsHolding(false);
        setHoldStartTime(null);
        setTotalHoldTime(newTotalHoldTime);

        toast.success("Ride continued successfully!");
      } else {
        // START hold - set operation to "2" and wait for "20"
        const response = await fetch("/api/bike-operation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bikeId,
            operator: currentOperator,
            operation: "2", // Hold operation
            status: "busy",
            battery,
            ridetime,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          const errorMsg = result.error || "Failed to send hold command to bike";
          console.error("❌ Hold command failed:", errorMsg);
          toast.error(errorMsg);
          setIsHoldProcessing(false);
          return;
        }

        // Wait for bike to respond with operation="20" and status="busy"
        let attempts = 0;
        const maxAttempts = 30;
        let bikeConfirmed = false;

        while (attempts < maxAttempts && !bikeConfirmed) {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const checkResponse = await fetch(
            `/api/bikes?bikeId=${bikeId}&operator=${currentOperator}`
          );
          const checkResult = await checkResponse.json();

          if (checkResult.success) {
            const currentBike = checkResult.bike;
            if (
              currentBike.operation === "20" &&
              currentBike.status === "busy"
            ) {
              bikeConfirmed = true;
              break;
            }
          }

          attempts++;
        }

        if (!bikeConfirmed) {
          console.error("❌ Bike did not confirm hold operation within 30 seconds");
          toast.error(
            "Bike did not respond. Please try again or contact support."
          );
          setIsHoldProcessing(false);
          return;
        }

        // Start hold timer only after bike confirms
        const holdStart = new Date();
        setIsHolding(true);
        setHoldStartTime(holdStart);

        toast.success(
          "Bike has been put on hold. Click Continue to resume your ride."
        );
      }
    } catch (error) {
      console.error("❌ Error with hold operation:", error);
      toast.error(
        `Failed to ${isHolding ? "continue" : "hold"} bike. Please try again.`
      );
    } finally {
      setIsHoldProcessing(false);
    }
  }, [
    bikeData,
    currentOperator,
    currentBookingId,
    isHolding,
    holdStartTime,
    totalHoldTime,
  ]);

  // Helper function to update trip timers
  const updateTripTimers = useCallback(
    async (
      bookingId: string,
      updates: {
        holdTimer?: number;
        rideTimer?: number;
        rideId?: string;
      }
    ) => {
      try {
        const bike = bikeData?.bike as BikeData["bike"];
        const bikeId = bike?.bikeId || bike?.id;

        const response = await fetch("/api/create-trip", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userData?.phoneNumber,
            bookingId,
            bikeId, // Include bikeId for trip updates
            ...updates,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          console.error("Failed to update trip timers:", result.message);
        }

        return result.success;
      } catch (error) {
        console.error("Error updating trip timers:", error);
        return false;
      }
    },
    [bikeData]
  );

  const handleRideEnd = useCallback(async () => {
    if (!bikeData?.bike || !currentBookingId) {
      toast.error(
        "No bike data or booking ID available for end ride operation"
      );
      return;
    }

    try {
      setIsEndProcessing(true);
      const bike = bikeData.bike as BikeData["bike"];
      if (!bike) {
        console.error("❌ No bike data available for end ride operation");
        toast.error("No bike data available. Cannot end ride.");
        setIsEndProcessing(false);
        return;
      }

      const bikeId = bike.bikeId || bike.id;
      const battery = bike.battery || "87";
      const ridetime = bike.ridetime || "480";

      // Calculate trip totals
      const endTime = new Date();
      const startTime = rideStartTime || new Date(); // fallback to current time if null
      const currentRideTime = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      ); // in seconds
      const totalTripTimeCalc = currentRideTime + totalHoldTime; // ride time + hold time

      // 1. Update bike operation to "0" (end) and wait for confirmation
      const bikeResponse = await fetch("/api/bike-operation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bikeId,
          operator: currentOperator,
          operation: "0",
          status: "active",
          battery,
          ridetime,
          action: "direct-update",
        }),
      });

      const bikeResult = await bikeResponse.json();
      if (!bikeResult.success) {
        const errorMsg = bikeResult.error || "Failed to send end command to bike";
        console.error("❌ End ride command failed:", errorMsg);
        toast.error(errorMsg);
        setIsEndProcessing(false);
        return;
      }

      // Wait for bike confirmation - assuming bike responds with operation="00" when ending
      let attempts = 0;
      const maxAttempts = 30;
      let bikeConfirmed = false;

      while (attempts < maxAttempts && !bikeConfirmed) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const checkResponse = await fetch(
          `/api/bikes?bikeId=${bikeId}&operator=${currentOperator}`
        );
        const checkResult = await checkResponse.json();

        if (checkResult.success) {
          const currentBike = checkResult.bike;
          // Check if bike confirmed end operation (operation="00" or stays at "0" with status="active")
          if (
            (currentBike.operation === "00" || currentBike.operation === "0") &&
            currentBike.status === "active"
          ) {
            bikeConfirmed = true;
            break;
          }
        }

        attempts++;
      }

      if (!bikeConfirmed) {
        console.warn(
          "Bike did not confirm end operation within expected time, proceeding anyway"
        );
        // Continue with trip completion even if bike doesn't confirm
      }

      // 2. Update trip data with final values and end the trip
      // Determine destination station - prioritize selected station, then bike's current station
      const destinationStationId =
        selectedStation || bikeData.bike?.inStationId || "Unknown";
      const destinationStationName =
        getSelectedStationDetails()?.name ||
        bikeData.bike?.inStationName ||
        "Unknown";

      const tripResponse = await fetch("/api/create-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData?.phoneNumber,
          bookingId: currentBookingId,
          bikeId,
          destinationStationId,
          destinationStationName,
          rideTimer: currentRideTime,
          totalTripTime: totalTripTimeCalc,
          endTrip: true, // This triggers station count increment
          operator: currentOperator,
          trackLocationTime: endTime.toLocaleString("sv-SE").replace(" ", " "), // "2025-09-15 10:09:43" format
        }),
      });

      const tripResult = await tripResponse.json();
      if (!tripResult.success) {
        console.warn("Failed to update trip data:", tripResult.error);
        // Don't throw error here, bike operation succeeded
      }

      const userResponse = await fetch("/api/check-user-trips", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData?.phoneNumber,
          bookingId: currentBookingId,
          rideId: null,
          rideOnGoingStatus: "false",
        }),
      });

      const userResult = await userResponse.json();
      if (!userResult.success) {
        console.warn("Failed to update trip data:", userResult.error);
        // Don't throw error here, bike operation succeeded
      }

      // CRITICAL FIX: Disconnect BLE when ride ends
      // Device was stored in global context when bike was unlocked in ReadyToRideModal
      console.log("🔌 [End Ride] Disconnecting BLE device...");
      disconnectBLE();
      console.log("✅ [End Ride] BLE disconnected successfully");

      // 3. Reset UI state
      setShowRideBooking(false);
      setBikeData(null);
      setCurrentBookingId("");
      setRideStartTime(new Date());
      setTotalHoldTime(0);
      setIsHolding(false);
      setHoldStartTime(null);

      toast.success(
        "Ride has been ended successfully. Thank you for using Pubbs!"
      );
    } catch (error) {
      console.error("❌ Error ending ride:", error);
      toast.error("Failed to end ride. Please try again.");
    } finally {
      setIsEndProcessing(false);
    }
  }, [
    bikeData,
    currentOperator,
    currentBookingId,
    rideStartTime,
    totalHoldTime,
    selectedStation,
    getSelectedStationDetails,
    userData?.phoneNumber,
  ]);

  const handleRideContinue = useCallback(async () => {
    if (!bikeData?.bike || !currentBookingId) {
      toast.error(
        "No bike data or booking ID available for continue operation"
      );
      return;
    }

    try {
      setIsHoldProcessing(true);
      const bike = bikeData.bike as BikeData["bike"];
      if (!bike) {
        console.error("❌ No bike data available for continue operation");
        toast.error("No bike data available. Please scan the bike again.");
        setIsHoldProcessing(false);
        return;
      }

      const bikeId = bike.bikeId || bike.id;
      const battery = bike.battery || "87";
      const ridetime = bike.ridetime || "480";

      // Calculate final hold time
      const currentHoldTimeCalc = holdStartTime
        ? Math.floor((new Date().getTime() - holdStartTime.getTime()) / 1000)
        : 0;
      const finalHoldTime = totalHoldTime + currentHoldTimeCalc;

      // 1. Update bike operation to "3" (continue)
      const bikeResponse = await fetch("/api/bike-operation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bikeId,
          operator: currentOperator,
          operation: "3",
          status: "busy",
          battery,
          ridetime,
        }),
      });

      const bikeResult = await bikeResponse.json();
      if (!bikeResult.success) {
        const errorMsg = bikeResult.error || "Failed to continue bike operation";
        console.error("❌ Continue bike operation failed:", errorMsg);
        toast.error(errorMsg);
        setIsHoldProcessing(false);
        return;
      }

      // 2. Update trip data with final hold time and clear hold flag
      const tripResponse = await fetch("/api/create-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData?.phoneNumber,
          bookingId: currentBookingId,
          bikeId,
          holdTimer: finalHoldTime,
        }),
      });

      const tripResult = await tripResponse.json();
      if (!tripResult.success) {
        console.warn("Failed to update trip data:", tripResult.error);
        // Don't throw error here, bike operation succeeded
      }

      // 3. Clear hold flag in database
      try {
        await fetch("/api/check-user-trips", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userData?.phoneNumber,
            bookingId: currentBookingId,
            action: "set-hold-status",
            isHold: false,
          }),
        });
      } catch (error) {
        console.warn("Failed to clear hold flag:", error);
      }

      // 4. Reset hold state
      setIsHolding(false);
      setHoldStartTime(null);
      setTotalHoldTime(finalHoldTime);

      toast.success("Ride continued! You can now resume your journey.");
    } catch (error) {
      console.error("❌ Error continuing ride:", error);
      toast.error("Failed to continue ride. Please try again.");
    } finally {
      setIsHoldProcessing(false);
    }
  }, [
    bikeData,
    currentOperator,
    currentBookingId,
    holdStartTime,
    totalHoldTime,
  ]);

  const handleBikeReset = useCallback(
    async (bikeId: string) => {
      try {
        const response = await fetch("/api/bike-operation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bikeId,
            operator: currentOperator,
            action: "reset",
            battery: "87",
            ridetime: "480",
          }),
        });

        const result = await response.json();

        if (result.success) {
          console.log("✅ Bike reset successfully");
          return true;
        } else {
          const errorMsg = result.error || "Failed to reset bike";
          console.error("❌ Bike reset failed:", errorMsg);
          toast.error(errorMsg);
          return false;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("❌ Error resetting bike:", { error, bikeId });
        toast.error(`Failed to reset bike: ${errorMessage}`);
        return false;
      }
    },
    [currentOperator]
  );

  const handleRideBookingClose = useCallback(() => {
    setShowRideBooking(false);
  }, []);

  const handleQRScanResult = useCallback(
    async (result: string) => {
      setShowQRScanner(false);
      setQrProcessing(true);
      setBikeData(null);

      try {
        const normalizeBikeId = (id: string): string => {
          return id.replace(/:/g, "").toUpperCase();
        };

        const isMacAddress = (str: string): boolean => {
          return /^[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}$/.test(
            str
          );
        };

        let processedResult = result;

        if (isMacAddress(result)) {
          processedResult = normalizeBikeId(result);
        }

        let qrData;
        try {
          qrData = JSON.parse(processedResult);
          // Operator is now controlled by context, not QR code
        } catch {
          qrData = {
            bikeId: processedResult,
            operator: currentOperator,
          };
        }

        if (!qrData.operator) {
          qrData.operator = currentOperator;
        }

        try {
          const bikeResponse = await fetch(
            `/api/bikes?bikeId=${qrData.bikeId}&operator=${qrData.operator}`
          );

          if (bikeResponse.ok) {
            const fetchedBikeData = await bikeResponse.json();
            setBikeData(fetchedBikeData);

            if (fetchedBikeData.success && fetchedBikeData.bike) {
              const bike = fetchedBikeData.bike;
              const validStatuses = ["active", "available", "idle"];
              const currentStatus = bike.status?.toLowerCase() || "unknown";

              if (!validStatuses.includes(currentStatus)) {
                console.warn(
                  `⚠️ Bike not available. Status: ${bike.status || "unknown"}`
                );
                toast.error(
                  `Bike is not available for use. Current status: ${bike.status || "unknown"
                  }`
                );
                return;
              }

              setShowReadyToRide(true);
            } else {
              console.warn("⚠️ Bike data fetch failed:", fetchedBikeData);
              toast.error("Failed to fetch bike data. Please try again.");
              return;
            }
          } else {
            // Handle non-ok responses safely
            let errorMessage = "Unknown error";
            try {
              const errorData = await bikeResponse.json();
              console.error("❌ API Error:", errorData);
              errorMessage = errorData.error || errorData.message || "Unknown error";
            } catch (parseError) {
              console.error("❌ Failed to parse error response:", parseError);
              errorMessage = `HTTP ${bikeResponse.status}: ${bikeResponse.statusText}`;
            }

            toast.error(`Failed to fetch bike data: ${errorMessage}`);
            return;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error("❌ Error calling bikes API:", {
            error,
            bikeId: qrData.bikeId,
            operator: qrData.operator,
          });
          toast.error(`Failed to connect to bike service: ${errorMessage}`);
          return;
        }

        try {
          const originalQrData = JSON.parse(result);
          if (originalQrData.stationId) {
            setSelectedStation(originalQrData.stationId);
          }
        } catch {
          console.log(
            `✅ Processed QR: Original: ${result}, Normalized: ${processedResult}, Using ${currentOperator} operator (dynamic)`
          );
        }
      } finally {
        setQrProcessing(false);
      }
    },
    [currentOperator, availableOperators]
  );

  const manualRefreshStations = useCallback(async () => {
    await fetchStations(currentOperator);
  }, [fetchStations, currentOperator]);

  return {
    selectedStation,
    showSubscriptionWarning,
    showQRScanner,
    showRideBooking,
    showReadyToRide,
    qrProcessing,
    bikeData,
    currentOperator,
    availableOperators,
    showGeofencing,
    currentBookingId,

    // Active ride state
    hasActiveRide,
    activeRideData,
    showContinueRideDialog,

    // Hold/Continue state
    isHolding,
    holdStartTime,
    isHoldProcessing,
    isEndProcessing,
    rideStartTime,
    totalRideTime,
    totalHoldTime,
    currentRideTimer,
    currentTotalTripTime,

    stations,
    stationsLoading,
    stationsError,
    hasActiveSubscription,

    handleStationSelect,
    handleBuyPlan,
    handleQRScanner,
    handleQRScanResult,
    handleReadyToRideClose,
    handleProceedToUnlock,
    handleRideHold,
    handleRideContinue,
    handleRideEnd,
    handleBikeReset,
    handleRideBookingClose,
    getMapCenter,
    getMapLocations,
    getBikesByStation,

    // Active ride handlers
    handleContinueRideClick,
    handleContinueRideConfirm,
    handleStartNewRide,
    checkActiveRide,

    manualRefreshStations,

    setShowQRScanner,
    setShowSubscriptionWarning,
    setShowRideBooking,
    setBikeData,
    setCurrentBookingId,
    setShowContinueRideDialog,
  };
};
