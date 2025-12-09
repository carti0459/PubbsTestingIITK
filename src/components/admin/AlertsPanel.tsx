import React, { useState } from 'react';
import { SystemAlert } from '@/types/admin.type';

interface AlertsPanelProps {
  alerts: SystemAlert[];
  onAcknowledge: (alertId: string, acknowledgedBy: string) => Promise<boolean>;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onAcknowledge }) => {
  const [acknowledgingAlert, setAcknowledgingAlert] = useState<string | null>(null);

  const getAlertIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'critical':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getCategoryColor = (category: SystemAlert['category']) => {
    switch (category) {
      case 'bike': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-purple-100 text-purple-800';
      case 'revenue': return 'bg-yellow-100 text-yellow-800';
      case 'security': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    setAcknowledgingAlert(alertId);
    try {
      await onAcknowledge(alertId, 'Admin User'); // In real app, get from auth context
    } finally {
      setAcknowledgingAlert(null);
    }
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const recentAlerts = alerts.slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
          {unacknowledgedAlerts.length > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {unacknowledgedAlerts.length} unread
            </span>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {recentAlerts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !alert.acknowledged ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {alert.title}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(alert.category)}`}>
                        {alert.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                      
                      {!alert.acknowledged ? (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={acknowledgingAlert === alert.id}
                          className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          {acknowledgingAlert === alert.id ? 'Acknowledging...' : 'Acknowledge'}
                        </button>
                      ) : (
                        <span className="text-xs text-green-600 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Alerts</h4>
            <p className="text-gray-600">All systems are operating normally</p>
          </div>
        )}
      </div>

      {alerts.length > 10 && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All Alerts ({alerts.length})
          </button>
        </div>
      )}
    </div>
  );
};