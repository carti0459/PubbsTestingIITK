import React, { useEffect } from 'react';
import { useGeofencing } from '@/hooks/useGeofencing';

interface ViolationsMonitorProps {
  operator: string;
}

const ViolationsMonitor: React.FC<ViolationsMonitorProps> = ({ operator }) => {
  const {
    violations,
    subscribeToViolations,
    resolveViolation,
    getUnresolvedViolations
  } = useGeofencing();

  useEffect(() => {
    const unsubscribe = subscribeToViolations(operator);
    return unsubscribe;
  }, [operator, subscribeToViolations]);

  const handleResolveViolation = async (violationId: string) => {
    const success = await resolveViolation(operator, violationId);
    if (!success) {
      alert('Failed to resolve violation');
    }
  };

  const getSeverityColor = (violationType: string) => {
    switch (violationType) {
      case 'enter_forbidden':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'exit_allowed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'outside_boundary':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatViolationType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const unresolved = getUnresolvedViolations();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Geofence Violations</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {unresolved.length} unresolved
          </span>
          {unresolved.length > 0 && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>

      {violations.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No violations detected</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {violations.slice(0, 20).map((violation) => (
            <div
              key={violation.id}
              className={`p-3 border rounded-lg ${
                violation.isResolved ? 'bg-gray-50 opacity-75' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(violation.violationType)}`}>
                      {formatViolationType(violation.violationType)}
                    </span>
                    {violation.isResolved && (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Resolved
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="font-medium text-gray-900">
                      Bike {violation.bikeId} • Area: {violation.areaName}
                    </div>
                    <div className="text-gray-600">
                      User: {violation.userId}
                    </div>
                    <div className="text-gray-600">
                      Location: {violation.location.lat.toFixed(4)}, {violation.location.lng.toFixed(4)}
                    </div>
                    <div className="text-gray-500">
                      {new Date(violation.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                {!violation.isResolved && (
                  <button
                    onClick={() => handleResolveViolation(violation.id)}
                    className="ml-3 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Resolve
                  </button>
                )}
              </div>

              {/* Show additional details for critical violations */}
              {violation.violationType === 'enter_forbidden' && !violation.isResolved && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Critical: Bike entered forbidden area! Immediate action required.
                  </div>
                </div>
              )}
            </div>
          ))}

          {violations.length > 20 && (
            <div className="text-center text-sm text-gray-500 pt-2 border-t">
              Showing latest 20 violations of {violations.length} total
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViolationsMonitor;