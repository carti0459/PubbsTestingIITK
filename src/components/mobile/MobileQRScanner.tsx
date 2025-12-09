import React, { useEffect, useRef, useState } from 'react';
import { vibrate } from '@/hooks/useTouchGestures';

interface MobileQRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const MobileQRScanner: React.FC<MobileQRScannerProps> = ({
  onScan,
  onClose,
  isOpen
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      initializeCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Prefer back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setStream(mediaStream);
        setIsScanning(true);
        setHasCamera(true);
      }
    } catch (error) {
      console.error('Failed to access camera:', error);
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          // For demo purposes, simulate QR code detection
          // In a real app, you'd use a QR code library to decode the image
          vibrate([100, 50, 100]);
          onScan('demo-bike-001'); // Simulated QR code data
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualInput = () => {
    const qrData = prompt('Enter QR code data manually:');
    if (qrData && qrData.trim()) {
      vibrate([100, 50, 100]);
      onScan(qrData.trim());
    }
  };

  const handleClose = () => {
    stopCamera();
    vibrate(50);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-colors"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-lg font-semibold">Scan QR Code</h2>
        
        <div className="w-10 h-10" />
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        {hasCamera ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Scanning Frame */}
                <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                  {/* Corner indicators */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-lg"></div>
                  
                  {/* Scanning animation */}
                  {isScanning && (
                    <div className="absolute inset-0 overflow-hidden rounded-lg">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 animate-pulse"></div>
                    </div>
                  )}
                </div>
                
                {/* Instructions */}
                <p className="text-white text-center mt-4 px-4">
                  Position the QR code within the frame
                </p>
              </div>
            </div>

            {/* Hidden canvas for processing */}
            <canvas
              ref={canvasRef}
              className="hidden"
              width="640"
              height="480"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white p-8">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Camera Access Required</h3>
              <p className="text-gray-300 mb-4">
                Please allow camera access to scan QR codes
              </p>
              
              {/* Alternative options */}
              <div className="space-y-3">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <span className="inline-block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                    Upload QR Code Image
                  </span>
                </label>
                
                <button
                  onClick={handleManualInput}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Enter Code Manually
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {hasCamera && (
        <div className="flex items-center justify-center space-x-8 p-6 bg-black bg-opacity-50">
          {/* File upload alternative */}
          <label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                  style={{ minHeight: '52px', minWidth: '52px' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </span>
          </label>

          {/* Manual input */}
          <button
            onClick={handleManualInput}
            className="p-3 rounded-full bg-gray-600 text-white hover:bg-gray-500 transition-colors"
            style={{ minHeight: '52px', minWidth: '52px' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};