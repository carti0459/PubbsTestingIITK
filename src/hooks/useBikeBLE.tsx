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

export default function useBikeBLE() {
  const [bike, setBike] = useState<ConnectResult | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [lastNotification, setLastNotification] = useState<any | null>(null);
  const notifierStopRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (notifierStopRef.current) {
        // safe call and ignore rejection
        notifierStopRef.current().catch(() => {});
      }
      if (bike) {
        try {
          disconnect(bike);
        } catch (e) {}
      }
    };
  }, [bike]);

  const connect = useCallback(async (opts) => {
    try {
      const bd = await connectToBikeLock({
        optionalServices: opts?.optionalServices,
      });
      setBike(bd);
      setConnected(true);
      // start notifications
      const stop = await startNotifications(bd, (data) => {
        const parsed = parseNotification(data);
        setLastNotification(parsed);
      });
      notifierStopRef.current = stop;
      return bd;
    } catch (err) {
      setConnected(false);
      setBike(null);
      throw err;
    }
  }, []);

  const unlock = useCallback(async () => {
    if (!bike) throw new Error("No bike connected");
    await writeCommand(bike, COMMANDS.UNLOCK);
    return true;
  }, [bike]);

  const lock = useCallback(async () => {
    if (!bike) throw new Error("No bike connected");
    await writeCommand(bike, COMMANDS.LOCK);
    return true;
  }, [bike]);

  const endRide = useCallback(async () => {
    if (!bike) throw new Error("No bike connected");
    await writeCommand(bike, COMMANDS.END_RIDE);
    return true;
  }, [bike]);

  const requestBattery = useCallback(async () => {
    if (!bike) throw new Error("No bike connected");
    await writeCommand(bike, COMMANDS.BATTERY_STATUS_REQUEST);
    return true;
  }, [bike]);

  const safeDisconnect = useCallback(() => {
    if (notifierStopRef.current) notifierStopRef.current().catch(() => {});
    if (bike) disconnect(bike);
    setConnected(false);
    setBike(null);
  }, [bike]);

  return {
    bike,
    connected,
    lastNotification,
    error: null,
    connect,
    unlock,
    lock,
    endRide,
    requestBattery,
    disconnect: safeDisconnect,
  };
}
