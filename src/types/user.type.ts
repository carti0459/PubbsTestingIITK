// Final User Data Structure for Pubbs Application
export interface User {
  // Authentication & Identity
  uid: string                  // Firebase Auth UID (primary identifier)
  email: string               // Email address
  emailVerified: boolean      // Email verification status
  phoneNumber?: string        // Phone number (optional)
  phoneVerified?: boolean     // Phone verification status
  
  // Profile Information
  fullName: string            // Full name
  displayName?: string        // Display name (can be different from fullName)
  age?: number               // Age
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  
  // Address Information
  address?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
    area?: string            // Campus area, district, etc.
  }
  
  // Pubbs Platform Data
  pubbsId?: string           // Legacy Pubbs ID (format: "PUBBS-{randomId}")
  operator?: string          // Operator name (e.g., "PubbsTesting")
  areaId?: string           // Area identifier for service area
  
  // Account Status
  isActive: boolean          // Account active status
  isBlocked?: boolean        // Account blocked status
  
  // Current Ride Information
  currentRide?: {
    rideId: string
    bookingId: string
    stationId: string
    stationName: string
    startTime: Date
    holdTime?: number        // Hold time in seconds
  }
  
  // Device Information (for tracking)
  deviceInfo?: {
    deviceId?: string
    imei?: string
    lastUsedDevice?: string
  }
  
  // User Preferences
  preferences?: {
    notifications: boolean
    locationSharing: boolean
    dataPrivacy: boolean
    preferredArea?: string
  }
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

// Trip Data Structure
export interface Trip {
  tripId: string
  bookingId: string
  
  // Station Information
  sourceStation: {
    id: string
    name: string
  }
  destinationStation: {
    id: string
    name: string
  }
  
  // Trip Timing
  startTime: Date
  endTime: Date
  holdTimer: number          // Hold time in seconds
  rideTimer: number          // Actual ride time in seconds
  totalTripTime: number      // Total trip duration
  
  // Billing
  fare: number              // Trip cost
  
  // Metadata
  operator: string
  userId: string
  createdAt: Date
}

// Subscription Data Structure (Based on actual Firebase data)
export interface Subscription {
  // Identifiers
  subscriptionId: string       // Plan ID (e.g., "PubbsTesting_SP_0")
  uniqueSubsId: string        // Unique subscription instance ID
  orderNumber?: string        // Order identifier (optional - not all have this)
  
  // Plan Details
  subscriptionName?: string   // Plan name (e.g., "Rider Plan", "Spark Plan") - optional
  
  // Pricing & Benefits
  subscriptionAmt: string     // Subscription cost (string format in actual data)
  maxFreeRide: string        // Number of free rides (string format in actual data)
  carryForward?: string      // Carry forward amount (string format, optional)
  
  // Payment
  paymentId?: string         // Payment method/ID (e.g., "OfflinePayment")
  
  // Validity
  subscriptionDate: string   // Start date (various formats: "dd-MM-yyyy HH:mm:ss" or "yyyy-MM-dd HH:mm:ss.SSS")
  subscriptionExpiry: string // Expiry date (same formats as above)
  validityTime: string      // Validity period in days (string format)
}

// Types for different operations
export interface CreateUserData {
  fullName: string
  email: string
  password: string
  phoneNumber?: string
}

export interface UpdateUserData {
  fullName?: string
  displayName?: string
  age?: number
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  address?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
    area?: string
  }
  preferences?: {
    notifications?: boolean
    locationSharing?: boolean
    dataPrivacy?: boolean
    preferredArea?: string
  }
}

export interface UserProfile {
  uid: string
  fullName: string
  email: string
  phoneNumber?: string
  displayName?: string
  isActive: boolean
  createdAt: Date
  lastLoginAt?: Date
}