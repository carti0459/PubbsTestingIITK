"use client";

import React from "react";
import QRScannerModal from "@/components/common/QRScannerModal";
import {
  SubscriptionWarning,
  StationSelector,
  MapContainer,
  QRScannerButton,
  SubscriptionOverlay,
  RideBookingDrawer,
  ReadyToRideModal,
  ContinueRideDialog,
  ContinueRideButton,
  useDashboard,
} from "./_components";

const MinDashboard = () => {
  const {
    // State
    selectedStation,
    showSubscriptionWarning,
    showQRScanner,
    showRideBooking,
    showReadyToRide,
    qrProcessing,
    bikeData,
    currentBookingId,

    // Active ride state
    hasActiveRide,
    activeRideData,
    showContinueRideDialog,

    // Hold/Continue state
    isHolding,
    holdStartTime,
    isHoldProcessing,
    isEndProcessing,
    totalHoldTime,

    // Data
    stations,
    stationsLoading,
    hasActiveSubscription,

    // Functions
    handleStationSelect,
    handleBuyPlan,
    handleQRScanner,
    handleQRScanResult,
    handleReadyToRideClose,
    handleProceedToUnlock,
    handleRideHold,
    handleRideContinue,
    handleBikeReset,
    handleRideEnd,
    handleRideBookingClose,
    getMapCenter,
    getMapLocations,
    getBikesByStation,

    // Active ride functions
    handleContinueRideClick,
    handleContinueRideConfirm,
    handleStartNewRide,

    // Setters
    setShowQRScanner,
    setShowSubscriptionWarning,
    setCurrentBookingId,
    setShowContinueRideDialog,
  } = useDashboard();

  return (
    <>
      {/* QR Processing Indicator */}
      {qrProcessing && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm">Processing QR code...</span>
          </div>
        </div>
      )}

      {/* Desktop Map Container */}
      <div className="hidden lg:block relative h-full">
        <MapContainer
          center={getMapCenter()}
          zoom={selectedStation ? 16 : 15}
          locations={getMapLocations()}
        />

        <SubscriptionOverlay
          hasActiveSubscription={hasActiveSubscription}
          onBuyPlan={handleBuyPlan}
        />

        {hasActiveRide && !showRideBooking ? (
          <ContinueRideButton onContinueClick={handleContinueRideClick} />
        ) : (
          <QRScannerButton onScanClick={handleQRScanner} />
        )}
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden h-[calc(100vh-64px)] bg-white flex flex-col">
        <div className="flex-shrink-0">
          <StationSelector
            stations={stations}
            selectedStation={selectedStation}
            onStationSelect={handleStationSelect}
            loading={stationsLoading}
            getBikesByStation={getBikesByStation}
          />
        </div>

        <div className="flex-1 relative bg-gray-100">
          <MapContainer
            center={getMapCenter()}
            zoom={selectedStation ? 16 : 15}
            locations={getMapLocations()}
          />

          <SubscriptionOverlay
            hasActiveSubscription={hasActiveSubscription}
            onBuyPlan={handleBuyPlan}
          />

          {hasActiveRide && !showRideBooking ? (
            <ContinueRideButton onContinueClick={handleContinueRideClick} />
          ) : (
            <QRScannerButton onScanClick={handleQRScanner} />
          )}
        </div>

        {/* Mobile Subscription Warning */}
        {showSubscriptionWarning && (
          <SubscriptionWarning
            isOpen={showSubscriptionWarning}
            onBuyPlan={handleBuyPlan}
            onClose={() => setShowSubscriptionWarning(false)}
          />
        )}
      </div>

      {/* Shared Modals and Drawers */}
      <RideBookingDrawer
        isOpen={showRideBooking}
        bikeData={bikeData?.bike || bikeData}
        bookingId={currentBookingId}
        isHolding={isHolding}
        holdStartTime={holdStartTime}
        isHoldProcessing={isHoldProcessing}
        isEndProcessing={isEndProcessing}
        totalHoldTime={totalHoldTime}
        onClose={handleRideBookingClose}
        onHold={handleRideHold}
        onContinue={handleRideContinue}
        onEnd={handleRideEnd}
      />

      <ReadyToRideModal
        isOpen={showReadyToRide}
        bikeData={bikeData?.bike || bikeData}
        onCancel={handleReadyToRideClose}
        onSuccess={(bookingId?: string) => {
          if (bookingId) {
            setCurrentBookingId(bookingId);
          }
          handleProceedToUnlock();
        }}
        onReset={handleBikeReset}
      />

      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScanResult}
      />

      <ContinueRideDialog
        isOpen={showContinueRideDialog}
        onClose={() => {
          setShowContinueRideDialog(false);
          handleStartNewRide();
        }}
        onContinue={handleContinueRideConfirm}
        rideData={activeRideData}
      />
    </>
  );
};

export default MinDashboard;
