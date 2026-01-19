"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  connectToBikeLock,
  disconnect,
  writeCommand,
  startNotifications,
  parseNotification,
  COMMANDS,
  type ConnectResult,
} from "@/lib/ble";

/**
 * FIX #5, #6, #7, #8, #9: Enhanced BLE hook with automatic reconnection,
 * keep-alive heartbeat, and robust state management
 */
export default function useBikeBLE() {
  const [bike, setBike] = useState<ConnectResult | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [lastNotification, setLastNotification] = useState<any | null>(null);
  
  // FIX #7: Enhanced state management
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const [rideInProgress, setRideInProgress] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const notifierStopRef = useRef<(() => Promise<void>) | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnectRef = useRef<boolean>(false);

  // FIX #8: Handle disconnect events
  const handleDisconnect = useCallback(() => {
    console.log("🔴 Disconnect detected. Manual:", isManualDisconnectRef.current, "Ride:", rideInProgress);
    setConnected(false);
    
    // Stop heartbeat immediately
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // FIX #5: Automatic reconnection only if ride is in progress and not manual disconnect
    if (rideInProgress && !isManualDisconnectRef.current && reconnectAttempts < 5) {
      setIsReconnecting(true);
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 16000); // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      console.log(`🔄 Attempting reconnection in ${delay}ms (attempt ${reconnectAttempts + 1}/5)...`);
      
      reconnectTimeoutRef.current = setTimeout(async () => {
        try {
          setReconnectAttempts(prev => prev + 1);
          // Attempt to reconnect with the same options
          await connect({ optionalServices: ["00001530-1212-efde-1523-785feabcd123"] });
          setReconnectAttempts(0); // Reset on success
          setIsReconnecting(false);
          setError(null);
          console.log("✅ Reconnection successful!");
        } catch (err) {
          console.error("❌ Reconnection failed:", err);
          setError(err instanceof Error ? err.message : "Reconnection failed");
          setIsReconnecting(false);
          
          // Will retry again via disconnect handler if still under max attempts
          if (reconnectAttempts >= 4) {
            setError("Maximum reconnection attempts reached. Please reconnect manually.");
            setRideInProgress(false);
          }
        }
      }, delay);
    } else if (reconnectAttempts >= 5) {
      setError("Connection lost. Maximum reconnection attempts reached.");
      setRideInProgress(false);
    }
  }, [rideInProgress, reconnectAttempts]);

  // FIX #9: Enhanced cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up BLE hook...");
      // Clear all timers
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      // Stop notifications
      if (notifierStopRef.current) {
        notifierStopRef.current().catch(() => {});
      }
      // Disconnect device
      if (bike) {
        try {
          disconnect(bike);
        } catch {}
      }
    };
  }, [bike]);

  const connect = useCallback(async (opts: { optionalServices?: string[] }) => {
    try {
      setError(null);
      // FIX #1 & #8: Pass disconnect handler to connection
      const bd = await connectToBikeLock({
        optionalServices: opts?.optionalServices,
        onDisconnect: handleDisconnect,
      });
      setBike(bd);
      setConnected(true);
      
      // Start notifications
      const stop = await startNotifications(bd, (data) => {
        const parsed = parseNotification(data);
        setLastNotification(parsed);
        console.log("📨 Notification received:", parsed);
      });
      notifierStopRef.current = stop;
      
      return bd;
    } catch (err) {
      setConnected(false);
      setBike(null);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    }
  }, [handleDisconnect]);

  const unlock = useCallback(async () => {
    if (!bike) throw new Error("No bike connected");
    try {
      await writeCommand(bike, COMMANDS.UNLOCK);
      
      // FIX #6 & #7: Start ride and begin keep-alive heartbeat
      setRideInProgress(true);
      setReconnectAttempts(0); // Reset reconnection counter when ride starts
      
      // Start heartbeat to keep connection alive (every 30 seconds)
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      heartbeatIntervalRef.current = setInterval(async () => {
        try {
          // FIX #4: Validate connection before sending heartbeat
          if (bike?.server?.connected) {
            console.log("💓 Sending keep-alive heartbeat...");
            await writeCommand(bike, COMMANDS.BATTERY_STATUS_REQUEST);
          } else {
            console.warn("⚠️ Skipping heartbeat - not connected");
          }
        } catch (err) {
          console.error("❌ Heartbeat failed:", err);
          // Don't throw - let disconnect handler manage reconnection
        }
      }, 30000); // 30 seconds
      
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    }
  }, [bike]);

  const lock = useCallback(async () => {
    if (!bike) throw new Error("No bike connected");
    try {
      await writeCommand(bike, COMMANDS.LOCK);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    }
  }, [bike]);

  const endRide = useCallback(async () => {
    if (!bike) throw new Error("No bike connected");
    try {
      await writeCommand(bike, COMMANDS.END_RIDE);
      
      // FIX #6: Stop heartbeat when ride ends
      setRideInProgress(false);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
        console.log("🛑 Stopped keep-alive heartbeat");
      }
      
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    }
  }, [bike]);

  const requestBattery = useCallback(async () => {
    if (!bike) throw new Error("No bike connected");
    try {
      await writeCommand(bike, COMMANDS.BATTERY_STATUS_REQUEST);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    }
  }, [bike]);

  const safeDisconnect = useCallback(() => {
    try {
      // FIX #8: Mark as manual disconnect to prevent auto-reconnection
      isManualDisconnectRef.current = true;
      setRideInProgress(false);
      
      // FIX #9: Clean up all resources
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (notifierStopRef.current) {
        notifierStopRef.current().catch(() => {});
        notifierStopRef.current = null;
      }
      if (bike) {
        disconnect(bike);
      }
      
      setConnected(false);
      setBike(null);
      setReconnectAttempts(0);
      setIsReconnecting(false);
      setError(null);
      
      // Reset manual disconnect flag after a short delay
      setTimeout(() => {
        isManualDisconnectRef.current = false;
      }, 1000);
      
      console.log("✅ Disconnected successfully");
    } catch (err) {
      console.error("⚠️ Error during disconnect:", err);
      // FIX #3: Don't throw - just log to prevent crashes
    }
  }, [bike]);

  return {
    bike,
    connected,
    lastNotification,
    error,
    isReconnecting,
    reconnectAttempts,
    rideInProgress,
    connect,
    unlock,
    lock,
    endRide,
    requestBattery,
    disconnect: safeDisconnect,
  };
}
