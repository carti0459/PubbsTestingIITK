"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface BLEContextType {
  bleDevice: BluetoothDevice | null;
  isConnected: boolean;
  setBLEDevice: (device: BluetoothDevice | null) => void;
  disconnectBLE: () => void;
  checkConnection: () => boolean;
}

const BLEContext = createContext<BLEContextType | undefined>(undefined);

export function BLEProvider({ children }: { children: React.ReactNode }) {
  const [bleDevice, setBleDevice] = useState<BluetoothDevice | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const setBLEDevice = useCallback((device: BluetoothDevice | null) => {
    setBleDevice(device);
    setIsConnected(device?.gatt?.connected || false);
  }, []);

  const disconnectBLE = useCallback(() => {
    if (bleDevice && bleDevice.gatt?.connected) {
      bleDevice.gatt.disconnect();
      console.log(`✅ [BLE Context] Disconnected from device: ${bleDevice.name || bleDevice.id}`);
    }
    setBleDevice(null);
    setIsConnected(false);
  }, [bleDevice]);

  const checkConnection = useCallback(() => {
    const connected = bleDevice?.gatt?.connected || false;
    setIsConnected(connected);
    return connected;
  }, [bleDevice]);

  return (
    <BLEContext.Provider value={{ bleDevice, isConnected, setBLEDevice, disconnectBLE, checkConnection }}>
      {children}
    </BLEContext.Provider>
  );
}

export function useBLEContext() {
  const context = useContext(BLEContext);
  if (!context) {
    throw new Error('useBLEContext must be used within a BLEProvider');
  }
  return context;
}
