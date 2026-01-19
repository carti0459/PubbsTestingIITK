"use client";
import React, { useState } from "react";
import useBikeBLE from "@/hooks/useBikeBLE";

/**
 * FIX #10 & #11: Enhanced UnlockButton with improved UI feedback
 * Shows connection status, reconnection attempts, errors, and ride status
 */
export default function UnlockButton() {
  const {
    connect,
    unlock,
    endRide,
    connected,
    error,
    isReconnecting,
    reconnectAttempts,
    rideInProgress,
    disconnect,
  } = useBikeBLE();
  const [loading, setLoading] = useState(false);

  async function handleConnectAndUnlock() {
    setLoading(true);
    try {
      // THIS must run inside the click handler (user gesture)
      await connect({
        optionalServices: ["00001530-1212-efde-1523-785feabcd123"],
      });
      await unlock();
      alert("✅ Unlock command sent successfully! Ride started.");
    } catch (e: unknown) {
      console.error("BLE error:", e);
      // FIX #11: Better error messaging
      const errorMsg = e instanceof Error ? e.message : String(e);
      if (errorMsg.includes("cancelled")) {
        alert("Connection cancelled. Please try again when ready.");
      } else if (errorMsg.includes("not found")) {
        alert("❌ Bike not found. Make sure your bike is powered on and nearby.");
      } else {
        alert("❌ BLE error: " + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleEndRide() {
    setLoading(true);
    try {
      await endRide();
      alert("✅ Ride ended successfully!");
    } catch (e: unknown) {
      console.error("Error ending ride:", e);
      alert("❌ Failed to end ride: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  }

  // FIX #10: Enhanced UI with status indicators
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={handleConnectAndUnlock}
          disabled={loading || connected || isReconnecting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Connecting..." : connected ? "Connected" : "🔓 Unlock Bike"}
        </button>

        {connected && (
          <>
            <button
              onClick={handleEndRide}
              disabled={loading || !rideInProgress}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Ending..." : "🏁 End Ride"}
            </button>

            <button
              onClick={() => disconnect && disconnect()}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      {/* FIX #10: Status indicators */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Status:</span>
          <span className={`flex items-center gap-1 ${
            connected ? "text-green-600" : isReconnecting ? "text-yellow-600" : "text-gray-600"
          }`}>
            {connected ? "🟢 Connected" : isReconnecting ? "🟡 Reconnecting..." : "⚪ Disconnected"}
          </span>
        </div>

        {rideInProgress && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">Ride:</span>
            <span className="text-blue-600">🚴 In Progress (keep-alive active)</span>
          </div>
        )}

        {isReconnecting && reconnectAttempts > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">Reconnection:</span>
            <span className="text-yellow-600">
              Attempt {reconnectAttempts}/5
            </span>
          </div>
        )}

        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded">
            <span className="font-semibold text-red-700">Error:</span>
            <span className="text-red-600 ml-2">{error}</span>
          </div>
        )}
      </div>

      {/* FIX #10: Help text */}
      <div className="text-xs text-gray-500 border-t pt-2">
        {!connected && "Click 'Unlock Bike' to connect and start your ride"}
        {connected && !rideInProgress && "Connection active. Unlock the bike to start riding."}
        {connected && rideInProgress && "Ride active. Connection will auto-reconnect if interrupted."}
      </div>
    </div>
  );
}
