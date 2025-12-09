import React, { useState, useEffect } from 'react';
import { useLockControl } from '@/hooks/useLockControl';

interface LockControlPanelProps {
  operator: string;
  bikeId?: string;
  onUnlockSuccess?: (unlockCode: string) => void;
}

const LockControlPanel: React.FC<LockControlPanelProps> = ({
  operator,
  bikeId,
  onUnlockSuccess
}) => {
  const {
    locks,
    commands,
    loading,
    error,
    subscribeToLocks,
    subscribeToCommands,
    unlockBike,
    lockBike,
    processQRUnlock
  } = useLockControl();

  const [selectedBikeId, setSelectedBikeId] = useState(bikeId || '');
  const [userId] = useState('current-user');
  const [manualQRCode, setManualQRCode] = useState('');
  const [lastUnlockCode, setLastUnlockCode] = useState('');

  useEffect(() => {
    const unsubscribeLocks = subscribeToLocks(operator);
    const unsubscribeCommands = subscribeToCommands(operator);
    
    return () => {
      unsubscribeLocks();
      unsubscribeCommands();
    };
  }, [operator, subscribeToLocks, subscribeToCommands]);

  const currentLock = locks.find(lock => lock.bikeId === selectedBikeId);
  const recentCommands = commands.filter(cmd => cmd.bikeId === selectedBikeId).slice(0, 5);

  const handleUnlock = async () => {
    if (!selectedBikeId) {
      alert('Please select a bike');
      return;
    }

    const result = await unlockBike(operator, selectedBikeId, userId);
    
    if (result.success && result.unlockCode) {
      setLastUnlockCode(result.unlockCode);
      onUnlockSuccess?.(result.unlockCode);
      alert(`Bike unlocked! Code: ${result.unlockCode}`);
    } else {
      alert(`Failed to unlock bike: ${result.error}`);
    }
  };

  const handleLock = async () => {
    if (!selectedBikeId) {
      alert('Please select a bike');
      return;
    }

    const result = await lockBike(operator, selectedBikeId, userId);
    
    if (result.success) {
      setLastUnlockCode('');
      alert('Bike locked successfully!');
    } else {
      alert(`Failed to lock bike: ${result.error}`);
    }
  };

  const handleQRUnlock = async () => {
    if (!manualQRCode.trim()) {
      alert('Please enter QR code content');
      return;
    }

    const result = await processQRUnlock(manualQRCode, userId);
    
    if (result.success && result.unlockCode) {
      setSelectedBikeId(result.bikeId || '');
      setLastUnlockCode(result.unlockCode);
      onUnlockSuccess?.(result.unlockCode);
      alert(`Bike ${result.bikeId} unlocked! Code: ${result.unlockCode}`);
      setManualQRCode('');
    } else {
      alert(`Failed to unlock via QR: ${result.error}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unlocked':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'locked':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCommandStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      case 'timeout':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Lock Control Panel</h3>
        <div className="flex items-center space-x-2">
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
          <span className="text-sm text-gray-500">
            {locks.length} locks connected
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Bike Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Select Bike
        </label>
        <select
          value={selectedBikeId}
          onChange={(e) => setSelectedBikeId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a bike...</option>
          {locks.map(lock => (
            <option key={lock.bikeId} value={lock.bikeId}>
              Bike {lock.bikeId} ({lock.status})
            </option>
          ))}
        </select>
      </div>

      {/* Current Lock Status */}
      {currentLock && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(currentLock.status)}`}>
                {currentLock.status}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Battery:</span>
              <span className="ml-2 font-medium">{currentLock.batteryLevel}%</span>
            </div>
            <div>
              <span className="text-gray-600">Connection:</span>
              <span className={`ml-2 ${currentLock.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {currentLock.isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Last Command:</span>
              <span className="ml-2 font-medium">{currentLock.lastCommand}</span>
            </div>
            {currentLock.userId && (
              <div className="col-span-2">
                <span className="text-gray-600">Current User:</span>
                <span className="ml-2 font-medium">{currentLock.userId}</span>
              </div>
            )}
            {currentLock.unlockCode && (
              <div className="col-span-2">
                <span className="text-gray-600">Unlock Code:</span>
                <span className="ml-2 font-mono text-lg font-bold text-green-600">
                  {currentLock.unlockCode}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="space-y-3">
        <div className="flex space-x-3">
          <button
            onClick={handleUnlock}
            disabled={loading || !selectedBikeId || currentLock?.status === 'unlocked'}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Unlock Bike
          </button>
          <button
            onClick={handleLock}
            disabled={loading || !selectedBikeId || currentLock?.status === 'locked'}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lock Bike
          </button>
        </div>
      </div>

      {/* QR Code Unlock */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          QR Code Unlock
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={manualQRCode}
            onChange={(e) => setManualQRCode(e.target.value)}
            placeholder="Enter QR code content or bike ID..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleQRUnlock}
            disabled={loading || !manualQRCode.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Unlock via QR
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Enter bike ID (e.g., &quot;BIKE001&quot;) or full QR JSON data
        </p>
      </div>

      {/* Last Unlock Code Display */}
      {lastUnlockCode && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-green-800">Last Unlock Code:</span>
            <span className="font-mono text-lg font-bold text-green-600">{lastUnlockCode}</span>
          </div>
        </div>
      )}

      {/* Recent Commands */}
      {recentCommands.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Recent Commands</h4>
          <div className="space-y-2">
            {recentCommands.map((command) => (
              <div key={command.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{command.command}</span>
                  <span className={`${getCommandStatusColor(command.status)}`}>
                    {command.status}
                  </span>
                </div>
                <div className="text-gray-500">
                  {new Date(command.timestamp).toLocaleTimeString()}
                  {command.responseTime && (
                    <span className="ml-2">({command.responseTime}ms)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lock Grid Overview */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">All Locks Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {locks.map((lock) => (
            <div
              key={lock.bikeId}
              className={`p-3 border rounded cursor-pointer transition-colors ${
                selectedBikeId === lock.bikeId 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedBikeId(lock.bikeId)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Bike {lock.bikeId}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lock.status)}`}>
                  {lock.status}
                </span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Battery: {lock.batteryLevel}%</div>
                <div>Connection: {lock.isConnected ? 'Connected' : 'Offline'}</div>
                {lock.userId && <div>User: {lock.userId}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LockControlPanel;