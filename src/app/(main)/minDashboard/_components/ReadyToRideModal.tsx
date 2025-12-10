"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { generateBookingId, createTripRecord } from "@/lib/booking-utils";

interface BluetoothRequestDeviceOptions {
  filters?: { namePrefix?: string }[];
  optionalServices?: string[];
}

interface BluetoothDevice {
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
}

interface BluetoothRemoteGATTServer {
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic {
  writeValue(value: ArrayBuffer | Uint8Array): Promise<void>;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  addEventListener(type: string, listener: (event: Event) => void): void;
}

declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice(options?: BluetoothRequestDeviceOptions): Promise<BluetoothDevice>;
    };
  }
}

// Helper function to prepare Bluetooth bytes (matching Flutter's prepareBytes function)
const prepareBluetoothBytes = (
  communicationKey: number[],
  appId: number,
  command: number[],
  data: number[]
): number[] => {
  const instruction = new Array(16).fill(0);
  instruction[0] = 0x0f;
  instruction[1] = 8;
  
  let j = 2;
  
  // Convert appId to 6 bytes (big-endian)
  const appIdBytes = new Array(6).fill(0);
  for (let i = 5; i >= 0; i--) {
    appIdBytes[i] = (appId >> ((5 - i) * 8)) & 0xff;
  }
  
  // Add app ID bytes
  for (let i = 0; i < 6; i++) {
    instruction[j] = appIdBytes[i];
    j++;
  }
  
  // Add communication key
  for (let i = 0; i < communicationKey.length && j < 12; i++) {
    instruction[j] = communicationKey[i];
    j++;
  }
  
  // Add command
  for (let i = 0; i < command.length && j < 14; i++) {
    instruction[j] = command[i];
    j++;
  }
  
  // Add data
  if (data && data.length > 0) {
    for (let i = 0; i < data.length && j < 16; i++) {
      instruction[j] = data[i];
      j++;
    }
  } else {
    instruction[j] = 0;
    instruction[j + 1] = 0;
  }
  
  return instruction;
};

interface BikeData {
  bikeId?: string;
  id?: string;
  operator?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  batteryLevel?: number;
  [key: string]: unknown;
}

interface ReadyToRideModalProps {
  isOpen: boolean;
  bikeData: BikeData | null;
  onSuccess: (bookingId?: string) => void;
  onCancel: () => void;
  onReset?: (bikeId: string) => Promise<boolean>;
}

const ReadyToRideModal: React.FC<ReadyToRideModalProps> = ({
  isOpen,
  bikeData,
  onSuccess,
  onCancel,
  onReset,
}) => {
  const { userData } = useAuth();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Checking bike status...");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResetOption, setShowResetOption] = useState(false);
  const [showUnlockButton, setShowUnlockButton] = useState(false);
  const [validatedBikeData, setValidatedBikeData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && bikeData) {
      // Reset states when modal opens
      setShowUnlockButton(false);
      setValidatedBikeData(null);
      setShowResetOption(false);
      checkBikeAndInitiateRide();
    }
  }, [isOpen, bikeData]);

  const checkBikeAndInitiateRide = async () => {
    setIsProcessing(true);
    setProgress(0);
    setStatus("Checking bike status...");
    setShowUnlockButton(false);

    try {
      setProgress(10);
      setStatus("Validating bike ID...");

      const bikeId = bikeData?.bikeId || bikeData?.id;
      const operator = bikeData?.operator || "PubbsTesting";

      if (!bikeId) {
        console.error("❌ No bike ID provided");
        setStatus("Error: No bike ID provided");
        setIsProcessing(false);
        setTimeout(() => {
          onCancel();
        }, 3000);
        return;
      }

      const validBikeId: string = bikeId;

      setProgress(25);
      setStatus("Checking bike availability...");

      const checkResponse = await axios.get(
        `/api/bikes?bikeId=${validBikeId}&operator=${operator}`
      );

      if (!checkResponse.data.success) {
        console.error("❌ Bike not found:", validBikeId);
        setStatus("Error: Bike not found");
        setIsProcessing(false);
        setTimeout(() => {
          onCancel();
        }, 3000);
        return;
      }

      const bike = checkResponse.data.bike;

      // CRITICAL: Validate bike is in correct state (operation: 0, status: active)
      // Bike should be idle and ready to ride before unlock
      const currentOperation = bike.operation?.toString() || "0";
      const currentStatus = bike.status?.toLowerCase() || "active";

      if (currentOperation !== "0" || currentStatus !== "active") {
        console.error("❌ Bike not in ready state:", { 
          operation: currentOperation, 
          status: currentStatus,
          expected: { operation: "0", status: "active" }
        });
        setStatus(`Error: Bike is not ready. Current state: operation=${currentOperation}, status=${currentStatus}. Bike must be idle (operation=0, status=active) to start a ride.`);
        setIsProcessing(false);
        setShowResetOption(true);
        setTimeout(() => {
          onCancel();
        }, 5000);
        return;
      }

      setProgress(40);
      setStatus("Bike validated successfully! Ready to unlock.");

      // Store validated bike data and show unlock button
      setValidatedBikeData({ validBikeId, operator, bike });
      setShowUnlockButton(true);
      setIsProcessing(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Error during bike validation:", { error, bikeData });
      setStatus(`Error: ${errorMessage}`);
      setIsProcessing(false);

      setTimeout(() => {
        onCancel();
      }, 3000);
    }
  };

  const handleUnlockBike = async () => {
    if (!validatedBikeData) return;

    setIsProcessing(true);
    setShowUnlockButton(false);
    setProgress(40);
    setStatus("Sending unlock command to bike...");

    try {
      const { validBikeId, operator, bike } = validatedBikeData;

      const bikeType = bike.type || "QTGSM";

      if (bikeType === "QTGSM" || bikeType === "QTGSMAUTO") {
        // ========== GSM-based bikes (Remote control via Firebase) ==========
        console.log(`🔓 [GSM] Unlocking ${bikeType} bike...`);

        const unlockResponse = await axios.post("/api/bike-operation", {
          bikeId: validBikeId,
          operator,
          operation: "1", // Unlock request
          status: "busy",
          battery: bike.battery || "87",
          ridetime: bike.ridetime || "480",
        });

        if (!unlockResponse.data.success) {
          const errorMsg = unlockResponse.data.error || "Failed to send unlock command to bike";
          console.error("❌ [GSM] Unlock command failed:", errorMsg);
          setStatus(`Error: ${errorMsg}`);
          setIsProcessing(false);
          setTimeout(() => {
            onCancel();
          }, 3000);
          return;
        }

        setProgress(50);
        setStatus("Waiting for bike to confirm unlock...");

        // Wait for bike to respond with operation=10 and status=busy
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const waitResponse = await axios.get(
            `/api/bikes?bikeId=${validBikeId}&operator=${operator}`
          );

          if (waitResponse.data.success) {
            const currentBike = waitResponse.data.bike;

            if (
              currentBike.operation === "10" &&
              currentBike.status === "busy"
            ) {
              console.log("✅ [GSM] Bike confirmed unlock with operation=10");
              break;
            }
          }

          attempts++;
          setStatus(
            `Waiting for bike confirmation... (${attempts}/${maxAttempts})`
          );
        }

        if (attempts >= maxAttempts) {
          console.error("❌ [GSM] Bike did not confirm unlock within 30 seconds");
          setStatus("Error: Bike did not respond. Please try again or contact support.");
          setIsProcessing(false);
          setTimeout(() => {
            onCancel();
          }, 3000);
          return;
        }

        setProgress(100);
        setStatus("Bike is ready! Click Start to begin your ride.");
        setIsProcessing(false);
      } else if (
        bikeType === "NRBLE" ||
        bikeType === "NRBLEAUTO" ||
        bikeType === "QTBLE" ||
        bikeType === "QTBLEE"
      ) {
        // ========== BLE-based bikes (Direct Bluetooth unlock via Web Bluetooth API) ==========
        console.log(`📱 [BLE] Unlocking ${bikeType} bike via Web Bluetooth...`);

        setProgress(50);
        setStatus("Requesting Bluetooth access...");

        // Check if Web Bluetooth API is supported
        if (!navigator.bluetooth) {
          console.error("❌ [BLE] Web Bluetooth not supported in this browser");
          setStatus("Error: Your browser does not support Bluetooth");
          setIsProcessing(false);
          setTimeout(() => {
            onCancel();
          }, 3000);
          return;
        }

        try {
          // Step 1: Request Bluetooth device access
          setStatus("Scanning for bike Bluetooth device...");
          
          const device = await navigator.bluetooth.requestDevice({
            filters: [
              { namePrefix: validBikeId }, // Filter by bike ID as device name
            ],
            optionalServices: [
              "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
            ],
          });

          console.log(`✅ [BLE] Found device: ${device.name}`);

          // Step 2: Connect to GATT server
          setProgress(60);
          setStatus("Connecting to bike...");

          const server = await device.gatt?.connect();
          if (!server) {
            console.error("❌ [BLE] Failed to connect to GATT server");
            setStatus("Error: Could not connect to bike");
            setIsProcessing(false);
            setTimeout(() => {
              onCancel();
            }, 3000);
            return;
          }

          console.log("✅ [BLE] Connected to GATT server");

          // Step 3: Get the Nordic UART Service
          setProgress(70);
          setStatus("Requesting communication key...");

          const service = await server.getPrimaryService(
            "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
          );

          const writeCharacteristic = await service.getCharacteristic(
            "6e400002-b5a3-f393-e0a9-e50e24dcca9e" // TX (write)
          );

          const notifyCharacteristic = await service.getCharacteristic(
            "6e400003-b5a3-f393-e0a9-e50e24dcca9e" // RX (notify)
          );

          // Step 4: Enable notifications
          await notifyCharacteristic.startNotifications();

          // Step 5: Send COMMUNICATION_KEY_COMMAND
          const appId = 345678;
          const communicationKeyCommand = [1, 1];
          let communicationKey: number[] = [1, 2, 3, 4];

          // Prepare bytes for communication key request
          const keyRequestBytes = prepareBluetoothBytes(
            communicationKey,
            appId,
            communicationKeyCommand,
            [0, 0]
          );

          await writeCharacteristic.writeValue(new Uint8Array(keyRequestBytes));
          console.log("📤 [BLE] Sent COMMUNICATION_KEY_COMMAND");

          // Step 6: Wait for communication key response
          setProgress(80);
          setStatus("Waiting for bike response...");

          const keyResponse = await new Promise<DataView>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Timeout waiting for communication key"));
            }, 5000);

            notifyCharacteristic.addEventListener(
              "characteristicvaluechanged",
              (event: Event) => {
                clearTimeout(timeout);
                const target = event.target as unknown as BluetoothRemoteGATTCharacteristic & { value: DataView };
                resolve(target.value);
              }
            );
          });

          // Parse communication key from response
          const keyData = new Uint8Array(keyResponse.buffer);
          if (keyData.length >= 12) {
            communicationKey = Array.from(keyData.slice(8, 12));
            console.log("✅ [BLE] Received communication key:", communicationKey);
          }

          // Step 7: Send UNLOCK_COMMAND
          setProgress(90);
          setStatus("Sending unlock command...");

          const unlockCommand = [2, 1]; // UNLOCK_COMMAND
          const unlockBytes = prepareBluetoothBytes(
            communicationKey,
            appId,
            unlockCommand,
            [0, 0]
          );

          await writeCharacteristic.writeValue(new Uint8Array(unlockBytes));
          console.log("📤 [BLE] Sent UNLOCK_COMMAND");

          // Step 8: Wait for unlock confirmation
          const unlockResponse = await new Promise<DataView>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Timeout waiting for unlock confirmation"));
            }, 5000);

            notifyCharacteristic.addEventListener(
              "characteristicvaluechanged",
              (event: Event) => {
                clearTimeout(timeout);
                const target = event.target as unknown as BluetoothRemoteGATTCharacteristic & { value: DataView };
                resolve(target.value);
              }
            );
          });

          const unlockData = new Uint8Array(unlockResponse.buffer);
          console.log("✅ [BLE] Unlock response:", Array.from(unlockData));

          // Step 9: Update bike status in Firebase
          await axios.post("/api/bike-operation", {
            bikeId: validBikeId,
            operator,
            operation: "10", // Mark as unlocked
            status: "busy",
            battery: bike.battery || "87",
            ridetime: bike.ridetime || "480",
          });

          // Disconnect from device
          device.gatt?.disconnect();
          console.log("✅ [BLE] Disconnected from device");

          setProgress(100);
          setStatus("Bike unlocked successfully! Click Start to begin your ride.");
          setIsProcessing(false);
        } catch (bleError) {
          // Handle specific Bluetooth errors
          let errorMessage = "";
          let isUserCancellation = false;
          
          if (bleError instanceof Error) {
            const errorName = bleError.name;
            const errorMsg = bleError.message.toLowerCase();
            
            // Check for user cancellation first (not an error, just user action)
            if (errorMsg.includes("user cancelled") || errorMsg.includes("user canceled")) {
              console.log("ℹ️ [BLE] User cancelled device selection");
              isUserCancellation = true;
              setIsProcessing(false);
              onCancel();
              return; // Exit silently, no error needed
            }
            
            // Handle actual errors
            if (errorName === "NotFoundError" || errorMsg.includes("globally disabled")) {
              console.log("ℹ️ [BLE] Bluetooth not available:", bleError.message);
              toast.error("Bluetooth Not Available", {
                description: "Please enable Bluetooth in your system settings and try again.",
                duration: 4000,
              });
              errorMessage = "Bluetooth is disabled. Please enable it and try again.";
            } else if (errorName === "NotAllowedError") {
              console.log("ℹ️ [BLE] Bluetooth permission denied");
              toast.error("Bluetooth Permission Required", {
                description: "Please allow Bluetooth access to unlock the bike.",
                duration: 4000,
              });
              errorMessage = "Bluetooth permission denied. Please allow access and try again.";
            } else if (errorName === "SecurityError") {
              console.log("ℹ️ [BLE] Bluetooth security error - HTTPS required");
              toast.error("Secure Connection Required", {
                description: "Web Bluetooth requires HTTPS. Please use a secure connection.",
                duration: 4000,
              });
              errorMessage = "Bluetooth requires a secure connection (HTTPS).";
            } else if (errorMsg.includes("gatt") || errorMsg.includes("service")) {
              console.log("ℹ️ [BLE] Communication failed:", bleError.message);
              toast.error("Bike Communication Failed", {
                description: "Make sure the bike is nearby and powered on.",
                duration: 4000,
              });
              errorMessage = "Failed to communicate with bike. Ensure it's nearby and powered on.";
            } else {
              console.log("ℹ️ [BLE] Bluetooth error:", bleError.message);
              toast.error("Bluetooth Error", {
                description: bleError.message,
                duration: 4000,
              });
              errorMessage = `Bluetooth error: ${bleError.message}`;
            }
          } else {
            console.log("ℹ️ [BLE] Unknown error:", bleError);
            toast.error("Unlock Failed", {
              description: "An unexpected error occurred.",
              duration: 4000,
            });
            errorMessage = "An unexpected error occurred.";
          }
          
          // Show error message and close modal
          if (!isUserCancellation && errorMessage) {
            setStatus(errorMessage);
            setIsProcessing(false);
            setTimeout(() => {
              onCancel();
            }, 3000);
          }
        }
      } else {
       
        const unlockResponse = await axios.post("/api/bike-operation", {
          bikeId: validBikeId,
          operator,
          operation: "1",
          status: "busy",
          battery: bike.battery || "87",
          ridetime: bike.ridetime || "480",
        });

        if (!unlockResponse.data.success) {
          const errorMsg = unlockResponse.data.error || "Failed to send unlock command to bike";
          console.error("❌ [Other Bike Type] Unlock command failed:", errorMsg);
          setStatus(`Error: ${errorMsg}`);
          setIsProcessing(false);
          setTimeout(() => {
            onCancel();
          }, 3000);
          return;
        }

        setProgress(100);
        setStatus("Unlock command sent. Click Start to begin your ride.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error during bike unlock:", error);
      setStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setIsProcessing(false);

      setTimeout(() => {
        onCancel();
      }, 3000);
    }
  };

  const handleReset = async () => {
    if (!onReset || !bikeData) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus("Resetting bike state...");
    setShowResetOption(false);

    const bikeId = bikeData?.bikeId || bikeData?.id;

    if (!bikeId) {
      setStatus("Failed to reset bike. No bike ID provided.");
      setIsProcessing(false);
      setTimeout(() => {
        onCancel();
      }, 2000);
      return;
    }

    const success = await onReset(bikeId);

    if (success) {
      setProgress(25);
      setStatus("Bike reset successful. Preparing for ride...");

      setTimeout(() => {
        checkBikeAndInitiateRide();
      }, 1000);
    } else {
      setStatus("Failed to reset bike. Please try again.");
      setIsProcessing(false);
      setTimeout(() => {
        onCancel();
      }, 2000);
    }
  };

  const createTripRecordForModal = async (
    bikeId: string,
    operator: string,
    bikeData: BikeData
  ): Promise<string | null> => {
    if (!userData?.phoneNumber) {
      console.warn("No user data available for trip creation");
      return null;
    }

    try {
      const bookingId = await generateBookingId({
        bikeId,
        userId: userData.phoneNumber,
      });

      const result = await createTripRecord({
        userId: userData.phoneNumber,
        bookingId,
        bikeId,
        bikeData,
        operator,
      });

      if (!result.success) {
        console.error("❌ Failed to create trip record:", result.message);
        return null;
      }

      return bookingId;
    } catch (error) {
      console.error("Error creating trip record:", error);

      return null;
    }
  };

  const handleStartRide = async () => {
    if (!bikeData) return;

    setIsProcessing(true);
    setProgress(80);
    setStatus("Creating trip record...");

    try {
      const bikeId = bikeData?.bikeId || bikeData?.id;
      const operator = bikeData?.operator || "PubbsTesting";

      if (!bikeId) {
        console.error("❌ No bike ID provided for trip creation");
        setStatus("Error: Invalid bike ID");
        setIsProcessing(false);
        setTimeout(() => {
          onCancel();
        }, 3000);
        return;
      }

      const validBikeId: string = bikeId;

      // Get current bike data - bike should already be unlocked with operation="10" from QR scan
      const checkResponse = await axios.get(
        `/api/bikes?bikeId=${validBikeId}&operator=${operator}`
      );

      if (!checkResponse.data.success) {
        console.error("❌ Failed to get bike data:", checkResponse.data.error);
        setStatus("Error: Could not verify bike status");
        setIsProcessing(false);
        setTimeout(() => {
          onCancel();
        }, 3000);
        return;
      }

      const bike = checkResponse.data.bike;

      // Verify bike is still in unlocked state (operation="10" and status="busy")
      if (bike.operation !== "10" || bike.status !== "busy") {
        console.error("❌ Bike not in ready state:", { operation: bike.operation, status: bike.status });
        setStatus("Error: Bike is not ready. Please scan QR code again.");
        setIsProcessing(false);
        setTimeout(() => {
          onCancel();
        }, 3000);
        return;
      }

      setProgress(90);
      setStatus("Finalizing trip setup...");

      // Create trip record directly since bike is already unlocked
      const createdBookingId = await createTripRecordForModal(
        validBikeId,
        operator,
        bike
      );

      setProgress(100);
      setStatus("Ride started successfully!");

      setTimeout(() => {
        onSuccess(createdBookingId || undefined);
      }, 1000);
    } catch (error) {
      console.error("Error starting ride:", error);
      setStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setIsProcessing(false);

      setTimeout(() => {
        onCancel();
      }, 3000);
    }
  };

  if (!isOpen || !bikeData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4 text-white">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-center mb-6">
          READY TO RIDE
        </h2>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">Progress</span>
            <span className="text-cyan-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className="bg-cyan-400 h-2 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-6">
          <p className="text-gray-300 text-sm">{status}</p>
          {progress === 100 && (
            <div className="flex items-center justify-center mt-2">
              <svg
                className="w-5 h-5 text-green-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-green-400 text-sm">Ready!</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          {progress === 100 ? (
            <button
              onClick={handleStartRide}
              disabled={isProcessing}
              className="flex-1 bg-cyan-500 text-white py-3 rounded-lg font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Ride
            </button>
          ) : showUnlockButton ? (
            <button
              onClick={handleUnlockBike}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
            >
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Unlock Bike</span>
            </button>
          ) : showResetOption ? (
            <>
              <button
                onClick={() => onSuccess()}
                className="flex-1 bg-cyan-500 text-white py-3 rounded-lg font-medium hover:bg-cyan-600 transition-colors"
              >
                Proceed Anyway
              </button>
              {onReset && (
                <button
                  onClick={handleReset}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Reset Bike
                </button>
              )}
            </>
          ) : (
            <>
              {isProcessing && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
                </div>
              )}
            </>
          )}

          <button
            onClick={onCancel}
            disabled={isProcessing && progress < 100}
            className={`flex-1 bg-transparent border border-gray-400 text-gray-400 py-3 rounded-lg font-medium hover:bg-gray-400 hover:text-slate-800 transition-colors ${
              isProcessing && progress < 100
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadyToRideModal;
