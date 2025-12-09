import { useState, useCallback } from "react";
import { database } from "@/lib/firebase";
import { ref, set, get, onValue, off } from "firebase/database";

export interface BikeLock {
  bikeId: string;
  status: "locked" | "unlocked" | "error" | "maintenance";
  batteryLevel: number;
  lastCommand: string;
  lastCommandTime: number;
  userId?: string;
  unlockCode?: string;
  isConnected: boolean;
  location: {
    lat: number;
    lng: number;
  };
}

export interface LockCommand {
  id: string;
  bikeId: string;
  userId: string;
  command: "lock" | "unlock" | "status" | "locate";
  timestamp: number;
  status: "pending" | "success" | "failed" | "timeout";
  responseTime?: number;
  errorMessage?: string;
}

interface LockControlState {
  locks: BikeLock[];
  commands: LockCommand[];
  loading: boolean;
  error: string | null;
}

export const useLockControl = () => {
  const [state, setState] = useState<LockControlState>({
    locks: [],
    commands: [],
    loading: false,
    error: null,
  });

  const generateUnlockCode = useCallback((): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }, []);

  const simulateLockDelay = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      const delay = Math.random() * 2000 + 1000;
      const success = Math.random() > 0.1;

      setTimeout(() => {
        resolve(success);
      }, delay);
    });
  }, []);

  const subscribeToLocks = useCallback((operator: string) => {
    const locksRef = ref(database, `${operator}/BikeLocks`);

    const unsubscribe = onValue(locksRef, (snapshot) => {
      if (snapshot.exists()) {
        const locksData = snapshot.val();
        const locksList: BikeLock[] = Object.entries(locksData).map(
          ([key, value]: [string, unknown]) => {
            const lockValue = value as Record<string, unknown>;
            return {
              bikeId: key,
              status: (lockValue.status as BikeLock["status"]) || "locked",
              batteryLevel: (lockValue.batteryLevel as number) || 100,
              lastCommand: (lockValue.lastCommand as string) || "none",
              lastCommandTime:
                (lockValue.lastCommandTime as number) || Date.now(),
              userId: (lockValue.userId as string) || "",
              unlockCode: (lockValue.unlockCode as string) || "",
              isConnected: (lockValue.isConnected as boolean) !== false,
              location: (lockValue.location as {
                lat: number;
                lng: number;
              }) || { lat: 0, lng: 0 },
            };
          }
        );

        setState((prev) => ({ ...prev, locks: locksList }));
      } else {
        setState((prev) => ({ ...prev, locks: [] }));
      }
    });

    return () => off(locksRef, "value", unsubscribe);
  }, []);

  const subscribeToCommands = useCallback((operator: string) => {
    const commandsRef = ref(database, `${operator}/LockCommands`);

    const unsubscribe = onValue(commandsRef, (snapshot) => {
      if (snapshot.exists()) {
        const commandsData = snapshot.val();
        const commandsList: LockCommand[] = (
          Object.values(
            commandsData as Record<string, unknown>
          ) as LockCommand[]
        ).sort((a: LockCommand, b: LockCommand) => {
          return b.timestamp - a.timestamp;
        });

        setState((prev) => ({ ...prev, commands: commandsList }));
      } else {
        setState((prev) => ({ ...prev, commands: [] }));
      }
    });

    return () => off(commandsRef, "value", unsubscribe);
  }, []);

  const unlockBike = useCallback(
    async (
      operator: string,
      bikeId: string,
      userId: string,
    ): Promise<{ success: boolean; unlockCode?: string; error?: string }> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const bikeRef = ref(database, `${operator}/Bicycle/${bikeId}`);

        const bikeSnapshot = await get(bikeRef);

        if (!bikeSnapshot.exists()) {
          const errorMsg = `Bike not found in database. Path: ${operator}/Bicycle/${bikeId}`;

          throw new Error(errorMsg);
        }

        const bikeData = bikeSnapshot.val();

        const validStatuses = ["active", "available", "idle"];
        const currentStatus = bikeData.status?.toLowerCase() || "unknown";

        if (!bikeData.status || !validStatuses.includes(currentStatus)) {
          const errorMsg = `Bike is not available for use. Current status: "${
            bikeData.status || "unknown"
          }" (normalized: "${currentStatus}"). Valid statuses: ${validStatuses.join(
            ", "
          )}`;

          throw new Error(errorMsg);
        }

        const commandId = `cmd-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}`;
        const command: LockCommand = {
          id: commandId,
          bikeId,
          userId,
          command: "unlock",
          timestamp: Date.now(),
          status: "pending",
        };

        await set(
          ref(database, `${operator}/LockCommands/${commandId}`),
          command
        );

        const startTime = Date.now();
        const success = await simulateLockDelay();
        const responseTime = Date.now() - startTime;

        if (success) {
          const unlockCode = generateUnlockCode();

          const lockUpdate = {
            status: "unlocked",
            userId,
            unlockCode,
            lastCommand: "unlock",
            lastCommandTime: Date.now(),
            isConnected: true,
          };

          await set(
            ref(database, `${operator}/BikeLocks/${bikeId}`),
            lockUpdate
          );

          const bikeUpdates = {
            status: "busy",
            operation: "1",
          };

          await set(ref(database, `${operator}/Bicycle/${bikeId}`), {
            ...bikeData,
            ...bikeUpdates,
          });

          await set(ref(database, `${operator}/LockCommands/${commandId}`), {
            ...command,
            status: "success",
            responseTime,
          });

          setState((prev) => ({ ...prev, loading: false }));
          return { success: true, unlockCode };
        } else {
          const errorMessage = "Lock communication failed";

          await set(ref(database, `${operator}/LockCommands/${commandId}`), {
            ...command,
            status: "failed",
            responseTime,
            errorMessage,
          });

          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    },
    [simulateLockDelay, generateUnlockCode]
  );

  const lockBike = useCallback(
    async (
      operator: string,
      bikeId: string,
      userId: string
    ): Promise<{ success: boolean; error?: string }> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const commandId = `cmd-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}`;
        const command: LockCommand = {
          id: commandId,
          bikeId,
          userId,
          command: "lock",
          timestamp: Date.now(),
          status: "pending",
        };

        await set(
          ref(database, `${operator}/LockCommands/${commandId}`),
          command
        );

        const startTime = Date.now();
        const success = await simulateLockDelay();
        const responseTime = Date.now() - startTime;

        if (success) {
          const lockUpdate = {
            status: "locked",
            userId: "",
            unlockCode: "",
            lastCommand: "lock",
            lastCommandTime: Date.now(),
            isConnected: true,
          };

          await set(
            ref(database, `${operator}/BikeLocks/${bikeId}`),
            lockUpdate
          );

          await set(
            ref(database, `${operator}/Bicycle/${bikeId}/status`),
            "active"
          );

          await set(ref(database, `${operator}/LockCommands/${commandId}`), {
            ...command,
            status: "success",
            responseTime,
          });

          setState((prev) => ({ ...prev, loading: false }));
          return { success: true };
        } else {
          const errorMessage = "Lock communication failed";

          await set(ref(database, `${operator}/LockCommands/${commandId}`), {
            ...command,
            status: "failed",
            responseTime,
            errorMessage,
          });

          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    },
    [simulateLockDelay]
  );

  const getLockStatus = useCallback(
    async (operator: string, bikeId: string): Promise<BikeLock | null> => {
      try {
        const lockRef = ref(database, `${operator}/BikeLocks/${bikeId}`);
        const snapshot = await get(lockRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          return {
            bikeId,
            status: data.status || "locked",
            batteryLevel: data.batteryLevel || 100,
            lastCommand: data.lastCommand || "none",
            lastCommandTime: data.lastCommandTime || Date.now(),
            userId: data.userId || "",
            unlockCode: data.unlockCode || "",
            isConnected: data.isConnected !== false,
            location: data.location || { lat: 0, lng: 0 },
          };
        }
        return null;
      } catch (error) {
        console.error("Error getting lock status:", error);
        return null;
      }
    },
    []
  );

  const initializeBikeLock = useCallback(
    async (
      operator: string,
      bikeId: string,
      location: { lat: number; lng: number }
    ): Promise<boolean> => {
      try {
        const lockData: BikeLock = {
          bikeId,
          status: "locked",
          batteryLevel: 100,
          lastCommand: "initialize",
          lastCommandTime: Date.now(),
          isConnected: true,
          location,
        };

        await set(ref(database, `${operator}/BikeLocks/${bikeId}`), lockData);
        return true;
      } catch (error) {
        console.error("Error initializing bike lock:", error);
        return false;
      }
    },
    []
  );

  const processQRUnlock = useCallback(
    async (
      qrContent: string,
      userId: string
    ): Promise<{
      success: boolean;
      unlockCode?: string;
      error?: string;
      bikeId?: string;
    }> => {
      try {
        let qrData;
        try {
          qrData = JSON.parse(qrContent);
        } catch {
          qrData = { bikeId: qrContent, operator: "PubbsTesting" };
        }

        if (!qrData.bikeId) {
          return { success: false, error: "Invalid QR code: No bike ID found" };
        }

        const operator = qrData.operator || "PubbsTesting";
        const bikeId = qrData.bikeId;

        const result = await unlockBike(operator, bikeId, userId);

        return {
          ...result,
          bikeId,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to process QR code",
        };
      }
    },
    [unlockBike]
  );

  return {
    ...state,
    subscribeToLocks,
    subscribeToCommands,
    unlockBike,
    lockBike,
    getLockStatus,
    initializeBikeLock,
    processQRUnlock,
    generateUnlockCode,
  };
};
