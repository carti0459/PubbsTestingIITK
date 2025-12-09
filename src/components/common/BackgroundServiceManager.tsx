"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ServiceStatus {
  scheduler: {
    status: string;
    lastCheck: string;
    data: Record<string, unknown> | null;
  };
  autoHoldChecker: {
    status: string;
    lastCheck: string;
    data: Record<string, unknown> | null;
  };
}

export const BackgroundServiceManager = () => {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(
    null
  );
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    checkServiceStatus();

    const statusInterval = setInterval(checkServiceStatus, 5 * 60 * 1000);

    return () => clearInterval(statusInterval);
  }, []);

  const checkServiceStatus = async () => {
    try {
      const response = await fetch("/api/monitor", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setServiceStatus(data.services);

        if (
          data.services.scheduler.status === "stopped" ||
          data.services.scheduler.status === "unknown"
        ) {
          await startServices();
        }
      }
    } catch (error) {
      console.error("Failed to check service status:", error);
    }
  };

  const startServices = async () => {
    if (isStarting) return;

    setIsStarting(true);
    try {
      const response = await fetch("/api/startup", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Background services started");

        setTimeout(checkServiceStatus, 2000);
      } else {
        console.error(
          "❌ Failed to start background services:",
          result.message
        );
        toast.error("Failed to start background services");
      }
    } catch (error) {
      console.error("❌ Error starting background services:", error);
      toast.error("Error starting background services");
    } finally {
      setIsStarting(false);
    }
  };

  const restartServices = async () => {
    if (isStarting) return;

    setIsStarting(true);
    try {
      const response = await fetch("/api/monitor", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Background services restarted");
        setTimeout(checkServiceStatus, 2000);
      } else {
        console.error(
          "❌ Failed to restart background services:",
          result.message
        );
        toast.error("Failed to restart background services");
      }
    } catch (error) {
      console.error("❌ Error restarting background services:", error);
      toast.error("Error restarting background services");
    } finally {
      setIsStarting(false);
    }
  };

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm hidden">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-3 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Background Services
          </span>
          <button
            onClick={restartServices}
            disabled={isStarting}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
          >
            {isStarting ? "..." : "Restart"}
          </button>
        </div>

        {serviceStatus && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span>Scheduler:</span>
              <span
                className={`px-1 rounded text-xs ${
                  serviceStatus.scheduler.status === "running" ||
                  serviceStatus.scheduler.status === "restarted"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {serviceStatus.scheduler.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Auto-Hold:</span>
              <span
                className={`px-1 rounded text-xs ${
                  serviceStatus.autoHoldChecker.status === "healthy"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {serviceStatus.autoHoldChecker.status}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
