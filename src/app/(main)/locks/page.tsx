"use client";

import React, { useState, useEffect } from 'react';
import { useLockControl } from '@/hooks/useLockControl';
import LockControlPanel from '@/components/locks/LockControlPanel';

const LocksPage = () => {
  const [selectedOperator, setSelectedOperator] = useState('IITKgpCampus');
  const [lastUnlockCode, setLastUnlockCode] = useState('');
  
  const {
    locks,
    commands,
    subscribeToLocks,
    subscribeToCommands
  } = useLockControl();

  useEffect(() => {
    const unsubscribeLocks = subscribeToLocks(selectedOperator);
    const unsubscribeCommands = subscribeToCommands(selectedOperator);
    
    return () => {
      unsubscribeLocks();
      unsubscribeCommands();
    };
  }, [selectedOperator, subscribeToLocks, subscribeToCommands]);

  const stats = {
    totalLocks: locks.length,
    unlockedLocks: locks.filter(lock => lock.status === 'unlocked').length,
    lockedLocks: locks.filter(lock => lock.status === 'locked').length,
    errorLocks: locks.filter(lock => lock.status === 'error').length,
    connectedLocks: locks.filter(lock => lock.isConnected).length,
    lowBatteryLocks: locks.filter(lock => lock.batteryLevel < 20).length
  };

  const recentCommands = commands.slice(0, 10);
  const failedCommands = commands.filter(cmd => cmd.status === 'failed').length;
  const successRate = commands.length > 0 
    ? ((commands.filter(cmd => cmd.status === 'success').length / commands.length) * 100).toFixed(1)
    : '0';

  const handleUnlockSuccess = (unlockCode: string) => {
    setLastUnlockCode(unlockCode);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Lock Control System</h1>
              <p className="text-sm text-gray-600">Manage bike locks and unlock operations</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="IITKgpCampus">IIT Kharagpur Campus</option>
                <option value="TestOperator">Test Operator</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-md">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.totalLocks}</p>
                <p className="text-sm text-gray-600">Total Locks</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-md">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.unlockedLocks}</p>
                <p className="text-sm text-gray-600">Unlocked</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-md">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.lockedLocks}</p>
                <p className="text-sm text-gray-600">Locked</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-md ${stats.errorLocks > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                <svg className={`w-5 h-5 ${stats.errorLocks > 0 ? 'text-red-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className={`text-2xl font-semibold ${stats.errorLocks > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {stats.errorLocks}
                </p>
                <p className="text-sm text-gray-600">Errors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Connection Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Connected:</span>
                <span className="text-sm font-medium text-green-600">{stats.connectedLocks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Offline:</span>
                <span className="text-sm font-medium text-red-600">{stats.totalLocks - stats.connectedLocks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Low Battery:</span>
                <span className="text-sm font-medium text-yellow-600">{stats.lowBatteryLocks}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Command Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate:</span>
                <span className="text-sm font-medium text-green-600">{successRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Commands:</span>
                <span className="text-sm font-medium">{commands.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Failed:</span>
                <span className="text-sm font-medium text-red-600">{failedCommands}</span>
              </div>
            </div>
          </div>

          {lastUnlockCode && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-3">Last Unlock Code</h3>
              <div className="text-center">
                <div className="font-mono text-2xl font-bold text-green-600 mb-2">
                  {lastUnlockCode}
                </div>
                <p className="text-sm text-green-700">
                  Share this code with the user
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Main Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel - 2/3 width */}
          <div className="lg:col-span-2">
            <LockControlPanel
              operator={selectedOperator}
              onUnlockSuccess={handleUnlockSuccess}
            />
          </div>

          {/* Recent Commands - 1/3 width */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">Recent Commands</h3>
              
              {recentCommands.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p>No commands yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentCommands.map((command) => (
                    <div key={command.id} className="p-3 bg-gray-50 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">Bike {command.bikeId}</span>
                          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                            {command.command}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          command.status === 'success' ? 'bg-green-100 text-green-800' :
                          command.status === 'failed' ? 'bg-red-100 text-red-800' :
                          command.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {command.status}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>User: {command.userId}</div>
                        <div>Time: {new Date(command.timestamp).toLocaleString()}</div>
                        {command.responseTime && (
                          <div>Response: {command.responseTime}ms</div>
                        )}
                        {command.errorMessage && (
                          <div className="text-red-600">Error: {command.errorMessage}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  onClick={() => {
                    // Simulate QR scan result
                    const mockQR = JSON.stringify({
                      bikeId: 'BIKE001',
                      operator: selectedOperator,
                      timestamp: Date.now()
                    });
                    navigator.clipboard.writeText(mockQR);
                    alert('Mock QR data copied to clipboard');
                  }}
                >
                  Generate Test QR Data
                </button>
                
                <button
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  onClick={() => {
                    if (lastUnlockCode) {
                      navigator.clipboard.writeText(lastUnlockCode);
                      alert('Unlock code copied to clipboard');
                    } else {
                      alert('No unlock code available');
                    }
                  }}
                  disabled={!lastUnlockCode}
                >
                  Copy Last Unlock Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocksPage;