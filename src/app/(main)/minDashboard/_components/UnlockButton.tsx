/*'use client';
import React, { useState } from 'react';
import useBikeBLE from '@/hooks/useBikeBLE';

export default function UnlockButton() {
  const { connect, unlock, connected, lastNotification, disconnect } = useBikeBLE();
  const [loading, setLoading] = useState(false);

  async function handleConnectAndUnlock() {
    setLoading(true);
    try {
      const bike = await connect({ namePrefix: 'BIKE_' });
      await unlock();
      // Optionally call backend to notify trip started
      try {
        await fetch('/api/bike-operation/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: 'web', method: 'ble' })
        });
      } catch (e) {
        console.warn('Failed to call backend start API', e);
      }
      alert('Unlock command sent. Waiting for confirmation...');
    } catch (e) {
      console.error(e);
      alert('BLE unlock failed: ' + (e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleConnectAndUnlock} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
        {loading ? 'Working...' : 'Connect & Unlock (BLE)'}
      </button>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => disconnect && disconnect()} className="px-3 py-1 border rounded">Disconnect</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <strong>Connected:</strong> {connected ? 'Yes' : 'No'}
      </div>
      <div style={{ marginTop: 8 }}>
        <strong>Last:</strong> {lastNotification ? JSON.stringify(lastNotification) : '—'}
      </div>
    </div>
  );
}*/

"use client";
import React, { useState } from "react";
import useBikeBLE from "@/hooks/useBikeBLE";

export default function UnlockButton() {
  const { connect, unlock, connected, lastNotification, disconnect } =
    useBikeBLE();
  const [loading, setLoading] = useState(false);

  async function handleConnectAndUnlock() {
    setLoading(true);
    try {
      // THIS must run inside the click handler (user gesture)
      await connect({
        optionalServices: ["00001530-1212-efde-1523-785feabcd123"],
      });
      await unlock();
      alert("Unlock command sent. Waiting for confirmation...");
    } catch (e: unknown) {
      console.error("BLE error:", e);
      alert("BLE error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleConnectAndUnlock} disabled={loading}>
      {loading ? "Connecting..." : "Unlock Bike"}
    </button>
  );
}
