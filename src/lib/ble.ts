/// <reference types="web-bluetooth" />

// ...existing code...
/**
 * BLE helper utilities — replace the SERVICE/CHAR UUID placeholders below with your
 * actual UUID strings (do NOT include angle brackets).
 */

const SERVICE_UUID = "00001530-1212-efde-1523-785feabcd123"; // <-- REPLACE
const UNLOCK_UUID = "00001532-1212-efde-1523-785feabcd123"; // <-- REPLACE
const NOTIFY_UUID = "00001531-1212-efde-1523-785feabcd123"; // <-- REPLACE

// Basic command payloads — adjust to match your lock protocol
export const COMMANDS = {
  UNLOCK: Uint8Array.from([0x0f, 0x01]),
  LOCK: Uint8Array.from([0x0f, 0x02]),
  END_RIDE: Uint8Array.from([0x0f, 0x03]),
  BATTERY_STATUS_REQUEST: Uint8Array.from([0x0f, 0x04]),
};

export type ConnectResult = {
  device: BluetoothDevice;
  server: BluetoothRemoteGATTServer;
  service: BluetoothRemoteGATTService;
  // Cleanup function to remove disconnect event listener
  removeDisconnectListener?: () => void;
};

/**
 * Connect to bike lock. 
 * opts: { namePrefix?: string, optionalServices?: string[], onDisconnect?: () => void }
 * 
 * FIX #1: Now accepts onDisconnect callback that fires when device disconnects
 * This prevents silent disconnections and allows automatic reconnection
 */
export async function connectToBikeLock(
  opts?: {
    namePrefix?: string;
    optionalServices?: string[];
    onDisconnect?: () => void;
  }
): Promise<ConnectResult> {
  if (!("bluetooth" in navigator)) {
    throw new Error("Web Bluetooth API not available in this browser");
  }

  const namePrefix = opts?.namePrefix ?? "BIKE_";
  const optionalServices = opts?.optionalServices ?? [SERVICE_UUID, UNLOCK_UUID, NOTIFY_UUID];

  try {
    /*const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix }],
      optionalServices,
    });*/

    //TEMP Debug : accepting all devices to show every advertising BLE device
    // For production, have to use the above requestDevice with filters
    console.debug("⤴ requestDevice options:", { namePrefix, optionalServices });
    // Cast navigator.bluetooth to any to allow using 'acceptAllDevices' despite TS lib mismatch
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true, // ✅ SHOW ALL BLE DEVICES
      optionalServices: [
        '00001530-1212-efde-1523-785feabcd123'
      ]
    } as RequestDeviceOptions);

    if (!device.gatt) {
      throw new Error("Selected device has no GATT server");
    }

    // FIX #1: Add disconnect event listener BEFORE connecting
    // This ensures we catch disconnections that happen during or after connection
    const disconnectHandler = () => {
      console.warn("🔴 BLE Device disconnected:", device.name || device.id);
      if (opts?.onDisconnect) {
        opts.onDisconnect();
      }
    };

    device.addEventListener('gattserverdisconnected', disconnectHandler);

    // FIX #3: Enhanced error handling for connection
    let server: BluetoothRemoteGATTServer;
    try {
      server = await device.gatt.connect();
      console.log("✅ GATT Server connected successfully");
    } catch (connectErr) {
      device.removeEventListener('gattserverdisconnected', disconnectHandler);
      throw new Error(`Failed to connect to GATT server: ${connectErr instanceof Error ? connectErr.message : String(connectErr)}`);
    }

    // FIX #4: Validate connection state before proceeding
    if (!server.connected) {
      device.removeEventListener('gattserverdisconnected', disconnectHandler);
      throw new Error("GATT server connected but connection state is false");
    }

    // FIX #3: Enhanced error handling for service discovery
    let service: BluetoothRemoteGATTService;
    try {
      service = await server.getPrimaryService(SERVICE_UUID);
      console.log("✅ Primary service discovered");
    } catch (serviceErr) {
      device.removeEventListener('gattserverdisconnected', disconnectHandler);
      if (device.gatt?.connected) {
        device.gatt.disconnect();
      }
      throw new Error(`Failed to get primary service: ${serviceErr instanceof Error ? serviceErr.message : String(serviceErr)}`);
    }

    // FIX #2: Return cleanup function for the disconnect listener
    const removeDisconnectListener = () => {
      device.removeEventListener('gattserverdisconnected', disconnectHandler);
    };

    return { device, server, service, removeDisconnectListener };
  } catch (err) {
    console.error("❌ BLE Connect Error:", err);
    // FIX #3: Provide helpful error messages
    if (err instanceof Error) {
      if (err.message.includes("User cancelled")) {
        throw new Error("Connection cancelled by user");
      } else if (err.message.includes("not found")) {
        throw new Error("Bike not found. Make sure it's powered on and nearby.");
      }
    }
    throw err;
  }
}

/**
 * Disconnect helper (accepts the ConnectResult or device object).
 * FIX #2 & #3: Now cleans up disconnect listener before disconnecting to prevent memory leaks
 */
export function disconnect(target: ConnectResult | null | BluetoothDevice | undefined) {
  try {
    if (!target) return;

    let device: BluetoothDevice | undefined | null = null;
    let removeListener: (() => void) | undefined;

    // allow either full object or raw device
    if ("device" in (target as any) && (target as any).device) {
      device = (target as any).device;
      removeListener = (target as any).removeDisconnectListener;
    } else {
      device = target as BluetoothDevice;
    }

    // FIX #2: Remove disconnect listener first to prevent it from firing during intentional disconnect
    if (removeListener) {
      try {
        removeListener();
        console.log("🧹 Removed disconnect event listener");
      } catch (err) {
        console.warn("Failed to remove disconnect listener:", err);
      }
    }

    // FIX #4: Validate connection state before disconnecting
    if (device && device.gatt) {
      if (device.gatt.connected) {
        device.gatt.disconnect();
        console.log("🔌 Disconnected from GATT server");
      } else {
        console.log("ℹ️ Device already disconnected");
      }
    }
  } catch (err) {
    console.warn("⚠️ Error disconnecting device:", err);
    // FIX #3: Don't throw - just log the error to prevent crashes during cleanup
  }
}

/**
 * Write a command to the unlock characteristic (generic writer).
 * `ctx` is the ConnectResult returned by connectToBikeLock (device/server/service).
 * FIX #3 & #4: Added connection validation and robust error handling
 */
export async function writeCommand(
  ctx: ConnectResult,
  payload: Uint8Array
): Promise<void> {
  if (!ctx || !ctx.service) {
    throw new Error("No connected service to write to");
  }

  // FIX #4: Validate connection state before attempting to write
  if (!ctx.server?.connected) {
    throw new Error("Device is not connected. Cannot send command.");
  }

  try {
    const char = await ctx.service.getCharacteristic(UNLOCK_UUID);
    await char.writeValue(payload as BufferSource);
    console.log("✅ Command written successfully:", Array.from(payload));
  } catch (err) {
    console.error("❌ BLE writeCommand error:", err);
    // FIX #3: Provide specific error messages
    if (err instanceof Error) {
      if (err.message.includes("GATT Server is disconnected")) {
        throw new Error("Device disconnected. Please reconnect and try again.");
      } else if (err.message.includes("GATT operation")) {
        throw new Error("Failed to send command to bike. Please try again.");
      }
    }
    throw err;
  }
}

/**
 * Start notifications on the notify characteristic. `onData` receives Uint8Array.
 * Returns a cleanup function that stops notifications and removes the listener.
 * FIX #3 & #4: Added connection validation and robust error handling
 */
export async function startNotifications(
  ctx: ConnectResult,
  onData?: (data: Uint8Array) => void
): Promise<() => Promise<void>> {
  if (!ctx || !ctx.service) {
    throw new Error("No connected service for notifications");
  }

  // FIX #4: Validate connection state
  if (!ctx.server?.connected) {
    throw new Error("Device is not connected. Cannot start notifications.");
  }

  try {
    const notifyChar = await ctx.service.getCharacteristic(NOTIFY_UUID);

    const handler = (event: Event) => {
      const char = event.target as BluetoothRemoteGATTCharacteristic | null;
      const dv = char?.value;
      if (!dv) return;
      const bytes = new Uint8Array(dv.buffer);
      if (onData) onData(bytes);
    };

    await notifyChar.startNotifications();
    notifyChar.addEventListener("characteristicvaluechanged", handler);
    console.log("✅ Notifications started successfully");

    return async () => {
      try {
        notifyChar.removeEventListener("characteristicvaluechanged", handler);
        // FIX #3: Only stop notifications if still connected
        if (ctx.server?.connected && typeof notifyChar.stopNotifications === "function") {
          await notifyChar.stopNotifications();
          console.log("🧹 Notifications stopped");
        }
      } catch (err) {
        console.warn("⚠️ Error stopping notifications:", err);
        // FIX #3: Don't throw during cleanup - just log
      }
    };
  } catch (err) {
    console.error("❌ Failed to start notifications:", err);
    throw new Error(`Failed to start notifications: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Minimal notification parser — extend to parse your device protocol.
 */
export function parseNotification(data: Uint8Array) {
  return { raw: Array.from(data) };
}
// ...existing code...