/**
 * Shared utility functions for booking ID generation and trip management
 */

export interface BookingIdGenerationOptions {
  bikeId: string;
  userId: string;
  fallbackToRandom?: boolean;
}

/**
 * Generates a booking ID in format: bikeId_tripNumber
 * - If user has no trips: bikeId_0
 * - If user has trips: bikeId_(maxTripNumber + 1)
 * - Falls back to random generation if needed
 */
export const generateBookingId = async ({
  bikeId,
  userId,
  fallbackToRandom = true,
}: BookingIdGenerationOptions): Promise<string> => {
  if (!bikeId || !userId) {
    if (fallbackToRandom) {
      return generateRandomBookingId();
    }
    throw new Error("bikeId and userId are required for booking ID generation");
  }

  try {
    // Check existing trips for the user
    const response = await fetch(`/api/check-user-trips?userId=${userId}`);
    const data = await response.json();
    
    let nextTripNumber = 0;
    
    if (data.success && data.hasTrips && data.tripNumbers && data.tripNumbers.length > 0) {
      // Find the largest trip number and add 1
      const maxTripNumber = Math.max(...data.tripNumbers);
      nextTripNumber = maxTripNumber + 1;
    }
    
    // Generate booking ID as bikeId_tripNumber
    const bookingId = `${bikeId}_${nextTripNumber}`;
    return bookingId;
    
  } catch (error) {
    console.error("Error generating booking ID:", error);
    
    if (fallbackToRandom) {
      return generateRandomBookingId();
    }
    throw error;
  }
};

/**
 * Generates a random 8-character booking ID as fallback
 */
export const generateRandomBookingId = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Creates a trip record for a user
 */
export const createTripRecord = async ({
  userId,
  bookingId,
  bikeId,
  bikeData,
  operator = "PubbsTesting",
}: {
  userId: string;
  bookingId: string;
  bikeId: string;
  bikeData?: Record<string, unknown>;
  operator?: string;
}): Promise<{ success: boolean; message: string; bookingId?: string }> => {
  try {
    const createTripResponse = await fetch('/api/create-trip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        bookingId,
        bikeId,
        sourceStationId: bikeData?.inStationId,
        sourceStationName: bikeData?.inStationName,
        operator,
      }),
    });

    const tripResult = await createTripResponse.json();
    
    if (tripResult.success) {
      return {
        success: true,
        message: 'Trip record created successfully',
        bookingId,
      };
    } else {
      return {
        success: false,
        message: tripResult.message || 'Failed to create trip record',
      };
    }

  } catch (error) {
    console.error('Error creating trip record:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};