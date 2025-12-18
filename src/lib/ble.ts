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
};

/**
 * Connect to bike lock. opts: { namePrefix?: string, optionalServices?: string[] }
 */
export async function connectToBikeLock(
  opts?: { namePrefix?: string; optionalServices?: string[] }
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
    } as BluetoothRequestDeviceOptions);

    if (!device.gatt) throw new Error("Selected device has no GATT server");

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);

    return { device, server, service };
  } catch (err) {
    console.error("BLE Connect Error:", err);
    throw err;
  }
}

/**
 * Disconnect helper (accepts the ConnectResult or device object).
 */
export function disconnect(target: ConnectResult | null | BluetoothDevice | undefined) {
  try {
    let device: BluetoothDevice | undefined | null = null;
    if (!target) return;
    // allow either full object or raw device
    if ("device" in (target as any) && (target as any).device) {
      device = (target as any).device;
    } else {
      device = target as BluetoothDevice;
    }

    if (device && device.gatt && device.gatt.connected) {
      device.gatt.disconnect();
    }
  } catch (err) {
    console.warn("Error disconnecting device:", err);
  }
}

/**
 * Write a command to the unlock characteristic (generic writer).
 * `ctx` is the ConnectResult returned by connectToBikeLock (device/server/service).
 */
export async function writeCommand(
  ctx: ConnectResult,
  payload: Uint8Array
): Promise<void> {
  if (!ctx || !ctx.service) throw new Error("No connected service to write to");
  try {
    const char = await ctx.service.getCharacteristic(UNLOCK_UUID);
    await char.writeValue(payload);
  } catch (err) {
    console.error("BLE writeCommand error:", err);
    throw err;
  }
}

/**
 * Start notifications on the notify characteristic. `onData` receives Uint8Array.
 * Returns a cleanup function that stops notifications and removes the listener.
 */
export async function startNotifications(
  ctx: ConnectResult,
  onData?: (data: Uint8Array) => void
): Promise<() => Promise<void>> {
  if (!ctx || !ctx.service) throw new Error("No connected service for notifications");
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

  return async () => {
    try {
      notifyChar.removeEventListener("characteristicvaluechanged", handler);
      if (typeof notifyChar.stopNotifications === "function") {
        await notifyChar.stopNotifications();
      }
    } catch (err) {
      console.warn("Error stopping notifications:", err);
    }
  };
}

/**
 * Minimal notification parser — extend to parse your device protocol.
 */
export function parseNotification(data: Uint8Array) {
  return { raw: Array.from(data) };
}
// ...existing code...