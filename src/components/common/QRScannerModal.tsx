"use client";

import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, facingMode]);

  const initializeScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);

      if (!window.isSecureContext && location.hostname !== "localhost") {
        setError(
          "Camera access requires HTTPS. Please use a secure connection."
        );
        setIsScanning(false);
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera API not supported on this browser");
        setIsScanning(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
            frameRate: { ideal: 30, min: 15 },
          },
        });

        stream.getTracks().forEach((track) => track.stop());
      } catch (permissionError: unknown) {
        throw permissionError;
      }

      if (!QrScanner.hasCamera()) {
        setError("No camera found on this device");
        setHasCamera(false);
        setIsScanning(false);
        return;
      }

      setHasCamera(true);

      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            onScan(result.data);
            stopScanning();
            onClose();
          },
          {
            returnDetailedScanResult: true,
            preferredCamera: facingMode,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        await qrScannerRef.current.start();
        setIsScanning(true);
      }
    } catch (err: unknown) {
      setIsScanning(false);

      const error = err as Error & { name?: string };
      if (error.name === "NotAllowedError") {
        setError(
          "Camera access denied. Please allow camera permission and try again."
        );
      } else if (error.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else if (error.name === "NotSupportedError") {
        setError("Camera not supported on this device.");
      } else if (error.name === "NotReadableError") {
        setError("Camera is already in use by another application.");
      } else if (error.name === "OverconstrainedError") {
        setError("Camera does not support the requested constraints.");
      } else {
        setError(`Camera error: ${error.message || "Unknown error occurred"}`);
      }
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const flipCamera = async () => {
    if (qrScannerRef.current) {
      try {
        setFacingMode((prev) =>
          prev === "environment" ? "user" : "environment"
        );
        await qrScannerRef.current.setCamera(
          facingMode === "environment" ? "user" : "environment"
        );
      } catch (err) {
        console.error("Error flipping camera:", err);

        stopScanning();
        setTimeout(() => initializeScanner(), 100);
      }
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    initializeScanner();
  };

  const requestCameraPermission = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
      });

      stream.getTracks().forEach((track) => track.stop());
      initializeScanner();
    } catch (err: unknown) {
      const error = err as Error & { name?: string };
      if (error.name === "NotAllowedError") {
        setError(
          "Please allow camera access in your browser settings and refresh the page."
        );
      } else {
        setError(`Camera access failed: ${error.message}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="bg-white rounded-lg p-4 m-4 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Scan QR Code</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-red-600 text-sm mb-4 px-2">{error}</p>
            <div className="space-y-2">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
              {(error.includes("access denied") ||
                error.includes("permission") ||
                error.includes("NotAllowedError")) && (
                <>
                  <button
                    onClick={requestCameraPermission}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Request Camera Permission
                  </button>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Tap &quot;Request Camera Permission&quot; above</p>
                    <p>• Allow camera access when prompted</p>
                    <p>• Make sure you&apos;re using HTTPS or localhost</p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : hasCamera === false ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">
              No camera available on this device
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                autoPlay
                muted
                playsInline
              />

              {/* Camera flip button */}
              {hasCamera && (
                <button
                  onClick={flipCamera}
                  className="absolute top-3 right-3 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  title={`Switch to ${
                    facingMode === "environment" ? "front" : "back"
                  } camera`}
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
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">
                Position the QR code within the camera view
              </p>
              <p className="text-xs text-gray-500">
                Using:{" "}
                {facingMode === "environment" ? "Back Camera" : "Front Camera"}
              </p>
              {isScanning && (
                <div className="flex items-center justify-center mt-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-xs text-gray-500">
                    Scanning for QR code...
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerModal;
